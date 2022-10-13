<script lang="ts">
import { ExtractedColors } from "./../ortfo.ts"
import { helptip } from "./../actions.ts"
import { getContext } from "svelte"

import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import { backend, localDatabase } from "../backend"
import FieldColors from "../components/FieldColors.svelte"
import { objectMapValues } from "../utils"
import { uniqueId } from "lodash"
import { colorPickersSelectedColors } from "../stores"
import type { ExtractedColors } from "../ortfo"

export let hash = uniqueId("color-picker-")
export let originalColors: ExtractedColors
export let images: { [url: string]: string }
export let selected: string | null = null
export let extracted: ExtractedColors = { ...originalColors }

$: $colorPickersSelectedColors[hash] = extracted
$: if (selected) extract(selected)

async function extract(selected) {
	backend.extractColors(selected).then(colors => {
		extracted = objectMapValues(colors, c => `#${c}`)
	})
}

const { close } = getContext("simple-modal")
</script>

<h1 use:i18n>Choose an image</h1>

<ul class="images">
	{#each Object.entries(images) as [src, alt]}
		<li>
			<button
				on:click={() => (selected = src)}
				data-variant="none"
				class:selected={selected === src}
				><img src={localDatabase(src)} {alt} /></button
			>
		</li>
	{/each}
</ul>

<ul class="swatches">
	{#each ["primary", "secondary", "tertiary"] as name}
		<li>
			<div
				class="swatch"
				class:unset={!extracted[name]}
				use:helptip={extracted[name]
					? ""
					: $_("Select an image to extract its colors")}
				style:--fill={extracted[name]}
			/>
			<span class="label">{$_(name)}</span>
		</li>
	{/each}
</ul>

<ul class="buttons">
	<li><button on:click={close}>{$_("use these colors")}</button></li>
	<li>
		<button
			on:click={() => {
				extracted = { ...originalColors }
				close()
			}}>{$_("cancel")}</button
		>
	</li>
</ul>

<style>
.images {
	display: flex;
	flex-wrap: wrap;
	gap: 2em;
	justify-content: center;
}

.images button {
	border: 0.25em solid transparent;
}

.images img {
	object-fit: cover;
}

.images button.selected {
	border-color: var(--ortforange);
}

.swatches {
	margin-top: 3em;
	display: flex;
	gap: 2em;
	justify-content: center;
}

.swatches li {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.swatch {
	height: 2em;
	width: 2em;
	border-radius: 100%;
	background-color: var(--fill);
	position: relative;
	border: 2px solid transparent;
}

.swatch.unset {
	border-color: var(--gray);
}
.swatch.unset::after {
	content: "?";
	position: absolute;
	font-size: 2em;
	color: var(--ortforange);
	left: 50%;
	bottom: 50%;
	transform: translate(-50%, 50%);
}

li {
	list-style: none;
}

img {
	height: 10em;
}

.buttons {
	display: flex;
	gap: 1em;
	justify-content: center;
	margin: 2em 0 1em 0;
}
</style>
