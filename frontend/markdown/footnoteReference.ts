import { Node, nodeInputRule } from "@tiptap/core"

export const FootnoteReference = Node.create({
    name: "footnoteReference",
    priority: 500, // Needs to be parsed before <sup>
    group: "inline",
    inline: true,
    atom: true,

    addAttributes() {
        return {
            reference: {
                default: "",
                parse: (element: HTMLElement) => {
                    return element.querySelector("a").innerText.trim()
                },
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: "sup.footnote-ref",
                getAttrs: element => {
                    if (typeof element === "string") return false
                    if (element.childNodes.length !== 1) return false
                    const child = element.firstChild
                    if (child.nodeName !== "A") return false

                    return {
                        reference: child.textContent.trim(),
                    }
                },
            },
        ]
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: /(\[\^([^\s\]]+)\])/,
                getAttributes: match => ({
                    reference: match[2],
                }),
                type: this.type,
            }),
        ]
    },

    renderHTML({ node }) {
        return [
            "sup",
            { class: "footnote-ref", id: `fnref:${node.attrs.reference}` },
            [
                "a",
                { href: `#fn:${node.attrs.reference}` },
                node.attrs.reference,
            ],
        ]
    },

    renderText({ node }) {
        return `[^${node.attrs.reference}]`
    },
})
