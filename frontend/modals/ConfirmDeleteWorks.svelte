<script lang="ts" context="module">
export async function deleteWorks(notifications, workIDs: WorkID[]) {
	database.set({
		...get(database),
		works: get(database).works.filter(w => !workIDs.includes(w.id)),
	})
	try {
		await backend.deleteWorks(workIDs)
	} catch (error) {
		notifications.error(error)
	}
}
</script>

<script lang="ts">
import { i18n } from "../actions"
import { _ } from "svelte-i18n"
import { database, settings, WorkID } from "../stores"
import { get } from "svelte/store"
import { backend } from "../backend"
import { getContext } from "svelte"
import { createNotificationSpawner } from "../utils"

const { close } = getContext("simple-modal")
const notifications = createNotificationSpawner()

export let workIDs: WorkID[]
</script>

<h2 use:i18n>Are you sure?</h2>

<p>
	{@html $_("deleting_works_warning", {
		values: {
			ids: new Intl.ListFormat($settings.language, {
				type: "conjunction",
			}).format(workIDs.map(id => `<em>${id}</em>`)),
		},
	})}
</p>

<section class="removed-files">
	<p use:i18n>The following files will be removed:</p>

	<ul>
		{#each workIDs as id}
			<li>
				<code>{$settings.projectsfolder}/{id}/.portfoliodb/</code>
				{#await backend.listDirectory(`${$settings.projectsfolder}/${id}/.portfoliodb`)}
					<p use:i18n>Loading…</p>
				{:then files}
					<ul class="files">
						{#each files as file}
							<li><code>{file.name}</code></li>
						{/each}
					</ul>
				{:catch error}
					<p>Error: {error}</p>
				{/await}
			</li>
		{/each}
	</ul>
</section>

<ul class="buttons">
	<li>
		<button on:click={async () => await deleteWorks(notifications, workIDs)}
			>{$_("delete_works", {
				values: {
					count: workIDs.length,
				},
			})}</button
		>
	</li>
	<li><button use:i18n on:click={() => close()}>cancel</button></li>
</ul>

<style>
section.removed-files {
	margin-top: 2em;
}

ul:not(.buttons) {
	display: flex;
	flex-direction: column;
	padding-left: 2em;
}

.buttons {
	display: flex;
	justify-content: center;
	margin-top: 2em;
	width: 100%;
}

.buttons li {
	margin-right: 1em;
	list-style: none;
}
</style>
