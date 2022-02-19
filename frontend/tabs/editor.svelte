<script lang="ts">
import { onMount } from "svelte"
import { inLanguage, WorkOneLang } from "../ortfo"
import SwitchButton from "../components/SwitchButton.svelte"
import {
	state,
	settings,
	database,
	fillEditorMetadataState,
	databaseLanguages,
	editorWork,
	editor,
} from "../stores"
import JSONTree from "svelte-json-tree"
import equal from "deep-equal"
import FieldImage from "../components/FieldImage.svelte"
import FieldList from "../components/FieldList.svelte"
import FieldColors from "../components/FieldColors.svelte"
import ContentGrid from "../components/ContentGrid.svelte"
import { Split } from "@geoffcox/svelte-splitter"
import type { ContentBlock } from "../contentblocks"
import { diff, Operation } from "just-diff"
import tinykeys from "tinykeys"
import { SvelteGridItem, toLayout } from "../layout"

onMount(async () => {
	$editor.metadata = await fillEditorMetadataState($editorWork, $settings)
	tinykeys(window, {
		"$mod+s": saveToDisk,
	})
})

function updateContentBlocks({
	items,
	columnSize,
}: {
	items: SvelteGridItem[]
	columnSize: number
}) {
	contentBlocksColumnSize = columnSize
	differenceWithDisk = diff($editor.items, items)
}

function saveToDisk() {
	if (layoutChanged) {
		const updatedLayout = toLayout($editor.items, contentBlocksColumnSize)
	}
	differenceWithDisk.forEach(difference => {})
}

function editTitle(e) {
	if (!editingTitle) {
		editingTitle = true
		document.getElementById("title").focus()
	} else {
		editingTitle = false
		$editor.title = e.target.textContent
	}
}

let editingTitle = false
let layoutChanged = false
let contentBlocksColumnSize = 0
let differenceWithDisk: {
	op: Operation
	path: (string | number)[]
	value: any
}[] = []

$: $editor.unsavedChanges = differenceWithDisk.length >= 1
$: layoutChanged =
	differenceWithDisk.filter(d =>
		d.path.some(k => ["x", "y", "w", "h"].includes(k.toString()))
	).length >= 1
</script>

<Split initialPrimarySize="{100 - $editor.metadataPaneSplitRatio * 100}%">
	<section class="layout" slot="primary">
		<SwitchButton
			bind:value={$state.editingLanguage}
			on:change={e => ($state.editingLanguage = e.detail)}
			options={{ en: "english", fr: "français" }}
			showCodes
		/>
		<p class="url">/{$editorWork.id}</p>

		<div class="title" id="title">
			<h1
				on:blur={e => {
					editingTitle = false
					$editor.title = e.target.textContent
				}}
				contenteditable={editingTitle}
			>
				{$editorWork.title}
			</h1>
			<button data-variant="inline" on:click={editTitle}
				>{#if editingTitle}finish editing{:else}edit{/if}</button
			>
		</div>

		{#if $settings.showTips}
			<p class="tip">
				Drag and drop blocks to arrange the layout of the page.
				Double-click a block to edit it.
			</p>
		{/if}

		<ContentGrid
			work={$editorWork}
			on:edit={e => updateContentBlocks(e.detail)}
		/>
	</section>

	<section class="metadata" slot="secondary">
		<h2>Metadata</h2>
		{#if $settings.showTips}
			<p class="tip">
				unset values inherit their defaults, set in
				<a
					href="#settings"
					on:click={() => ($state.openTab = "settings")}>settings</a
				>
			</p>
		{/if}

		<dl>
			<FieldList key="tags" bind:value={$editor.metadata.tags} />
			<FieldList key="madewith" bind:value={$editor.metadata.madewith} />
			<FieldColors key="colors" bind:value={$editor.metadata.colors} />
			<FieldImage
				key="pagebackground"
				bind:value={$editor.metadata.pagebackground}
			/>
		</dl>
	</section>
</Split>

<style>
.title {
	text-align: left;
	margin-top: -0.25em;
}
.title h1 {
	margin: 0;
}
[contenteditable] {
	border: 2px solid transparent;
}
[contenteditable="true"] {
	border-color: var(--ortforange);
}
.title {
	display: flex;
	align-items: center;
	gap: 1em;
}

.url {
	font-family: var(--mono);
}
.layout {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.title,
.url {
	align-self: flex-start;
}
</style>
