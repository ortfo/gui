<script lang="ts" context="module">
export function startPolling(reloadWhenDone: boolean = true) {
	let poller = setIntervalAsync(async () => {
		let progress = (await backend.getBuildProgress()) as BuildProgress
		buildProgress.set(progress)
		if (progress.percent === 100) {
			clearIntervalAsync(poller)
			// Leave time for the progress bar to fade out
			setTimeout(() => {
				buildProgress.set({
					percent: 0,
					current: {},
					total: 0,
					processed: 0,
				} as BuildProgress)
				if (reloadWhenDone) {
					setTimeout(() => {
						window.location.reload()
					}, 500)
				}
			}, 500)
		}
	}, 150)
}

export function rebuildDatabase(reloadWhenDone: boolean = true) {
	startPolling(reloadWhenDone)
	backend.rebuildDatabase()
}
</script>

<script lang="ts">
import { tooltip } from "../actions"
import {
	settings,
	state,
	hasUnsavedChanges,
	buildProgress,
	rebuildingDatabase,
	unsavedChanges,
} from "../stores"
import type { PageName } from "../stores"
import { createModalSummoner } from "../modals"
import { backend, BuildProgress } from "../backend"
import {
	setIntervalAsync,
	clearIntervalAsync,
} from "set-interval-async/dynamic"
import { _ } from "svelte-i18n"
import UnsavedChanges from "../modals/UnsavedChanges.svelte"
import { create } from "lodash"
import { getContext } from "svelte"

const summon = createModalSummoner(getContext("simple-modal"))

let rebuildErrored = false
let rebuildError = ""

let tabs: PageName[] = ["tags", "technologies", "sites", "settings"]
</script>

<nav>
	<img src={`assets/${$settings.theme}-logo.svg`} alt="ortfo's logo" />
	{#if rebuildErrored}
		{rebuildError}
	{:else}
		<a
			class={$state.openTab === "works" ? "current" : ""}
			href="#works"
			on:click={() => {
				$state.openTab = "works"
			}}
		>
			{$_("works")}
		</a>
		{#if $state.editingWorkID}
			<span class="separator">/</span>
			<a
				on:click={() => {
					$state.openTab = "editor"
				}}
				href="#editor"
				class:current={$state.openTab === "editor"}
				>{$state.editingWorkID}</a
			>
			<span
				class="close-current-work"
				class:unsaved-changes={$hasUnsavedChanges}
				on:click={() => {
					if ($hasUnsavedChanges) {
						summon(UnsavedChanges)
					} else {
						$state.openTab = "works"
						$state.editingWorkID = ""
					}
				}}
			/>
		{/if}
		{#each tabs as tab}
			<a
				class={$state.openTab === tab ? "current" : ""}
				href={`#${tab}`}
				on:click={() => {
					$state.openTab = tab
				}}
			>
				{$_(tab)}
			</a>
		{/each}
	{/if}
	<button on:click={_ => rebuildDatabase()}>
		{#if $rebuildingDatabase}
			{$_("rebuilding…")}
		{:else}
			{$_("rebuild")}
		{/if}
	</button>
	<button on:click={() => summon("publish")}>{$_("publish!")}</button>
	<button
		use:tooltip={$_("Quit ortfo")}
		class="quit"
		data-variant="a"
		on:click={() => {
			backend.saveUIState($state)
			backend.quit()
		}}>×</button
	>
	<div
		class="progress-bar"
		class:errored={rebuildErrored}
		class:active={$rebuildingDatabase}
		style={`width: ${
			rebuildErrored || !$rebuildingDatabase
				? 100
				: $buildProgress.percent
		}%`}
	/>
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
	z-index: 100;
	/* position: relative; */
}

.progress-bar {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	background-color: var(--ortforange);
	/* background-color: red; */
	z-index: -10;
	transition: width 0.25s ease, opacity 0.5s ease;
	opacity: 0;
}

.progress-bar.active {
	opacity: 1;
}

.progress-bar.errored {
	background-color: rgb(255, 89, 89);
}

.separator {
	margin: 0 -1em;
	font-size: 1.5em;
	color: var(--gray);
}
.close-current-work {
	display: inline-block;
	margin-left: -0.9rem;
	width: 1.2rem;
	cursor: pointer;
}
.close-current-work::after,
.close-current-work.unsaved-changes:hover::after {
	content: "×";
	font-size: 2em;
}
.close-current-work.unsaved-changes::after {
	content: "●";
	font-size: 1.2em;
}
.close-current-work:not(.unsaved-changes) {
	opacity: 0;
}
.close-current-work:hover {
	opacity: 1;
}
.close-current-work.unsaved-changes:not(:hover) {
	color: var(--ortforange);
}
.separator,
.unsaved-changes {
	padding-bottom: 1px; /* nav: border-bottom-width */
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

nav a[href="#editor"] {
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	min-width: 0; /* prevent navbar overflow */
}

nav a.current {
	font-variation-settings: "wght" 700;
	border-bottom-color: var(--ortforange);
}
button:first-of-type {
	margin-left: auto;
}

.quit {
	font-size: 2rem;
}
</style>
