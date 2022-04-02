<script lang="ts">
import Navbar from "./components/Navbar.svelte"
import { database, settings, state } from "./stores"
import { backend } from "./backend"
import Works from "./tabs/works.svelte"
import Tags from "./tabs/tags.svelte"
import Editor from "./tabs/editor.svelte"
import Settings from "./tabs/settings.svelte"
import { onMount } from "svelte"
import Modal from "svelte-simple-modal"
import ModalButtonClose from "./components/ModalButtonClose.svelte"

async function loadSettings() {
	await backend.initialize()
	$settings = await backend.settingsRead()
	console.info(`Loaded settings from backend: ${JSON.stringify($settings)}`)
	if (!$settings.surname) {
		$settings.surname = prompt("What is your surname?", "")
	}
	if (!$settings.projectsfolder) {
		$settings.projectsfolder = prompt("Where are your projects stored?", "")
	}
	await backend.settingsWrite($settings)
	$state = await backend.readUIState()
	console.info(`Loaded UI state save from backend: ${JSON.stringify($state)}`)
}

function applyTheme(themeName: string) {
	const root = document.querySelector(":root") as HTMLElement
	document.body.dataset.theme = themeName
	switch (themeName) {
		case "light":
			root.style.setProperty("--ortforange", "#e57c08")
			root.style.setProperty("--ortforange-light", "#fae5ce")
			root.style.setProperty("--black", "#000")
			root.style.setProperty("--white", "#fff")
			root.style.setProperty("--gray-light", "#ccc")
			root.style.setProperty("--gray", "#767676")
			break
		case "dark":
			root.style.setProperty("--black", "#FFF")
			root.style.setProperty("--white", "#000")
			root.style.setProperty("--gray", "#757575")
			root.style.setProperty("--gray-light", "#222")
			root.style.setProperty("--ortforange-light", "#2e1902")
			break
	}
}

async function loadDatabase() {
	$database = await backend.databaseRead()
	console.info(`Loaded database from backend`)
}

async function load() {
	await loadSettings()
	await loadDatabase()
}

onMount(() => {
	window.addEventListener("keypress", e => {
		if (e.key == "r" && e.ctrlKey) {
			window.location.reload()
		}
	})
})

settings.subscribe(settings => applyTheme(settings.theme))
</script>

{#await load()}
	<h1>Sit tight, loading your stuff…</h1>
{:then _}
	<Modal closeButton={ModalButtonClose}>
		<Navbar />
		<main>
			{#if $state.openTab == "works"}
				<Works />
			{:else if $state.openTab == "tags"}
				<Tags />
			{:else if $state.openTab == "technologies"}
				TODO
			{:else if $state.openTab == "sites"}
				TODO
			{:else if $state.openTab == "settings"}
				<Settings />
			{:else if $state.openTab == "editor"}
				<Editor />
			{:else}
				404
			{/if}
		</main>
	</Modal>
{:catch e}
	<div class="error">
		<h1>Woops!</h1>
		<p>Couldn't load your stuff:</p>
		<ol>
			{#each e.toString().split(": ") as reason}
				<li>{reason}</li>
			{/each}
		</ol>
	</div>
{/await}

<style>
:global(body, input, select) {
	font-family: var(--sans);
	background-color: var(--white);
	color: var(--black);
	margin: 0;
}

:global(code, pre) {
	font-family: var(--mono);
}

:global(*) {
	color: currentColor;
	font-family: var(--sans);
	margin: 0;
	padding: 0;
}

:global(button) {
	background: transparent;
	border: none;
	cursor: pointer;
}

:global(button):not([data-variant]) {
	border-radius: 2em;
	border: 2px solid var(--ortforange);
	color: var(--ortforange);
	background-color: transparent;
	font-weight: bold;
	padding: 0.25rem 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

:global(button):not([data-variant]):hover {
	background-color: var(--ortforange-light);
}

:global(button[data-variant="inline"]) {
	border: 1px solid var(--black);
	padding: 2px 5px;
}

:global(h1) {
	text-align: center;
	font-size: 3em;
	font-weight: normal;
	margin: 2rem 0;
}

:root {
	--sans: "Manrope";
	--mono: "Victor Mono", monospace;
}

:global(body[data-theme="dark"] .icon) {
	filter: invert(1);
}

main {
	max-width: 1400px;
	margin: 0 auto;
	padding-top: calc(3.25rem + 2rem);
}

.error {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: lightcoral;
	color: darkred;
	max-width: 1000px;
	margin: 0 auto;
	padding: 2rem;
}
</style>
