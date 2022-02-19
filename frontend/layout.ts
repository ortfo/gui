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

// toLayout transforms an array of grid of svelte-grid items into a ortfomk layout
export function toLayout(
    items: SvelteGridItem[],
    columnSize: number
): OrtfoMkLayout {
    let layout: OrtfoMkLayout = []
    items = items
        .map(i => ({ ...i, position: i[columnSize] }))
        .sort(
            (a, b) => (a.position.y - b.position.y, a.position.x - b.position.x)
        )
    console.info(items.map(i => i.data.display))
}
