<script lang="ts">
import { _ } from "svelte-i18n"

export let onClose
</script>

<button data-variant="none" on:click={onClose} title={$_("close")}>
	<!-- <img src="assets/icon-close.svg" alt="×" class="icon"> -->
	×
</button>

<style>
button {
	font-size: 2rem;
	height: 1.5rem;
	line-height: 1.2;
	margin: 0 0.5em;
	margin-left: auto;
	display: flex;
}
button:hover, button:focus {
	color: var(--ortforange);
	font-variation-settings: "wght" 800;
}
</style>
