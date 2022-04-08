import type { Content } from "@tiptap/core"
import { groupBy, last } from "lodash"
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

export function blockAt(
    blocks: ContentBlock[],
    size: number
): (x: number, y: number) => ContentBlock | null {
    return (target_x, target_y) =>
        blocks.find(({ [size]: { x, y, w, h }, id }) => {
            return (
                range(x, x + w).includes(target_x) &&
                range(y, y + h).includes(target_y)
            )
        }) || null
}

export function fromBlocksToLayout(
    blocks: ContentBlock[],
    layoutWidth: number
): OrtfoMkLayout {
    if (blocks.length === 0) {
        return []
    }
    let layout: OrtfoMkLayout = []
    const at = blockAt(blocks, layoutWidth)
    const layoutHeight = Math.max(...blocks.map(b => b[layoutWidth].y)) + 1

    for (const y of range(0, layoutHeight)) {
        const row: OrtfoMkLayoutCell[] = []
        for (const x of range(0, layoutWidth)) {
            const block = at(x, y)
            let cell: OrtfoMkLayoutCell
            if (block === null) {
                row.push(null)
            } else {
                const [_, layoutIndex] = block.id.split(":")
                row.push(`${block.data.type[0]}${parseInt(layoutIndex) + 1}`)
            }
        }
        layout.push(row)
    }

    layout = normalizeLayout(layout, layoutWidth)

    return layout
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
            if (lastSeen === cell) {
                // Previous cell was the same as this one.
                // It's a consecutive repeat, tally up in the lastest element of `repeats`.
                repeats[repeats.length - 1][1]++
            } else {
                // Else, this is a new cell, so start a new element in `repeats`.
                repeats.push([cell, 1])
            }
            lastSeen = cell
        }
        return repeats
    }

    const compress = row => {
        const compressionRate = Math.min(
            ...consecutiveRepeats(row).map(([, r]) => r)
        )
        // To compress a row (meaning turn [l1, l1, m1, m1, m1] into [l1, m1, m1]),
        // create a new row with each **consecutive** repeat repeated the minimum number of times: original repeats count / lowest repeat count of row.
        let compressed = []
        for (const [cell, repeatsCount] of consecutiveRepeats(row)) {
            compressed = [
                ...compressed,
                ...repeat(repeatsCount / compressionRate, cell),
            ]
        }
        return compressed
    }

    let latestCounts: { p: number; l: number; m: number } = {
        p: 0,
        l: 0,
        m: 0,
    }

    return layout
        .map(row => {
            if (Array.isArray(row)) return compress(row)
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
                return cell
            })
        )
}

export function layoutWidth(layout: OrtfoMkLayout): number {
    return lcm(...layout.map(row => (Array.isArray(row) ? row.length : 1)))
}
