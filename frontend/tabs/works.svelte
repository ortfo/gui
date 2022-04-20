<script lang="ts">
import Card from "../components/Card.svelte"
import CardWork from "../components/CardWork.svelte"
import NewWork from "../modals/NewWork.svelte"
import {
	settings,
	databaseCurrentLanguage,
	volatileWorks,
	WorkID,
	database,
} from "../stores"
import { createModalSummoner } from "../modals"
import { _ } from "svelte-i18n"
import { getContext, onMount } from "svelte"
import CreateWork from "../modals/CreateWork.svelte"
import type { Tag, Work, WorkOneLang } from "../ortfo"
import Fuse from "fuse.js"
import SearchBar from "../components/SearchBar.svelte"
import FieldSelect from "../components/FieldSelect.svelte"

let creatingWork = false
let filterByTag: Tag["singular"] | "" = ""
let query: string = ""
let searcher: Fuse<WorkOneLang>

function withoutVolatiles<W extends WorkOneLang | Work>(works: W[]): W[] {
	return works.filter(work => !$volatileWorks.includes(work.id))
}

$: searcher = new Fuse(withoutVolatiles($databaseCurrentLanguage.works), {
	keys: ["id", "title"],
	includeMatches: true,
	includeScore: true,
})

onMount(() => {
	if (withoutVolatiles($databaseCurrentLanguage.works).length === 0) {
		creatingWork = true
	}
})

function search(query: string): Fuse.FuseResult<WorkOneLang>[] {
	let results: Fuse.FuseResult<WorkOneLang>[] = []
	if (query.length === 0) {
		results = withoutVolatiles($databaseCurrentLanguage.works).map(
			(work, i) => ({
				item: work,
				matches: [],
				refIndex: i,
				score: 1,
			})
		)
	} else {
		results = searcher.search(query)
	}

	if (filterByTag !== "") {
		results = results.filter(r =>
			r.item.metadata?.tags?.includes(filterByTag)
		)
	}

	return results
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

<section class="filters">
	<SearchBar bind:query />
	{#if $database.tags.length > 0}
		<div class="tag-filter">
			<label for="filter-by-tags">
				<img src="assets/icon-tag.svg" alt="tagged" class="icon" />
			</label>
			<select id="filter-by-tags" class="tags" bind:value={filterByTag}>
				{#each ["", ...$database.tags.map(t => t.singular)] as tag}
					<option value={tag}
						>{tag === "" ? $_("All tags") : tag}</option
					>
				{/each}
			</select>
			<span class="arrow">↓</span>
		</div>
	{/if}
</section>

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

section.filters {
	display: flex;
	padding: 0 2em;
	margin-bottom: 1em;
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
