<script lang="ts">
import { i18n, tooltip } from "../actions"
import SearchableList from "../components/SearchableList.svelte"
import { database } from "../stores"
import { _ } from "svelte-i18n"
import CreateTech from "../components/CreateTech.svelte"
import Card from "../components/Card.svelte"
import HighlightText from "../components/HighlightText.svelte"
import { createModalSummoner } from "../modals"
import { getContext } from "svelte"
import type { Tag, Technology } from "../ortfo"
import { backend } from "../backend"
import MarkdownEditor from "../components/MarkdownEditor.svelte"
import { except } from "../utils"
const summon = createModalSummoner()

let editingTech: Technology | null = null
let techsWithEditingStatus: (Technology & { editing: boolean })[] =
	$database.technologies.map(t => ({ ...t, editing: false }))

async function removeTech(tech: Technology) {
	techsWithEditingStatus = techsWithEditingStatus.filter(
		t => t.urlname !== tech.urlname
	)
	$database.technologies = techsWithEditingStatus.map(except("editing"))
	await backend.writeTechnologies($database.technologies)
}

function editTech(tech: Technology) {
	techsWithEditingStatus = techsWithEditingStatus.map(t => ({
		...t,
		editing: t.urlname === tech.urlname,
	}))
	editingTech = techsWithEditingStatus.find(t => t.urlname === tech.urlname)
}

async function finishEditing(tech: Technology) {
	techsWithEditingStatus = techsWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingTech = null
	$database.technologies = techsWithEditingStatus.map(except("editing"))
	await backend.writeSites($database.technologies)
}

function cancelEditing(tech: Technology) {
	techsWithEditingStatus = techsWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingTech = null
}
</script>

<h1 use:i18n>Technologies</h1>
<p class="intro" use:i18n>
	Specify what you use in your projects: languages, materials, textures,
	samples, frameworks, you name it.
</p>

<section class="technologies">
	<SearchableList
		bind:items={techsWithEditingStatus}
		let:result
		keys={[
			"urlname",
			"displayname",
			"description",
			"learnmoreurl",
			"author",
		]}
	>
		<li
			slot="create"
			class:as-list-item={$database.technologies.length > 0}
			class="selectable"
		>
			{#if $database.technologies.length > 0}
				<button
					class="create"
					data-variant="none"
					on:click={_ => summon(CreateTech)}>+</button
				>
			{/if}
		</li>

		<!-- Individual item -->

		<div class="tech">
			<div class="content">
				<span class="display-name">
					{#if result.item.editing}
						<input
							type="text"
							bind:value={editingTech.displayname}
						/>
						{$_("by")}
						<input type="text" bind:value={editingTech.author} />
					{:else}
						<HighlightText
							text={result.item.displayname}
							indices={result.matches.find(
								m => m.key === "displayname"
							)?.indices}
						/>
						<span class="author">
							{#if result.item.author}{$_("by")} {/if}
							<HighlightText
								text={result.item.author}
								indices={result.matches.find(
									m => m.key === "author"
								)?.indices}
							/>
						</span>
					{/if}
				</span>
				<span class="names-separator">|</span>
				<span class="url-name">
					{#if result.item.editing}
						<input type="text" bind:value={editingTech.urlname} />
					{:else}
						<HighlightText
							text={result.item.urlname}
							indices={result.matches.find(
								m => m.key === "urlname"
							)?.indices}
						/>
					{/if}
				</span>
				<p
					class="description"
					class:empty={result.item.description === "" &&
						!result.item.editing}
				>
					{#if result.item.editing}
						<MarkdownEditor
							autoactive
							bind:value={editingTech.description}
							placeholder={$_("describe your technology")}
						/>
					{:else if result.item.description}
						{@html result.item.description}
					{:else}
						{$_("No description")}
					{/if}
				</p>
			</div>
			<button
				class="edit"
				data-variant="none"
				title={$_(
					result.item.editing
						? "Finish editing"
						: "Edit this technology"
				)}
				on:click={_ =>
					result.item.editing
						? finishEditing(result.item)
						: editTech(result.item)}
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
					result.item.editing
						? "Abort changes"
						: "Delete this technology"
				)}
				on:click={_ =>
					result.item.editing
						? cancelEditing(result.item)
						: removeTech(result.item)}
			>
				×</button
			>
		</div>

		<!-- /Individual item -->

		<li slot="no-results">
			{#if $database.technologies.length === 0}
				<CreateTech />
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
section.technologies {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	height: 70vh;
	margin-bottom: 3em;
}
input {
	display: inline;
}
.tech {
	display: flex;
	width: 100%;
}
.author {
	color: var(--gray);
}
.author:not(:empty) {
	margin-left: 0.25em;
}
.names-separator {
	margin: 0 0.5em;
	font-variation-settings: "wght" 800;
	transform: scaleY(3);
	color: var(--gray);
}
button.edit {
	margin-left: auto;
	margin-right: 2em;
}
button.edit .icon {
	height: 1.5em;
	transform: translateY(1px);
}
button.delete {
	font-size: 1.2em;
	transform: scale(2.2);
}
.description.empty {
	color: var(--gray);
}
button.create {
	font-size: 3em;
	font-variation-settings: "wght" 300;
	transform: scale(2);
	width: 100%;
	height: 100%;
}
input {
	width: 10ch;
}
.tech:not(:focus-within):not(:hover) button {
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
