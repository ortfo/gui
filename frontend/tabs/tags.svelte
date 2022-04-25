<script lang="ts">
import { i18n, tooltip } from "../actions"
import SearchableList from "../components/SearchableList.svelte"
import { database } from "../stores"
import { _ } from "svelte-i18n"
import CreateTag from "../components/CreateTag.svelte"
import Card from "../components/Card.svelte"
import HighlightText from "../components/HighlightText.svelte"
import { createModalSummoner } from "../modals"
import { getContext } from "svelte"
import type { Tag } from "../ortfo"
import { backend } from "../backend"
import MarkdownEditor from "../components/MarkdownEditor.svelte"
import { except } from "../utils"
const summon = createModalSummoner()

let editingTag: Tag | null = null
let tagsWithEditingStatus: (Tag & { editing: boolean })[] = $database.tags.map(
	t => ({ ...t, editing: false })
)

async function removeTag(tag: Tag) {
	tagsWithEditingStatus = tagsWithEditingStatus.filter(
		t => t.singular !== tag.singular
	)
	$database.tags = tagsWithEditingStatus.map(except("editing"))
	await backend.writeSites($database.tags)
}

function editTag(tag: Tag) {
	if ([tag.plural, tag.singular].includes("")) {
		return
	}
	tagsWithEditingStatus = tagsWithEditingStatus.map(t => ({
		...t,
		editing: t.singular === tag.singular,
	}))
	editingTag = tagsWithEditingStatus.find(t => t.singular === tag.singular)
}

async function finishEditing(tag: Tag) {
	tagsWithEditingStatus = tagsWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingTag = null
	$database.tags = tagsWithEditingStatus.map(except("editing"))
	await backend.writeSites($database.tags)
}

function cancelEditing(tag: Tag) {
	tagsWithEditingStatus = tagsWithEditingStatus.map(t => ({
		...t,
		editing: false,
	}))
	editingTag = null
}
</script>

<h1 use:i18n>Tags</h1>
<p class="intro" use:i18n>Categorize your works with <em>tags</em></p>

<section class="tags">
	<SearchableList
		bind:items={tagsWithEditingStatus}
		let:result
		keys={["singular", "plural", "description", "learnmoreurl"]}
	>
		<li
			slot="create"
			class:as-list-item={$database.tags.length > 0}
			class="selectable"
		>
			{#if $database.tags.length > 0}
				<button
					class="create"
					data-variant="none"
					on:click={_ => summon(CreateTag)}>+</button
				>
			{/if}
		</li>

		<!-- Individual item -->

		<div class="tag">
			<div class="content">
				<span class="singular-name">
					{#if result.item.editing}
						<input type="text" bind:value={editingTag.singular} />
					{:else}
						<HighlightText
							text={result.item.singular}
							indices={result.matches.find(
								m => m.key === "singular"
							)?.indices}
						/>
					{/if}
				</span>
				<span class="names-separator">|</span>
				<span class="plural-name">
					{#if result.item.editing}
						<input type="text" bind:value={editingTag.plural} />
					{:else}
						<HighlightText
							text={result.item.plural}
							indices={result.matches.find(
								m => m.key === "plural"
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
							bind:value={editingTag.description}
							placeholder={$_("describe your tag")}
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
					result.item.editing ? "Finish editing" : "Edit this tag"
				)}
				on:click={_ =>
					result.item.editing
						? finishEditing(result.item)
						: editTag(result.item)}
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
					result.item.editing ? "Abort changes" : "Delete this tag"
				)}
				on:click={_ =>
					result.item.editing
						? cancelEditing(result.item)
						: removeTag(result.item)}
			>
				×</button
			>
		</div>

		<!-- /Individual item -->

		<li slot="no-results">
			{#if $database.tags.length === 0}
				<CreateTag />
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
section.tags {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	height: 70vh;
	margin-bottom: 3em;
}
.tag {
	display: flex;
	width: 100%;
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
input {
	width: 10ch;
}
button.create {
	font-size: 3em;
	font-variation-settings: "wght" 300;
	transform: scale(2);
	width: 100%;
	height: 100%;
}
.tag:not(:focus-within):not(:hover) button {
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
