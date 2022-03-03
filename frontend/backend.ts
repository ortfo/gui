import { nanoid } from "nanoid"
import type { Settings, State } from "./stores"
import {
    addInternalIDs,
    Database,
    DatabaseOneLang,
    dbWork,
    inLanguage,
    LayedOutElement,
    Work,
    WorkOneLang,
} from "./ortfo"
import { lowercaseNoSpacesKeys, transformKeys } from "./utils"

/*
 * Strings that represent binary files, with a filetype at the start.
 * Can be used in [src] attributes of images, for example.
 * Example:
 *
 *      data:image/webp;base64,gAaA...
 */
export type Base64WithFiletype = string

type Backend = {
    initialize: () => Promise<null | string>
    settingsRead: () => Promise<Settings>
    settingsWrite: (settings: Settings) => Promise<null | string>
    quit: () => Promise<void>
    databaseRead: () => Promise<Database>
    rebuildDatabase: () => Promise<null | string>
    getMedia: (path: string) => Promise<Base64WithFiletype>
    layout: (work: WorkOneLang) => Promise<LayedOutElement[]>
    writeToDisk: (work: dbWork) => Promise<null | string>
}

export const backend: Backend = {
    initialize: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__initialize()
    },
    settingsRead: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = await backend__settingsRead()
        return lowercaseNoSpacesKeys(!!data ? data : {})
    },
    settingsWrite: async (settings: Settings) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__settingsWrite(settings)
    },
    quit: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__quit()
    },
    databaseRead: async () => {
        const data = lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            (await backend__databaseRead()) || {}
        ) as Database
        return { ...data, works: data.works.map(addInternalIDs) }
    },
    rebuildDatabase: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__rebuildDatabase()
    },
    getMedia: async (path: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__getMedia(path)
    },
    layout: async (work: WorkOneLang) => {
        // the backend will discard internalID since it does not exist there, so we append it to "real" IDs of every parargaph/media/link.
        const internalIDsLengths = new Set(
            [...work.paragraphs, ...work.media, ...work.links].map(
                e => e.internalID.length
            )
        )
        if (internalIDsLengths.size !== 1) {
            throw Error(
                "internal IDs should all have the same length, but internal IDs are " +
                    JSON.stringify(
                        [...work.paragraphs, ...work.media, ...work.links].map(
                            e =>
                                `${e.internalID} (length ${e.internalID.length})`
                        )
                    )
            )
        }
        const internalIDsLength = internalIDsLengths.values().next().value
        const appendInternalIDs = element => ({
            ...element,
            id: element.internalID + (element.id || ""),
        })

        work.paragraphs = work.paragraphs.map(appendInternalIDs)
        work.media = work.media.map(appendInternalIDs)
        work.links = work.links.map(appendInternalIDs)
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = (await backend__layout(work)).map(lowercaseNoSpacesKeys)

        // After processing, we get the internalIDs back into their spots.
        const splitBackInternalIDs = element => {
            return {
                ...element,
                internalID: element.id.slice(0, internalIDsLength),
                id: element.id.slice(internalIDsLength),
            }
        }
        return data.map(splitBackInternalIDs)
    },
    writeToDisk: async (work: Work) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return await backend__writeback(work)
    },
}
