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

export interface dbWork {
    id: string
    metadata: { [key: string]: any }
    title: { [key: string]: string }
    paragraphs: { [key: string]: Paragraph[] }
    media: { [key: string]: Media[] }
    links: { [key: string]: Link[] }
    footnotes: { [key: string]: Footnote[] }
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
    metadata: { [key: string]: any }
    title: { [key: string]: string }
    paragraphs: { [key: string]: Paragraph[] }
    mediaembeddeclarations: { [key: string]: MediaEmbedDeclaration[] }
    links: { [key: string]: Link[] }
    footnotes: { [key: string]: Footnote[] }
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

export interface Work extends dbWork {
    metadata: WorkMetadata
}

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

export interface WorkMetadata {
    created: string
    started: string
    finished: string
    tags: string[]
    layout: any[]
    layoutproper: string[][]
    madewith: string[]
    colors: {
        primary: string
        secondary: string
        tertiary: string
    }
    pagebackground: string
    title: string
    wip: boolean
    thumbnails: { [key: string]: { [key: number]: string } }
}

export const metadataReadableNames = {
    created: "created",
    started: "started",
    finished: "finished",
    tags: "tags",
    madewith: "made with",
    colors: "colors",
    pagebackground: "page background",
    title: "title",
    wip: "work in progress",
    thumbnails: "thumbnails",
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
