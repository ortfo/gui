<script lang="ts" context="module">
export function closeWork() {
	state.set({
		...get(state),
		openTab: "works",
		editingWorkID: "",
	})
}
</script>

<script lang="ts">
import { getContext } from "svelte"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"
import { backend } from "../backend"
import { state, workInEditor, workOnDisk } from "../stores"
import { saveWork } from "../tabs/editor.svelte"

const { close } = getContext("simple-modal")
</script>

<h2>{$_("Unsaved changes")}</h2>

<p>
	{$_(
		"This work has unsaved changes, which will be lost if you close the tab. Are you sure about this?"
	)}
</p>

<ul class="button-row">
	<li>
		<button
			on:click={_ => {
				closeWork()
				close()
			}}>{$_("close without saving")}</button
		>
	</li>
	<li><button on:click={_ => close()}>{$_("don't close")}</button></li>
	<li>
		<button
			on:click={async () => {
				await saveWork($workOnDisk?.id, $workInEditor)
				closeWork()
				await backend.saveUIState($state)
				close()
			}}>{$_("save then close")}</button
		>
	</li>
</ul>

<style>
.button-row {
	display: flex;
	justify-content: space-between;
	margin-top: 1em;
}
.button-row li {
	margin-right: 1em;
	list-style: none;
}
</style>
