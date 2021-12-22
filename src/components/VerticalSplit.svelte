<script lang="ts">
export let right: number = 0.5
</script>

<div class="split" style="grid-template-columns: {Math.floor(1 / right)}fr 1fr">
	<slot />
</div>

<style>
.split {
	display: grid;
}
</style>
