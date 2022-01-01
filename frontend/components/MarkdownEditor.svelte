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

const actions = editor => ({
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
	"set-content-to-value": editor.chain().setContent(value),
})
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
		onBlur: () => {
			dispatch("blur")
		},
		onFocus: () => {
			dispatch("focus")
		},
	})
})

onDestroy(() => {
	if (editor) {
		editor.destroy()
	}
})

$: while (operationsStack?.length) {
	const action = operationsStack.pop()
	if (editor === undefined) continue
	try {
		actions(editor)[action].run()
	} catch (e) {
		console.error(`Couldn't run ${action}: ${e}`)
	}
}
</script>

<div class="markdown-editor" bind:this={element} />

<style>
:global(.markdown-editor ul, .markdown-editor ol) {
	padding-left: 1em;
}
</style>
