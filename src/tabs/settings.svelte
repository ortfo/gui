<script lang="ts">
import { backend } from "../backend"

import { settings } from "../stores"

settings.subscribe(async settings => {
	await backend.settingsWrite(settings)
})
</script>

<h1>Settings</h1>

<dl>
	<dt>theme</dt>
	<dd>
		<select name="theme" id="theme" bind:value={$settings.theme}>
			<option value="light">light</option>
			<option value="dark">dark</option>
		</select>
	</dd>

	<dt>surname</dt>
	<dd><input type="text" bind:value={$settings.surname} /></dd>

	<dt>projects folder</dt>
	<dd><input type="text" bind:value={$settings.projectsfolder} /></dd>

	<dt>language</dt>
	<dd>
		<select name="language" id="language" bind:value={$settings.language}>
			<option value="fr">french</option>
			<option value="en">english</option>
		</select>
	</dd>

	<dt>show tips</dt>
	<dd>
		<input
			type="checkbox"
			name="show-tips"
			id="show-tips"
			bind:checked={$settings.showTips}
		/>
	</dd>
</dl>
