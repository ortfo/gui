<script lang="ts">
import type { WorkOneLang } from "../ortfo"
import JSONTree from "svelte-json-tree"
import Card from "./Card.svelte"
import { settings, state } from "../stores"
import { backend, local } from "../backend"

let thumbBase64 = ""

function thumbPath() {
	// return work.metadata.thumbnails?.[
	// 	Object.keys(work.metadata.thumbnails)?.[0]
	// ]?.[400]
	console.log(work)
	// return `${work.id}/.portfoliodb/${work.media[0].source}`
	return ""
}

function editWork() {
	$state.editingWorkID = work.id
	$state.openTab = "editor"
}
export let work: WorkOneLang
</script>

<Card clickable on:click={editWork}>
	{#await thumbPath()}
		<div class="thumb loading" />
	{:then _}
		<div
			class="thumb"
			style={`background-image: url(${local(thumbPath())})`}
		/>
	{/await}
	<div class="text">
		<h2>{work.title || work.id}</h2>
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
