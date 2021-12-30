<script lang="ts">
import Card from "../components/Card.svelte"
import CardWork from "../components/CardWork.svelte"
import { settings, database } from "../stores"
import { summon } from "../modals"
</script>

{#if $settings.surname}
	<h1>Good to see you, {$settings.surname}.</h1>
{:else}
	<h1>Good to see you.</h1>
{/if}

<ul class="cards">
	<li id="create">
		<Card creates hasIcon on:click={() => summon("new-entry")}>+</Card>
	</li>
	{#each $database.works as work}
		<li id={`work-${work.id}`}>
			<CardWork {work} />
		</li>
	{/each}
</ul>

<style>
h1 {
	margin: 1.5em 0;
}
ul {
	display: grid;
	grid-template-columns: repeat(auto-fill, calc(15em + 0.175em));
	gap: 2em;
	list-style: none;
	padding-left: 0;
	justify-content: center;
	margin-bottom: 15em;
}
</style>
