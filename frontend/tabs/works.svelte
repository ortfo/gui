<script lang="ts">
import Card from "../components/Card.svelte"
import CardWork from "../components/CardWork.svelte"
import NewWork from "../modals/NewWork.svelte"
import { settings, databaseCurrentLanguage, database } from "../stores"
import { createModalSummoner } from "../modals"
import { _ } from "svelte-i18n"
import { getContext } from "svelte"
import { backend, DirEntry } from "../backend"
const summon = createModalSummoner(getContext("simple-modal"))

let creatingWork = false

async function getUndescribedWorks() {
	let dirs = await backend.listDirectory($settings.projectsfolder)
	console.log(dirs)
	return dirs.filter(
		dir =>
			!$database.works.map(w => w.id).includes(dir.Name) &&
			dir.IsDir &&
			!dir.Name.startsWith(".")
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

<div class="sheet" class:open={creatingWork}>
	<h1>{$_("Let's describe a work")}</h1>
	<button on:click={_ => (creatingWork = false)}>Cancel</button>
	{#await getUndescribedWorks()}
		{$_("Loading…")}
	{:then dirs}
		<h2>{$_("Works in your projects folder that don't have descriptions yet")}</h2>
		{#each dirs as dir}
			<li>{dir.Name}</li>
		{/each}
	{:catch error}
		<!-- getU was rejected -->
	{/await}
</div>

<ul class="cards">
	<li id="create">
		<Card creates hasIcon on:click={_ => (creatingWork = true)}>+</Card>
	</li>
	{#each $databaseCurrentLanguage.works as work}
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
.sheet {
	position: fixed;
	top: 53px; /* XXX: navbar's height */
	z-index: 100;
	background: var(--white);
	left: 0;
	right: 0;
	bottom: 0;
	transition: all 0.25s ease;
	opacity: 1;
	overflow-y: scroll;
}
.sheet:not(.open) {
	top: 100vh;
	bottom: -100vh;
	opacity: 0;
	pointer-events: none;
}
</style>
