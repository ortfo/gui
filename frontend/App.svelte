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
import tinykeys from "tinykeys"
import { addMessages, init as i18nInit, locale } from "svelte-i18n"
import { _ } from "svelte-i18n"
import { i18n } from "./actions"
import messagesFrench from "../i18n/fr.yaml"
import Technologies from "./tabs/technologies.svelte"
import Externalsites from "./tabs/externalsites.svelte"
import FieldText from "./components/FieldText.svelte"
import FieldFilepath from "./components/FieldFilepath.svelte";

function loadLocales() {
	addMessages("fr", messagesFrench)
	i18nInit({
		fallbackLocale: "en",
		initialLocale: $settings.language,
	})
}

$: $locale = $settings.language

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
	loadLocales()
	await loadDatabase()
}

onMount(() => {
	tinykeys(window, {
		"$mod+r": () => {
			backend.saveUIState($state)
			window.location.reload()
		},
	})

	window.addEventListener("scroll", () => {
		$state.scrollPositions[$state.openTab] = window.scrollY
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
				<Technologies />
			{:else if $state.openTab == "sites"}
				<Externalsites />
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
		<h1 use:i18n>Woops!</h1>
		<p use:i18n>Couldn't load your stuff:</p>
		<ol>
			{#each e.toString().split(": ") as reason}
				<li>{reason}</li>
			{/each}
		</ol>
		<h2 use:i18n>Try changing these settings</h2>
		<dl>
			<FieldFilepath
				key={$_("projects folder")}
				bind:value={$settings.projectsfolder}
			/>
		</dl>
		<button
			on:click={_ => {
				backend.settingsWrite($settings)
				window.location.reload()
			}}
			use:i18n>Reload</button
		>
	</div>
{/await}

<style>
:global(body) {
	background-color: var(--white);
	transition: background-color 1s ease;
}
:global(body, input, select) {
	font-family: var(--sans);
	color: var(--black);
	margin: 0;
}

:global(code, pre, code em, pre em) {
	font-family: var(--mono);
}

:global(*) {
	color: currentColor;
	font-family: var(--sans);
	margin: 0;
	padding: 0;
	font-variation-settings: "wght" 400;
}

:global(*:not(input):not(select):not(textarea):not(.ProseMirror):focus-visible) {
	outline: 1px solid var(--ortforange);
}

:global(button) {
	background: transparent;
	border: none;
	cursor: pointer;
}

:global(button:not([data-variant])) {
	border-radius: 2em;
	border: 2px solid var(--black);
	color: var(--black);
	background-color: transparent;
	font-variation-settings: "wght" 800;
	padding: 0.25rem 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

:global(button):not([data-variant]):hover,
:global(button):not([data-variant]):focus {
	background-color: var(--ortforange);
	color: black;
}

:global(button[data-variant="inline"]) {
	border: 1px solid var(--black);
	padding: 2px 5px;
	transition: all 0.25s ease;
}

:global(button[data-variant="inline"]):active {
	background-color: var(--black);
	color: var(--white);
}

:global(button[data-variant="link"]) {
	font-size: 1em;
	position: relative;
}
:global(button[data-variant="link"])::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: var(--ortforange);
	transition: all 0.125s ease;
}
:global(button[data-variant="link"]):hover,
:global(button[data-variant="link"]):focus {
	color: var(--ortforange);
}
:global(button[data-variant="link"]):not(:hover):not(:focus)::after {
	transform: scaleX(0.75);
}

:global(button[data-variant="none"]) {
	font-size: 1em;
}

:global(h1) {
	text-align: center;
	font-size: 3em;
	font-variation-settings: "wght" 400;
	margin: 2rem 0;
}

:global(input:not([type="file"]), textarea, ._markdown-editor) {
	border: 1px solid var(--black);
	border-radius: 0.5em;
	padding: 0.25rem 0.5rem;
	font-size: 1em;
	transition: all 0.2s ease;
}

:global(input:hover, textarea:hover, select:hover, ._markdown-editor:hover) {
	border-radius: 0;
}
:global(input:focus, textarea:focus, select:focus-visible, ._markdown-editor:focus-within) {
	border-radius: 0;
	border-color: var(--ortforange);
}

:root {
	--sans: "Manrope";
	--mono: "Victor Mono", monospace;
}

:global(body[data-theme="dark"] .icon) {
	filter: invert(1);
}

:global(.window[aria-modal="true"]) {
	background-color: var(--white);
	color: var(--black);
}

:global(body) {
	display: flex;
	flex-direction: column;
}

main {
	max-width: 1400px;
	margin: 0 auto;
	padding-top: calc(3.25rem + 2rem);
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	width: 100%;
}

.error {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: rgb(167, 4, 4);
	--black: white;
	--white: black;
	color: var(--black);
	padding: 2rem;
	min-height: 100vh;
}

.error h2 {
	margin-top: 5em;
}
</style>
