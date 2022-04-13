<script lang="ts">
import { _ } from "svelte-i18n"

export let query: string = ""
</script>

<div class="search-bar">
	<img src="/assets/icon-search.svg" alt="⌕" class="icon" />
	<input type="text" bind:value={query} placeholder={$_("Search")} />
</div>

<style>
.search-bar {
	display: flex;
	justify-content: center;
	align-items: center;
}
.icon {
	width: 3em;
	height: 3em;
	margin-right: 0.5em;
}
</style>
