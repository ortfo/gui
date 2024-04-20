<script lang="ts">
import { TinyColor } from "@ctrl/tinycolor"
import { _ } from "svelte-i18n"
import { tooltip } from "../actions"
import { noSpaces } from "../utils"
import MetadataField from "./MetadataField.svelte"

export let initial: string
export let value: string
export let key: string
export let partOfObject: boolean = false
export let compact: boolean = false

function reset(e) {
	e.preventDefault()
	value = initial
}

$: {
	if (value.startsWith("rgba(")) {
		value = new TinyColor(value).setAlpha(1).toHexString() as `#${string}`
	}
	if (!value.startsWith("#") && value !== "") {
		value = new TinyColor(value).toHexString() as `#${string}`
	}
}
</script>

<MetadataField oneline={!compact} {partOfObject} {key} {compact}>
	<div
		use:tooltip={[
			value !== initial ? $_("Right-click to reset") : null,
			value ? $_("Ctrl+click to clear") : null,
		]
			.filter(Boolean)
			.join("; ")}
		style:background-color={value}
		role="button"
		tabindex="0"
		on:contextmenu={reset}
		class:unset={!value}
		on:click={event => {
			if (
				event instanceof MouseEvent &&
				(event.ctrlKey || event.metaKey)
			) {
				event.preventDefault()
				event.stopPropagation()
				value = ""
			}
		}}
		class="swatch"
	>
		<input id="metadata-field-{noSpaces(key)}" type="color" bind:value />
	</div>
	<span class="hex">{value || $_("unspecified")}</span>
</MetadataField>

<style lang="scss">
input {
	opacity: 0;
	cursor: pointer;
}
.swatch {
	display: block;
	height: 2em;
	position: relative;
	width: 2em;
	box-sizing: border-box;
	border-radius: 100%;

	&.unset {
		background: transparent;
		border: 0.25em solid var(--gray);
	}
	&.unset::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-45deg);
		width: 175%;
		height: 0.25em;
		background: var(--gray);
	}
}

.hex {
	font-size: 0.8em;
	font-family: var(--mono);
	color: var(--gray);
	width: 6em;
	text-align: center;
	display: inline-block;
	text-wrap: nowrap;
	margin-top: 0.2em;
}
</style>
