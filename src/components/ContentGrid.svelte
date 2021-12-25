<script lang="ts">
import { onMount } from "svelte"

import Grid from "svelte-grid"
import JSONTree from "svelte-json-tree"
import gridHelp from "svelte-grid/build/helper"
import { ContentBlock, makeBlocks } from "../contentblocks"
import type { WorkOneLang } from "../ortfo"
import Card from "./Card.svelte"
import { database, state } from "../stores"
import MarkdownEditor from "./MarkdownEditor.svelte"
import MarkdownToolbar from "./MarkdownToolbar.svelte"
import type { ActionName } from "./MarkdownToolbar.svelte"

export let work: WorkOneLang
type ItemID = number
let blocks: ContentBlock[] = []
let numberOfColumns: number = 0
let cols: number[][] = []
let items: any[] = []
let operationsStacks: Record<ItemID, ActionName[]> = {}
let editingBlock: number | null = null
onMount(async () => {
	const _ = await makeBlocks(work)
	blocks = _.blocks
	console.log(blocks)
	numberOfColumns = _.numberOfColumns
	console.log(numberOfColumns)
	cols = [[400, numberOfColumns]]
	items = gridHelp.adjust(blocks, numberOfColumns)
	items.forEach(item => {
		operationsStacks[item.id] = []
	})
})

const addBlock = (type: ContentBlock["data"]["type"]) => e => {
	const geometry = {
		x: Math.max(...blocks.map(block => block[numberOfColumns].x)),
		y: Math.max(...blocks.map(block => block[numberOfColumns].y)),
		w: numberOfColumns,
		h: 1,
	}
	const id = Math.max(...blocks.map(block => block.id)) + 1
	blocks = [
		...blocks,
		{
			id,
			[numberOfColumns]: gridHelp.item(geometry),
			data: {
				type,
				raw: "",
				display: "",
			},
		},
	]
	items = gridHelp.adjust(blocks, numberOfColumns)
	operationsStacks[id] = []
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

<Grid bind:items {cols} rowHeight={300} let:dataItem={item} fastStart fillSpace>
	<div class="block" data-type={item.data.type}>
		{#if item.data.type === "paragraph"}
			<code>Editor #{item.id}</code>
			<MarkdownToolbar
				on:action={e => pushToOpStack(item.id, e.detail)}
			/>
			<MarkdownEditor
				bind:value={items[index(item)].data.display}
				on:input={({ detail }) => {
					console.log(`updating from editor #${item.id}`)
					items[index(item)].data.display = detail
				}}
				bind:operationsStack={operationsStacks[item.id]}
				itemID={item.id}
			/>
		{:else if item.data.type === "link"}
			<input
				class="name"
				bind:value={items[index(item)].data.display}
				placeholder="name your link"
			/>
			<input
				class="url"
				bind:value={items[index(item)].data.raw}
				placeholder="put the url here"
			/>
		{:else if item.data.type === "media"}
			<img
				src={items[index(item)].data.raw}
				alt={items[index(item)].data.display}
			/>
		{/if}
	</div>
</Grid>
<div class="create-block">
	<h2>Add a new block?</h2>
	<div class="types">
		<button data-variant="none" on:click={addBlock("media")}>
			<img src="/assets/icon-media.svg" alt="media icon" />
			media
		</button>
		<button data-variant="none" on:click={addBlock("paragraph")}>
			<img src="/assets/icon-paragraph.svg" alt="¶" />
			paragraph
		</button>
		<button data-variant="none" on:click={addBlock("link")}>
			<img src="/assets/icon-major-link.svg" alt="link icon" />
			link
		</button>
	</div>
</div>

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
	border: 0.175em solid var(--gray);
	border-radius: 0.5em;
	display: flex;
}

.create-block {
	border: 0.175em solid var(--ortforange);
	border-radius: 0.5em;
	max-width: 300px;
	margin: 0 auto;
	background-color: var(--ortforange-light);
}

.block .name {
	font-size: 1.4em;
}
.block .url {
	color: var(--gray);
}

.block[data-type="link"] {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.block:not([data-type="paragraph"]) {
	justify-self: center;
	align-self: center;
	margin: 0 auto;
}

.block[data-type="link"] input {
	text-align: center;
}

.block,
.create-block {
	padding: 1em;
}

:global(.svlt-grid-item):hover {
	cursor: move;
	border-color: var(--black);
}

:global(.markdown-editor) {
	cursor: text;
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
