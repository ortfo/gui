import { describe, expect, it } from "vitest"
import { ContentBlock } from "./contentblocks"
import { fromBlocksToLayout } from "./layout"

describe("fromBlocksToLayout", () => {
    const blockGenerator =
        (size: number) =>
        (
            x: number,
            y: number,
            w: number,
            h: number,
            type: "link" | "paragraph" | "media",
            layoutIndex: number
        ) =>
            ({
                [size]: {
                    x,
                    y,
                    w,
                    h,
                },
                data: {
                    type,
                },
                id: `${type}:${layoutIndex}`,
            } as ContentBlock)

    it("re-creates correctly a single-cell layout", () => {
        const block = blockGenerator(1)
        const layout = fromBlocksToLayout([block(0, 0, 1, 1, "link", 1)], 1)

        expect(layout).toEqual(["l1"])
    })

    it("re-creates a more complex layout", () => {
        const block = blockGenerator(6)
        /*

        [p]
        [m1, m2, m3]
        [m1, l]
        [l, p]
        [l, l, l, l]

        */
        const layout = [
            block(0, 0, 6, 1, "paragraph", 1),
            block(0, 1, 1, 2, "media", 1),
            block(1, 1, 1, 1, "media", 2),
            block(2, 1, 1, 1, "media", 3),
            block(2, 2, 1, 1, "link", 1),
            block(0, 3, 1, 1, "link", 2),
            block(1, 3, 1, 1, "paragraph", 2),
            block(0, 4, 1, 1, "link", 3),
            block(1, 4, 1, 1, "link", 4),
            block(2, 4, 1, 1, "link", 5),
            block(3, 4, 1, 1, "link", 6),
        ]

        expect(fromBlocksToLayout(layout, 6)).toEqual([
            "p1",
            ["m1", "m2", "m3"],
            ["m1", "l1"],
            ["l2", "p2"],
            ["l3", "l4", "l5", "l6"],
        ])
    })
})
