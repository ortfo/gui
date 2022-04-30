<script lang="ts">
import { TinyColor } from "@ctrl/tinycolor"
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"
import { noSpaces } from "../utils"

export let value: `#${string}` | ""
export let key: string
export let partOfObject: boolean = false
export let compact: boolean = false

function reset(e) {
	e.preventDefault()
	value = ""
}

$: {
	if (value.startsWith("rgba(")) {
		value = new TinyColor(value).setAlpha(1).toHexString() as `#${string}`
	}
	if (!value.startsWith("#") && value !== "") {
		value = `#${value}`
	}
}
</script>

<MetadataField oneline={!compact} {partOfObject} {key} {compact}>
	<input
		id="metadata-field-{noSpaces(key)}"
		type="color"
		bind:value
		class:unset={!value}
		on:contextmenu={reset}
	/>
	<span class="hex">{value || $_("unspecified")}</span>
</MetadataField>

<style lang="scss">
input {
	border: none;
	font-size: 1em;
	appearance: none;
	-webkit-appearance: none;
	border: none !important;
	padding: 0;
	height: 2em;
	width: 2em;
	position: relative;
	cursor: pointer;

	&.unset::-webkit-color-swatch {
		background: transparent !important;
		border: 0.25em solid var(--gray);
	}
	&.unset::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-45deg);
		width: 75%;
		height: 0.25em;
		background: var(--gray);
	}
	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}
	&::-webkit-color-swatch {
		border: none;
		border-radius: 100%;
	}
}

.hex {
	font-size: 0.8em;
	font-family: var(--mono);
	color: var(--gray);
	width: 6em;
	text-align: center;
}
</style>
