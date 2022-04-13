import tippy from "sveltejs-tippy"

export const tooltip = (
    node: HTMLElement,
    parameters: string | [string, number] | Object
) => {
    let content: string
    let delay: number = 50
    if (typeof parameters === "string") {
        content = parameters
    } else if (Array.isArray(parameters)) {
        ;[content, delay] = parameters
    } else {
        // node.title = parameters.content
        return tippy(node, parameters)
    }
    // node.title = content
    return tippy(node, { content, delay: [delay, 0] })
}

export const scrollStates = (
    element: HTMLElement,
    thresholds: { bottom: number; top: number }
) => {
    element.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } = element
        const { bottom, top } = thresholds
        const isBottom = scrollTop + clientHeight >= scrollHeight - bottom
        const isTop = scrollTop <= top
        if (isBottom || isTop) {
            element.dataset.scrolled = isBottom
                ? "bottom"
                : isTop
                ? "top"
                : null
        } else {
            delete element.dataset.scrolled
        }
    })
}
