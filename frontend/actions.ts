import { MessageFormater, _ } from "svelte-i18n"
import { element } from "svelte/internal"
import { get } from "svelte/store"
import tippy from "sveltejs-tippy"
import { settings } from "./stores"

export const helptip = (
    node: HTMLElement,
    parameters: string | [string, number] | Object
) => {
    if (get(settings)?.showtips) {
        return tooltip(node, parameters)
    }
}

export const tooltip = (
    node: HTMLElement,
    parameters: string | [string, number] | Object
) => {
    let content: string
    let delay: number = 50
    if (parameters === "") {
        return
    }
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

export const i18n = (element: HTMLElement) => {
    const svelteClassPattern = /s-[\w_-]+/

    const withoutSvelteClasses = htmlContent => {
        let parsed = document.createElement("div")
        parsed.innerHTML = htmlContent
        parsed.querySelectorAll("[class]").forEach(element => {
            ;[...element.classList].forEach(className => {
                if (svelteClassPattern.test(className)) {
                    element.classList.remove(className)
                }
            })
            if (element.classList.length === 0) {
                element.removeAttribute("class")
            }
        })
        return parsed.innerHTML
    }

    const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ")

    _.subscribe(messageFormatter => {
        element.innerHTML = messageFormatter(
            withoutSvelteClasses(collapseWhitespace(element.innerHTML))
        )
    })
}

export const clickOutside = node => {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent("click-outside", node))
        }
    }

    document.addEventListener("click", handleClick, true)

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true)
        },
    }
}
