import { describe, expect, it } from "vitest"
import type { ContentBlock } from "./contentblocks"
import { fromBlocksToLayout, normalizeLayout } from "./layout"

describe("normalizeLayout", () => {
    it("removes useless duplicates in rows", () => {
        expect(
            normalizeLayout([["l1", "l1", "l1", "m2", "m2", "m2"]], 6)
        ).toEqual([["l1", "m2"]])
        expect(
            normalizeLayout(
                [
                    "p1",
                    [
                        "m1",
                        "m1",
                        "m1",
                        "m1",
                        "m2",
                        "m2",
                        "m2",
                        "m2",
                        "m3",
                        "m3",
                        "m3",
                        "m3",
                    ],
                    [
                        "m1",
                        "m1",
                        "m1",
                        "m1",
                        "l1",
                        "l1",
                        "l1",
                        "l1",
                        "l1",
                        "l1",
                        "l1",
                        "l1",
                    ],
                    ["l2", "p2"],
                    ["l3", "l4", "l5", "l6"],
                ],
                12
            )
        ).toEqual([
            "p1",
            ["m1", "m2", "m3"],
            ["m1", "l1", "l1"],
            ["l2", "p2"],
            ["l3", "l4", "l5", "l6"],
        ])
    })
})

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
        const layout = fromBlocksToLayout([block(0, 0, 1, 1, "link", 0)], 1)

        expect(layout).toEqual(["l1"])
    })

    it("re-creates a more complex layout", () => {
        const block = blockGenerator(12)
        /*

        [p]
        [m1, m2, m3]
        [m1, l1, l1]
        [l, p]
        [l, l, l, l]

        */
        const layout = [
            block(0, 0, 12, 1, "paragraph", 0),
            block(0, 1, 4, 2, "media", 0),
            block(4, 1, 4, 1, "media", 1),
            block(8, 1, 4, 1, "media", 2),
            block(4, 2, 8, 1, "link", 0),
            block(0, 3, 6, 1, "link", 1),
            block(6, 3, 6, 1, "paragraph", 1),
            block(0, 4, 3, 1, "link", 2),
            block(3, 4, 3, 1, "link", 3),
            block(6, 4, 3, 1, "link", 4),
            block(9, 4, 3, 1, "link", 5),
        ]

        expect(fromBlocksToLayout(layout, 12)).toEqual([
            "p1",
            ["m1", "m2", "m3"],
            ["m1", "l1", "l1"],
            ["l2", "p2"],
            ["l3", "l4", "l5", "l6"],
        ])
    })

    it("re-creates a rather complex layout with spacers", () => {
        /*
            p1
            m1
            [null, p2]
            [null, p3]
            [p4, null]
            p5
            p6
            l1
            [p7, null]
            m2
            [p8, null]
            [p9, null]
            [p10, null]
        */

        const block = blockGenerator(2)
        const layout = [
            block(0, 0, 2, 1, "paragraph", 0),
            block(0, 1, 2, 1, "media", 0),
            block(1, 2, 1, 1, "paragraph", 1),
            block(1, 3, 1, 1, "paragraph", 2),
            block(0, 4, 1, 1, "paragraph", 3),
            block(0, 5, 2, 1, "paragraph", 4),
            block(0, 6, 2, 1, "paragraph", 5),
            block(0, 7, 2, 1, "link", 0),
            block(0, 8, 1, 1, "paragraph", 6),
            block(0, 9, 2, 1, "media", 1),
            block(0, 10, 1, 1, "paragraph", 7),
            block(0, 11, 1, 1, "paragraph", 8),
            block(0, 12, 1, 1, "paragraph", 9),
        ]

        expect(fromBlocksToLayout(layout, 2)).toEqual([
            "p1",
            "m1",
            [null, "p2"],
            [null, "p3"],
            ["p4", null],
            "p5",
            "p6",
            "l1",
            ["p7", null],
            "m2",
            ["p8", null],
            ["p9", null],
            ["p10", null],
        ])
    })
})
