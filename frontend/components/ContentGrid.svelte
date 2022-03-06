<script lang="ts">
import JSONTree from "svelte-json-tree"
import Grid from "svelte-grid"
import gridHelp from "svelte-grid/build/helper"
import {
	ContentBlock,
	emptyContentUnit,
	eachLanguage,
	fromBlocksToParsedDescription,
	ItemID,
	toBlocks,
} from "../contentblocks"
import type { LayedOutElement, ParsedDescription, Translated } from "../ortfo"
import MarkdownEditor from "./MarkdownEditor.svelte"
import MarkdownToolbar from "./MarkdownToolbar.svelte"
import type { ActionName } from "./MarkdownToolbar.svelte"
import { tooltip } from "../actions"
import { scale } from "svelte/transition"
import { createEventDispatcher } from "svelte"
import type { Base64WithFiletype } from "../backend"
import { state, workInEditor } from "../stores"

const dispatch = createEventDispatcher()

export let work: ParsedDescription
export let language: string

let blocks: Translated<ContentBlock[]> = {}
let base64images: Translated<{ [id: ItemID]: Base64WithFiletype }> = {}
let cols: number[][] = []
let rowCapacity: number = 0
let operationsStacks: Record<ItemID, ActionName[]> = {}
let activeBlock: number | null = null
let willDeactivateBlock: boolean = false

async function initialize(work: ParsedDescription) {
	;[blocks, rowCapacity] = await toBlocks(work)
	cols = [[400, rowCapacity]]
	Object.entries(blocks).forEach(([_, items]) =>
		items.forEach(item => {
			operationsStacks[item.id] = []
		})
	)
}

const addBlock = (type: LayedOutElement["type"]) => e => {
	Object.entries(blocks).forEach(([lang, blocksOneLang]) => {
		const geometry = {
			x: Math.min(...blocksOneLang.map(block => block[rowCapacity].x)),
			y:
				Math.max(...blocksOneLang.map(block => block[rowCapacity].y)) +
				1,
			w: rowCapacity,
			h: 1,
		}
		const id = `${type}:${
			Math.max(
				...blocksOneLang
					.map(b => b.id.split(":"))
					.filter(([bType, _]) => bType === type)
					.map(([_, id]) => parseInt(id))
			) + 1
		}` as ItemID

		blocks[lang] = [
			...blocks[lang],
			{
				id,
				[rowCapacity]: {
					...gridHelp.item(geometry),
					customDragger: true,
					customResizer: true,
				},
				data: emptyContentUnit(type),
			},
		]
		blocks[lang] = blocks[lang].map(gridHelp.item)
		operationsStacks[id] = []
	})
}

const removeBlock = (item: ContentBlock) => e => {
	Object.keys(blocks).forEach(lang => {
		blocks[language] = blocks[language].filter(
			block => block.id !== item.id
		)
		blocks[language] = blocks[language].map(gridHelp.item)
		delete operationsStacks[item.id]
	})
}

function index(item: { id: string }): number {
	return blocks[language].findIndex(it => it.id === item.id)
}

function pushToOpStack(id: ItemID, action: ActionName) {
	operationsStacks = {
		...operationsStacks,
		[id]: [...(operationsStacks[id] || []), action],
	}
}

// $: works = fromBlocksToParsedDescription(
// 	blocks,
// 	rowCapacity,
// 	$workInEditor.metadata,
// 	$workInEditor.title,
// 	$workInEditor.footnotes
// )

$: (blocks[language] || []).forEach(block => {
	pushToOpStack(block.id, "set-content-to-value")
})
</script>

