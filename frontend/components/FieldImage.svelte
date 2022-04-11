<script lang="ts">
import type { Base64WithFiletype } from "../backend"
import { encode as bufferBase64encode } from "base64-arraybuffer"
import { createEventDispatcher } from "svelte"
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"

const emit = createEventDispatcher()

export let value: { data: Base64WithFiletype; path: string }
let files = [] as unknown as FileList
export let key: string

async function getBase64d() {
	if (!files.length) {
		emit("change", "")
		return
	}

	value = {
		data:
			`data:${files[0].type};base64,` +
			bufferBase64encode(await files[0].arrayBuffer()),
		path: files[0].name,
	}
	emit("change", value)
	return value
}
</script>

<MetadataField {key} oneline>
	<input
		type="file"
		accept="image/*"
		name={key}
		id="input-{key}"
		bind:files
	/>
	{#if files.length || value?.data}
		<div class="preview">
			{#await getBase64d()}
				<p>{$_("Loading…")}</p>
			{:then}
				<img
					class="preview"
					src={value.data}
					alt={$_("chosen image for {key}", { values: { key } })}
				/>
				<button
					class="remove"
					on:click={() => {
						files = []
						document.getElementById(`input-${key}`).value = ""
						value = ""
						emit("change", "")
					}}>&times;</button
				>
			{:catch err}
				<p>{$_("An error occured: ")}{err}</p>
			{/await}
		</div>
	{/if}
</MetadataField>

<style>
img.preview {
	height: 2rem;
}
</style>
