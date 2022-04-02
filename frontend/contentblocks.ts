import gridHelp from "svelte-grid/build/helper"
import { backend } from "./backend"
import { layoutWidth } from "./layout"
import type {
    Footnote,
    LayedOutElement,
    Link,
    MediaEmbedDeclaration,
    Paragraph,
    ParsedDescription,
    Translated,
    WorkMetadata,
} from "./ortfo"
import { distance, first, range, second } from "./utils"

export type ContentBlock = {
    id: ItemID
    [col: number]: {
        x: number
        y: number
        w: number
        h: number
    }
    data: ContentUnit
}

export type ContentUnit =
    | ({ type: "paragraph" } & Paragraph)
    | ({ type: "media" } & MediaEmbedDeclaration)
    | ({ type: "link" } & Link)

export type ItemID = `${ContentUnit["type"]}:${number}`

export function eachLanguage<I, O>(blocks: Translated<I[]>) {
    type F<o> = ((oneLang: I) => o) | ((language: string, oneLang: I) => o)

    const createTransformer =
        <o>(using: string) =>
        (f: F<o>) => {
            if (![1, 2].includes(f.length)) {
                throw Error("Transformer must take 1 or 2 arguments")
            }

            return (
                using === "forEach"
                    ? entries => void entries
                    : Object.fromEntries
            )(
                Object.entries(blocks)[using](([language, onelang]) => [
                    language,
                    // @ts-ignore: can't narrow down the type of f, see https://github.com/microsoft/TypeScript/issues/18422
                    f.length === 1 ? f(onelang) : f(language, onelang),
                ])
            )
        }

    return {
        do: createTransformer("forEach"),
        map: createTransformer("map"),
        filter: createTransformer("filter"),
    } as {
        do: (f: F<void>) => void
        map: (f: F<O>) => Translated<O[]>
        filter: (f: F<boolean>) => Translated<O[]>
    }
}

/**
 * Transforms a parsed description into a layed out content blocks.
 * @param description the parsed description to transform into layout blocks
 * @returns [content blocks, max. number of columns per row (row "capacity")]
 */
export async function toBlocks(
    description: ParsedDescription
): Promise<[Translated<ContentBlock[]>, number]> {
    const rowCapacity = description.metadata.layout
        ? layoutWidth(description.metadata.layout)
        : 1
    let layouts: Translated<LayedOutElement[]>
    try {
        layouts = await backend.layout(description)
    } catch (error) {
        console.error(error)
        return [{}, 0]
    }
    return [
        eachLanguage<LayedOutElement, ContentBlock>(layouts).map(layout => {
            return layout.map(element => {
                const {
                    type,
                    layoutindex,
                    positions,
                    generalcontenttype,
                    metadata,
                    ...contentunit
                } = element
                let block = {
                    id: `${type}:${layoutindex}` as ItemID,
                    [rowCapacity]: gridHelp.item({
                        // We assume that the element's positions are contiguous.
                        x: Math.min(...positions.map(second)),
                        y: Math.min(...positions.map(first)),
                        w: distance(positions.map(second)) + 1,
                        h: distance(positions.map(first)) + 1,
                        customDragger: true,
                        customResizer: true,
                    }),
                    data: {
                        ...contentunit,
                        type,
                    },
                }
                return block
            })
        }),
        rowCapacity,
    ]
}

export function fromBlocksToParsedDescription(
    blocks: Translated<ContentBlock[]>,
    rowCapacity: number,
    metadata: ParsedDescription["metadata"],
    title: Translated<string>,
    footnotes: Translated<Footnote[]>
): ParsedDescription {
    let description: ParsedDescription = {
        metadata,
        title,
        footnotes,
        paragraphs: {},
        mediaembeddeclarations: {},
        links: {},
    }

    if (Object.keys(blocks).length === 0) {
        return description
    }

    const anyLanguage = Object.keys(blocks)[0]

    description.metadata.layout = blocks[anyLanguage].map(block => {
        console.log("jgreojg")
        const [_, layoutindex] = block.id.split(":", 2)
        console.log(
            "🚀 ~ file: contentblocks.ts ~ line 147 ~ layoutindex]",
            layoutindex
        )
        const { type, ...contentunit } = block.data
        console.log(
            "🚀 ~ file: contentblocks.ts ~ line 149 ~ contentunit",
            contentunit
        )
        const { x, y, w, h } = block[rowCapacity]
        return {
            positions: range(x, x + w - 1).map(x =>
                range(y, y + h - 1).map(y => [x, y])
            ),
            generalcontenttype: "sus",
            metadata: {} as WorkMetadata,
            type,
            layoutindex,
            ...contentunit,
        } as unknown as LayedOutElement
    })

    description.paragraphs = eachLanguage<ContentBlock, Paragraph>(
        eachLanguage<ContentBlock, ContentBlock>(blocks).filter(
            block => block.type === "paragraph"
        )
    ).map((block: ContentBlock) => {
        const { content, id } = block.data as Paragraph & { type: "paragraph" }
        return {
            content,
            id,
        } as Paragraph
    })

    description.links = eachLanguage<ContentBlock, Link>(
        eachLanguage<ContentBlock, ContentBlock>(blocks).filter(
            block => block.type === "link"
        )
    ).map((block: ContentBlock) => {
        const { name, id, title, url } = block.data as Link & { type: "link" }
        return {
            url,
            id,
            title,
            name,
        } as Link
    })

    type MediaEmbed = MediaEmbedDeclaration

    description.mediaembeddeclarations = eachLanguage<ContentBlock, MediaEmbed>(
        eachLanguage<ContentBlock, ContentBlock>(blocks).filter(
            block => block.type === "media"
        )
    ).map((block: ContentBlock) => {
        const { alt, attributes, source, title } = block.data as MediaEmbed & {
            type: "media"
        }
        return {
            alt,
            attributes,
            source,
            title,
        } as MediaEmbed
    })

    return description
}

export function emptyContentUnit(type: LayedOutElement["type"]): ContentUnit {
    switch (type) {
        case "media":
            return {
                type,
                alt: "",
                attributes: {
                    autoplay: false,
                    controls: true,
                    looped: false,
                    muted: false,
                    playsinline: false,
                },
                source: "",
                title: "",
            }
        case "link":
            return {
                type,
                id: "",
                name: "",
                title: "",
                url: "",
            }
        case "paragraph":
            return {
                type,
                content: "",
                id: "",
            }
        default:
            throw Error(`Unknown content unit type "${type}"`)
    }
}
