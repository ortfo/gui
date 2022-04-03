export type Translated<T> = { [langage: string]: T }

export interface Abbreviation {
    name: string
    definition: string
}

export interface Footnote {
    name: string
    content: string
}

export interface Paragraph {
    id: string
    content: string
}

export interface Link {
    id: string
    name: string
    title: string
    url: string
}

export interface ortfodbWork {
    id: string
    metadata: Translated<any>
    title: Translated<string>
    paragraphs: Translated<Paragraph[]>
    links: Translated<Link[]>
    media: Translated<Media[]>
    footnotes: Translated<Footnote[]>
}

export interface MediaEmbedDeclaration {
    alt: string
    title: string
    source: string
    attributes: MediaAttributes
}

export interface MediaAttributes {
    looped: boolean
    autoplay: boolean
    muted: boolean
    playsinline: boolean
    controls: boolean
}

export interface ParsedDescription {
    metadata: Translated<any>
    title: Translated<string>
    paragraphs: Translated<Paragraph[]>
    mediaembeddeclarations: Translated<MediaEmbedDeclaration[]>
    links: Translated<Link[]>
    footnotes: Translated<Footnote[]>
}

export interface WorkOneLang {
    id: string
    metadata: WorkMetadata
    title: string
    paragraphs: Paragraph[]
    media: Media[]
    links: Link[]
    footnotes: Footnote[]
    language: string
}

export interface Work extends ortfodbWork {
    metadata: WorkMetadata
}

/**
 * Currified function to return a work in a single language.
 * @param language the target language to extract from the given work
 * @returns An extractor that will return a work in the given language
 */
export const inLanguage = (language: string) => (work: Work) => {
    const access = prop => work[prop][language] || work[prop]["default"]
    return {
        ...work,
        paragraphs: access("paragraphs") || [],
        media: access("media") || [],
        links: access("links") || [],
        footnotes: access("footnotes") || [],
        language: language,
        title: access("title") || "",
    } as WorkOneLang
}

/**
 * Turn multiple single-language works into a full work.
 * Can be thought of as the opposite of `inLanguage`.
 * @param singleLanguageWorks single-language works to merge
 * @returns the merged work
 */
export const fromLanguages = (...singleLanguageWorks: WorkOneLang[]) => {
    const multiLanguage = propertyName =>
        Object.fromEntries(
            singleLanguageWorks.map(work => [work.language, work[propertyName]])
        )

    if (new Set(singleLanguageWorks.map(w => w.id)).size !== 1) {
        throw new Error(
            "fromLanguages: cannot merge single-language works with different ids"
        )
    }

    return {
        id: singleLanguageWorks[0].id,
        metadata: Object.assign(
            {},
            ...singleLanguageWorks.map(w => w.metadata)
        ),
        title: multiLanguage("title"),
        paragraphs: multiLanguage("paragraphs"),
        media: multiLanguage("media"),
        links: multiLanguage("links"),
        footnotes: multiLanguage("footnotes"),
    } as Work
}

export interface WorkMetadata {
    created?: string
    started?: string
    finished?: string
    tags?: string[]
    layout?: any[]
    madewith?: string[]
    colors?: {
        primary: string
        secondary: string
        tertiary: string
    }
    pagebackground?: string
    wip?: boolean
    thumbnails: { [image: string]: { [resolution: number]: string } }
    aliases?: string[]
    titlestyle?: "filled" | "outlined"
}

export const metadataReadableNames = {
    madewith: "made with",
    pagebackground: "page background",
    wip: "work in progress",
}

export interface Database {
    works: Work[]
    technologies: Technology[]
    tags: Tag[]
    sites: ExternalSite[]
}

export interface DatabaseOneLang {
    works: WorkOneLang[]
    technologies: Technology[]
    tags: Tag[]
    sites: ExternalSite[]
}

export interface ExternalSite {
    name: string
    url: string
    purpose: string
    username: string
}

export interface Tag {
    singular: string
    plural: string
    aliases: string[]
    description: string
    learnmoreurl: string
}

export interface Technology {
    urlname: string
    displayname: string
    aliases: string[]
    author: string
    learnmoreurl: string
    description: string
}

export interface Media {
    id: string
    alt: string
    title: string
    source: string
    absolutepath: string
    path: string
    contenttype: string
    size: number
    dimensions: ImageDimensions
    duration: number
    online: boolean
    attributes: MediaAttributes
    hassound: boolean
}

export interface ImageDimensions {
    width: number
    height: number
    aspectratio: number
}

// Not exactly like ortfomk.Layout, as we don't send analyzed media but embed declarations
export interface LayedOutElement
    extends MediaEmbedDeclaration,
        Paragraph,
        Link {
    type: "media" | "paragraph" | "link"
    layoutindex: number
    positions: number[][]
    generalcontenttype: string
    metadata: WorkMetadata
}
