export type Translated<T> = { [langage: string]: T }
import { Database as DatabaseConverter } from "@ortfo/db"
import type {
    Database as _AnalyzedWork,
    ContentValue,
} from "@ortfo/db/dist/database"

export type AnalyzedWork = _AnalyzedWork
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

export type Database = ReturnType<typeof DatabaseConverter.toDatabase>

export type AnalyzedWorkLocalized = Omit<AnalyzedWork, "content"> & {
    content: ContentValue
}
export type DatabaseOneLang = Record<string, AnalyzedWorkLocalized>

export function localize(
    work: AnalyzedWork,
    lang: string
): AnalyzedWorkLocalized {
    return {
        ...work,
        content:
            lang in work.content
                ? work.content[lang]
                : work.content["default"] ?? {
                      blocks: [],
                      footnotes: {},
                      layout: [],
                      title: "",
                  },
    }
}

export const metadataReadableNames = {
    wip: "work in progress",
    madeWith: "made with",
    pageBackground: "page background",
}
