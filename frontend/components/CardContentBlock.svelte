<script lang="ts">
import { createEventDispatcher } from "svelte"

import type { ContentBlock } from "../contentblocks"
import FieldFilepath from "./FieldFilepath.svelte"
import FieldText from "./FieldText.svelte"
import MarkdownEditor from "./MarkdownEditor.svelte"
import { scale } from "svelte/transition"
import { settings, workOnDisk } from "../stores"
import { localDatabase, localProjects, relativeToDatabase } from "../backend"
import type { WorkOneLang } from "../ortfo"
import { _ } from "svelte-i18n"
import { tooltip, i18n } from "../actions"

const dispatch = createEventDispatcher()

export let block: ContentBlock
export let work: WorkOneLang
export let activeBlock: string

function thumbnailOfSource(source: string): string {
	let absolutePath =
		$workOnDisk.metadata.thumbnails?.[
			work.media.find(m => m.source === source)?.path
		]?.[700]
	return absolutePath
		? localDatabase(relativeToDatabase(absolutePath))
		: localProjects(`${$workOnDisk.id}/.portfoliodb/${source}`)
}
</script>

<div
	in:scale
	class="block"
	data-type={block.data.type}
	class:active={activeBlock === block.id}
	style={block.data.type === "media"
		? `background-image: url(${thumbnailOfSource(block.data.source)})`
		: ""}
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
			<h2>
				{$_("link #{n}", {
					values: { n: parseInt(block.id.split(":")[1]) + 1 },
				})}
			</h2>
			<dl>
				<FieldText
					key="name"
					bind:value={block.data.name}
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
			<h2>
				{$_("media #{n}", {
					values: { n: parseInt(block.id.split(":")[1]) + 1 },
				})}
			</h2>
			<dl>
				<FieldText
					key="name"
					bind:value={block.data.alt}
					on:focus={() => (activeBlock = block.id)}
					on:blur={() => (activeBlock = null)}
					placeholder={$_("describe your media")}
				/>
				<FieldFilepath
					relativeTo={`${$settings.projectsfolder}/${work.id}/.portfoliodb`}
					key="source"
					bind:value={block.data.source}
					on:focus={() => (activeBlock = block.id)}
					on:blur={() => (activeBlock = null)}
					placeholder={$_("put the path or url to the media here")}
				/>
			</dl>
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
		on:mousedown={() => dispatch("movePointerDown")}
	>
		<img src="/assets/icon-move.svg" class="icon" alt={$_("move")} />
	</div>
	<div
		class="resizer"
		use:tooltip={[$_("resize"), 500]}
		on:mousedown={() => dispatch("resizePointerDown")}
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
	margin-bottom: 1.5em;

	&::before {
		content: "— ";
	}
	&::after {
		content: " —";
	}
}

.block[data-type="media"]:hover,
.block[data-type="media"]:focus-within {
	background-size: cover;

	.content {
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);

		&[data-theme="dark"] {
			background: rgba(0, 0, 0, 0.75);
		}
		&[data-theme="light"] {
			background: rgba(255, 255, 255, 0.75);
		}
	}
}

.block[data-type="media"]:not(:hover):not(:focus-within) .content {
	opacity: 0;
	pointer-events: none;
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
}

.block:not([data-type="paragraph"]) .content {
	justify-content: center;
	align-items: center;
}

.block:not(:hover) .dragger,
.block:not(:hover) .resizer,
.block:not(:hover) .deleter {
	opacity: 0;
}

.resizer,
.dragger,
.deleter {
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

.dragger img,
.resizer img,
.deleter img {
	height: 2rem;
	width: 2rem;
}
</style>
