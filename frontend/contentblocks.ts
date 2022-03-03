import type { WorkOneLang, Paragraph, Media, Link } from "./ortfo"
import { backend } from "./backend"
import gridHelp from "svelte-grid/build/helper"
import { layoutWidth, OrtfoMkLayout } from "./layout"

export type ContentBlock = {
    id: string
    [col: number]: {
        x: number
        y: number
        w: number
        h: number
    }
    data: {
        type: string
        raw: string // paragraph: empty, media: base64-encoded image data of 400px thumbnail, link: href
        display: string // paragraph: content, media: alt, link: name
        path?: string // media: path
    }
}

export async function makeBlocks(
    work: WorkOneLang
): Promise<{ blocks: ContentBlock[]; numberOfColumns: number }> {
    const numberOfColumns = work.metadata.layout
        ? layoutWidth(work.metadata.layout)
        : 1
    let elements
    try {
        elements = await backend.layout(work)
    } catch (error) {
        console.error(error)
        return { blocks: [], numberOfColumns }
    }
    return {
        numberOfColumns,
        blocks: await Promise.all(
            elements.map(async (element, index) => {
                let block: ContentBlock = {
                    id: element.internalID,
                } as unknown as ContentBlock
                block[numberOfColumns] = gridHelp.item({
                    // We assume that the element's positions are contiguous.
                    x: Math.min(...element.positions.map(pos => pos[1])),
                    y: Math.min(...element.positions.map(pos => pos[0])),
                    w:
                        Math.max(...element.positions.map(pos => pos[1])) -
                        Math.min(...element.positions.map(pos => pos[1])) +
                        1,
                    h:
                        Math.max(...element.positions.map(pos => pos[0])) -
                        Math.min(...element.positions.map(pos => pos[0])) +
                        1,
                    customDragger: true,
                    customResizer: true,
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
                            raw: await backend.getMedia(
                                work.metadata.thumbnails[element.path][400]
                            ),
                            display: element.alt,
                            path: element.path,
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
            })
        ),
    }
}
