import { writable, derived } from "svelte/store"
import type { Writable, Readable } from "svelte/store"
import {
    DatabaseOneLang,
    Database,
    WorkMetadata,
    WorkOneLang,
    Work,
    freezeMetadata,
    Footnote,
} from "./ortfo"
import type { ContentBlock } from "./contentblocks"
import { backend, Base64WithFiletype } from "./backend"
import { inLanguage } from "./ortfo"
import { SvelteGridItem, workFromItems } from "./layout"

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
    editingWorkID: WorkID | null
    editingLanguage: "en" | "fr"
}

export type EditorState = {
    metadataPaneSplitRatio: number
    items: SvelteGridItem[]
    metadata: {
        tags: string[]
        madewith: string[]
        created: Date | null
        colors: {
            primary: string
            secondary: string
            tertiary: string
        }
        aliases: string[]
        titlestyle: "filled" | "outlined"
        pagebackground: { data: Base64WithFiletype; path: string }
        thumbnails: {
            [size: number]: { data: Base64WithFiletype; path: string }
        }
    }
    title: string
    footnotes: Work["footnotes"]
    unsavedChanges: boolean
    columnsCount: number
}

export async function fillEditorMetadataState(
    work: WorkOneLang,
    settings: Settings
): Promise<EditorState["metadata"]> {
    const metadata = work.metadata
    const pagebackgroundPath = `${settings.projectsfolder}/${work.id}/.portfoliodb/${metadata?.pagebackground}`
    return {
        tags: metadata.tags || [],
        madewith: metadata.madewith || [],
        created: metadata.created ? new Date(metadata.created) : null,
        colors: metadata.colors,
        aliases: metadata?.aliases || [],
        titlestyle: metadata?.titlestyle || "filled",
        pagebackground: {
            data: metadata?.pagebackground
                ? await backend.getMedia(pagebackgroundPath)
                : "",
            path: pagebackgroundPath,
        },
        thumbnails: {}, // TODO
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
    editingWorkID: "ideaseed",
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
    footnotes: {},
    columnsCount: 2,
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

export const workOnDisk: Readable<Work> = derived(
    [database, state],
    ([$database, $state]) => {
        if ("works" in $database) {
            return $database.works.find(w => w.id === $state.editingWorkID)
        }
    }
)

export const workOnDiskCurrentLanguage: Readable<WorkOneLang> = derived(
    [workOnDisk, state],
    ([$currentWorkOnDisk, $state]) =>
        inLanguage($state.editingLanguage)($currentWorkOnDisk)
)

export const workInEditorCurrentLanguage: Readable<WorkOneLang> = derived(
    [editor, workOnDiskCurrentLanguage],
    ([$editor, $workInEditorCurrentLanguage]) => {
        const { links, media, paragraphs, layout } = workFromItems(
            $editor.items,
            $editor.columnsCount,
            $workInEditorCurrentLanguage.language,
            $workInEditorCurrentLanguage
        )
        return {
            metadata: {
                ...$workInEditorCurrentLanguage.metadata,
                ...freezeMetadata($editor.metadata),
                layout: layout,
            },
            title: $editor.title || $workInEditorCurrentLanguage.title,
            id: $workInEditorCurrentLanguage.id,
            footnotes: {
                ...$workInEditorCurrentLanguage.footnotes,
                ...$editor.footnotes,
            },
            language: $workInEditorCurrentLanguage.language,
            links,
            media,
            paragraphs,
        } as WorkOneLang
    }
)
