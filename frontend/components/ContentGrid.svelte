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
import { layoutWidth, OrtfoMkLayout } from "../layout"
import { deepRepeat, pick } from "../utils"
import hotkeys from "../tinykeysInputDisabled"

const dispatch = createEventDispatcher()

export let work: ParsedDescription
export let language: string

let blocks: Translated<ContentBlock[]> = {}
let cols: number[][] = []
let rowCapacity: number = 0
let rowHeight: number = 500
let _newRowCapacity = rowCapacity
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

const stretchLayout = (oldLayout: OrtfoMkLayout, oldRowCapacity, target) => {
	if (target < layoutWidth(oldLayout)) {
		throw Error("Impossible to stretch layout below minimum capacity")
	}

	return oldLayout.map(row => {
		if (!Array.isArray(row)) {
			return deepRepeat(target, row)
		}
		const rate = target / row.length
		if (!Number.isInteger(rate)) {
			throw Error(
				`Cannot stretch layout row of size ${row.length} into size ${target} (rate is ${rate}, non integer)`
			)
		}

		return row.map(cell => deepRepeat(target, cell)).flat()
	})
}

const updateRowCapacity = async (newValue: number) => {
	const oldValue = rowCapacity
	;[blocks, rowCapacity] = await toBlocks(
		{
			...work,
			metadata: {
				...work.metadata,
				layout: stretchLayout(work.metadata.layout, oldValue, newValue),
			},
		},
		$settings.portfoliolanguages
	)
	cols = [[400, rowCapacity]]
}

const addBlock =
	(
		type: LayedOutElement["type"],
		overrideGeometry: {
			x?: number | null
			y?: number | null
			h?: number | null
			w?: number | null
		} = {}
	) =>
	e => {
		Object.entries(blocks).forEach(([lang, blocksOneLang]) => {
			const empty = blocksOneLang.length === 0
			const geometry = {
				x: Object.hasOwn(overrideGeometry, "x")
					? overrideGeometry?.x
					: empty
					? 0
					: Math.min(
							...blocksOneLang.map(block => block[rowCapacity].x)
					  ),
				y: Object.hasOwn(overrideGeometry, "y")
					? overrideGeometry?.y
					: empty
					? 0
					: Math.max(
							...blocksOneLang.map(block => block[rowCapacity].y)
					  ) + 1,
				w: overrideGeometry?.w || rowCapacity,
				h: overrideGeometry?.h || 1,
			}

			// compute new geometry for other blocks: if they are below the one being added, they need to be shifted down
			const newGeometry = (old: ContentBlock[number]) => {
				if (old.y < geometry.y) return old

				return {
					...old,
					y: old.y + 1,
				}
			}

			const id = `${type}:${
				Math.max(
					-1,
					...blocksOneLang
						.map(b => b.id.split(":"))
						.filter(([bType, _]) => bType === type)
						.map(([_, id]) => parseInt(id))
				) + 1
			}` as ItemID

			const newOtherBlocks = blocks[lang].map(b => ({
				...b,
				[rowCapacity]: newGeometry(b[rowCapacity]),
			}))

			blocks[lang] = [
				...newOtherBlocks.filter(b => b[rowCapacity].y <= geometry.y),
				{
					id,
					[rowCapacity]: {
						...gridHelp.item(geometry),
						customDragger: true,
						customResizer: true,
					},
					data: emptyContentUnit(type),
				},
				...newOtherBlocks.filter(b => b[rowCapacity].y > geometry.y),
			]
			blocks[lang] = blocks[lang].map(gridHelp.item)
		})
	}

const removeBlock = (item: ContentBlock) => e => {
	// updateOtherLanguages will not delete blocks that are in one language's layout but not the other, as they could've also been added from the other to the current one.
	// we delete the block from other languages right there.
	
	const itemWasAloneOnRow = Object.values(blocks).every(
		oneLangBlocks =>
			oneLangBlocks.filter(b => b[rowCapacity].y === item[rowCapacity].y)
				.length === 1
	)
	blocks[$state.lang] = blocks[$state.lang]
		// Remove the item
		.filter(b => b.id !== item.id)
		// Clean up empty space left by the deleted item
		.map(b => {
			const x = block => block[rowCapacity].x
			const y = block => block[rowCapacity].y
			const h = block => block[rowCapacity].h

			if (y(b) > y(item) && itemWasAloneOnRow) {
				b[rowCapacity].y -= h(item)
				console.log(`decremented y of ${b.id} by ${h(item)}`)
			}
			// TODO same y case
			return b
		})
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

function handleScroll(event: WheelEvent) {
	// alt+scroll: adjust block height
	if (event.altKey) {
		event.preventDefault()
		rowHeight = rowHeight + 0.25 * event.deltaY
	}
}

function index(item: { id: string }): number {
	return blocks[language].findIndex(it => it.id === item.id)
}

hotkeys(window, {
	"$mod+L": addBlock("link"),
	"$mod+M": addBlock("media"),
	"$mod+P": addBlock("paragraph"),
})

$: updateWork(blocks)
$: blocks = Object.fromEntries(
	Object.entries(blocks).map(([lang, blocksOneLang]) => {
		console.log(`sorting blocks`)
		return [
			lang,
			blocksOneLang.sort((a, b) =>
				a[rowCapacity].y > b[rowCapacity].y ||
				(a[rowCapacity].y === b[rowCapacity].y &&
					a[rowCapacity].x > b[rowCapacity].x)
					? 1
					: -1
			),
		]
	})
)
$: console.log("rowHeight=", rowHeight)
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
	<input
		type="number"
		name="row-capacity"
		id="row-capacity"
		bind:value={_newRowCapacity}
		on:blur={() => updateRowCapacity(_newRowCapacity)}
	/>
	<div class="scroll-listener" on:wheel={handleScroll}>
		<Grid
			bind:items={blocks[language]}
			{cols}
			{rowHeight}
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
				on:movePointerDown={e => movePointerDown(e.detail)}
				on:resizePointerDown={e => resizePointerDown(e.detail)}
				on:remove={removeBlock(item)}
				on:insert-below={e => {
					console.log("inserting", e.detail, "below", item)
					addBlock(e.detail, {
						y: item[rowCapacity].y + 1,
					})(e)
				}}
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

.scroll-listener {
	width: 100%;
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
