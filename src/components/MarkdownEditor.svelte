<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from "svelte"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
// import BubbleMenu from "@tiptap/extension-bubble-menu"
import Link from "@tiptap/extension-link"
import type { ActionName } from "./MarkdownToolbar.svelte"

export let value: string
export let operationsStack: ActionName[]
export let itemID: number

let element
let editor: Editor
let actions: Record<ActionName, { run: () => boolean }>

const dispatch = createEventDispatcher()

onMount(() => {
	editor = new Editor({
		element,
		extensions: [StarterKit, Link],
		content: value,
		onTransaction: () => {
			editor = editor
		},
		onUpdate: ({ editor }) => {
			dispatch("input", editor.getHTML())
		},
	})
	actions = {
		bold: editor.chain().focus().toggleMark("bold"),
		italic: editor.chain().focus().toggleMark("italic"),
		code: editor.chain().focus().toggleMark("code"),
		link: editor.chain().focus().toggleMark("link"),
		heading: editor.chain().focus().toggleHeading({ level: 2 }),
		"code-block": editor.chain().focus().toggleCodeBlock(),
		"list-bullets": editor.chain().focus().toggleBulletList(),
		"list-numbered": editor.chain().focus().toggleOrderedList(),
		media: {
			run: () => {
				console.error("not implemented")
				return false
			},
		},
		"list-definitions": {
			run: () => {
				console.error("not implemented")
				return false
			},
		},
	}
})

onDestroy(() => {
	if (editor) {
		editor.destroy()
	}
})

$: while (operationsStack?.length) {
	console.log(operationsStack)
	const action = operationsStack.pop()
	console.log(`Executing action ${action} on editor #${itemID}`)
	let result: boolean
	if (action in ["code", "link", "bold", "italic"]) {
		result = editor.chain().focus().toggleMark(action).run()
	} else if (action === "code-block") {
		result = editor.chain().focus().toggleCodeBlock().run()
	} else if (action === "list-bullets") {
		result = editor.chain().focus().toggleBulletList().run()
	} else if (action === "list-numbered") {
		result = editor.chain().focus().toggleOrderedList().run()
	}
	console.log(
		`, which was executed ${result ? "successfully" : "unsuccessfully"}`
	)
}
</script>

<div class="markdown-editor" bind:this={element} />
