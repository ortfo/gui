<script lang="ts">
import MetadataField from "./MetadataField.svelte"
import { backend, PickFileConstraint } from "../backend"
import { createNotificationSpawner, except, noSpaces } from "../utils"
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import { createEventDispatcher } from "svelte"
const dispatch = createEventDispatcher()
const notifications = createNotificationSpawner()

export let value: string
export let key: string
export let directory: boolean = false
export let accept: PickFileConstraint["accept"] = "*"
export let relativeTo: string = ""
export let startIn: string = relativeTo
export let oneline: boolean = true
export let help: string = ""
export let placeholder: string = ""
export let required: boolean = false

function parentDirectory(path: string): string {
	return path.replaceAll("\\", "/").split("/").slice(0, -1).join("/")
}
</script>

<MetadataField {key} {help} {oneline}>
	<div class="input-wrap">
		<input
			type="text"
			id="metadata-field-{noSpaces(key)}"
			bind:value
			on:change={e => dispatch("change", e)}
			{required}
			{placeholder}
		/>
		<button
			data-variant="inline"
			use:i18n
			on:click={async event => {
				try {
					value = await backend.pickFile({
						title: $_(
							`Pick a {key} ${directory ? "directory" : "file"}`,
							{
								values: { key },
							}
						),
						startIn: value
							? directory
								? value
								: parentDirectory(value)
							: startIn || "~",
						relativeTo,
						accept: directory ? "directory" : accept,
					})
				} catch (e) {
					if (e.toString() === "Cancelled") {
						event.target.blur()
						return
					}
					notifications.error(e)
				}
			}}>pick</button
		>
	</div>
</MetadataField>

<style>
.input-wrap {
	display: flex;
	gap: 0.5em;
}

.input-wrap input {
	border-start-end-radius: 0;
	border-end-end-radius: 0;
}
.input-wrap button {
	border-radius: 0.5em;
	border-end-start-radius: 0;
	border-start-start-radius: 0;
}
</style>
