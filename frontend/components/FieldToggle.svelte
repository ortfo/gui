<script lang="ts">
import MetadataField from "./MetadataField.svelte"
import { noSpaces } from "../utils"
import { createEventDispatcher } from "svelte"

export let value: boolean
export let key: string
export let help: string = ""
export let tooltip: string = ""
export let helptip: string = ""
export let oneline: boolean = true
export let partOfObject: boolean = false

const emit = createEventDispatcher()
</script>

<MetadataField {key} {help} {oneline} {partOfObject} {tooltip} {helptip}>
	<input
		id="metadata-field-{noSpaces(key)}"
		type="checkbox"
		name={key}
		bind:checked={value}
		on:change={e => emit("change", e.target.checked)}
	/>
</MetadataField>

<style lang="scss">
$height: 1.5em;
$pad: 0.25em;

input[type="checkbox"] {
	border: 0;
	appearance: none;
	-webkit-appearance: none;
	border-radius: $height;
	width: $height * 2;
	height: $height;
	$height: 1.5em;
	position: relative;
	border: 1px solid transparent;
	transition: all 0.25s ease;
	cursor: pointer;

	&:not(:checked) {
		border-color: var(--black);
	}

	&:checked {
		background: var(--ortforange);
	}
}

input[type="checkbox"] {
	&::after {
		content: "";
		position: absolute;
		left: 0;
		height: $height - 2 * $pad;
		width: $height - 2 * $pad;
		background-color: var(--black);
		border-radius: $height;
		top: 50%;
		transform: translateY(-50%) translateX($pad);
		transition: all 0.25s ease;
	}

	&:checked::after {
		background-color: var(--white);
		transform: translateY(-50%) translateX($pad + $height);
	}
}
</style>
