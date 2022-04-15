<script lang="ts">
import type { WorkOneLang } from "../ortfo"
import JSONTree from "svelte-json-tree"
import Card from "./Card.svelte"
import { settings, state } from "../stores"
import { backend, localDatabase, relativeToDatabase } from "../backend"
import type { Fuse } from "fuse.js"
import HighlightText from "./HighlightText.svelte"

function thumbPath() {
	const absolutePath =
		work.metadata.thumbnails?.[
			Object.keys(work.metadata.thumbnails)?.[0]
		]?.[400]
	return absolutePath ? relativeToDatabase(absolutePath) : ""
}

function editWork() {
	$state.editingWorkID = work.id
	$state.openTab = "editor"
}
export let work: WorkOneLang
export let highlightTitle: readonly Fuse.FuseRangeTuple[] = []
</script>

<Card clickable on:click={editWork}>
	{#await thumbPath()}
		<div class="thumb loading" />
	{:then _}
		<div
			class="thumb"
			style={`background-image: url(${localDatabase(thumbPath())})`}
		/>
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
		<p class="path">
			{$settings.projectsfolder.replaceAll("\\", "/")}/{work.id}
		</p>
	</div>
</Card>

<style>
.thumb {
	width: 100%;
	flex-grow: 1;
	background-repeat: no-repeat;
	background-size: cover;
	background-color: lightgray;
}

.text {
	text-align: center;
	padding: 1.125rem;
}

.path {
	font-family: var(--mono);
	color: var(--gray);
}
</style>
