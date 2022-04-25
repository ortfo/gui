<script lang="ts">
import { onMount } from "svelte"
import { backend } from "../backend"
import { DEFAULT_SETTINGS, DEFAULT_UI_STATE, settings, state } from "../stores"
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import FieldList from "../components/FieldList.svelte"
import FieldText from "../components/FieldText.svelte"
import FieldSelect from "../components/FieldSelect.svelte"
import FieldToggle from "../components/FieldToggle.svelte"
import { LANGUAGES, LANGUAGES_ALL } from "../languagecodes"
import FieldFilepath from "../components/FieldFilepath.svelte"
import { rebuildDatabase } from "../components/Navbar.svelte"
import { createNotificationSpawner, objectMapValues } from "../utils"

const notifications = createNotificationSpawner()

settings.subscribe(async settings => {
	await backend.settingsWrite(settings)
})

onMount(() => {
	window.scrollTo({ top: $state.scrollPositions.settings })
})
</script>

<h1>{$_("Settings")}</h1>

<dl>
	<FieldSelect
		oneline
		key={$_("language")}
		bind:value={$settings.language}
		options={{ en: "english", fr: "français" }}
	/>
	<FieldSelect
		oneline
		key={$_("theme")}
		bind:value={$settings.theme}
		options={{ light: $_("light"), dark: $_("dark") }}
	/>

	<FieldText key={$_("surname")} bind:value={$settings.surname} />

	<FieldFilepath
		directory
		key={$_("projects folder")}
		bind:value={$settings.projectsfolder}
		on:change={() => {
			rebuildDatabase()
		}}
	/>

	<FieldList
		bind:value={$settings.portfoliolanguages}
		key={$_("portfolio languages")}
		help={$_("languages to translate your portfolio into")}
		suggestions={objectMapValues(
			LANGUAGES_ALL,
			l => `${l.language} (${$_(l.country)})`
		)}
		disallowed={["default"]}
	/>

	<FieldToggle bind:value={$settings.showTips} key={$_("show tips")} />
</dl>

<section class="actions">
	<button
		use:i18n
		data-variant="inline"
		on:click={() => {
			$state = DEFAULT_UI_STATE
		}}>reset UI state</button
	>
	<button
		use:i18n
		data-variant="inline"
		on:click={() => {
			$settings = DEFAULT_SETTINGS
		}}>reset settings</button
	>
	<button
		use:i18n
		data-variant="inline"
		on:click={async () => {
			await backend.clearThumbnails()
			rebuildDatabase(false)
		}}>re-create thumbnails</button
	>
	{#if $settings.powerUser}
		<button
			use:i18n
			data-variant="inline"
			on:click={async () => {
				$settings.powerUser = false
				await backend.settingsWrite($settings)
				notifications.add($_("you are no longer a power user."))
			}}>disable power user mode</button
		>
	{/if}
</section>

<style lang="scss">
dl {
	margin: 0 auto;
	width: clamp(100px, 800px, 100%);
}

section.actions {
	margin: auto auto 3em auto;
	width: clamp(100px, 800px, 100%);
	text-align: center;

	button:not(:first-child) {
		margin-left: 1em;
	}
}
</style>
