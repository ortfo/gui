export type SvelteGridItem = {
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
    data: any
}

export type OrtfoMkLayout = (`${"p" | "m" | "l"}${number}`)[][]

// toLayout transforms an array of grid of svelte-grid items into a ortfomk layout
export function toLayout(items: SvelteGridItem[]) OrtfoMkLayout {
    let layout: OrtfoMkLayout = []
    items.forEach(item => {
        
    })
}
