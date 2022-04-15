<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from "svelte"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { tooltip } from "../actions"
// import BubbleMenu from "@tiptap/extension-bubble-menu"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { FootnoteReference } from "../markdown/footnoteReference"
import { MathDisplay, MathInline } from "../markdown/math"
import { _ } from "svelte-i18n"

const dispatch = createEventDispatcher()

export let value: string
export let placeholder: string = ""
export let active: boolean = false
export let noBorder: boolean = false

let element
let editor: Editor
let onToolbar: boolean // Whether the mouse is over the toolbar

function toBuffer(value: string) {
	return value
}

function fromBuffer(buffer: string) {
	return buffer
}

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
	"set-content-to-value": editor.chain().setContent(toBuffer(value)),
})

onMount(() => {
	editor = new Editor({
		element,
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
		content: toBuffer(value),
		onTransaction: () => {
			editor = editor
		},
		onUpdate: ({ editor }) => {
			value = fromBuffer(editor.getHTML())
			dispatch("input", value)
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
	editor.chain().setContent(toBuffer(value)).run()
}
</script>

<div class="_markdown-editor" class:noBorder>
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
				use:tooltip={$_("Bold")}
				data-variant="none"
				on:click={actions(editor)["bold"].run}
				tabindex="-1"
				><img
					src="/assets/icon-bold.svg"
					alt={$_("bold")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Italic")}
				data-variant="none"
				on:click={actions(editor)["italic"].run}
				tabindex="-1"
				><img
					src="/assets/icon-italic.svg"
					alt={$_("italic")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Heading")}
				data-variant="none"
				on:click={actions(editor)["heading"].run}
				tabindex="-1"
				><img
					src="/assets/icon-heading.svg"
					alt="heading"
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Code")}
				data-variant="none"
				on:click={actions(editor)["code"].run}
				tabindex="-1"
				><img
					src="/assets/icon-code.svg"
					alt={$_("code")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Block of code")}
				data-variant="none"
				on:click={actions(editor)["code-block"].run}
				tabindex="-1"
				><img
					src="/assets/icon-code-block.svg"
					alt={$_("code block")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Insert media")}
				data-variant="none"
				on:click={actions(editor)["media"].run}
				tabindex="-1"
				><img
					src="/assets/icon-insert-media.svg"
					alt={$_("media")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Link")}
				data-variant="none"
				on:click={actions(editor)["link"].run}
				tabindex="-1"
				><img
					src="/assets/icon-link.svg"
					alt="link"
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Bullet list")}
				data-variant="none"
				on:click={actions(editor)["list-bullets"].run}
				tabindex="-1"
				><img
					src="/assets/icon-list-bullets.svg"
					alt={$_("bullet list")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("Numbered list")}
				data-variant="none"
				on:click={actions(editor)["list-numbered"].run}
				tabindex="-1"
				><img
					src="/assets/icon-list-numbered.svg"
					alt={$_("numbered list")}
					class="icon"
				/></button
			>
		</li>
		<li>
			<button
				use:tooltip={$_("List of definitions")}
				data-variant="none"
				on:click={actions(editor)["list-definitions"].run}
				tabindex="-1"
				><img
					src="/assets/icon-list-definitions.svg"
					alt={$_("definition list")}
					class="icon"
				/></button
			>
		</li>
	</ul>
	<div class="editor" bind:this={editorElement} />
</div>

<style>
:global(.editor ul, .editor ol) {
	padding-left: 1em;
}

/* Placeholder */
:global(.editor p.is-editor-empty:first-child::before) {
	content: attr(data-placeholder);
	color: var(--gray);
}

:global(._markdown-editor.noBorder) {
	border: none;
}

:global(.editor sup) {
	font-size: 0.9em;
	line-height: 0.8em;
	vertical-align: super;
}

:global(.editor strong) {
	font-variation-settings: "wght" 800;
}

:global(.editor sup.footnote-ref a) {
	text-decoration: none;
	font-variation-settings: "wght" 800;
}

:global(._markdown-editor .editor .ProseMirror) {
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
