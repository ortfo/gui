<script lang="ts">
import Grid from "svelte-grid"
import gridHelp from "svelte-grid/build/helper"
import { ContentBlock, makeBlocks } from "../contentblocks"
import type { WorkOneLang } from "../ortfo"
import MarkdownEditor from "./MarkdownEditor.svelte"
import MarkdownToolbar from "./MarkdownToolbar.svelte"
import type { ActionName } from "./MarkdownToolbar.svelte"
import { tooltip } from "../actions"
import { scale } from "svelte/transition"

type ItemID = number
let blocks: ContentBlock[] = []
let numberOfColumns: number = 0
let cols: number[][] = []
let items: ContentBlock[] = []
let operationsStacks: Record<ItemID, ActionName[]> = {}
let activeBlock: number | null = null
let willDeactivateBlock: boolean = false

export let work: WorkOneLang

async function initialize(work) {
	const _ = await makeBlocks(work)
	blocks = _.blocks
	numberOfColumns = _.numberOfColumns
	cols = [[400, numberOfColumns]]
	items = blocks.map(gridHelp.item)
	items.forEach(item => {
		operationsStacks[item.id] = []
	})
}

const addBlock = (type: ContentBlock["data"]["type"]) => e => {
	const geometry = {
		x: Math.min(...blocks.map(block => block[numberOfColumns].x)),
		y: Math.max(...blocks.map(block => block[numberOfColumns].y)) + 1,
		w: numberOfColumns,
		h: 1,
	}
	const id = Math.max(...blocks.map(block => block.id)) + 1
	blocks = [
		...blocks,
		{
			id,
			[numberOfColumns]: {
				...gridHelp.item(geometry),
				customDragger: true,
				customResizer: true,
			},
			data: {
				type,
				raw: "",
				display: "",
			},
		},
	]
	items = blocks.map(gridHelp.item)
	operationsStacks[id] = []
}

const removeBlock = (item: ContentBlock) => e => {
	blocks = blocks.filter(block => block.id !== item.id)
	items = blocks.map(gridHelp.item)
	delete operationsStacks[item.id]
}

function index(item: { id: number }): number {
	return items.findIndex(it => it.id === item.id)
}

function pushToOpStack(id: number, action: ActionName) {
	operationsStacks = {
		...operationsStacks,
		[id]: [...(operationsStacks[id] || []), action],
	}
}
</script>

{#await initialize(work)}
	Loading...
{:then}
	<Grid
		bind:items
		{cols}
		rowHeight={400}
		let:dataItem={item}
		let:movePointerDown
		let:resizePointerDown
	>
		<div
			class="block"
			data-type={item.data.type}
			class:active={activeBlock === item.id}
			style={item.data.type === "media"
				? `background-image: url("${item.data.raw}")`
				: ""}
			transition:scale
		>
			<div class="content">
				{#if item.data.type === "paragraph"}
					<MarkdownToolbar
						on:action={e => pushToOpStack(item.id, e.detail)}
					/>
					<MarkdownEditor
						value={items[index(item)].data.display}
						on:input={({ detail }) => {
							items[index(item)].data.display = detail
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
						itemID={item.id}
						placeholder="write some text here"
					/>
				{:else if item.data.type === "link"}
					<input
						class="name"
						bind:value={items[index(item)].data.display}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="name your link"
					/>
					<input
						class="url"
						bind:value={items[index(item)].data.raw}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="put the url here"
					/>
				{:else if item.data.type === "media"}
					<input
						class="name"
						bind:value={items[index(item)].data.display}
						on:focus={() => (activeBlock = item.id)}
						on:blur={() => (activeBlock = null)}
						placeholder="describe your media"
					/>
					<input
						class="url"
						bind:value={items[index(item)].data.path}
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
}

:global(.block:not(.active) .toolbar) {
	opacity: 0;
	pointer-events: none;
}

:global(.block .toolbar) {
	transition: all 0.2s ease-in-out;
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
