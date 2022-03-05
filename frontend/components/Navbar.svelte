<script lang="ts">
import { tooltip } from "../actions"
import { settings, state, hasUnsavedChanges } from "../stores"
import type { PageName } from "../stores"
import { summon } from "../modals"
import { backend } from "../backend"

async function rebuildDatabase() {
	$state.rebuildingDatabase = true
	await backend.rebuildDatabase()
	$state.rebuildingDatabase = false
	window.location.reload()
}
let tabs: PageName[] = ["tags", "technologies", "sites", "settings"]
</script>

<nav>
	<img src={`assets/${$settings.theme}-logo.svg`} alt="ortfo's logo" />
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
		on:click={() => backend.quit()}>×</button
	>
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
