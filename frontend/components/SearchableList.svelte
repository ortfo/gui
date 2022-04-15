<script lang="ts">
import { scrollStates } from "../actions"
import Fuse from "fuse.js"
import { _ } from "svelte-i18n"
import SearchBar from "../components/SearchBar.svelte"

type T = any

export let items: T[]
export let keys: (keyof T)[]
export let selectable: boolean = false
let searcher: Fuse<T>
let query: string = ""
let results: T[]
$: searcher = new Fuse(items, {
	keys,
	includeScore: true,
	includeMatches: true,
})

function search(items: T[], query: string): Fuse.FuseResult<T>[] {
	console.log(items)
	if (query === "") {
		return items.map((d, i) => ({
			item: d,
			score: 1,
			matches: [],
			refIndex: i,
		}))
	}
	return searcher.search(query)
}

$: results = search(items, query)
</script>

<SearchBar bind:query />
<ul
	use:scrollStates={{ bottom: 50, top: 0 }}
	class:empty={results.length === 0}
>
	<slot name="create" />
	{#each results as result (result.refIndex)}
		<li on:click={console.log} class:selectable>
			<slot {result}>
				{result.item}
			</slot>
		</li>
	{:else}
		<slot name="no-results" class="no-results">{$_("No results.")}</slot>
	{/each}
</ul>

<style lang="scss">
ul {
	margin: 0.5em auto;
	display: flex;
	flex-direction: column;
	gap: 1.5em;
	overflow-y: scroll;
	overflow-x: hidden;
	text-align: left;
	width: 40em;
	position: relative;
	flex-grow: 1;
	transition: all 0.25s ease;
}

ul:not([data-scrolled="bottom"]):not(.empty) {
	-webkit-mask-image: -webkit-gradient(
		linear,
		left bottom,
		left 75%,
		from(rgba(0, 0, 0, 0)),
		to(rgba(0, 0, 0, 1))
	);
}

li[slot="no-results"] {
	font-size: 2em;
	margin-bottom: 1em;
}

li:not(.no-results),
:global(li.as-list-item) {
	display: flex;
	align-items: center;
	overflow-x: visible;
	font-size: 1em;
	padding: 1em 2em;
	text-align: left;
	transition: all 0.25s ease;
	border-radius: 0.5em;
	background: var(--gray-light);
	transform: scale(0.95);
	list-style: none;
}

li:not(.no-results).selectable,
:global(li.as-list-item.selectable) {
	&:hover,
	&:focus-within {
		background: var(--ortforange);
		transform: scale(1);
	}
	&:active {
		background: var(--ortforange);
		transform: scale(0.9);
	}
}
</style>
