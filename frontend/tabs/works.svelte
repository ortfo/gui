<script lang="ts">
import Fuse from "fuse.js"
import { onMount } from "svelte"
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import Card from "../components/Card.svelte"
import CardWork from "../components/CardWork.svelte"
import SearchBar from "../components/SearchBar.svelte"
import { createModalSummoner } from "../modals"
import ConfirmDeleteWorks from "../modals/ConfirmDeleteWorks.svelte"
import CreateWork from "../modals/CreateWork.svelte"
import type { AnalyzedWork, AnalyzedWorkLocalized } from "../ortfo"
import {
	WorkID,
	databaseCurrentLanguage,
	settings,
	state,
	tagsRepository,
	volatileWorks
} from "../stores"
import hotkeys from "../tinykeysInputDisabled"

const summon = createModalSummoner()

let creatingWork = false
let filterByTag: string = ""
let selectedWorks: Set<WorkID> = new Set()
let query: string = ""
let searcher: Fuse<AnalyzedWorkLocalized>
let searchBarElement: HTMLInputElement

function withoutVolatiles<W extends AnalyzedWorkLocalized | AnalyzedWork>(
	works: W[],
): W[] {
	return works.filter(work => !$volatileWorks.includes(work.id))
}

$: searcher = new Fuse(
	withoutVolatiles(Object.values($databaseCurrentLanguage)),
	{
		keys: ["id", "title"],
		includeMatches: true,
		includeScore: true,
	},
)

onMount(() => {
	if (
		withoutVolatiles(Object.values($databaseCurrentLanguage)).length === 0
	) {
		creatingWork = true
	}

	hotkeys(window, {
		"$mod+a": e => {
			if (e.insideEditable) return
			select(search(query).map(r => r.item))
		},
		"$mod+n": e => {
			if (creatingWork) return
			creatingWork = true
		},
		"$mod+Shift+a": e => {
			deselect(search(query).map(r => r.item))
		},
		"$mod+f": e => {
			if (creatingWork) return
			searchBarElement?.focus()
		},
	})
})

function search(query: string): Fuse.FuseResult<AnalyzedWorkLocalized>[] {
	let results: Fuse.FuseResult<AnalyzedWorkLocalized>[] = []
	if (query.length === 0) {
		results = withoutVolatiles(Object.values($databaseCurrentLanguage)).map(
			(work, i) => ({
				item: work,
				matches: [],
				refIndex: i,
				score: 1,
			}),
		)
	} else {
		results = searcher.search(query)
	}

	if (filterByTag !== "") {
		results = results.filter(r =>
			r.item.metadata?.tags?.includes(filterByTag),
		)
	}

	return results
}

function select(works: AnalyzedWorkLocalized[]) {
	selectedWorks = new Set(works.map(work => work.id))
}
function deselect(works: AnalyzedWorkLocalized[]) {
	selectedWorks = new Set(
		Array.from(selectedWorks).filter(
			id => !works.map(w => w.id).includes(id),
		),
	)
}
</script>

{#if $settings.surname}
	<h1>
		{$_("Good to see you, {name}.", {
			values: { name: $settings.surname },
		})}
	</h1>
{:else}
	<h1>{$_("Good to see you.")}</h1>
{/if}

<CreateWork bind:open={creatingWork} />

<div class="actionbar">
	<section class="filters">
		<SearchBar
			bind:htmlElement={searchBarElement}
			bind:query
			on:enter={() => {
				$state.editingWorkID = search(query)[0].item.id
				$state.openTab = "editor"
			}}
		/>
		{#if $tagsRepository.length > 0}
			<div class="tag-filter">
				<label for="filter-by-tags">
					<img src="assets/icon-tag.svg" alt="tagged" class="icon" />
				</label>
				<select
					id="filter-by-tags"
					class="tags"
					bind:value={filterByTag}
				>
					{#each ["", ...$tagsRepository.map(t => t.singular)] as tag}
						<option value={tag}
							>{tag === "" ? $_("All tags") : tag}</option
						>
					{/each}
				</select>
				<span class="arrow">↓</span>
			</div>
		{/if}
	</section>

	<section class="bulk-actions">
		{#if selectedWorks.size > 0}
			<span
				>{$_("selected_works_label", {
					values: { count: selectedWorks.size },
				})}</span
			>
			<button
				use:i18n
				data-variant="inline"
				on:click={() =>
					summon(ConfirmDeleteWorks, { workIDs: selectedWorks })}
				>delete</button
			>
			<button data-variant="inline" use:i18n>add a tag</button>
			<button data-variant="inline" use:i18n>remove a tag</button>
			<button data-variant="inline" use:i18n>set tags</button>
		{/if}
	</section>
</div>

<ul class="cards">
	<li id="create">
		<Card creates hasIcon on:click={_ => (creatingWork = true)}>+</Card>
	</li>
	{#each search(query) as result (result.item.id)}
		<li id={`work-${result.item.id}`}>
			<CardWork
				work={result.item}
				highlightTitle={result.matches.find(m => m.key === "title")
					?.indices}
				selectedTag={filterByTag}
				selected={selectedWorks.has(result.item.id)}
				on:select={() =>
					(selectedWorks = new Set([
						...selectedWorks,
						result.item.id,
					]))}
				on:deselect={() => {
					selectedWorks = new Set(
						[...selectedWorks].filter(id => id !== result.item.id),
					)
				}}
				on:tag-click={e => {
					let clickedTag = e.detail
					if (clickedTag === filterByTag) {
						filterByTag = ""
					} else {
						filterByTag = clickedTag
					}
				}}
			/>
		</li>
	{/each}
</ul>

<style lang="scss">
h1 {
	margin: 1.5em 0;
}
ul.cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, calc(15em + 0.175em));
	gap: 2em;
	list-style: none;
	padding-left: 0;
	justify-content: center;
	margin-bottom: 15em;
}

.actionbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 2rem;
	margin: 2rem 0;
	position: sticky;
	top: 2.25rem + 1rem;
	left: 0;
	right: 0;
	z-index: 10;
	background: var(--white);
}

section.filters {
	display: flex;
	align-items: center;
}

.tag-filter {
	margin-left: 2em;
	display: flex;
	align-items: center;
	position: relative;
}
.tag-filter img.icon {
	height: 1.7rem;
	transform: translateY(0.2rem); /* optical alignement */
}
select.tags {
	appearance: none;
	-webkit-appearance: none;
	background-color: transparent;
	font-size: 1em;
	height: 2rem;
	padding: 0 0.5em;
	margin-left: 1em;
	padding-right: calc(0.5em + 1.2em);
}
.tag-filter .arrow {
	position: absolute;
	right: 0.5em;
	font-size: 1.2em;
	pointer-events: none;
	display: inline-block;
	color: var(--black);
	z-index: 10;
	transform: translateY(0);
	opacity: 1;
	transition: all 0.25s ease;
}
select.tags:not(:focus):not(:hover) + .arrow {
	transform: translateY(-0.5rem);
	opacity: 0;
}
</style>
