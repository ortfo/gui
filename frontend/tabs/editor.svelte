<script lang="ts">
import { onMount } from "svelte"
import { toParsedDescription } from "../description"
import SwitchButton from "../components/SwitchButton.svelte"
import {
	state,
	settings,
	workInEditor,
	workOnDiskCurrentLanguage,
	workOnDisk,
} from "../stores"
import JSONTree from "svelte-json-tree"
import FieldImage from "../components/FieldImage.svelte"
import FieldList from "../components/FieldList.svelte"
import FieldColors from "../components/FieldColors.svelte"
import ContentGrid from "../components/ContentGrid.svelte"
// @ts-ignore don't know why ts thinks Split does not exist, it does
import { Split } from "@geoffcox/svelte-splitter"
import tinykeys from "tinykeys"
import { backend } from "../backend"
import ObjectDiffTable from "../components/ObjectDiffTable.svelte"
import { MissingWork } from "../errors"

onMount(async () => {
	tinykeys(window, {
		"$mod+s": async () => {
			backend.writeToDisk($workInEditor, $workOnDisk.id)
		},
	})
})

async function initialize() {
	if ($workOnDisk === null) {
		throw MissingWork(`Work ${$state.editingWorkID} not found.`)
	} else {
		$workInEditor = toParsedDescription($workOnDisk)
		$state.lang ||= "en"
	}
}

function editTitle(e) {
	if (!editingTitle) {
		editingTitle = true
		titleH1.focus()
	} else {
		editingTitle = false
		$workInEditor.title[$state.lang] = titleH1.textContent
	}
}

let editingTitle = false
let titleH1: HTMLHeadingElement
</script>

{#await initialize() then}
	<Split initialPrimarySize="{100 - $state.metadataPaneSplitRatio * 100}%">
		<section class="layout" slot="primary">
			<SwitchButton
				bind:value={$state.lang}
				options={{ en: "english", fr: "français" }}
				showCodes
			/>
			<p class="url">/{$workOnDisk.id}</p>

			<div class="title" id="title">
				<h1
					bind:this={titleH1}
					on:dblclick={_ => {
						window.getSelection().collapseToStart()
						editingTitle = true
					}}
					on:keypress={e => {
						switch (e.key) {
							case "Enter":
								e.preventDefault()
								editTitle(e)
								break
							case "Escape":
								e.preventDefault()
								editingTitle = false
								titleH1.textContent =
									$workInEditor.title[$state.lang]
								break
						}
					}}
					on:blur={editTitle}
					contenteditable={editingTitle}
				>
					{$workInEditor.title[$state.lang]}
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

			<ContentGrid bind:work={$workInEditor} language={$state.lang} />
		</section>

		<section class="metadata" slot="secondary">
			<h2>Metadata</h2>
			{#if $settings.showTips}
				<p class="tip">
					unset values inherit their defaults, set in
					<a
						href="#settings"
						on:click={() => ($state.openTab = "settings")}
						>settings</a
					>
				</p>
			{/if}

			<dl>
				<FieldList
					key="tags"
					bind:value={$workInEditor.metadata.tags}
				/>
				<FieldList
					key="madewith"
					bind:value={$workInEditor.metadata.madewith}
				/>
				<FieldColors
					key="colors"
					bind:value={$workInEditor.metadata.colors}
				/>
				<FieldImage
					key="pagebackground"
					bind:value={$workInEditor.metadata.pagebackground}
				/>
			</dl>
			<ObjectDiffTable
				a={toParsedDescription($workOnDisk)}
				b={$workInEditor}
				aLabel="on disk"
				bLabel="in editor"
			/>
		</section>
	</Split>
	<details class="raw-data">
		<summary>Show raw data for this work</summary>
		<JSONTree value={$workOnDisk} />
	</details>
{:catch error}
	{#if error.why === "missing_work"}
		<h1>Well, this is weird.</h1>
		<div class="error">
			<p>
				It looks like <em>{$state.editingWorkID}</em>'s folder has gone
				missing.
			</p>
			<button on:click={_ => ($state.openTab = "works")}
				>go back to all projects</button
			>
		</div>
	{:else}
		<h1>??</h1>
		<p>An unknown error occured. It says:</p>
		<p>{error}</p>
	{/if}
{/await}

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

.raw-data {
	align-self: flex-start;
	margin-top: 5em;
}
.url {
	font-family: var(--mono);
}
.layout {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-right: 1em;
}

.metadata {
	padding-left: 1em;
}

.title,
.url {
	align-self: flex-start;
}

.error {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.error button {
	margin-top: 1em;
}
</style>
