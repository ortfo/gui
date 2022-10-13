<script lang="ts">
import { _ } from "svelte-i18n"
import { i18n } from "../actions"
import { backend } from "../backend"
import { settings } from "../stores"
import { createNotificationSpawner } from "../utils"
import ExternalLink from "../components/ExternalLink.svelte"

const commitLink = `https://github.com/ortfo/gui/commit/${__commitHash__}`
const notifications = createNotificationSpawner()
</script>

<h1>
	<img src="/assets/{$settings.theme}-logo.svg" alt={$_("ortfo’s logo")} />
</h1>

<p class="version">{__version__}</p>

<dl>
	<dt use:i18n>created by</dt>
	<dd>
		<ExternalLink href="https://ewen.works"
			>ewen le bihan (ewen-lbh)</ExternalLink
		>
	</dd>
	<dt use:i18n>made with</dt>
	<dd>
		<ExternalLink href="https://svelte.dev">Svelte</ExternalLink>,
		<ExternalLink href="https://github.com/webview/webview"
			>webview</ExternalLink
		>
	</dd>
	<dt use:i18n>code available on github</dt>
	<dd>
		<ExternalLink href="https://github.com/ortfo/gui"
			>ortfo/gui</ExternalLink
		>
	</dd>
	<dt use:i18n>licensed under</dt>
	<dd>
		<ExternalLink href="https://opensource.org/licenses/GPL-3.0"
			>GNU Public License, version 3</ExternalLink
		>
	</dd>
</dl>

<p class="commit">
	<code class="commit-hash"
		>built from
		{#if $settings.poweruser}
			<ExternalLink
				href={commitLink}
				><span>{__commitHash__}</span></ExternalLink
			>
		{:else}
			<span
				on:click={async () => {
					$settings.poweruser = true
					await backend.settingsWrite($settings)
					notifications.add($_(`you are now a power user!`))
				}}>{__commitHash__}</span
			>
		{/if}
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
:global(a) {
	text-underline-position: under;
	text-underline-offset: -0.125em;
	text-decoration-thickness: 0.08em;
	transition: text-decoration-thickness 0.25s ease,
		text-decoration-offset 0.25s ease;
}
:global(a):hover,
:global(a):focus {
	text-decoration-color: var(--ortforange);
	text-decoration-thickness: 0.2em;
	text-underline-offset: calc(-0.125em - (0.2em - 0.08em) / 2);
}
</style>
