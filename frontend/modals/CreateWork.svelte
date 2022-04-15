<script lang="ts">
import { backend, DirEntry } from "../backend"
import { scrollStates } from "../actions"
import type { Work } from "../ortfo"
import { logExpr, unslug } from "../utils"
import UnsavedChanges from "../modals/UnsavedChanges.svelte"
import { getContext } from "svelte"
import Fuse from "fuse.js"
import { createModalSummoner } from "../modals"
import {
	database,
	databaseLanguages,
	hasUnsavedChanges,
	settings,
	state,
	volatileWorks,
} from "../stores"
import { _ } from "svelte-i18n"
import SearchBar from "../components/SearchBar.svelte"
import HighlightText from "../components/HighlightText.svelte"
const summon = createModalSummoner(getContext("simple-modal"))

// TODO use <SearchableList>

export let open: boolean = false

let searcher: Fuse<DirEntry>
let query: string = ""

$: console.log(searcher)

async function getUndescribedWorks() {
	let dirs = await backend.listDirectory($settings.projectsfolder)

	let inDatabase = dir =>
		$database.works.find(w => w.id === dir.name) !== undefined
	let isVolatile = dir => $volatileWorks.includes(dir.name)

	let undescribed = dirs.filter(
		dir =>
			(!inDatabase(dir) || isVolatile(dir)) &&
			dir.isdir &&
			!dir.name.startsWith(".")
	)

	searcher = new Fuse(undescribed, {
		includeScore: true,
		includeMatches: true,
		keys: ["name"],
	})

	return undescribed
}

async function createWork(dir: DirEntry) {
	const translated = data =>
		Object.fromEntries(Array.from($databaseLanguages).map(l => [l, data]))
	$database.works = [
		...$database.works,
		{
			footnotes: translated({}),
			id: dir.name,
			links: translated([]),
			media: translated([]),
			title: translated(unslug(dir.name)),
			paragraphs: translated([]),
			metadata: {
				thumbnails: {},
				layout: [],
			},
		},
	]
	$volatileWorks = [...$volatileWorks, dir.name]
}

function search(dirs: DirEntry[], query: string): Fuse.FuseResult<DirEntry>[] {
	if (query === "") {
		return dirs.map((d, i) => ({
			item: d,
			score: 1,
			matches: [],
			refIndex: i,
		}))
	}
	return logExpr(searcher.search(query))
}
</script>

<div class="sheet" class:open>
	<h1>{$_("Let’s describe a work")}</h1>
	{#await getUndescribedWorks()}
		{$_("Loading…")}
	{:then dirs}
		<p class="intro">
			{$_(
				"Here are the works in your projects folder that don’t have a description yet"
			)}
		</p>
		<SearchBar bind:query />
		<ul use:scrollStates={{ bottom: 50, top: 0 }}>
			{#each search(dirs, query) as result (result.refIndex)}
				<li>
					<button
						on:click={e => {
							open = false
							createWork(result.item)
							if ($hasUnsavedChanges) {
								summon(UnsavedChanges)
							}
							$state.editingWorkID = result.item.name
							$state.scrollPositions.editor = 0
							$state.openTab = "editor"
						}}
						data-variant="none"
						><HighlightText
							text={result.item.name}
							indices={result.matches.find(m => m.key === "name")?.indices}
						/></button
					>
				</li>
			{:else}
				<li class="troubleshoot">
					<div class="emoji">:/</div>
					<h3 class="no-results">{$_("No results")}</h3>
					<h3>{$_("Can’t find what you want?")}</h3>
					<p>
						{$_("Try changing your projects folder in")}
						<button
							data-variant="link"
							on:click={_ => ($state.openTab = "settings")}
							>{$_("settings")}</button
						>
					</p>
				</li>
			{/each}
		</ul>
	{:catch error}
		<!-- getU was rejected -->
	{/await}
	<button on:click={_ => (open = false)}>{$_("Cancel")}</button>
</div>

<style>
.sheet {
	position: fixed;
	top: 53px; /* XXX: navbar's height */
	z-index: 100;
	background: var(--white);
	left: 0;
	right: 0;
	bottom: 0;
	transition: all 0.25s ease;
	opacity: 1;
	overflow-y: scroll;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2em 0;
}
.sheet:not(.open) {
	top: 100vh;
	bottom: -100vh;
	opacity: 0;
	pointer-events: none;
}
.intro {
	margin-bottom: 2em;
}
ul {
	margin: 0.5em 0 2em;
	display: flex;
	flex-direction: column;
	gap: 1.5em;
	overflow-y: scroll;
	overflow-x: visible;
	text-align: left;
	width: 40em;
	position: relative;
	flex-grow: 1;
	transition: all 0.25s ease;
}

ul:not([data-scrolled="bottom"]) {
	-webkit-mask-image: -webkit-gradient(
		linear,
		left bottom,
		left 75%,
		from(rgba(0, 0, 0, 0)),
		to(rgba(0, 0, 0, 1))
	);
}

li:not(.troubleshoot) {
	display: flex;
	align-items: center;
	overflow-x: visible;
}

li.troubleshoot {
	text-align: center;
}

li.troubleshoot .emoji {
	font-size: 3em;
	margin-top: 1em;
	font-family: var(--mono);
	font-weight: bold;
	color: var(--gray);
}

li.troubleshoot .no-results {
	font-size: 2em;
	margin-bottom: 1em;
}

li:not(.troubleshoot) button {
	font-size: 1em;
	padding: 1em 2em;
	width: 100%;
	height: 100%;
	text-align: left;
	transition: all 0.25s ease;
	border-radius: 0.5em;
	background: var(--gray-light);
	transform: scale(0.95);
}

li:not(.troubleshoot) button:hover,
li:not(.troubleshoot) button:focus {
	background: var(--ortforange);
	transform: scale(1);
}

li:not(.troubleshoot) button:active {
	background: var(--ortforange);
	transform: scale(0.9);
}

h1 {
	margin-bottom: 0;
}

.troubleshoot {
	font-size: 0.85em;
	margin-bottom: 3em;
}
</style>
