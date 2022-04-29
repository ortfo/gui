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
	<button
		slot="next-to-label"
		data-variant="inline"
		on:click={autoSelect}
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
	gap: 1.2em;
}
</style>
