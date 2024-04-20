<script lang="ts">
import { onMount } from "svelte"
import { _, addMessages, init as i18nInit, locale } from "svelte-i18n"
import Notifications from "svelte-notifications"
import Modal from "svelte-simple-modal"
// @ts-expect-error language server too dumb to understand that i can import yaml
import messagesEnglish from "../i18n/en.yaml"
// @ts-expect-error same
import messagesFrench from "../i18n/fr.yaml"
import { i18n } from "./actions"
import { backend } from "./backend"
import FieldFilepath from "./components/FieldFilepath.svelte"
import ModalButtonClose from "./components/ModalButtonClose.svelte"
import Navbar, { rebuildDatabase } from "./components/Navbar.svelte"
import { createModalSummoner } from "./modals"
import Onboarding from "./screens/Onboarding.svelte"
import {
	buildProgress,
	database,
	debugFlyoutContent,
	onboardingNeeded,
	settings,
	state,
	workInEditor,
	workOnDisk,
} from "./stores"
import Editor, { closeWork } from "./tabs/editor.svelte"
import Externalsites from "./tabs/externalsites.svelte"
import Settings from "./tabs/settings.svelte"
import Tags from "./tabs/tags.svelte"
import Technologies from "./tabs/technologies.svelte"
import Works from "./tabs/works.svelte"
import hotkeys from "./tinykeysInputDisabled"
import { createNotificationSpawner } from "./utils"
import { vimkeys } from "./vimkeys"

const notifications = createNotificationSpawner()
const summon = createModalSummoner()

function loadLocales() {
	addMessages("fr", messagesFrench)
	addMessages("en", messagesEnglish)
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
	if ($onboardingNeeded) return
	await loadDatabase()
}

$: if ($state.editingWorkID) {
	if (!$workInEditor)
		$workInEditor = structuredClone($database[$state.editingWorkID])
	if (!$workOnDisk)
		$workOnDisk = structuredClone($database[$state.editingWorkID])
}

onMount(() => {
	hotkeys(window, {
		"$mod+r": () => {
			backend.saveUIState($state)
			window.location.reload()
		},
		"$mod+b": () => {
			rebuildDatabase("", true)
		},
		"$mod+w": () => {
			closeWork(summon)
		},
		...vimkeys(60),
		"ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A":
			async () => {
				$settings.poweruser = true
				await backend.settingsWrite($settings)
				notifications.add($_(`you are now a power user!`))
			},
	})

	window.addEventListener("scroll", () => {
		$state.scrollPositions[$state.openTab] = window.scrollY
	})
})

$: applyTheme($settings.theme)
</script>

<svelte:head>
	{#if import.meta.env.DEV }
		<title>ortfodb [dev]</title>
	{/if}
</svelte:head>

<Notifications>
	{#await load()}
		<h1>Sit tight, loading your stuff…</h1>
	{:then _}
		{#if $onboardingNeeded}
			<Onboarding />
		{:else}
			<Modal closeButton={ModalButtonClose}>
				<Navbar />
				<pre class="debug-flyout">{JSON.stringify(
						$debugFlyoutContent,
						null,
						2,
					)}</pre>
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
		{/if}
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
					directory
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
</Notifications>

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

:global(
		*:not(input):not(select):not(textarea):not(.ProseMirror):focus-visible
	) {
	outline: 1px solid var(--ortforange);
}

:global(.notifications) {
	position: fixed;
	z-index: 1000;
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

:global(button):not([data-variant]):disabled {
	color: var(--gray);
	cursor: not-allowed;
}

:global(button[data-variant="inline"]) {
	border: 1px solid var(--black);
	padding: 2px 5px;
	transition: all 0.25s ease;
}

:global(
		button[data-variant="inline"]:not(:disabled):hover,
		button[data-variant="inline"]:not(:disabled):focus
	) {
	background-color: var(--ortforange);
	color: black;
}

:global(button[data-variant="inline"]):not(:disabled):active {
	background-color: var(--black);
	color: var(--white);
}

:global(button[data-variant="inline"]):disabled {
	border-color: var(--gray);
	color: var(--gray);
	cursor: not-allowed;
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
:global(
		input:focus,
		textarea:focus,
		select:focus-visible,
		._markdown-editor:focus-within
	) {
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
	padding-bottom: 4em;
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

.debug-flyout {
	position: fixed;
	z-index: 100;
	bottom: 10px;
	left: 10px;
	background: #000;
	color: #ffffff;
	max-height: 75vh;
	max-width: 50vw;
	overflow: scroll;
}
</style>
