<script lang="ts">
import MetadataField from "./MetadataField.svelte"
import { toHex } from "../colornames.ts"
import { createEventDispatcher } from "svelte"
import { _ } from "svelte-i18n"
import { noSpaces } from "../utils"
const dispatch = createEventDispatcher()

export let value: string
export let key: string
export let partOfObject: boolean = false

let hexCode: string
$: hexCode = toHex(value)

function reset(e) {
	e.preventDefault()
	value = ""
}
</script>

<MetadataField oneline {partOfObject} {key}>
	<div
		class="swatch"
		class:unset={!value}
		style={value
			? `background-color: #${hexCode};border-color: #${hexCode};`
			: ""}
		on:dblclick={reset}
	/>
	<input
		id="metadata-field-{noSpaces(key)}"
		type="text"
		value={hexCode}
		on:input={e => dispatch("input", (value = e.target.value))}
		placeholder={$_("unset")}
	/>
</MetadataField>

<style>
.swatch {
	width: 1em;
	height: 1em;
	border-radius: 100%;
	display: inline-block;
	margin-left: 1em;
	margin-right: 0.5em;
	border: 0.2em solid;
}
.swatch.unset {
	border-color: var(--gray);
	position: relative;
}
.swatch.unset::after {
	content: "";
	position: absolute;
	top: 50%;
	transform: translateY(-50%) rotate(-45deg);
	width: 100%;
	height: 0.2em;
	background: var(--gray);
}
input {
	border: none;
	font-size: 1em;
}
</style>
