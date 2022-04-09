import { Node, Mark, markInputRule, textblockTypeInputRule } from "@tiptap/core"

export const MathDisplay = Node.create({
    name: "mathDisplay",
    group: "block",
    content: "text*",

    parseHTML() {
        return [{ tag: ".math.display" }]
    },

    addInputRules() {
        return [
            textblockTypeInputRule({
                find: /^(\$\$|\\\[)[\s\n]$/,
                type: this.type,
            }),
        ]
    },

    renderHTML() {
        return ["span", { class: "math display" }, 0]
    },
})

export const MathInline = Mark.create({
    name: "mathInline",

    parseHTML() {
        return [{ tag: ".math.inline" }]
    },

    addInputRules() {
        return [
            markInputRule({
                find: /^(\$|\\\()[\s\n]$/,
                type: this.type,
            }),
        ]
    },

    renderHTML() {
        return ["span", { class: "math inline" }, 0]
    },
})
