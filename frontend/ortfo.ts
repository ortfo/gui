import { databaseRead, LocalizedContent, Work } from "./backend.generated"

export type Database = NonNullable<Awaited<ReturnType<typeof databaseRead>>>

export type Translated<T> = { [langage: string]: T }

export type Localized<T extends Record<string, any>> = T[string]

export interface Link {
    id: string
    name: string
    title: Translated<string>
    description: Translated<string>
    url: string
}

export interface Collection {
    id: string
    title: Translated<string>
    description: Translated<string>
    learnmoreat: string
    includes: string
    aliases: string[]
}

export interface ExternalSite {
    name: string
    url: string
    purpose?: string
    username?: string
}

export type WorkLocalized = Omit<Work, "content"> & {
    content: LocalizedContent
}

export type DatabaseOneLang = Record<string, WorkLocalized>

export function localize(work: Work, lang: string): WorkLocalized {
    return {
        ...work,
        content: work.content?.[lang] ??
            work.content?.["default"] ?? {
                blocks: [],
                footnotes: {},
                layout: [],
                title: "",
                abbreviations: {},
            },
    }
}

export const metadataReadableNames = {
    wip: "work in progress",
    madeWith: "made with",
    pageBackground: "page background",
}
