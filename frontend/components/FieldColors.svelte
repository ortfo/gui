<script lang="ts">
import { createEventDispatcher, getContext } from "svelte"
import { createModalSummoner } from "../modals"
import FieldColor from "./FieldColor.svelte"
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"

const emit = createEventDispatcher()
const summon = createModalSummoner()

export let value: {
	primary: string
	secondary: string
	tertiary: string
}

function autoSelect(e) {
	// summon(PickImage)
}

export let key: string
</script>

<MetadataField {key} colon>
	<dl>
		<FieldColor partOfObject key="primary" bind:value={value.primary} />
		<FieldColor partOfObject key="secondary" bind:value={value.secondary} />
		<FieldColor partOfObject key="tertiary" bind:value={value.tertiary} />
	</dl>
	<button data-variant="inline" on:click={autoSelect}
		>{$_("pick from image")}</button
	>
</MetadataField>
