<script lang="ts">
	export let creates: boolean = false
</script>

<div class="card" class:creates={creates}>
	<slot></slot>
</div>

<style>
	.card {
		border: 1px solid var(--grey);
		padding: 1.125rem;
	}

	.card.creates {
		border: 1px solid var(--ortforange);
		background-color: var(--ortforange-light);
	}
</style>
