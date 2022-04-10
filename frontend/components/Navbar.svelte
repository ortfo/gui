<script lang="ts">
import { tooltip } from "../actions"
import { settings, state, hasUnsavedChanges, buildProgress } from "../stores"
import type { PageName } from "../stores"
import { summon } from "../modals"
import { backend } from "../backend"

let rebuildErrored = false
let rebuildError = ""

async function rebuildDatabase() {
	$state.rebuildingDatabase = true
	try {
		await Promise.all([
			backend.rebuildDatabase(),
			async () => {
				setInterval(async () => {
					let progress = await backend.getBuildProgress()
					$buildProgress = progress.percent
				}, 50)
			},
		])
		// window.location.reload()
	} catch (error) {
		rebuildErrored = true
		rebuildError = error
		console.error(error)
	} finally {
		setTimeout(() => {
			rebuildErrored = false
		}, 1500)
		$state.rebuildingDatabase = false
	}
}
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
		works
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
		{#if $hasUnsavedChanges}
			<span
				class="unsaved-changes"
				use:tooltip={"You have unsaved changes"}>&bull;</span
			>
		{/if}
	{/if}
	{#each tabs as tab}
		<a
			class={$state.openTab === tab ? "current" : ""}
			href={`#${tab}`}
			on:click={() => {
				$state.openTab = tab
			}}
		>
			{tab}
		</a>
	{/each}
	{/if}
	<button on:click={rebuildDatabase}>
		{#if $state.rebuildingDatabase}
			rebuilding&hellip;
		{:else}
			rebuild
		{/if}
	</button>
	<button on:click={() => summon("publish")}>publish!</button>
	<button
		use:tooltip={"Quit ortfo"}
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
		style={`width: ${rebuildErrored ? 100 : $buildProgress}%`}
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
	position: relative;
}

.progress-bar {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	background-color: var(--ortforange-light);
	z-index: -10;
	transition: width 0.25s ease;
}

.progress-bar.errored {
	background-color: rgb(255, 89, 89);
}

.separator {
	margin: 0 -1em;
	font-size: 1.5em;
	color: var(--gray);
}
.unsaved-changes {
	margin-left: -0.7em;
	font-size: 2.5em;
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
