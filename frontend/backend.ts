import { applyAbbreviations, collectAbbreviations } from "./description"
import type {
    Database,
    LayedOutElement,
    ParsedDescription,
    Translated,
} from "./ortfo"
import type { Settings, State } from "./stores"
import { lowercaseFirstCharacter, lowercaseNoSpacesKeys } from "./utils"

/*
 * Strings that represent binary files, with a filetype at the start.
 * Can be used in [src] attributes of images, for example.
 * Example:
 *
 *      data:image/webp;base64,gAaA...
 */
export type Base64WithFiletype = string

export type MaybeError = string | null

export type BuildProgress = {
    total: number
    processed: number
    percent: number
    current: {
        id: string
        step: string
        resolution: number
        file: string
        language: string
        output: string
    }
}

export const localProjects = path => `http://localhost:4444/projects/${path}`
export const localDatabase = path => `http://localhost:4444/database/${path}`
export const relativeToDatabase = path => path.split("portfolio-database/")[1]

export const backend = {
    initialize: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__initialize()) as MaybeError
    },
    settingsRead: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = await backend__settingsRead()
        return lowercaseNoSpacesKeys(!!data ? data : {}) as Settings
    },
    settingsWrite: async (settings: Settings) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__settingsWrite(settings)) as MaybeError
    },
    quit: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__quit()) as void
    },
    databaseRead: async () => {
        return lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            (await backend__databaseRead()) || {}
        ) as Database
    },
    getBuildProgress: async () => {
        return lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            (await backend__getBuildProgress()) || {}
        ) as BuildProgress
    },
    rebuildDatabase: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__rebuildDatabase()) as MaybeError
    },
    layout: async (work: ParsedDescription) => {
        const data = Object.fromEntries(
            Object.entries(
                // @ts-ignore backend__* functions are injected by webview (from the backend)
                (await backend__layout(work)) as Translated<unknown[]>
            ).map(([lang, val]) => [lang, val.map(lowercaseNoSpacesKeys)])
        )
        return data as Translated<LayedOutElement[]>
    },
    writeToDisk: async (work: ParsedDescription, workID: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeback(
            applyAbbreviations(work),
            workID
        )) as MaybeError
    },
    saveUIState: async (state: State) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__saveState(state)) as MaybeError
    },
    readUIState: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = await backend__loadState()
        return lowercaseFirstCharacter(!!data ? data : {}) as State
    },
}
