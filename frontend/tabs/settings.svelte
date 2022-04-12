<script lang="ts">
import { onMount } from "svelte"
import { backend } from "../backend"
import { settings, state } from "../stores"
import { _ } from "svelte-i18n"

settings.subscribe(async settings => {
	await backend.settingsWrite(settings)
})

onMount(() => {
	window.scrollTo({ top: $state.scrollPositions.settings })
})
</script>

<h1>{$_("Settings")}</h1>

<dl>
	<dt>{$_("theme")}</dt>
	<dd>
		<select name="theme" id="theme" bind:value={$settings.theme}>
			<option value="light">{$_("light")}</option>
			<option value="dark">{$_("dark")}</option>
		</select>
	</dd>

	<dt>{$_("surname")}</dt>
	<dd><input type="text" bind:value={$settings.surname} /></dd>

	<dt>{$_("projects folder")}</dt>
	<dd><input type="text" bind:value={$settings.projectsfolder} /></dd>

	<dt>{$_("language")}</dt>
	<dd>
		<select name="language" id="language" bind:value={$settings.language}>
			<option value="fr">{$_("french")}</option>
			<option value="en">{$_("english")}</option>
		</select>
	</dd>

	<dt>{$_("show tips")}</dt>
	<dd>
		<input
			type="checkbox"
			name="show-tips"
			id="show-tips"
			bind:checked={$settings.showTips}
		/>
	</dd>
</dl>
