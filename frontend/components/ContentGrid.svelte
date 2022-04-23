<script lang="ts">
import gridHelp from "svelte-grid/build/helper"
import Grid from "svelte-grid"
import MarkdownEditor from "./MarkdownEditor.svelte"
import { scale } from "svelte/transition"
import { tooltip } from "../actions"
import { localDatabase, localProjects, relativeToDatabase } from "../backend"
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
import { settings, state, workOnDisk } from "../stores"
import { createEventDispatcher, onMount } from "svelte"
import { diff } from "just-diff"
import { _ } from "svelte-i18n"
import FieldFilepath from "./FieldFilepath.svelte"
import FieldText from "./FieldText.svelte"

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
		;[blocks, rowCapacity] = await toBlocks(work, ["fr", "en"])
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

function thumbnailOfSource(source: string): string {
	let absolutePath =
		$workOnDisk.metadata.thumbnails?.[
			inLanguage(language)($workOnDisk).media.find(
				m => m.source === source
			)?.path
		]?.[700]
	return absolutePath
		? localDatabase(relativeToDatabase(absolutePath))
		: localProjects(`${$workOnDisk.id}/.portfoliodb/${source}`)
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
		<div
			in:scale
			class="block"
			data-type={item.data.type}
			class:active={activeBlock === item.id}
			style={item.data.type === "media"
				? `background-image: url(${thumbnailOfSource(
						item.data.source
				  )})`
				: ""}
		>
			<div class="content" data-theme={$settings.theme}>
				{#if item.data.type === "paragraph"}
					<MarkdownEditor
						noBorder
						bind:value={blocks[language][index(item)].data.content}
						active={activeBlock === item.id}
						on:blur={() => (activeBlock = null)}
						on:focus={() => (activeBlock = item.id)}
						placeholder={$_("write some text here")}
					/>
				{:else if item.data.type === "link"}
					<h2>
						{$_("link #{n}", {
							values: { n: parseInt(item.id.split(":")[1]) + 1 },
						})}
					</h2>
					<dl>
						<FieldText
							key="name"
							bind:value={blocks[language][index(item)].data.name}
							on:focus={() => (activeBlock = item.id)}
							on:blur={() => (activeBlock = null)}
							placeholder={$_("name your link")}
						/>
						<FieldText
							key="url"
							bind:value={blocks[language][index(item)].data.url}
							on:focus={() => (activeBlock = item.id)}
							on:blur={() => (activeBlock = null)}
							placeholder={$_("put the url here")}
						/>
					</dl>
				{:else if item.data.type === "media"}
					<h2>
						{$_("media #{n}", {
							values: { n: parseInt(item.id.split(":")[1]) + 1 },
						})}
					</h2>
					<dl>
						<FieldText
							key="name"
							bind:value={blocks[language][index(item)].data.alt}
							on:focus={() => (activeBlock = item.id)}
							on:blur={() => (activeBlock = null)}
							placeholder={$_("describe your media")}
						/>
						<FieldFilepath
							relativeTo={`${$settings.projectsfolder}/${work.id}/.portfoliodb`}
							key="source"
							bind:value={blocks[language][index(item)].data
								.source}
							on:focus={() => (activeBlock = item.id)}
							on:blur={() => (activeBlock = null)}
							placeholder={$_(
								"put the path or url to the media here"
							)}
						/>
					</dl>
				{/if}
			</div>
			<div
				class="deleter"
				use:tooltip={[$_("delete block"), 500]}
				on:click={removeBlock(item)}
			>
				<img
					src="/assets/icon-delete.svg"
					class="icon"
					alt={$_("delete")}
				/>
			</div>
			<div
				class="dragger"
				use:tooltip={[$_("move"), 500]}
				on:mousedown={movePointerDown}
			>
				<img
					src="/assets/icon-move.svg"
					class="icon"
					alt={$_("move")}
				/>
			</div>
			<div
				class="resizer"
				use:tooltip={[$_("resize"), 500]}
				on:mousedown={resizePointerDown}
			>
				<img
					src="/assets/icon-resize.svg"
					class="icon"
					alt={$_("resize")}
					draggable="false"
				/>
			</div>
		</div>
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

:global(.svlt-grid-item) {
	display: flex;
}
:global(.svlt-grid-item input) {
	background-color: var(--white);
}
.block {
	border: 0.175em solid var(--gray);
	border-radius: 0.5em;
	transition-delay: 100ms;
	transition: border-color 0.4s ease-in-out;
	overflow: hidden;
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

.block:not([data-type="paragraph"]) .content {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	transition: all 0.25s ease, opacity 0.5s ease;
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
