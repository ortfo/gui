<script lang="ts">
import { createEventDispatcher } from "svelte"
import { summon } from "../modals"
import FieldColor from "./FieldColor.svelte"
import MetadataField from "./MetadataField.svelte"

const emit = createEventDispatcher()

export let value: {
	primary: string
	secondary: string
	tertiary: string
}

function autoSelect(e) {
	summon("pick-image")
}

export let key: string
</script>

<MetadataField {key} colon>
	<dl>
		<FieldColor partOfObject key="primary" bind:value={value.primary} />
		<FieldColor partOfObject key="secondary" bind:value={value.secondary} />
		<FieldColor partOfObject key="tertiary" bind:value={value.tertiary} />
	</dl>
	<button data-variant="inline" on:click={autoSelect}>auto-select</button>
</MetadataField>
