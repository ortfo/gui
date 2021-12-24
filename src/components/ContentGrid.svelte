<script lang="ts">
import { onMount } from "svelte"

import Grid from "svelte-grid"
import JSONTree from "svelte-json-tree"
import gridHelp from "svelte-grid/build/helper"
import { ContentBlock, makeBlocks } from "../contentblocks"
import type { WorkOneLang } from "../ortfo"
import Card from "./Card.svelte"
import { state } from "../stores"

export let work: WorkOneLang
let blocks: ContentBlock[] = []
let numberOfColumns: number = 0
let cols: number[][] = []
let items: any = []
let editingBlock: number | null = null
onMount(async () => {
	const _ = await makeBlocks(work)
	blocks = _.blocks
	numberOfColumns = _.numberOfColumns
	cols = [[400, numberOfColumns]]
	items = gridHelp.adjust(blocks, numberOfColumns)
})

$: items = gridHelp.adjust(blocks, numberOfColumns)

const addBlock = (type: ContentBlock["data"]["type"]) => e => {
	const geometry = {
		x: Math.max(...blocks.map(block => block[numberOfColumns].x)),
		y: Math.max(...blocks.map(block => block[numberOfColumns].y)),
		w: numberOfColumns,
		h: 1,
	}
	console.log(geometry)
	blocks = [
		...blocks,
		{
			[numberOfColumns]: gridHelp.item(geometry),
			id: Math.max(...blocks.map(block => block.id)) + 1,
			data: {
				type,
				raw: "",
				display: "",
			},
		},
	]
}
</script>

<Grid
	bind:items
	{cols}
	rowHeight={200}
	let:dataItem={item}
	fastStart
	on:change={e => console.log("hello", e)}
>
	<div class="block" on:dblclick={(editingBlock = item.id)}>
		{#if item.data.type === "paragraph"}
			{@html item.data.display}
		{:else if item.data.type === "link"}
			<a href={item.data.source}>{@html item.data.display}</a>
		{:else if item.data.type === "media"}
			<img src={item.data.source} alt={item.data.display} />
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
}

.create-block {
	border: 0.175em solid var(--ortforange);
	border-radius: 0.5em;
	max-width: 300px;
	margin: 0 auto;
	background-color: var(--ortforange-light);
}

.block,
.create-block {
	padding: 1em;
}

:global(.svlt-grid-item):hover {
	cursor: move;
	border-color: var(--black);
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
