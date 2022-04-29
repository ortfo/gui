<script lang="ts">
import { i18n } from "../actions"
import { objectMapValues } from "../utils"
import { formatLanguage, Language, LANGUAGES_ALL } from "../languagecodes"
import { _, locale } from "svelte-i18n"
import { buildProgress, rebuildingDatabase, settings } from "../stores"
import FieldSelect from "../components/FieldSelect.svelte"
import FieldFilepath from "../components/FieldFilepath.svelte"
import { onMount } from "svelte"
import { backend } from "../backend"
import { createNotificationSpawner } from "../utils"
import AlternatingText from "../components/AlternatingText.svelte"
import FieldList from "../components/FieldList.svelte"
import { indexOf } from "lodash"
import { rebuildDatabase } from "../components/Navbar.svelte"
import CircularProgress from "../components/CircularProgress.svelte"

const notifications = createNotificationSpawner()

onMount(async () => {
	$settings.language = "en"
	try {
		if ((await backend.getUserLanguage()) === "fr") {
			$settings.language = "fr"
		}
	} catch (error) {
		notifications.error(
			$_("Could not get your language. Defaulting to english.")
		)
	}
	$settings.showtips = true
	$settings.theme = "dark"
})

async function finishOnboarding() {
	await backend.settingsWrite({ ...$settings, projectsfolder })
	await backend.clearThumbnails()
	step = "building"
	rebuildDatabase(true)
}

let steps = ["choose-locale", "main", "building"]
let step = steps[0]
let projectsfolder: string = ""
</script>

<section
	class="choose-locale"
	style:display={step === "choose-locale" ? "flex" : "none"}
>
	<h1>
		<AlternatingText
			strings={["Can you speak english?", "Parlez-vous français ?"]}
		/>
	</h1>
	<form on:submit|preventDefault={() => (step = "main")}>
		<div class="language-selector">
			<label
				for="language-en"
				data-selected={$settings.language === "en"}
			>
				English
				<input
					type="radio"
					name="language"
					id="language-en"
					value="en"
					bind:group={$settings.language}
				/>
			</label>
			<label
				for="language-fr"
				data-selected={$settings.language === "fr"}
			>
				Français
				<input
					type="radio"
					name="language"
					id="language-fr"
					value="fr"
					bind:group={$settings.language}
				/>
			</label>
		</div>
		<button type="submit">{$_("Let’s get started")}</button>
	</form>
</section>

<section class="main" style:display={step === "main" ? "flex" : "none"}>
	<h1 use:i18n>Hi there!</h1>
	<p use:i18n>
		We’ll set you up so that you can start building your portfolio. Don’t
		worry, it’ll be quick.
	</p>

	<section class="question">
		<FieldSelect
			key={$_("first, the most important question")}
			bind:value={$settings.theme}
			options={Object.fromEntries(
				["light", "dark"].map(theme => [theme, $_(`${theme} theme`)])
			)}
		/>
	</section>

	<section class="question">
		<FieldFilepath
			directory
			key={$_("then, where are your projects?")}
			help={$_(
				"this folder should contain a bunch of folders, one for each project"
			)}
			bind:value={projectsfolder}
		/>
	</section>

	<section class="question">
		<FieldList
			bind:value={$settings.portfoliolanguages}
			key={$_(
				"and finally, in what language(s) do you want to write your portfolio?"
			)}
			suggestions={objectMapValues(
				LANGUAGES_ALL,
				l => `${l.language} (${$_(l.country)})`
			)}
			disallowed={["default"]}
		/>
	</section>

	<button class="all-done" use:i18n on:click={finishOnboarding}
		>All done</button
	>
</section>

<section class="building" style:display={step === "building" ? "flex" : "none"}>
	<CircularProgress
		progress={$rebuildingDatabase ? $buildProgress.percent / 100 : 1}
	>
		{$_("Building, please wait…")}
	</CircularProgress>

	<p class="log">
		{#if $rebuildingDatabase}
			{$buildProgress.current.step}: {$buildProgress.current.file}
			{$buildProgress.current.resolution || $buildProgress.current.output}
		{/if}
	</p>
</section>

<style lang="scss">
section:not(.question) {
	height: 100vh;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.language-selector {
	display: flex;
	justify-content: center;
	gap: 2em;

	input {
		opacity: 0;
		width: 0;
	}

	label {
		height: 10rem;
		width: 10rem;
		background: var(--ortforange-light);
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.5em;
		border: 4px solid transparent;
		transition: background 0.25s ease, color 0.25s ease;

		&[data-selected="true"] {
			background: var(--ortforange);
			border-spacing: 2em;
			color: black;
		}
		&:hover,
		&:focus-within {
			border-color: var(--ortforange);
		}
	}
}

button[type="submit"] {
	margin-top: 2rem;
}

.question:first-of-type {
	margin-top: 6rem;
}

.question:not(:last-of-type) {
	margin-bottom: 3rem;
}

.question :global(.entry) {
	flex-direction: column;
	display: flex;
	justify-content: center;
	align-items: center;
}

.question :global(.entry .help) {
	display: block;
	margin: 0;
}

nav {
	margin: 2rem 0;
}

nav ul {
	display: flex;
	justify-content: center;
	gap: 2em;
	font-size: 2em;

	li {
		list-style: none;
	}
}

button.all-done {
	margin-top: 5rem;
}

section.building {
	:global(.progress) {
		height: 30rem;
		width: 30rem;
	}

	.log {
		position: absolute;
		bottom: 3rem;
		color: var(--gray)
	}
}

section.confirm {
	dl {
		margin-top: 3rem;
		text-align: left;
		justify-items: center;
	}
	dt {
		font-variation-settings: "wght" 700;
	}
	dd {
		margin-left: 2rem;
	}
	dd ul {
		li::before {
			content: "—";
			margin-right: 0.5em;
			font-variation-settings: "wght" 800;
		}
		li {
			list-style: none;
		}
	}
	.buttons {
		margin-top: 3rem;
		display: flex;
		gap: 1em;
		li {
			list-style: none;
		}
	}
}
</style>
