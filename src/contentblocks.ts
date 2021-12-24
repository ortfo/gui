import type { WorkOneLang, Paragraph, Media, Link } from "./ortfo"
import { backend } from "./backend"
import gridHelp from "svelte-grid/build/helper"

export type ContentBlock = {
    id: number
    [col: number]: {
        x: number
        y: number
        w: number
        h: number
    }
    data: {
        type: string
        raw: string // paragraph: empty, media: src, link: href
        display: string // paragraph: content, media: alt, link: name
    }
}

export async function makeBlocks(
    work: WorkOneLang
): Promise<{ blocks: ContentBlock[]; numberOfColumns: number }> {
    const numberOfColumns = Math.max(
        ...work.metadata.layout.map(
            row => (Array.isArray(row) ? row : [row]).length
        )
    )
    console.log(
        `#cols=${numberOfColumns} for ${JSON.stringify(work.metadata.layout)}`
    )
    const elements = await backend.layout(work)
    return {
        numberOfColumns,
        blocks: elements.map((element, index) => {
            let block = {
                id: index,
            }
            block[numberOfColumns] = gridHelp.item({
                // We assume that the element's positions are contiguous.
                x: Math.min(...element.positions.map(pos => pos[0])),
                y: Math.min(...element.positions.map(pos => pos[1])),
                w:
                    Math.max(...element.positions.map(pos => pos[0])) -
                    Math.min(...element.positions.map(pos => pos[0])) +
                    1,
                h:
                    Math.max(...element.positions.map(pos => pos[1])) -
                    Math.min(...element.positions.map(pos => pos[1])) +
                    1,
            })
            switch (element.type) {
                case "paragraph":
                    block.data = {
                        type: element.type,
                        raw: "",
                        display: element.content,
                    }
                    break
                case "media":
                    block.data = {
                        type: element.type,
                        raw: element.source,
                        display: element.alt,
                    }
                    break
                case "link":
                    block.data = {
                        type: element.type,
                        raw: element.url,
                        display: element.name,
                    }
            }
            return block
        }),
    }
}
