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
} from "../stores"
import JSONTree from "svelte-json-tree"
import equal from "deep-equal"
import FieldImage from "../components/FieldImage.svelte"
import FieldList from "../components/FieldList.svelte"
import FieldColors from "../components/FieldColors.svelte"
import ContentGrid from "../components/ContentGrid.svelte"
import { Split } from "@geoffcox/svelte-splitter"

onMount(async () => {
	$state.editor.metadata = await fillEditorMetadataState(
		$editorWork,
		$settings
	)
})

function diffWithSaved() {
	const current = $state.editor.metadata
	const saved = $editorWork.metadata
	return (
		current.aliases !== (saved?.aliases || []) ||
		!equal(current.colors, saved.colors) ||
		current.created.toISOString() !== saved.created.toISOString() ||
		current.titlestyle !== saved?.titlestyle
		// TODO pagebackground
	)
}

function editTitle(e) {
	if (!editingTitle) {
		editingTitle = true
		document.getElementById("title").focus()
	} else {
		editingTitle = false
		$state.editor.title = e.target.textContent
	}
}

let editingTitle = false

// $: $state.editor.unsavedChanges = diffWithSaved()
</script>

<Split initialPrimarySize="{100 - $state.editor.metadataPaneSplitRatio * 100}%">
	<section class="layout" slot="primary">
		<SwitchButton
			bind:value={$state.editor.language}
			on:change={e => ($state.editor.language = e.detail)}
			options={{ en: "english", fr: "français" }}
			showCodes
		/>
		<p class="url">/{$editorWork.id}</p>

		<div class="title" id="title">
			<h1
				on:blur={() => {
					editingTitle = false
					$state.editor.title = e.target.textContent
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

		<ContentGrid work={$editorWork} />
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
			<FieldList key="tags" bind:value={$state.editor.metadata.tags} />
			<FieldList
				key="madewith"
				bind:value={$state.editor.metadata.madewith}
			/>
			<FieldColors
				key="colors"
				bind:value={$state.editor.metadata.colors}
			/>
			<FieldImage
				key="pagebackground"
				bind:value={$state.editor.metadata.pagebackground}
			/>
		</dl>
	</section>
</Split>

<JSONTree data={$state.editor} />

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
