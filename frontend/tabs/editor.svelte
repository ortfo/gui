<script lang="ts">
import { onMount } from "svelte"
import { fromLanguages, inLanguage, WorkOneLang } from "../ortfo"
import SwitchButton from "../components/SwitchButton.svelte"
import {
	state,
	settings,
	currentLanguageDatabase,
	fillEditorMetadataState,
	database,
	workOnDiskCurrentLanguage,
	editor,
	databaseLanguages,
	workInEditorCurrentLanguage,
	workOnDisk,
} from "../stores"
import JSONTree from "svelte-json-tree"
import equal from "fast-deep-equal"
import FieldImage from "../components/FieldImage.svelte"
import FieldList from "../components/FieldList.svelte"
import FieldColors from "../components/FieldColors.svelte"
import ContentGrid from "../components/ContentGrid.svelte"
// @ts-ignore don't know why ts thinks Split does not exist, it does
import { Split } from "@geoffcox/svelte-splitter"
import type { ContentBlock } from "../contentblocks"
import { diff, Operation } from "just-diff"
import tinykeys from "tinykeys"
import { SvelteGridItem, workFromItems } from "../layout"
import { backend } from "../backend"
import { except } from "../utils"
import ObjectDiffTable from "../components/ObjectDiffTable.svelte"

onMount(async () => {
	$editor.metadata = await fillEditorMetadataState(
		$workOnDiskCurrentLanguage,
		$settings
	)
	$editor.title = $workOnDiskCurrentLanguage.title
	tinykeys(window, {
		"$mod+s": saveToDisk,
	})
})

async function saveToDisk() {
	const newWork = fromLanguages(
		...Array.from($databaseLanguages)
			.filter(l => l !== $state.editingLanguage)
			.map(l => inLanguage(l)($workOnDisk)),
		$workInEditorCurrentLanguage
	)
	console.info("Writing to disk", newWork)
	await backend.writeToDisk(newWork)
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
let diffWithDisk: {
	op: Operation
	path: (string | number)[]
	value: any
}[] = []

$: diffWithDisk = diff($workInEditorCurrentLanguage, $workOnDiskCurrentLanguage)
$: $editor.unsavedChanges = diffWithDisk.length > 0
$: layoutChanged = diffWithDisk.some(d => d.path.includes("layout"))
</script>

<!-- <Split initialPrimarySize="{100 - $editor.metadataPaneSplitRatio * 100}%"> -->
<Split initialPrimarySize="10%">
	<section class="layout" slot="primary">
		<SwitchButton
			bind:value={$state.editingLanguage}
			on:change={e => ($state.editingLanguage = e.detail)}
			options={{ en: "english", fr: "français" }}
			showCodes
		/>
		<p class="url">/{$workOnDiskCurrentLanguage.id}</p>

		<div class="title" id="title">
			<h1
				on:blur={e => {
					editingTitle = false
					$editor.title = e.target.textContent
				}}
				contenteditable={editingTitle}
			>
				{$workOnDiskCurrentLanguage.title}
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
			work={$workOnDiskCurrentLanguage}
			on:edit={e => ($editor.items = e.detail)}
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
		<ObjectDiffTable
			a={$workOnDiskCurrentLanguage}
			b={$workInEditorCurrentLanguage}
			aLabel="on disk"
			bLabel="in editor"
		/>
		on disk <JSONTree value={$workOnDiskCurrentLanguage} />
		in editor <JSONTree value={$workInEditorCurrentLanguage} />
		items <JSONTree value={$editor.items} />
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