{#await initialize(work)}
	Loading...
{:then}
	<Grid
		bind:items={blocks[language]}
		{cols}
		rowHeight={400}
		let:dataItem={item}
		let:movePointerDown
		let:resizePointerDown
	>
		<div
			transition:scale
			class="block"
			data-type={item.data.type}
			class:active={activeBlock === item.id}
			style={item.data.type === "media"
				? `background-image: url("${base64images[item.id]}")`
				: ""}
		>
			<div class="content">
				{#if item.data.type === "paragraph"}
					<MarkdownToolbar
						on:action={e => pushToOpStack(item.id, e.detail)}
					/>
					<MarkdownEditor
						value={item.data.content}
						on:input={({ detail }) => {
							blocks[language][index(item)].data.content = detail
						}}
						on:blur={() => {
							willDeactivateBlock = true
							setTimeout(() => {
								if (willDeactivateBlock) {
									activeBlock = null
									willDeactivateBlock = false
								}
							}, 150)
						}}
						on:focus={() => {
							activeBlock = item.id
							willDeactivateBlock = false
						}}
						bind:operationsStack={operationsStacks[item.id]}
						placeholder="write some text here"
					/>
				{:else if item.data.type === "link"}
					<span class="type">Link</span>
					<input
						class="name"
						bind:value={blocks[language][index(item)].data.name}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="name your link"
					/>
					<input
						class="url"
						bind:value={blocks[language][index(item)].data.url}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="put the url here"
					/>
				{:else if item.data.type === "media"}
					<input
						class="name"
						bind:value={blocks[language][index(item)].data.alt}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="describe your media"
					/>
					<input
						class="url"
						bind:value={blocks[language][index(item)].data.source}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="put the path or url to the media here"
					/>
				{/if}
			</div>
			<div
				class="deleter"
				use:tooltip={["delete block", 500]}
				on:click={removeBlock(item)}
			>
				<img src="/assets/icon-delete.svg" class="icon" alt="delete" />
			</div>
			<div
				class="dragger"
				use:tooltip={["move", 500]}
				on:mousedown={movePointerDown}
			>
				<img src="/assets/icon-move.svg" class="icon" alt="move" />
			</div>
			<div
				class="resizer"
				use:tooltip={["resize", 500]}
				on:mousedown={resizePointerDown}
			>
				<img
					src="/assets/icon-resize.svg"
					class="icon"
					alt="resize"
					draggable="false"
				/>
			</div>
		</div>
	</Grid>
	<div class="create-block">
		<h2>Add a new block?</h2>
		<div class="types">
			<button data-variant="none" on:click={addBlock("media")}>
				<img
					src="/assets/icon-media.svg"
					alt="media icon"
					class="icon"
				/>
				media
			</button>
			<button data-variant="none" on:click={addBlock("paragraph")}>
				<img src="/assets/icon-paragraph.svg" alt="¶" class="icon" />
				paragraph
			</button>
			<button data-variant="none" on:click={addBlock("link")}>
				<img
					src="/assets/icon-major-link.svg"
					alt="link icon"
					class="icon"
				/>
				link
			</button>
		</div>
	</div>
{/await}

<!-- 
	- remove space (if any) at top: get minimum `y` and translate all items with `y <- y - minY`
	- stretch items to fill horizontal space (spacers are here to fill empty space): group by `x`, for groups of length 1, set `w = number of columns on current breakpoint`
 -->
<style>
h2 {
	text-align: center;
	color: var(--ortforange);
	font-weight: normal;
}

:global(.svlt-grid-item) {
	display: flex;
}
.block {
	border: 0.175em solid var(--gray);
	border-radius: 0.5em;
	transition: border-color 0.4s ease-in-out;
	transition-delay: 100ms;
}

:global(.block:not(.active) .toolbar) {
	opacity: 0;
	pointer-events: none;
}

:global(.block .toolbar) {
	transition: all 0.2s ease-in-out;
	transition-delay: 110ms;
}

:global(.toolbar) {
	align-self: flex-start;
}

.create-block {
	border: 0.175em solid var(--ortforange);
	border-radius: 0.5em;
	max-width: 300px;
	margin: 0 auto;
	margin-top: 5em;
	background-color: var(--ortforange-light);
}

.block .name {
	font-size: 1.4em;
}
.block .url {
	color: var(--gray);
}

.block .type {
	color: var(--gray);
	/* position: absolute;
	z-index: -1; */
	margin: 0;
	padding: 0;
	font-size: 10em;
	height: 0.5em;
	line-height: 0.1;
	font-weight: bold;
	opacity: 0.5;
	pointer-events: none;
}

.block input {
	text-align: center;
	transition: opacity 0.2s ease-in-out;
}
.block input.url {
	width: 90%;
}
.block input.name {
	width: 80%;
}

.block[data-type="media"] {
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}

.block[data-type="media"]:not(:hover):not(.active) input {
	opacity: 0;
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

.create-block .types {
	display: flex;
	justify-content: space-between;
	margin: 0 2em;
}
.create-block .types button {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.create-block .types button:hover:not(:active) {
	font-weight: bold;
}
</style>
