import { writable, derived } from "svelte/store"
import type { Writable, Readable } from "svelte/store"
import type {
    DatabaseOneLang,
    Database,
    WorkMetadata,
    WorkOneLang,
} from "./ortfo"
import type { ContentBlock } from "./contentblocks"
import { backend, Base64WithFiletype } from "./backend"
import { inLanguage } from "./ortfo"
import type { SvelteGridItem } from "./layout"

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
    editingLanguage: "en" | "fr"
}

export type EditorState = {
    metadataPaneSplitRatio: number
    items: SvelteGridItem[]
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

export async function fillEditorMetadataState(
    work: WorkOneLang,
    settings: Settings
): Promise<EditorState["metadata"]> {
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
    openTab: "works",
    rebuildingDatabase: false,
    editingWork: "",
    editingLanguage: "en",
})

export const editor: Writable<EditorState> = writable({
    metadataPaneSplitRatio: 0.333,
    items: [],
    metadata: {
        tags: [],
        madewith: [],
        colors: {
            primary: "",
            secondary: "",
            tertiary: "",
        },
    } as EditorState["metadata"],
    unsavedChanges: false,
    title: "",
})

export const database: Writable<Database> = writable({} as Database)

export const databaseLanguages: Readable<Set<string>> = derived(
    [database],
    ([$database]) =>
        new Set(
            $database.works
                .map(w => Object.keys(w.title))
                .flat()
                .filter(l => l !== "default")
        )
)

export const currentLanguageDatabase = derived(
    [database, settings],
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

export const editorWork: Readable<WorkOneLang> = derived(
    [database, state],
    ([$database, $state]) => {
        if ("works" in $database) {
            return inLanguage($state.editingLanguage)(
                $database.works.find(w => w.id === $state.editingWork)
            )
        }
    }
)
