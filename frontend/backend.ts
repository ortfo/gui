import { applyAbbreviations, collectAbbreviations } from "./description"
import type {
    Database,
    ExternalSite,
    LayedOutElement,
    ParsedDescription,
    Tag,
    Technology,
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

export type DirEntry = {
    name: string
    type: string
    info: Object
    isdir: boolean
}

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

export type PickFileConstraint = {
    accept: "directory" | "*" | `.${string}`
}

let FILESERVER_PORT

export const localProjects = path =>
    `http://localhost:${FILESERVER_PORT}/projects/${path}`
export const localDatabase = path =>
    `http://localhost:${FILESERVER_PORT}/database/${path}`
export const relativeToDatabase = path => path.split("portfolio-database/")[1]

export const backend = {
    // ../backend/main.go
    initialize: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        FILESERVER_PORT = await backend__fileserverPort()
        console.info(`Received fileserver port ${FILESERVER_PORT}`)
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__initialize()) as MaybeError
    },
    // ../backend/main.go
    settingsRead: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = await backend__settingsRead()
        return lowercaseNoSpacesKeys(!!data ? data : {}) as Settings
    },
    // ../backend/main.go
    settingsWrite: async (settings: Settings) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__settingsWrite(settings)) as MaybeError
    },
    // ../backend/main.go
    quit: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__quit()) as void
    },
    // ../backend/main.go
    databaseRead: async () => {
        return lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            (await backend__databaseRead()) || {}
        ) as Database
    },
    // ../backend/main.go
    getBuildProgress: async () => {
        return lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            (await backend__getBuildProgress()) || {}
        ) as BuildProgress
    },
    // ../backend/main.go
    rebuildDatabase: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__rebuildDatabase()) as MaybeError
    },
    // ../backend/main.go
    layout: async (work: ParsedDescription, languages: string[]) => {
        const data = Object.fromEntries(
            Object.entries(
                // @ts-ignore backend__* functions are injected by webview (from the backend)
                (await backend__layout(work, languages)) as Translated<
                    unknown[]
                >
            ).map(([lang, val]) => [lang, val.map(lowercaseNoSpacesKeys)])
        )
        return data as Translated<LayedOutElement[]>
    },
    // ../backend/main.go
    writeToDisk: async (work: ParsedDescription, workID: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeback(
            applyAbbreviations(work),
            workID
        )) as MaybeError
    },
    // ../backend/main.go
    saveUIState: async (state: State) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__saveState(state)) as MaybeError
    },
    // ../backend/main.go
    readUIState: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        const data = await backend__loadState()
        return lowercaseFirstCharacter(!!data ? data : {}) as State
    },
    // ../backend/main.go
    listDirectory: async (path: string) => {
        return lowercaseNoSpacesKeys(
            // @ts-ignore backend__* functions are injected by webview (from the backend)
            await backend__listDirectory(path)
        ) as DirEntry[]
    },
    // ../backend/main.go
    writeSites: async (tags: Tag[]) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeTags(
            tags.map(t => ({
                Singular: t.singular,
                Plural: t.plural,
                Description: t.description,
                Aliases: t.aliases,
                LearnMoreURL: t.learnmoreurl,
            }))
        )) as MaybeError
    },
    // ../backend/main.go
    writeTechnologies: async (technologies: Technology[]) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeTechnologies(technologies)) as MaybeError
    },
    // ../backend/main.go
    writeExternalSites: async (externalSites: ExternalSite[]) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeExternalSites(externalSites)) as MaybeError
    },
    // ../backend/main.go
    openInBrowser: async (url: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__openInBrowser(url)) as MaybeError
    },
    // ../backend/main.go:157
    pickFile: async ({
        title,
        startIn,
        relativeTo,
        ...constraint
    }: {
        title: string
        startIn: string
        relativeTo: string
    } & PickFileConstraint) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__pickFile(
            title,
            startIn,
            constraint,
            relativeTo
        )) as string
    },
    // ../backend/main.go:182
    deleteWorks: async (workIDs: string[]) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__deleteWorks(workIDs)) as MaybeError
    },
    // ../backend/main.go
    rawDescription: async (workID: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__rawDescription(workID)) as string
    },
    // ../backend/main.go
    writeRawDescription: async (workID: string, content: string) => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__writeRawDescription(
            workID,
            content
        )) as MaybeError
    },
    // ../backend/main.go
    clearThumbnails: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__clearThumbnails()) as MaybeError
    },
    getUserLanguage: async () => {
        // @ts-ignore backend__* functions are injected by webview (from the backend)
        return (await backend__getUserLanguage()) as string
    }
}
