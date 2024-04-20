<script lang="ts">
import { createEventDispatcher } from "svelte"
import type { ContentBlock } from "../contentblocks"
import FieldText from "./FieldText.svelte"
import MarkdownEditor from "./MarkdownEditor.svelte"
import { clickOutside } from "../actions"
import { scale } from "svelte/transition"
import { settings } from "../stores"
import type { AnalyzedWorkLocalized } from "../ortfo"
import { _ } from "svelte-i18n"
import { tooltip } from "../actions"
import ContentBlockMedia from "./ContentBlockMedia.svelte"

const dispatch = createEventDispatcher()

export let block: ContentBlock
export let work: AnalyzedWorkLocalized
export let activeBlock: string

let choosingWhatToInsert: boolean = false
</script>

<div
	in:scale
	class="block"
	data-type={block.data.type}
	id={`block-${block.id}`}
	class:active={activeBlock === block.id}
>
	<div class="content" data-theme={$settings.theme}>
		{#if block.data.type === "paragraph"}
			<MarkdownEditor
				noBorder
				bind:value={block.data.content}
				active={activeBlock === block.id}
				on:blur={() => (activeBlock = null)}
				on:focus={() => (activeBlock = block.id)}
				placeholder={$_("write some text here")}
			/>
		{:else if block.data.type === "link"}
			<dl>
				<FieldText
					key="name"
					bind:value={block.data.text}
					on:focus={() => (activeBlock = block.id)}
					on:blur={() => (activeBlock = null)}
					placeholder={$_("name your link")}
				/>
				<FieldText
					key="url"
					bind:value={block.data.url}
					on:focus={() => (activeBlock = block.id)}
					on:blur={() => (activeBlock = null)}
					placeholder={$_("put the url here")}
				/>
			</dl>
		{:else if block.data.type === "media"}
			<ContentBlockMedia {block} {work} {activeBlock} />
		{/if}
	</div>
	<div
		class="deleter"
		use:tooltip={[$_("delete block"), 500]}
		on:click={() => dispatch("remove")}
	>
		<img src="/assets/icon-delete.svg" class="icon" alt={$_("delete")} />
	</div>
	<div
		class="dragger"
		use:tooltip={[$_("move"), 500]}
		on:mousedown={e => dispatch("movePointerDown", e)}
	>
		<img src="/assets/icon-move.svg" class="icon" alt={$_("move")} />
	</div>
	{#if choosingWhatToInsert}
		<ul
			class="insert-below"
			use:clickOutside
			on:click-outside={() => {
				choosingWhatToInsert = false
			}}
		>
			<li>
				<img
					src="/assets/icon-media.svg"
					alt="media"
					class="icon"
					on:click={() => {
						choosingWhatToInsert = false
						dispatch("insert-below", "media")
					}}
				/>
			</li>
			<li>
				<img
					src="/assets/icon-paragraph.svg"
					alt="paragraph"
					class="icon"
					on:click={() => {
						choosingWhatToInsert = false
						dispatch("insert-below", "paragraph")
					}}
				/>
			</li>
			<li>
				<img
					src="/assets/icon-major-link.svg"
					alt="link"
					class="icon"
					on:click={() => {
						choosingWhatToInsert = false
						dispatch("insert-below", "link")
					}}
				/>
			</li>
		</ul>
	{:else}
		<div
			class="insert-below"
			use:tooltip={[$_("insert below"), 500]}
			on:click={() => {
				choosingWhatToInsert = true
			}}
		>
			<div class="icon-insert-below open">+</div>
		</div>
	{/if}
	<div
		class="resizer"
		use:tooltip={[$_("resize"), 500]}
		on:mousedown={(e) => dispatch("resizePointerDown", e)}
	>
		<img
			src="/assets/icon-resize.svg"
			class="icon"
			alt={$_("resize")}
			draggable="false"
		/>
	</div>
</div>

<style lang="scss">
.block {
	border: 0.175em solid var(--gray);
	border-radius: 0.5em;
	transition-delay: 100ms;
	transition: border-color 0.4s ease-in-out;
	overflow: hidden;
}

.block:not([data-type="paragraph"]) .content {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}

.block:not([data-type="paragraph"]) h2 {
	margin-top: 0;
	margin-bottom: 1.5em;

	&::before {
		content: "— ";
	}
	&::after {
		content: " —";
	}
}

.block[data-type="link"] .content {
	justify-content: center;
	align-items: center;
}

.block[data-type="media"] {
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}

.block.active {
	border-color: var(--ortforange);
}

.block,
.create-block {
	position: relative;
	height: 100%;
	width: 100%;
}
.block .content,
.create-block {
	padding: 1em;
}

.block .content {
	height: 100%;
	display: flex;
	flex-direction: column;
	flex-grow: 0;
	min-height: 0;
}

.block:not(:hover) .dragger,
.block:not(:hover) .resizer,
.block:not(:hover) .deleter {
	opacity: 0;
}

.resizer,
.dragger,
.deleter,
.insert-below {
	position: absolute;
	transition: all 0.2s ease;
}
.resizer {
	cursor: nwse-resize;
	bottom: 1rem;
	right: 1rem;
}

.dragger {
	cursor: move;
	bottom: 1rem;
	left: 1rem;
}

.deleter {
	cursor: pointer;
	top: 1rem;
	right: 1rem;
}

.insert-below {
	cursor: pointer;
	bottom: 1rem;
	transform: translateX(-50%);
	left: 50%;
}

.dragger .icon,
.resizer .icon,
.deleter .icon,
.insert-below .icon {
	height: 2rem;
	width: 2rem;
}

.icon-insert-below, .insert-below .icon {
	transform: scale(1.5);
}

.icon-insert-below.open {
	font-size: 1.7rem;
	justify-content: center;
	align-items: center;
	display: flex;
}

.insert-below li {
	list-style: none;
}
ul.insert-below {
	display: flex;
}
</style>
