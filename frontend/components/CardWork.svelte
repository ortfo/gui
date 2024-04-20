<script lang="ts">
import type Fuse from "fuse.js"
import { createEventDispatcher } from "svelte"
import { _ } from "svelte-i18n"
import { helptip } from "../actions"
import { localDatabase } from "../backend"
import type { AnalyzedWorkLocalized } from "../ortfo"
import type { BlockElement } from "@ortfo/db/dist/database"
import { database, state, workInEditor, workOnDisk } from "../stores"
import { closestTo } from "../utils"
import Card from "./Card.svelte"
import HighlightText from "./HighlightText.svelte"

const dispatch = createEventDispatcher()

function thumbPath() {
	let chosenMedia: BlockElement
	if (work.metadata?.thumbnail) {
		chosenMedia = work.content.blocks.find(
			m => m.distSource === work.metadata.thumbnail,
		)
	} else {
		chosenMedia = work.content.blocks.filter(
			m => Object.keys(m.thumbnails ?? {}).length,
		)[0]
	}
	if (!chosenMedia) return ""
	const sizes = Object.keys(chosenMedia.thumbnails).map(Number)
	const thumbnailPath = chosenMedia.thumbnails?.[closestTo(400, sizes)]
	return thumbnailPath ? localDatabase(thumbnailPath) : ""
}

function editWork() {
	console.log(`editing work ${work.id}`)
	$workInEditor = structuredClone($database[work.id])
	$workOnDisk = structuredClone($database[work.id])
	$state.editingWorkID = work.id
	$state.openTab = "editor"
}
export let work: AnalyzedWorkLocalized
export let highlightTitle: readonly Fuse.RangeTuple[] = []
export let selectedTag = ""
export let selectable = true
export let selected = false

$: dispatch(selected ? "select" : "deselect", { work })
</script>

<Card
	clickable
	{selectable}
	bind:selected
	on:click={({detail: event}) => {
		if (!(event instanceof MouseEvent)) return
		if (event.ctrlKey || event.metaKey) {
			selected = !selected
		} else {
			editWork()
		}
	}}
>
	{#await thumbPath()}
		<div class="thumb loading" />
	{:then _}
		<div class="thumb" style={`background-image: url(${thumbPath()})`} />
	{/await}
	<div class="text">
		<h2>
			<HighlightText
				--bg="var(--ortforange-light)"
				text={work.content.title || work.id}
				indices={highlightTitle}
			/>
		</h2>
		<!-- {@html work.paragraphs[0]?.content || ""} -->
		<ul class="tags">
			{#each work.metadata?.tags || [] as tag}
				<li>
					<button
						class:selected={selectedTag === tag}
						use:helptip={selectedTag === tag
							? $_("Click to show all works")
							: $_("Click to only show works tagged {tag}", {
									values: { tag },
								})}
						on:click|stopPropagation={e => {
							if (e.ctrlKey || e.metaKey) {
								selected = !selected
								return
							}
							dispatch("tag-click", tag)
							e.target.blur()
						}}
						data-variant="none"
						class="tag filter">{tag}</button
					>
				</li>
			{/each}
		</ul>
	</div>
</Card>

<style lang="scss">
.thumb {
	width: 100%;
	flex-grow: 1;
	background-repeat: no-repeat;
	background-size: cover;
	background-color: var(--gray-light);
	border-radius: 0.5rem 0.5rem 0 0;
}

.text {
	text-align: center;
	padding: 1.125rem;
}

.tags {
	margin-top: 0.5em;
	width: 100%;
	display: flex;
	min-width: 0;
	flex-flow: row wrap;
	gap: 0.5em;
	justify-content: center;
}
.tags li {
	list-style: none;
	padding: 0;
	display: inline-block;
}

.tag {
	padding: 0.125em 0.5em;
	border-radius: 4em;
	background-color: var(--gray-light);

	&.selected {
		background-color: var(--ortforange-light);
	}

	&::before {
		content: "#";
	}

	&:hover,
	&:focus {
		background-color: var(--ortforange);
		color: black;
	}
}
</style>
