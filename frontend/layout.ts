import type {
    Link,
    Media,
    Paragraph,
    UnanalyzedMedia,
    Work,
    WorkOneLang,
} from "./ortfo"
import { completeWith, lcm, range, repeat } from "./utils"

export type SvelteGridItem<Data = any> = {
    [k: number]: {
        fixed: boolean
        resizable: boolean
        draggable: boolean
        customDragger: boolean
        customResizer: boolean
        min: { w: number; h: number }
        max: { w: number; h: number }
        x: number
        y: number
        w: number
        h: number
        id?: string | null
    }
    id: string
    data: Data
}

export type OrtfoMkLayoutCell = `${"p" | "m" | "l"}${number}` | null
export type OrtfoMkLayout = (OrtfoMkLayoutCell[] | OrtfoMkLayoutCell)[]

// toLayout transforms an array of grid of svelte-grid items into a ortfomk layout and content blocks
export function workFromItems(
    items: SvelteGridItem<
        | {
              type: "link" | "paragraph"
              raw: string
              display: string
          }
        | { type: "media"; raw: string; display: string; path: string }
    >[],
    columnSize: number,
    language: string,
    workOnDisk: WorkOneLang
): {
    layout: OrtfoMkLayout
    paragraphs: Paragraph[]
    links: Link[]
    media: Media[]
} {
    if (items.length === 0) {
        return { layout: [[]], paragraphs: [], links: [], media: [] }
    }
    let layout: OrtfoMkLayout = []
    let contentBlocks: {
        paragraphs: Paragraph[]
        media: Media[]
        links: Link[]
    } = {
        paragraphs: [],
        media: [],
        links: [],
    }
    const position = item => item[columnSize]
    const y = item => position(item).y
    const x = item => position(item).x
    const height = item => position(item).h
    const width = item => position(item).w
    const row = index =>
        items.filter(item =>
            range(y(item), y(item) + height(item)).includes(index)
        )
    const lastRow = Math.max(...items.map(y))
    const blocksOfSameType = item =>
        contentBlocks[
            { media: "media", paragraph: "paragraphs", link: "links" }[
                item.data.type
            ]
        ]
    const isAlreadyInBlocks = item =>
        blocksOfSameType(item).some(block => block.id === item.id)

    items = items
        .map(i => ({ ...i, position: i[columnSize] }))
        .sort((a, b) => (y(a) - y(b), x(a) - x(b)))

    let rowIndices = range(0, lastRow + 1)

    for (const rowIndex of rowIndices) {
        let layoutRow = []
        for (const item of row(rowIndex)) {
            const { type, display, raw } = item.data
            const layoutCell =
                type[0] /* first character of type name */ +
                (blocksOfSameType(item).length + 1)
            layoutRow.push(...repeat(width(item), layoutCell))
            if (!isAlreadyInBlocks(item)) {
                switch (item.data.type) {
                    case "paragraph":
                        contentBlocks.paragraphs.push({
                            id: workOnDisk.paragraphs.find(
                                p => p.internalID === item.id
                            ).id,
                            internalID: item.id,
                            content: display,
                        })
                        break

                    case "media":
                        const onDiskMedia = workOnDisk.media.find(
                            m => m.internalID === item.id
                        )
                        contentBlocks.media.push({
                            ...onDiskMedia, // TODO analyze new media from backend when path changed
                            internalID: item.id,
                            alt: display,
                            source: item.data.path,
                            // title: "", // TODO allow user to set title
                            // attributes: {
                            //     // TODO allow user to set attributes
                            //     looped: false,
                            //     autoplay: false,
                            //     muted: false,
                            //     playsinline: false,
                            //     controls: true,
                            // },
                        })
                        break

                    case "link":
                        contentBlocks.links.push({
                            id: workOnDisk.links.find(
                                p => p.internalID === item.id
                            ).id,
                            internalID: item.id,
                            name: display,
                            title: "", // TODO allow user to set title
                            url: raw,
                        })
                        break

                    default:
                        break
                }
            }
        }
        // FIXME fills with undefineds for some reason
        // FIXME does not work if there are spacers in the middle or before the first item
        layoutRow = completeWith(columnSize, null, layoutRow)
        //
        layout.push(layoutRow)
    }

    layout = normalizeLayout(layout, columnSize)

    return { layout, ...contentBlocks }
}

/**
 * Returns a normalized layout, meaning:
 * - index-less cells have their indices added
 * - single-cell row arrays are turned into the single cell's value (e.g. [l1] becomes l1)
 * - unecessary duplicate cells in rows are removed: (e.g. with a column count of 6, [l1, l1, m1, m1, m1] becomes [l1, m1, m1])
 * @param layout any ortfomk layout
 */
export function normalizeLayout(
    layout: OrtfoMkLayout,
    columnsCount: number
): OrtfoMkLayout {
    const mapOnRow = func => row =>
        Array.isArray(row) ? row.map(func) : func(row)

    const hasSingle = type =>
        new Set(
            layout
                .flatMap(mapOnRow(cell => cell))
                .filter(cell => cellType(cell) === type)
        ).size === 1

    const cellType = cell => (cell === null ? null : cell.slice(0, 1))

    const consecutiveRepeats = row => {
        let lastSeen = undefined // null is taken by spacers
        let repeats = []
        for (const cell of row) {
            // Previous cell was the same as this one.
            // It's a consecutive repeat, tally up in the lastest element of `repeats`.
            if (lastSeen === cell) {
                repeats[repeats.length - 1][1]++
                // Else, this is a new cell, so start a new element in `repeats`.
            } else {
                repeats.push([cell, 1])
            }
            lastSeen = cell
        }
        return repeats
    }

    const compressible = row =>
        // A row is only compressible if every **consecutive** repeat has its repeats count divisible by the total number of columns.
        // For example, [l1, l1, m1, m1, m1] is compressible, but [l1, m1, m1, m1, l1] is not!
        consecutiveRepeats(row).every(
            ([_, repeatsCount]) => repeatsCount % columnsCount === 0
        )

    const compress = row => {
        // To compress a row (meaning turn [l1, l1, m1, m1, m1] into [l1, m1, m1]),
        // create a new row with each **consecutive** repeat repeated the minimum number of times: original repeats count / total columns count.
        // ⚠ A row **cannot** be compressed properly if it is not compressible (see compressible)
        let compressed = []
        for (const [cell, repeatsCount] of consecutiveRepeats(row)) {
            compressed = [
                ...compressed,
                ...repeat(repeatsCount / columnsCount, cell),
            ]
        }
        return compressed
    }

    const compressed = layout.map(row => {
        if (Array.isArray(row) && compressible(row)) return compress(row)
        return row
    })
    if (compressed.some(row => row === undefined)) {
        throw Error("undefineds in compressed layout!!!!")
    }

    let latestCounts: { p: number; l: number; m: number } = {
        p: 0,
        l: 0,
        m: 0,
    }

    return layout
        .map(row => {
            if (Array.isArray(row) && compressible(row)) return compress(row)
            return row
        })
        .map(row => {
            if (Array.isArray(row) && row.length === 1) return row[0]
            return row
        })
        .map(
            mapOnRow(cell => {
                if (cell?.length === 1) {
                    latestCounts[cellType(cell)]++
                    return cell + latestCounts[cellType(cell)].toString()
                } else if (cell !== null) {
                    latestCounts[cellType(cell)] = parseInt(cell.slice(1))
                    return cell
                }
            })
        )
}

export function layoutWidth(layout: OrtfoMkLayout): number {
    return lcm(...layout.map(row => (Array.isArray(row) ? row.length : 1)))
}
