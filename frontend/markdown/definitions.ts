import { Node } from "@tiptap/core"

export const DefinitionList = Node.create({
    name: "definitionList",
    group: "block list",
    content: "definitionItem+",

    parseHTML() {
        return [{ tag: "dl" }]
    },

    renderHTML({ HTMLAttributes }) {
        return ["dl", HTMLAttributes, 0]
    },

    addInputRules() {
        return []
    },
})
