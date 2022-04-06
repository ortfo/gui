import gridHelp from "svelte-grid/build/helper"
import { backend } from "./backend"
import { fromBlocksToLayout, layoutWidth } from "./layout"
import {
    Footnote,
    LayedOutElement,
    Link,
    MediaEmbedDeclaration,
    Paragraph,
    ParsedDescription,
    Translated,
} from "./ortfo"
import { distance, first, pick, second } from "./utils"

export type ContentBlock = {
    id: ItemID
    [col: number]: {
        x: number
        y: number
        w: number
        h: number
        fixed: boolean
        resizable: boolean
        draggable: boolean
        customDragger: boolean
        customResizer: boolean
        min: {
            w?: number
            h?: number
        }
        max: {
            w?: number
            h?: number
        }
    }
    data: ContentUnit
}

export type ContentUnit =
    | ({ type: "paragraph" } & Paragraph)
    | ({ type: "media" } & MediaEmbedDeclaration)
    | ({ type: "link" } & Link)

export type ItemID = `${ContentUnit["type"]}:${number}`

/**
 *
 * @param blocks the translated blocks to process
 * @returns functions to transform the blocks: map, filter or do (forEach) on every I, for every language
 */
export function eachLanguage<I, O>(blocks: Translated<I[]>) {
    type F<o> = ((item: I) => o) | ((language: string, item: I) => o)

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
                Object.entries(blocks).map(
                    ([language, onelang]: [string, I[]]) => [
                        language,
                        onelang[using](item =>
                            // @ts-ignore: can't narrow down the type of f, see https://github.com/microsoft/TypeScript/issues/18422
                            f.length === 1 ? f(item) : f(language, item)
                        ),
                    ]
                )
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
        eachLanguage<LayedOutElement, ContentBlock>(layouts).map(
            (item: LayedOutElement) => {
                const {
                    type,
                    layoutindex,
                    positions,
                    generalcontenttype,
                    metadata,
                    ...contentunit
                } = item
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
                }
                let blockData: ContentBlock["data"]
                switch (type) {
                    case "media":
                        blockData = {
                            type,
                            ...pick(
                                contentunit,
                                "alt",
                                "title",
                                "source",
                                "attributes"
                            ),
                        }

                        break
                    case "link":
                        blockData = {
                            type,
                            ...pick(contentunit, "id", "name", "title", "url"),
                        }
                        break
                    case "paragraph":
                        blockData = {
                            type,
                            ...pick(contentunit, "id", "content"),
                        }
                }

                return { ...block, data: blockData }
            }
        ),
        rowCapacity,
    ]
}

function onlyOfType(
    type: "media" | "link" | "paragraph",
    blocks: Translated<ContentBlock[]>
): Translated<ContentBlock[]> {
    return eachLanguage<ContentBlock, ContentBlock>(blocks).filter(
        block => block.data.type === type
    )
}

export function fromBlocksToParsedDescription(
    blocks: Translated<ContentBlock[]>,
    rowCapacity: number,
    base: ParsedDescription
): ParsedDescription {
    if (Object.keys(blocks).length === 0) {
        return base
    }
    let description: ParsedDescription = {
        ...base,
        paragraphs: {},
        mediaembeddeclarations: {},
        links: {},
    }

    if (Object.keys(blocks).length === 0) {
        return description
    }

    const anyLanguage = Object.keys(blocks)[0]

    description.metadata.layout = fromBlocksToLayout(
        blocks[anyLanguage],
        rowCapacity
    )

    description.paragraphs = eachLanguage<ContentBlock, Paragraph>(
        onlyOfType("paragraph", blocks)
    ).map((block: ContentBlock) => {
        const { content, id } = block.data as Paragraph & { type: "paragraph" }
        return {
            content,
            id,
        } as Paragraph
    })

    description.links = eachLanguage<ContentBlock, Link>(
        onlyOfType("link", blocks)
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
        onlyOfType("media", blocks)
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
