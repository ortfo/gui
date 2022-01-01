<script lang="ts">
export let onClose
</script>

<button data-variant="inline" on:click={onClose}>
	<!-- <img src="assets/icon-close.svg" alt="×" class="icon"> -->
	×
</button>

<style>
button {
	font-size: 2rem;
	height: 1rem;
	margin: 0 0.5em;
	margin-left: auto;
	display: flex;
}
</style>
