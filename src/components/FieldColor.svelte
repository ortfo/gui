<script lang="ts">
import MetadataField from "./MetadataField.svelte"

export let value: string
export let key: string
export let partOfObject: boolean = false

function reset(e) {
	e.preventDefault()
	value = ""
}
</script>

<MetadataField oneline {partOfObject} {key} on:contextmenu={reset}>
	<div
		class="swatch"
		class:unset={!value}
		style={value ? `background-color: #${value};` : ""}
	/>
	<input type="text" bind:value placeholder="unset" />
</MetadataField>

<style>
	.swatch {
		width:  1em;
		height: 1em;
		border-radius: 100%;
		display: inline-block;
		margin-left: 1em;
		margin-right: .5em;
	}
	.swatch.unset {
		background-color: var(--gray);
	}
</style>
