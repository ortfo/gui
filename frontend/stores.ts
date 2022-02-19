import { writable, derived } from "svelte/store"
import type { Writable, Derived } from "svelte/store"
import type {
    DatabaseOneLang,
    Database,
    WorkMetadata,
    WorkOneLang,
} from "./ortfo"
import { backend, Base64WithFiletype } from "./backend"
import { inLanguage } from "./ortfo"

export type Settings = {
    theme: string
    surname: string
    projectsfolder: string
    language: "en" | "fr"
    showTips: boolean
}

export type PageName =
    | "works"
    | "tags"
    | "technologies"
    | "sites"
    | "settings"
    | "editor"

export type WorkID = string

export type State = {
    openTab: PageName
    rebuildingDatabase: boolean
    editingWork: WorkID | null
    editor: {
        language: "en" | "fr"
        metadataPaneSplitRatio: number
        metadata: {
            tags: string[]
            madewith: string[]
            created: Date
            colors: {
                primary: string
                secondary: string
                tertiary: string
            }
            aliases: string[]
            titlestyle: "filled" | "outlined"
            pagebackground: Base64WithFiletype
        }
        title: string
        unsavedChanges: boolean
    }
}

export async function fillEditorMetadataState(
    work: WorkOneLang,
    settings: Settings
): Promise<State["editor"]["metadata"]> {
    const metadata = work.metadata
    return {
        tags: metadata.tags || [],
        madewith: metadata.madewith || [],
        created: new Date(metadata.created),
        colors: metadata.colors,
        aliases: metadata?.aliases || [],
        titlestyle: metadata?.titlestyle || "filled",
        pagebackground: metadata?.pagebackground
            ? await backend.getMedia(
                  `${settings.projectsfolder}/${work.id}/.portfoliodb/${metadata?.pagebackground}`
              )
            : "",
    }
}

export const settings: Writable<Settings> = writable({
    theme: "light",
    surname: "",
    projectsfolder: "",
    language: "en",
    showTips: true,
})

export const state: Writable<State> = writable({
    openTab: "editor",
    rebuildingDatabase: false,
    editingWork: "humanr",
    editor: {
        language: "en",
        metadataPaneSplitRatio: 0.333,
        metadata: {
            tags: [],
            madewith: [],
            colors: {
                primary: "",
                secondary: "",
                tertiary: "",
            },
        } as State["editor"]["metadata"],
        unsavedChanges: false,
        title: "",
    },
})

export const databaseLanguages: Writable<Database> = writable({} as Database)

export const database = derived(
    [databaseLanguages, settings],
    ([$databaseLanguages, $settings]) => {
        if (Object.keys($databaseLanguages).length) {
            return {
                ...$databaseLanguages,
                works: $databaseLanguages.works.map(
                    inLanguage($settings.language)
                ),
            }
        }
        return {}
    }
)

export const editorWork: Derived<WorkOneLang> = derived(
    [databaseLanguages, state],
    ([$databaseLanguages, $state]) => {
        if ("works" in $databaseLanguages) {
            return inLanguage($state.editor.language)(
                $databaseLanguages.works.find(w => w.id === $state.editingWork)
            )
        }
    }
)
