<script lang="ts" context="module">
export type ActionName =
	| "bold"
	| "italic"
	| "heading"
	| "code"
	| "code-block"
	| "media"
	| "link"
	| "list-bullets"
	| "list-numbered"
	| "list-definitions"
</script>

<script lang="ts">
import type { Editor } from "@tiptap/core"
import { createEventDispatcher } from "svelte"

const dispatch = createEventDispatcher()

const emitAction = (actionName: ActionName) => e =>
	dispatch("action", actionName)
</script>

<ul class="toolbar">
	<li>
		<button data-variant="none" on:click={emitAction("bold")}
			><img src="/assets/icon-bold.svg" alt="bold" class="icon" /></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("italic")}
			><img
				src="/assets/icon-italic.svg"
				alt="italic"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("heading")}
			><img
				src="/assets/icon-heading.svg"
				alt="heading"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("code")}
			><img src="/assets/icon-code.svg" alt="code" class="icon" /></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("code-block")}
			><img
				src="/assets/icon-code-block.svg"
				alt="code block"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("media")}
			><img
				src="/assets/icon-insert-media.svg"
				alt="media"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("link")}
			><img src="/assets/icon-link.svg" alt="link" class="icon" /></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("list-bullets")}
			><img
				src="/assets/icon-list-bullets.svg"
				alt="bullet list"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("list-numbered")}
			><img
				src="/assets/icon-list-numbered.svg"
				alt="numbered list"
				class="icon"
			/></button
		>
	</li>
	<li>
		<button data-variant="none" on:click={emitAction("list-definitions")}
			><img
				src="/assets/icon-list-definitions.svg"
				alt="definition list"
				class="icon"
			/></button
		>
	</li>
</ul>

<style>
ul {
	list-style: none;
	display: flex;
}

li {
	padding: 0;
}

li + li {
	margin-left: 1em;
}
</style>
