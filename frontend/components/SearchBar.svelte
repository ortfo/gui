<script lang="ts">
import { createEventDispatcher, onMount } from "svelte"

import { _ } from "svelte-i18n"
import hotkeys from "../tinykeysInputDisabled"

const dispatch = createEventDispatcher()

export let query: string = ""
export let htmlElement: HTMLInputElement

onMount(() => {
})
</script>

<div class="search-bar">
	<img src="/assets/icon-search.svg" alt="⌕" class="icon" />
	<input
		bind:this={htmlElement}
		type="text"
		bind:value={query}
		placeholder={$_("Search")}
		on:keyup={e => {
			switch (e.key) {
				case "Escape":
					htmlElement.blur()
					break
				case "Enter":
					console.log("dispatching")
					dispatch("enter", e)
					break
			}
		}}
	/>
	{#if query !== ""}
		<button class="clear" data-variant="none" on:click={_ => (query = "")}
			>×</button
		>
	{/if}
</div>

<style>
.search-bar {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
}
.icon {
	width: 3em;
	height: 3em;
	margin-right: 0.5em;
}
button.clear {
	position: absolute;
	font-size: 2em;
	right: 0.25em;
}
</style>
