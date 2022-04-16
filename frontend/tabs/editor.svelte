<script context="module" lang="ts">
export async function saveWork(
	id: WorkID,
	parsedDescription: ParsedDescription,
	reloadWhenDone: boolean = true
) {
	await backend.writeToDisk(parsedDescription, id)
	volatileWorks.set(get(volatileWorks).filter(workID => workID !== id))
	rebuildDatabase(reloadWhenDone)
}
</script>

<script lang="ts">
import { onMount } from "svelte"
import { toParsedDescription } from "../description"
import SwitchButton from "../components/SwitchButton.svelte"
import {
	state,
	settings,
	workInEditor,
	workOnDisk,
	WorkID,
	volatileWorks,
} from "../stores"
import JSONTree from "svelte-json-tree"
import { i18n } from "../actions"
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
import type { ParsedDescription } from "../ortfo"
import FieldMap from "../components/FieldMap.svelte"
import { rebuildDatabase } from "../components/Navbar.svelte"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"

onMount(async () => {
	tinykeys(window, {
		"$mod+s": async () => {
			await saveWork($workOnDisk.id, $workInEditor, false)
			await backend.saveUIState($state)
			// TODO only re-mount components whose was unsaved prior to rebuilding
		},
	})
})

async function initialize() {
	if ($workOnDisk === null) {
		throw MissingWork(`Work ${$state.editingWorkID} not found.`)
	} else {
		$workInEditor = toParsedDescription(
			$workOnDisk,
			$settings.portfoliolanguages
		)
		$state.lang ||= "en"
	}
}

function editTitle(e) {
	if (!editingTitle) {
		editingTitle = true
		titleH1.focus()
	} else {
		editingTitle = false
		$workInEditor.title = {
			...$workInEditor.title,
			[$state.lang]: titleH1.textContent,
		}
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
			<p class="url">/{$workOnDisk?.id}</p>

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
					>{#if editingTitle}{$_("finish")}{:else}{$_(
							"edit"
						)}{/if}</button
				>
			</div>

			{#if $settings.showTips}
				<p class="tip">
					{$_(
						"Drag and drop blocks to arrange the layout of the page. Double-click a block to edit it."
					)}
				</p>
			{/if}

			<ContentGrid bind:work={$workInEditor} language={$state.lang} />
		</section>

		<aside slot="secondary">
			<section class="metadata">
				<h2>{$_("Metadata")}</h2>
				{#if $settings.showTips}
					<p class="tip">
						{$_("unset values inherit their defaults, set in")}
						<a
							href="#settings"
							on:click={() => ($state.openTab = "settings")}
							>{$_("settings")}</a
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
			</section>

			<section class="footnotes">
				<h2>{$_("Footnotes")}</h2>
				<!-- TODO when a key changes, update references. -->
				<FieldMap
					value={$workInEditor.footnotes[$state.lang]}
					richText
					on:input={({ detail }) => {
						$workInEditor.footnotes = {
							...$workInEditor.footnotes,
							[$state.lang]: Object.fromEntries(
								Object.entries(detail).map(([k, v]) => [
									k,
									v.replace(/<p>(.+)<\/p>/, "$1"),
								])
							),
						}
					}}
					placeholderKey={$_("key")}
					placeholderValue={$_("content")}
					removeTooltip={$_("Remove this footnote")}
				/>
			</section>

			<section class="abbreviations">
				<h2>{$_("Abbreviations")}</h2>

				<FieldMap
					value={$workInEditor.abbreviations[$state.lang]}
					on:input={({ detail }) => {
						$workInEditor.abbreviations = {
							...$workInEditor.abbreviations,
							[$state.lang]: Object.fromEntries(
								Object.entries(detail).map(([k, v]) => [
									k,
									v.replace(/<p>(.+)<\/p>/, "$1"),
								])
							),
						}
					}}
					placeholderKey={$_("name")}
					placeholderValue={$_("definition")}
				/>
			</section>
		</aside>
	</Split>
	{#if import.meta.env.DEV}
		<details class="raw-data dev-only">
			<summary>Show raw data for this work</summary>
			<JSONTree value={$workInEditor} />
		</details>
		<div class="float dev-only">
			<div id="debug" />
			<ObjectDiffTable
				a={toParsedDescription($workOnDisk || null) || {}}
				b={$workInEditor}
				aLabel="on disk"
				bLabel="in editor"
			/>
		</div>
	{/if}
{:catch error}
	{#if error.why === "missing_work"}
		<h1 use:i18n>Well, this is weird.</h1>
		<div class="error">
			<p>
				{@html $_(
					"It looks like <em>{id}</em>’s folder has gone missing.",
					{
						values: {
							id: $state.editingWorkID,
						},
					}
				)}
			</p>
			<button on:click={_ => ($state.openTab = "works")}
				>{$_("go back to all projects")}</button
			>
		</div>
	{:else}
		<h1>??</h1>
		<p>{$_("An error occured: ")}</p>
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
	margin-top: 2em;
	font-family: var(--mono);
}
.layout {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-right: 1em;
}

aside {
	padding-left: 1em;
}

aside section:not(:first-of-type) {
	margin-top: 4em;
}

aside h2 {
	margin-bottom: 0.25em;
	font-size: 1.75em;
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

.float {
	position: fixed;
	bottom: 2em;
	right: 2em;
	width: 500px;
	z-index: 1000;
	background: var(--gray-light);
	padding: 2em;
	border-radius: 0.5em;
}
</style>
