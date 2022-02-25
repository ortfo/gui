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
import {
    layoutWidth,
    normalizeLayout,
    SvelteGridItem,
    workFromItems,
} from "./layout"

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
        created: string
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
    footnotes: Footnote[]
    unsavedChanges: boolean
    columnsCount: number
}

export async function fillEditorMetadataState(
    work: WorkOneLang,
    settings: Settings
): Promise<EditorState["metadata"]> {
    const metadata = work.metadata as unknown as EditorState["metadata"]
    const pagebackgroundPath = `${settings.projectsfolder}/${work.id}/.portfoliodb/${metadata?.pagebackground}`
    // if (metadata?.created) {
    //     metadata.created = new Date(metadata.created)
    // }
    if (metadata?.pagebackground) {
        try {
            metadata.pagebackground = {
                data: await backend.getMedia(pagebackgroundPath),
                path: pagebackgroundPath,
            }
        } catch (error) {
            console.error(error)
        }
    }
    return metadata
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
    editingWorkID: "",
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
    footnotes: [],
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

export const currentLanguageDatabase: Readable<DatabaseOneLang> = derived(
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
        throw Error("No database")
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
    ([$workOnDisk, $state]) => {
        const work = inLanguage($state.editingLanguage)($workOnDisk)

        work.metadata.aliases ||= []
        work.metadata.colors ||= {
            primary: "",
            secondary: "",
            tertiary: "",
        }
        work.metadata.created ||= null
        work.metadata.finished ||= null
        work.metadata.layout ||= null
        work.metadata.madewith ||= []
        work.metadata.pagebackground ||= ""
        work.metadata.started ||= null
        work.metadata.tags ||= []
        work.metadata.thumbnails ||= {}
        work.metadata.titlestyle ||= "filled"
        work.metadata.wip ||= false
        work.metadata.layout = work.metadata?.layout
            ? normalizeLayout(
                  work.metadata.layout,
                  layoutWidth(work.metadata.layout)
              )
            : work.metadata?.layout
        return work
    }
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
            footnotes: [
                ...$workInEditorCurrentLanguage.footnotes,
                ...$editor.footnotes,
            ],
            language: $workInEditorCurrentLanguage.language,
            links,
            media,
            paragraphs,
        } as WorkOneLang
    }
)
