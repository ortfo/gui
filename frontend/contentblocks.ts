import { type Database as AnalyzedWork, BlockElement } from "@ortfo/db/dist/database"
import gridHelp from "svelte-grid/build/helper"
import { layoutWidth, OrtfoMkLayout } from "./layout"
import { Translated } from "./ortfo"
import { distance, first, second } from "./utils"

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
    data: BlockElement
}

export type ItemID = string

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
    description: AnalyzedWork,
    languages: string[]
): Promise<[Translated<ContentBlock[]>, number]> {
    const layout = description.content[languages[0]].layout as OrtfoMkLayout
    const rowCapacity = layout.length
        ? layoutWidth(layout)
        : 1

    console.log('converting to blocks from', description)
    return [
        Object.fromEntries(Object.entries(description.content).map(([language, content]) => {
            return [language, content.blocks.map((item: BlockElement) => {
                // Find all positions as (x, y) in the 2D layout array where the block is. the 2D layout array contains block IDs.
                const positions = layout.flatMap((row, y) =>
                    (Array.isArray(row) ? row : [row]).map((cell, x) => (cell === item.id ? [y, x] : null))
                ).filter(Boolean) as [number, number][]
                return {
                    id: item.id,
                    [rowCapacity]: gridHelp.item({
                        // We assume that the element's positions are contiguous.
                        x: Math.min(...positions.map(second)),
                        y: Math.min(...positions.map(first)),
                        w: distance(positions.map(second)) + 1,
                        h: distance(positions.map(first)) + 1,
                        customDragger: true,
                        customResizer: true,
                    }),
                    data: item
                } 
            })]})),
        Math.max(rowCapacity, 1),
    ]
}

export function emptyContentUnit(type: "paragraph"|"link"|"media"): BlockElement {
    return {
        type, 
        alt: "",
    analyzed: false,
    anchor: "",
    attributes: {
        autoplay: false,
        controls: true,
        loop: false,
        muted: false,
        playsinline: false
    },
    caption: "",
    colors: {
        primary: "",
        secondary: "",
        tertiary: ""
    },
    content: "",
    contentType: "",
    dimensions: {
        aspectRatio: 0,
        height: 0,
        width: 0
    },
    distSource: "",
    duration: 0,
    hasSound: false,
    id: "",
    index: 0,
    online: false,
    relativeSource: "",
    size: 0,
    text: "",
    thumbnails: {},
    thumbnailsBuiltAt: "",
    title: "",
    url: "",
    }
}
