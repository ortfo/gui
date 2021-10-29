<script lang="ts">
	import { theme } from "../stores"
	import {summon} from "../modals"

	type PageName = "works" | "tags" | "technologies" | "sites" | "settings"

	export let currentPage: PageName = "works"
	let tabs: PageName[] = [
		"works",
		"tags",
		"technologies",
		"sites",
		"settings",
	]
</script>

<nav>
	<img src={`assets/${$theme}-logo.svg`} alt="ortfo's logo" />
	{#each tabs as tab}
		<a
			class={currentPage === tab ? "current" : ""}
			href={`#${tab}`}
			on:click={() => currentPage = tab}
		>
			{tab}
		</a>
	{/each}
	<button on:click={() => summon("publish")}>publish!</button>
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
	button {
		margin-left: auto;
	}
</style>
