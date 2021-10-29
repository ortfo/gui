<script lang="ts">
	import Navbar from "./components/Navbar.svelte";
	import { surname, theme } from "./stores";

	if ($theme == "dark") {
		document.querySelector(":root").style.setProperty("--black", "#FFF");
		document.querySelector(":root").style.setProperty("--white", "#000");
		document.querySelector(":root").style.setProperty("--gray", "#222");
		document.querySelector(":root").style.setProperty("--ortforange-light", "#2e1902");
	}
</script>

<main>
	<Navbar />
	<h1>Good to see you, {$surname}.</h1>
</main>

<style>
	:global(body) {
		font-family: var(--sans);
		background-color: var(--white);
		margin: 0;
	}

	:global(*) {
		color: var(--black);
	}

	:global(button) {
		border-radius: 2em;
		border: 2px solid var(--ortforange);
		color: var(--ortforange);
		background-color: transparent;
		font-weight: bold;
		padding: 0.25rem 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global(button):hover {
		background-color: var(--ortforange-light);
	}

	:global(h1) {
		text-align: center;
		font-size: 3em;
		font-weight: normal;
	}

	:root {
		--ortforange: #e57c08;
		/* dark mode: --ortforange-light: #2e1902 */
		--ortforange-light: #fae5ce;
		--black: #000;
		--white: #fff;
		--gray: #ccc;
		--sans: "Manrope";
	}
</style>
