import { groupBy } from "lodash"
import { ContentBlock } from "./contentblocks"
import { lcm, range, repeat } from "./utils"

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

export function fromBlocksToLayout(
    blocks: ContentBlock[],
    size: number
): OrtfoMkLayout {
    const layout: OrtfoMkLayout = []
    const repeated = []
    for (const block of blocks) {
        const { x, y, w, h } = block[size]
        const { type } = block.data
        for (const current_x of range(x, x + w)) {
            for (const current_y of range(y, y + h)) {
                repeated.push([current_x, current_y, type, block.id])
            }
        }
    }
    for (const row of Object.values(groupBy(repeated, e => e[1]))) {
        layout.push(
            row.map(([x, y, type, id]) => {
                const [_, layoutIndex] = id.split(":")
                return `${type[0]}${layoutIndex}` as OrtfoMkLayoutCell
            })
        )
    }
    return normalizeLayout(layout, size)
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

    debugger
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
