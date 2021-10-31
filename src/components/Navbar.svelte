<script lang="ts">
	import { settings, state } from "../stores"
	import type {PageName} from "../stores"
	import {summon} from "../modals"
	import {backend} from "../backend"
	import { createEventDispatcher } from "svelte"

	const dispatch = createEventDispatcher()
	export let currentPage: PageName = $state.openTab
	let tabs: PageName[] = [
		"works",
		"tags",
		"technologies",
		"sites",
		"settings",
	]
</script>

<nav>
	<img src={`assets/${$settings.theme}-logo.svg`} alt="ortfo's logo" />
	{#each tabs as tab}
		<a
			class={currentPage === tab ? "current" : ""}
			href={`#${tab}`}
			on:click={() => {currentPage = tab; dispatch("update", currentPage)}}
		>
			{tab}
		</a>
	{/each}
	<button on:click={() => summon("publish")}>publish!</button>
	<button class="quit" data-looks-like="a" on:click={() => backend.quit()}>×</button>
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
		height: 2.25rem;
		background-color: var(--white);
		border-bottom: 1px solid var(--black);
		gap: 2em;
		padding: 0.5rem 1rem;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
	}
	img {
		height: 2.1rem;
	}
	nav a {
		height: 1.3em;
		text-decoration: none;
		display: inline-block;
		border-bottom: 3px solid transparent;
	}
	nav a.current {
		font-weight: bold; 
		border-bottom-color: var(--ortforange);
	}
	button:first-of-type {
		margin-left: auto;
	}

	.quit {
		font-size: 2rem;
	}
</style>
