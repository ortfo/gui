<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from "svelte"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { tooltip } from "../actions"
// import BubbleMenu from "@tiptap/extension-bubble-menu"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import type { Writable } from "svelte/store"
import { FootnoteReference } from "../markdown/footnoteReference"
import { MathDisplay, MathInline } from "../markdown/math"

export let value: string
export let placeholder: string = ""
export let active: boolean = false

let element
let editor: Editor
let onToolbar: boolean // Whether the mouse is over the toolbar

const actions = (editor: Editor) => ({
	bold: editor.chain().focus().toggleMark("bold").focus(),
	italic: editor.chain().focus().toggleMark("italic").focus(),
	code: editor.chain().focus().toggleMark("code").focus(),
	link: editor.chain().focus().toggleMark("link").focus(),
	heading: editor.chain().focus().toggleHeading({ level: 2 }).focus(),
	"code-block": editor.chain().focus().toggleCodeBlock().focus(),
	"list-bullets": editor.chain().focus().toggleBulletList().focus(),
	"list-numbered": editor.chain().focus().toggleOrderedList().focus(),
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
		content: value,
		extensions: [
			FootnoteReference,
			StarterKit,
			MathDisplay,
			MathInline,
			Link.configure({
				HTMLAttributes: [],
			}),
			Placeholder.configure({ placeholder }),
		],
		onTransaction: () => {
			editor = editor
		},
		onUpdate: ({ editor }) => {
			dispatch("input", editor.getHTML())
		},
		onBlur: () => {
			if (!onToolbar) {
				dispatch("blur")
			}
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

// Only update editor's buffer when not editing
$: if (editor && !editor.isFocused && !onToolbar) {
	editor.chain().setContent(value).run()
}
</script>

<ul
	class="toolbar"
	class:active
	on:mouseenter={_ => (onToolbar = true)}
	on:focus={_ => (onToolbar = true)}
	on:mouseleave={_ => (onToolbar = false)}
	on:blur={_ => (onToolbar = false)}
>
	<li>
		<button
			use:tooltip={"Bold"}
			data-variant="none"
			on:click={actions(editor)["bold"].run}
			><img src="/assets/icon-bold.svg" alt="bold" class="icon" /></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Italic"}
			data-variant="none"
			on:click={actions(editor)["italic"].run}
			><img
				src="/assets/icon-italic.svg"
				alt="italic"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Heading"}
			data-variant="none"
			on:click={actions(editor)["heading"].run}
			><img
				src="/assets/icon-heading.svg"
				alt="heading"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Code"}
			data-variant="none"
			on:click={actions(editor)["code"].run}
			><img src="/assets/icon-code.svg" alt="code" class="icon" /></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Block of code"}
			data-variant="none"
			on:click={actions(editor)["code-block"].run}
			><img
				src="/assets/icon-code-block.svg"
				alt="code block"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Insert media"}
			data-variant="none"
			on:click={actions(editor)["media"].run}
			><img
				src="/assets/icon-insert-media.svg"
				alt="media"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Link"}
			data-variant="none"
			on:click={actions(editor)["link"].run}
			><img src="/assets/icon-link.svg" alt="link" class="icon" /></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Bullet list"}
			data-variant="none"
			on:click={actions(editor)["list-bullets"].run}
			><img
				src="/assets/icon-list-bullets.svg"
				alt="bullet list"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"Numbered list"}
			data-variant="none"
			on:click={actions(editor)["list-numbered"].run}
			><img
				src="/assets/icon-list-numbered.svg"
				alt="numbered list"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button
			use:tooltip={"List of definitions"}
			data-variant="none"
			on:click={actions(editor)["list-definitions"].run}
			><img
				src="/assets/icon-list-definitions.svg"
				alt="definition list"
				class="icon"
			/></button
		>
	</li>
</ul>
<div class="editor" bind:this={element} />

<style>
:global(.editor ul, .editor ol) {
	padding-left: 1em;
}

/* Placeholder */
:global(.editor p.is-editor-empty:first-child::before) {
	content: attr(data-placeholder);
	color: var(--gray);
}

:global(.editor sup) {
	font-size: 0.8em;
	line-height: 1.2em;
	vertical-align: super;
}

:global(.editor .ProseMirror) {
	max-height: 260px;
	overflow-y: scroll;
}

.toolbar {
	list-style: none;
	display: flex;
}

.toolbar li {
	padding: 0;
}

.toolbar li + li {
	margin-left: 1em;
}

.toolbar:not(.active) {
	opacity: 0;
	pointer-events: none;
}

.toolbar {
	transition: all 0.2s ease-in-out;
}
</style>
