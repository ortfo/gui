<script lang="ts">
import { tooltip } from "./../actions.ts"
import { colorPickersSelectedColors } from "./../stores.ts"
import { createEventDispatcher, getContext } from "svelte"
import { createModalSummoner } from "../modals"
import FieldColor from "./FieldColor.svelte"
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"
import type { Media, MediaEmbedDeclaration } from "../ortfo"
import ExtractColorsFromImage from "../modals/ExtractColorsFromImage.svelte"
import { uniqueId } from "lodash"

const emit = createEventDispatcher()
const summon = createModalSummoner()
const colorPickerHash = uniqueId("color-picker-")

export let images: { [path: string]: string } // {path (passed to localDatabase(...)) : description of image (alt text)}
export let selectedImage: string | null = null
export let value: {
	primary: string
	secondary: string
	tertiary: string
}

let hasImagesToExtractColorsFrom: boolean

function autoSelect(e) {
	summon(ExtractColorsFromImage, {
		images,
		selected: selectedImage,
		hash: colorPickerHash,
		originalColors: value,
	})
}

$: value = $colorPickersSelectedColors[colorPickerHash] || value
$: hasImagesToExtractColorsFrom =
	Object.keys(images).filter(url => !!url).length > 0

export let key: string
</script>

<MetadataField {key} colon>
	<button
		slot="next-to-label"
		data-variant="inline"
		on:click={autoSelect}
		disabled={!hasImagesToExtractColorsFrom}
		use:tooltip={hasImagesToExtractColorsFrom
			? ""
			: $_("This work has no media to extract colors from")}
		class="pick-from-image">{$_("extract from an image")}</button
	>
	<dl>
		<FieldColor compact key="primary" bind:value={value.primary} />
		<FieldColor compact key="secondary" bind:value={value.secondary} />
		<FieldColor compact key="tertiary" bind:value={value.tertiary} />
	</dl>
</MetadataField>

<style>
.pick-from-image {
	display: inline-block;
	margin-left: 1em;
}

dl {
	margin-left: 2em;
	display: flex;
	gap: 1.3em;
}
</style>
