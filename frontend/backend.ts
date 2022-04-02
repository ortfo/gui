import { nanoid } from "nanoid"
import type { Settings, State } from "./stores"
import {
    Database,
    DatabaseOneLang,
    ortfodbWork,
    inLanguage,
    LayedOutElement,
    Work,
    WorkOneLang,
    MediaEmbedDeclaration,
    Media,
    ParsedDescription,
    Paragraph,
    Link,
    Translated,
} from "./ortfo"
import {
    lowercaseNoSpacesKeys,
    lowercaseFirstCharacter,
    mapToTranslated,
    transformKeys,
} from "./utils"
import type { OrtfoMkLayout } from "./layout"

/*
 * Strings that represent binary files, with a filetype at the start.
 * Can be used in [src] attributes of images, for example.
 * Example:
 *
 *      data:image/webp;base64,gAaA...
 */
export type Base64WithFiletype = string

export type MaybeError = string | null

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
    rebuildDatabase: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__rebuildDatabase()) as MaybeError
    },
    getMedia: async (path: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__getMedia(path)) as Base64WithFiletype
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
        return (await backend__writeback(work, workID)) as MaybeError
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
