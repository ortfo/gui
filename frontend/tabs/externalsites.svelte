<script lang="ts">
import { i18n, tooltip } from "../actions"
import SearchableList from "../components/SearchableList.svelte"
import { database } from "../stores"
import { _ } from "svelte-i18n"
import CreateExternalSite from "../components/CreateExternalSite.svelte"
import Card from "../components/Card.svelte"
import HighlightText from "../components/HighlightText.svelte"
import { createModalSummoner } from "../modals"
import { getContext } from "svelte"
import type { ExternalSite } from "../ortfo"
import { backend } from "../backend"
import MarkdownEditor from "../components/MarkdownEditor.svelte"
import { except } from "../utils"
const summon = createModalSummoner(getContext("simple-modal"))

let editingSite: ExternalSite | null = null
let sitesWithEditingStatus: (ExternalSite & { editing: boolean })[] =
	$database.sites.map(t => ({ ...t, editing: false }))

async function removeSite(site: ExternalSite) {
	sitesWithEditingStatus = sitesWithEditingStatus.filter(
		t => t.name !== site.name
	)
	$database.sites = sitesWithEditingStatus.map(except("editing"))
	await backend.writeSites($database.sites)
}

function editSite(site: ExternalSite) {
	sitesWithEditingStatus = sitesWithEditingStatus.map(t => ({
		...t,
		editing: t.url === site.url,
	}))
	editingSite = sitesWithEditingStatus.find(t => t.url === site.url)
}

async function finishEditing(site: ExternalSite) {
	sitesWithEditingStatus = sitesWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingSite = null
	$database.sites = sitesWithEditingStatus.map(except("editing"))
	await backend.writeSites($database.sites)
}

function cancelEditing(site: ExternalSite) {
	sitesWithEditingStatus = sitesWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingSite = null
}
</script>

<h1 use:i18n>External sites</h1>
<p class="intro" use:i18n>
	Make people aware of your online presence elsewhere on the web: social
	media, YouTube channel, et cætera.
</p>

<section class="sites">
	<SearchableList
		bind:items={sitesWithEditingStatus}
		let:result
		keys={["url", "name", "username", "purpose"]}
	>
		<li
			slot="create"
			class:as-list-item={$database.sites.length > 0}
			class="selectable"
		>
			{#if $database.sites.length > 0}
				<button
					class="create"
					data-variant="none"
					on:click={_ => summon(CreateExternalSite)}>+</button
				>
			{/if}
		</li>

		<!-- Individual item -->

		<div class="site">
			<div class="content">
				<span class="purpose">
					{#if result.item.editing}
						<input
							title={$_("purpose")}
							placeholder={$_(
								"what do you use that website for?"
							)}
							type="text"
							bind:value={editingSite.purpose}
						/>
					{:else}
						<HighlightText
							text={result.item.purpose}
							indices={result.matches.find(
								m => m.key === "purpose"
							)?.indices}
						/>
					{/if}
				</span>
				<span class="name">
					{#if result.item.editing}
						<input
							type="text"
							placeholder={$_("how’s that site called?")}
							bind:value={editingSite.name}
						/>
					{:else}
						<HighlightText
							text={result.item.name}
							indices={result.matches.find(m => m.key === "name")
								?.indices}
						/>
					{/if}
				</span>
				<span class="username">
					{#if result.item.editing}
						<input
							type="text"
							placeholder={$_(
								"what do you go by on {site_name}?",
								{
									values: {
										site_name:
											result.item.name || $_("that site"),
									},
								}
							)}
							bind:value={editingSite.username}
						/>
					{:else}
						<HighlightText
							text={result.item.username}
							indices={result.matches.find(
								m => m.key === "username"
							)?.indices}
						/>
					{/if}
				</span>
				<span class="url">
					{#if result.item.editing}
						<input type="text" bind:value={editingSite.url} />
					{:else}
						<a
							href={result.item.url}
							on:click|preventDefault={async e =>
								await backend.openInBrowser(result.item.url)}
						>
							<HighlightText
								text={result.item.url}
								indices={result.matches.find(
									m => m.key === "url"
								)?.indices}
							/>
						</a>
					{/if}
				</span>
			</div>
			<button
				class="edit"
				data-variant="none"
				title={$_(
					result.item.editing ? "Finish editing" : "Edit this site"
				)}
				on:click={_ =>
					result.item.editing
						? finishEditing(result.item)
						: editSite(result.item)}
			>
				<img
					src="/assets/icon-{result.item.editing
						? 'confirm'
						: 'edit'}.svg"
					alt="/"
					class="icon"
				/></button
			>
			<button
				class="delete"
				data-variant="none"
				title={$_(
					result.item.editing ? "Abort changes" : "Delete this site"
				)}
				on:click={_ =>
					result.item.editing
						? cancelEditing(result.item)
						: removeSite(result.item)}
			>
				×</button
			>
		</div>

		<!-- /Individual item -->

		<li slot="no-results">
			{#if $database.sites.length === 0}
				<CreateExternalSite />
			{:else}
				<h2 use:i18n>No results.</h2>
			{/if}
		</li>
	</SearchableList>
</section>

<style>
.intro {
	text-align: center;
	margin-bottom: 3em;
}
h1 {
	margin: 0;
}
section.sites {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	height: 70vh;
	margin-bottom: 3em;
}
.site {
	display: flex;
	width: 100%;
}
button.edit {
	margin-left: auto;
	margin-right: 2em;
}
button.edit .icon {
	height: 1.9em;
	transform: translateY(1px);
}
button.delete {
	font-size: 1.2em;
	transform: scale(2.2);
}
.purpose:not(:empty),
.name {
	margin-right: 0.75em;
}
.purpose {
	font-style: italic;
}
.username:not(:empty)::before {
	content: "@";
	color: var(--gray);
}
.url {
	display: block;
}
button.create {
	font-size: 3em;
	font-variation-settings: "wght" 300;
	transform: scale(2);
	width: 100%;
	height: 100%;
}
.site:not(:focus-within):not(:hover) button {
	opacity: 0;
}
li[slot="create"],
li[slot="no-results"] {
	display: flex;
	align-items: center;
	flex-direction: column;
}
li[slot="no-results"] {
	margin-top: 2em;
}
</style>
