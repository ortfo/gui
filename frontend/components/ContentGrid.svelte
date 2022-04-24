<script lang="ts">
import gridHelp from "svelte-grid/build/helper"
import Grid from "svelte-grid"
import MarkdownEditor from "./MarkdownEditor.svelte"
import { scale } from "svelte/transition"
import { tooltip } from "../actions"
import {
	backend,
	localDatabase,
	localProjects,
	relativeToDatabase,
} from "../backend"
import {
	ContentBlock,
	eachLanguage,
	emptyContentUnit,
	fromBlocksToParsedDescription,
	ItemID,
	toBlocks,
} from "../contentblocks"
import {
	inLanguage,
	LayedOutElement,
	ParsedDescription,
	Translated,
} from "../ortfo"
import {
	settings,
	state,
	workOnDisk,
	workOnDiskCurrentLanguage,
} from "../stores"
import { createEventDispatcher, onMount } from "svelte"
import { diff } from "just-diff"
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import FieldFilepath from "./FieldFilepath.svelte"
import FieldText from "./FieldText.svelte"
import { rebuildDatabase } from "./Navbar.svelte"
import CardContentBlock from "./CardContentBlock.svelte"
import { deleteWorks } from "../modals/ConfirmDeleteWorks.svelte"

const dispatch = createEventDispatcher()

export let work: ParsedDescription
export let language: string

let blocks: Translated<ContentBlock[]> = {}
let cols: number[][] = []
let rowCapacity: number = 0
let activeBlock: number | null = null
let initialized = false
let error: Error | null = null

onMount(async () => {
	try {
		;[blocks, rowCapacity] = await toBlocks(
			work,
			$settings.portfoliolanguages
		)
		cols = [[400, rowCapacity]]
		// Need timeout because of the scale transition
		setTimeout(() => {
			window.scrollTo({
				top: $state.scrollPositions.editor,
				left: 0,
				behavior: "smooth",
			})
		}, 200)
	} catch (err) {
		error = err
	} finally {
		initialized = true
	}
})

