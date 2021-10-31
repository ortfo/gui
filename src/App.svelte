<script lang="ts">
import Card from "./components/Card.svelte";
import ContentGrid from "./components/ContentGrid.svelte";
import Navbar from "./components/Navbar.svelte";
type PageName = "works" | "tags" | "technologies" | "sites" | "settings"

import {
    settings
} from "./stores";
import {
    backend
} from "./backend"
import Works from "./tabs/works.svelte";
import Tags from "./tabs/tags.svelte";
import Editor from "./tabs/editor.svelte";
import Settings from "./tabs/settings.svelte";

async function loadSettings() {
    await backend.initializeConfigurationDirectory()
    $settings = await backend.settingsRead()
    console.info(`Loaded settings from backend: ${JSON.stringify($settings)}`)
    // if (!$settings.surname) {
    //     $settings.surname = prompt("What is your surname?", "")
    // }
    // if (!$settings.projectsFolder) {
    //     $settings.projectsFolder = prompt("Where are your projects stored?", "")
    // }
    await backend.settingsWrite($settings)
}

if ($settings.theme == "dark") {
    document.querySelector(":root").style.setProperty("--black", "#FFF");
    document.querySelector(":root").style.setProperty("--white", "#000");
    document.querySelector(":root").style.setProperty("--gray", "#222");
    document.querySelector(":root").style.setProperty("--ortforange-light", "#2e1902");
}

let currentPage: PageName = "works"
</script>

{#await loadSettings()}
<h1>Sit tight, loading your settings&dots;</h1>
{:then _}
<Navbar bind:currentPage />
<main>
	{#if currentPage == "works"}
	<Works />
	{:else if currentPage == "tags"}
	<Tags/>
	{:else if currentPage == "technologies"}
	TODO
	{:else if currentPage == "sites"}
	TODO
	{:else if currentPage == "settings"}
	<Settings/>
	{:else if currentPage == "editor"}
	<Editor/>
	{/if}
</main>
{:catch e}
<div class="error">
    <h1>Woops!</h1>
    <p>Couldn't load your settings:</p>
    <ol>
        {#each e.toString().split(": ") as reason}
        <li>{reason}</li>
        {/each}
    </ol>
</div>
{/await}

<style>
:global(body) {
    font-family: var(--sans);
    background-color: var(--white);
    margin: 0;
}

:global(code, pre) {
    font-family: var(--mono);
}

:global(*) {
    color: currentColor;
    font-family: var(--sans);
    margin: 0;
    padding: 0;
}

:global(button) {
    background: transparent;
    border: none;
    cursor: pointer;
}

:global(button):not([data-looks-like]) {
    border-radius: 2em;
    border: 2px solid var(--ortforange);
    color: var(--ortforange);
    background-color: transparent;
    font-weight: bold;
    padding: 0.25rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

:global(button):not([data-looks-like]):hover {
    background-color: var(--ortforange-light);
}

:global(h1) {
    text-align: center;
    font-size: 3em;
    font-weight: normal;
    margin: 2rem 0;
}

:root {
    --sans: "Manrope";
    --mono: "Victor Mono", monospace;
}

body[data-theme="light"] {
    --ortforange: #e57c08;
    /* dark mode: --ortforange-light: #2e1902 */
    --ortforange-light: #fae5ce;
    --black: #000;
    --white: #fff;
    --gray: #ccc;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 2.25rem;
}

.error {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: lightcoral;
    color: darkred;
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}
</style>
