<script lang="ts">
import Card from "../components/Card.svelte"
import CardWork from "../components/CardWork.svelte"
import NewWork from "../modals/NewWork.svelte"
import {
	settings,
	databaseCurrentLanguage,
	volatileWorks,
	WorkID,
} from "../stores"
import { createModalSummoner } from "../modals"
import { _ } from "svelte-i18n"
import { getContext, onMount } from "svelte"
import CreateWork from "../modals/CreateWork.svelte"
import type { Work, WorkOneLang } from "../ortfo"
import Fuse from "fuse.js"
import SearchBar from "../components/SearchBar.svelte"

let creatingWork = false
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
	if (query.length === 0) {
		return withoutVolatiles($databaseCurrentLanguage.works).map(
			(work, i) => ({
				item: work,
				matches: [],
				refIndex: i,
				score: 1,
			})
		)
	}

	return searcher.search(query)
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
			/>
		</li>
	{/each}
</ul>

<style>
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
}
</style>
