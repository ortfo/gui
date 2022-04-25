<script lang="ts">
import type { Tag, WorkOneLang } from "../ortfo"
import JSONTree from "svelte-json-tree"
import Card from "./Card.svelte"
import { settings, state } from "../stores"
import { backend, localDatabase, relativeToDatabase } from "../backend"
import type { Fuse } from "fuse.js"
import HighlightText from "./HighlightText.svelte"
import { _ } from "svelte-i18n"
import { tooltip } from "../actions"
import { createEventDispatcher } from "svelte"
import { closestTo } from "../utils"

const dispatch = createEventDispatcher()

function thumbPath() {
	const chosenMedia = Object.keys(work.metadata.thumbnails)?.[0] // TODO allow user to set this (requires changes in ortfo/mk too)
	const sizes = Object.keys(
		work.metadata.thumbnails?.[chosenMedia] || {}
	).map(parseInt)
	const thumbnailPath =
		work.metadata.thumbnails?.[chosenMedia]?.[closestTo(400, sizes)]
	return thumbnailPath ? localDatabase(thumbnailPath) : ""
}

function editWork() {
	$state.editingWorkID = work.id
	$state.openTab = "editor"
}
export let work: WorkOneLang
export let highlightTitle: readonly Fuse.FuseRangeTuple[] = []
export let selectedTag: Tag["singular"] | "" = ""
export let selectable: boolean = true
export let selected: boolean = false

$: dispatch(selected ? "select" : "deselect", { work })
</script>

<Card clickable {selectable} bind:selected on:click={editWork}>
	{#await thumbPath()}
		<div class="thumb loading" />
	{:then _}
		<div class="thumb" style={`background-image: url(${thumbPath()})`} />
	{/await}
	<div class="text">
		<h2>
			<HighlightText
				--bg="var(--ortforange-light)"
				text={work.title || work.id}
				indices={highlightTitle}
			/>
		</h2>
		<!-- {@html work.paragraphs[0]?.content || ""} -->
		<ul class="tags">
			{#each work.metadata?.tags || [] as tag}
				<li>
					<button
						class:selected={selectedTag === tag}
						use:tooltip={$settings.showTips
							? $_("Click to only show works tagged {tag}", {
									values: { tag },
							  })
							: ""}
						on:click|stopPropagation={e => {
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
