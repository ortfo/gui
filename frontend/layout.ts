import type {
    Link,
    Media,
    Paragraph,
    UnanalyzedMedia,
    Work,
    WorkOneLang,
} from "./ortfo"
import { completeWith, range, repeat } from "./utils"

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

export type OrtfoMkLayout = (`${"p" | "m" | "l"}${number}` | null)[][]

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
        layoutRow = completeWith(columnSize, null, layoutRow)
        layout.push(layoutRow)
    }

    return { layout, ...contentBlocks }
}
