<script lang="ts">
	import Card from "./components/Card.svelte";
	import Navbar from "./components/Navbar.svelte";
	import { surname, theme } from "./stores";

	if ($theme == "dark") {
		document.querySelector(":root").style.setProperty("--black", "#FFF");
		document.querySelector(":root").style.setProperty("--white", "#000");
		document.querySelector(":root").style.setProperty("--gray", "#222");
		document.querySelector(":root").style.setProperty("--ortforange-light", "#2e1902");
	}
</script>

<Navbar />
<main>
	<h1>Good to see you, {$surname}.</h1>
	<Card creates><p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sint ipsa iure praesentium optio dolore ea veritatis corporis architecto eos itaque velit, commodi doloribus placeat error reiciendis, assumenda harum nisi. Dolores.</p></Card>
</main>

<style>
	:global(body) {
		font-family: var(--sans);
		background-color: var(--white);
		margin: 0;
	}

	:global(*) {
		color: var(--black);
		font-family: var(--sans);
		margin: 0;
		padding: 0;
	}

	:global(button) {
		background: transparent;
		border: none;
		cursor: pointer;
	}

	:global(button):not([data-looks-like]) {
		border-radius: 2em;
		border: 2px solid var(--ortforange);
		color: var(--ortforange);
		background-color: transparent;
		font-weight: bold;
		padding: 0.25rem 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global(button):not([data-looks-like]):hover {
		background-color: var(--ortforange-light);
	}

	:global(h1) {
		text-align: center;
		font-size: 3em;
		font-weight: normal;
		margin: 2rem 0;
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

	main {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
