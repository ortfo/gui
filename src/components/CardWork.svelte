<script lang="ts">
import type { WorkOneLang } from "../ortfo"
import JSONTree from "svelte-json-tree"
import Card from "./Card.svelte"
import { settings, state } from "../stores"
import { backend } from "../backend"

let thumbBase64 = ""

async function loadThumb() {
	const path =
		work.metadata.thumbnails?.[
			Object.keys(work.metadata.thumbnails)?.[0]
		]?.[400]
	if (path) {
		thumbBase64 = await backend.getMedia(path)
	} else {
		thumbBase64 = ""
	}
}

function editWork() {
	$state.editingWork = work.id
	$state.openTab = "editor"
}
export let work: WorkOneLang
</script>

<Card clickable on:click={editWork}>
	{#await loadThumb()}
		<div class="thumb loading" />
	{:then _}
		<div class="thumb" style={`background-image: url(${thumbBase64})`} />
	{/await}
	<div class="text">
		<h2>{work.title || work.id}</h2>
		<!-- {@html work.paragraphs[0]?.content || ""} -->
		<!-- <JSONTree value={work} /> -->
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
