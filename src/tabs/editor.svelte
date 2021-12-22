<script lang="ts">
import { onMount } from "svelte"
import type { WorkOneLang } from "../ortfo"
import SwitchButton from "../components/SwitchButton.svelte"
import JSONTree from "svelte-json-tree"
import { state, settings, database, fillEditorMetadataState } from "../stores"
import VerticalSplit from "../components/VerticalSplit.svelte"
import FieldImage from "../components/FieldImage.svelte"
import FieldList from "../components/FieldList.svelte"

export let work: WorkOneLang = $database.works.find(
	w => w.id == $state.editingWork
)
onMount(() => {
	$state.editor.metadata = fillEditorMetadataState(work.metadata)
	console.log($state)
})
</script>

<VerticalSplit right={$state.editor.metadataPaneSplitRatio}>
	<section class="layout">
		<SwitchButton
			bind:value={$state.editor.language}
			options={{ en: "english", fr: "français" }}
			showCodes
		/>
		<p class="url">/{work.id}</p>
		<h1>{work.title} <button data-variant="inline">edit</button></h1>

		{#if $settings.showTips}
			<p class="tip">
				Drag and drop blocks to arrange the layout of the page.
				Double-click a block to edit it.
			</p>
		{/if}
	</section>

	<section class="metadata">
		<h2>Metadata</h2>
		{#if $settings.showTips}
			<p class="tip">
				right-click any item to reset its value <br />
				unset values inherit their defaults, set in
				<a
					href="#settings"
					on:click={() => ($state.openTab = "settings")}>settings</a
				>
			</p>
		{/if}

		<dl>
			<FieldList key="tags" bind:value={$state.editor.metadata.tags} />
			<FieldImage
				key="pagebackground"
				bind:value={$state.editor.metadata.pagebackground}
			/>
		</dl>

		<JSONTree data={$state.editor.metadata} />
		<JSONTree data={$state} />
	</section>
</VerticalSplit>

<style>
h1 {
	text-align: left;
	margin-top: -0.25em;
}
</style>
