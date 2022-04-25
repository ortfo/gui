<script lang="ts">
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import { backend } from "../backend"
import { settings } from "../stores"
import { createNotificationSpawner } from "../utils"

const notifications = createNotificationSpawner()
</script>

<h1>
	<img src="/assets/{$settings.theme}-logo.svg" alt={$_("ortfo’s logo")} />
</h1>

<p class="version">{__version__}</p>

<dl>
	<dt use:i18n>created by</dt>
	<dd><a href="https://ewen.works">ewen le bihan (ewen-lbh)</a></dd>
	<dt use:i18n>made with</dt>
	<dd>
		<a href="https://svelte.dev">Svelte</a>,
		<a href="https://github.com/webview/webview">webview</a>
	</dd>
	<dt use:i18n>code available on github</dt>
	<dd><a href="https://github.com/ortfo/gui">ortfo/gui</a></dd>
	<dt use:i18n>licensed under</dt>
	<dd>
		<a href="https://opensource.org/licenses/GPL-3.0"
			>GNU Public License, version 3</a
		>
	</dd>
</dl>

<p class="commit">
	<code class="commit-hash"
		>built from <code
			on:click={async () => {
				$settings.powerUser = true
				await backend.settingsWrite($settings)
				notifications.add($_(`you are now a power user!`))
			}}>{__commitHash__}</code
		>
		at {__buildDate__}</code
	>
</p>

<style>
h1,
p {
	text-align: center;
}
.version {
	margin-top: -3em;
	margin-bottom: 5em;
}
dl {
	width: fit-content;
	margin: 0 auto;
	margin-bottom: 4em;
}
dd {
	padding-left: 2em;
}
dt {
	font-variation-settings: "wght" 800;
}
dt:not(:first-of-type) {
	margin-top: 1em;
}
.commit {
	font-size: 0.75em;
}
</style>