const addBlock = (type: LayedOutElement["type"]) => e => {
	Object.entries(blocks).forEach(([lang, blocksOneLang]) => {
		const empty = blocksOneLang.length === 0
		const geometry = {
			x: empty
				? 0
				: Math.min(...blocksOneLang.map(block => block[rowCapacity].x)),
			y: empty
				? 0
				: Math.max(
						...blocksOneLang.map(block => block[rowCapacity].y)
				  ) + 1,
			w: rowCapacity,
			h: 1,
		}
		const id = `${type}:${
			empty
				? 0
				: Math.max(
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
	})
}

const removeBlock = (item: ContentBlock) => e => {
	blocks = Object.fromEntries(
		Object.entries(blocks).map(([lang, blocks]) => [
			lang,
			blocks.filter(b => b.id !== item.id),
		])
	)
}

function updateOtherLanguages() {
	const otherLanguages = Object.keys(blocks).filter(l => l !== language)
	const blockInCurrentLanguage = id => blocks[language].find(b => b.id === id)
	for (const lang of otherLanguages) {
		blocks[lang] = blocks[lang].map(b => ({
			...b,
			[rowCapacity]: blockInCurrentLanguage(b.id)?.[rowCapacity],
		}))
	}
}

function updateWork(blocks) {
	let updatedWork = fromBlocksToParsedDescription(
		blocks,
		rowCapacity,
		work,
		language
	)
	let delta = diff(updatedWork, work)
	if (delta.length > 0) {
		console.info("Work changed, delta is", delta)
		dispatch("change", updatedWork)
		work = updatedWork
	}
}

function index(item: { id: string }): number {
	return blocks[language].findIndex(it => it.id === item.id)
}

$: updateWork(blocks)
</script>

{#if !initialized}
	{$_("Loading…")}
{:else if error}
	<h1>{$_("An error occured: ")}</h1>
	<ul class="reason">
		{#each error.toString().split(": ") as reason}
			<li>
				{#if Array.from(reason).includes("\n")}
					<pre>{reason}</pre>
				{:else}
					{reason}
				{/if}
			</li>
		{/each}
	</ul>
{:else if blocks[language].length > 0}
	<Grid
		bind:items={blocks[language]}
		{cols}
		rowHeight={400}
		let:dataItem={item}
		let:movePointerDown
		let:resizePointerDown
		on:change={_ => {
			updateOtherLanguages()
			updateWork(blocks)
		}}
	>
		<CardContentBlock
			bind:block={blocks[language][index(item)]}
			bind:activeBlock
			work={inLanguage(language)($workOnDisk)}
			on:movePointerDown
			on:resizePointerDown
			on:remove={removeBlock(item)}
		/>
	</Grid>
	<div class="create-block">
		<h2>{$_("Add a new block?")}</h2>
		<div class="types">
			<button data-variant="none" on:click={addBlock("media")}>
				<img
					src="/assets/icon-media.svg"
					alt="media icon"
					class="icon"
				/>
				{$_("media")}
			</button>
			<button data-variant="none" on:click={addBlock("paragraph")}>
				<img src="/assets/icon-paragraph.svg" alt="¶" class="icon" />
				{$_("paragraph")}
			</button>
			<button data-variant="none" on:click={addBlock("link")}>
				<img
					src="/assets/icon-major-link.svg"
					alt={$_("link icon")}
					class="icon"
				/>
				{$_("link")}
			</button>
		</div>
	</div>
{:else}
	<div class="empty">
		<h2>{$_("No content yet.")}</h2>
		<div class="create-block empty">
			<h3>{$_("Add a…")}</h3>
			<div class="types">
				<button data-variant="none" on:click={addBlock("media")}>
					<img
						src="/assets/icon-media.svg"
						alt={$_("media icon")}
						class="icon"
					/>
					{$_("media")}
				</button>
				<button data-variant="none" on:click={addBlock("paragraph")}>
					<img
						src="/assets/icon-paragraph.svg"
						alt="¶"
						class="icon"
					/>
					{$_("paragraph")}
				</button>
				<button data-variant="none" on:click={addBlock("link")}>
					<img
						src="/assets/icon-major-link.svg"
						alt={$_("link icon")}
						class="icon"
					/>
					{$_("link")}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 
	- remove space (if any) at top: get minimum `y` and translate all items with `y <- y - minY`
	- stretch items to fill horizontal space (spacers are here to fill empty space): group by `x`, for groups of length 1, set `w = number of columns on current breakpoint`
 -->
<style lang="scss">
h2 {
	text-align: center;
	color: var(--ortforange);
	font-variation-settings: "wght" 700;
}

:global(.toolbar) {
	align-self: flex-start;
}

.create-block:not(.empty) {
	border: 0.175em solid var(--ortforange);
	border-radius: 0.5em;
	max-width: 400px;
	margin: 0 auto;
	margin-top: 5em;
	background-color: var(--ortforange-light);
}

:global(.svlt-grid-item) {
	display: flex;
}
:global(.svlt-grid-item input) {
	background-color: var(--white);
}
.create-block .types {
	display: flex;
	justify-content: space-between;
	margin: 0 2em;
	max-width: 500px;
}
.create-block .types button {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 6em;
	height: 6em;
	padding: 0.5em;
	margin: 0.5em;
	transition: all 0.25s ease, font-varation-settings 1s ease,
		box-shadow 0.25s ease 0.125s;
	outline: none;
	border: 1px solid transparent;
}

.create-block .types button:hover:not(:active),
.create-block .types button:focus:not(:active) {
	box-shadow: -0.5em 0.5em 0 0 var(--black);
	border-color: var(--black);
	transform: translate(0.5em, -0.5em);
}

.create-block .types button:hover:not(:active) {
	font-variation-settings: "wght" 700;
}

.create-block .types button img {
	transform: scale(1.25);
}

.empty {
	display: flex;
	align-items: center;
	flex-direction: column;
	text-align: center;
	width: 100%;
	border-radius: 3px;
	padding: 4em;
}

.empty h2 {
	color: var(--gray);
}
</style>
