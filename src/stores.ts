import { writable } from "svelte/store"
import type { Writable } from "svelte/store"
import type { DatabaseOneLang, WorkMetadata, WorkOneLang } from "./ortfo"
import type { Base64WithFiletype } from "./backend"

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
    }
}

export function fillEditorMetadataState(
    metadata: WorkMetadata
): State["editor"]["metadata"] {
    return {
        tags: metadata.tags,
        madewith: metadata.madewith,
        created: new Date(metadata.created),
        colors: metadata.colors,
        aliases: metadata?.aliases || [],
        titlestyle: metadata?.titlestyle || "filled",
        pagebackground: metadata?.pagebackground,
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
    editingWork: null,
    editor: {
        language: "en",
        metadataPaneSplitRatio: 0.333,
        metadata: {
            tags: [],
        } as State["editor"]["metadata"],
    },
})

export const database: Writable<DatabaseOneLang> = writable({
    sites: [],
    tags: [],
    technologies: [],
    works: [],
} as DatabaseOneLang)
