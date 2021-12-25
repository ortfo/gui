import type { Settings } from "./stores"
import { Database, DatabaseOneLang, inLanguage } from "./ortfo"
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
    initializeConfigurationDirectory: () => Promise<null | string>
    settingsRead: () => Promise<Settings>
    settingsWrite: (settings: Settings) => Promise<null | string>
    quit: () => Promise<void>
    databaseRead: () => Promise<DatabaseOneLang>
    rebuildDatabase: () => Promise<null | string>
    getMedia: (path: string) => Promise<Base64WithFiletype>
    layout: (work: WorkOneLang) => Promise<LayedOutElement[]>
}

export const backend: Backend = {
    initializeConfigurationDirectory: async () => {
        return await backend__initializeConfigurationDirectory()
    },
    settingsRead: async () => {
        const data = await backend__settingsRead()
        return lowercaseNoSpacesKeys(!!data ? data : {})
    },
    settingsWrite: async (settings: Settings) => {
        return await backend__settingsWrite(settings)
    },
    quit: async () => {
        return await backend__quit()
    },
    databaseRead: async () => {
        const data = lowercaseNoSpacesKeys(
            (await backend__databaseRead()) || {}
        )
        console.log(JSON.stringify(data))
        data.works = data.works.map(inLanguage("en"))
        return data
    },
    rebuildDatabase: async () => {
        return await backend__rebuildDatabase()
    },
    getMedia: async (path: string) => {
        return await backend__getMedia(path)
    },
    layout: async (work: string) => {
        const data = await backend__layout(work)
        return data.map(lowercaseNoSpacesKeys)
    },
}
