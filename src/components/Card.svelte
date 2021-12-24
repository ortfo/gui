<script lang="ts">
import { createEventDispatcher } from "svelte"

export let creates: boolean = false
export let clickable: boolean = creates
export let hasIcon: boolean = false
const emit = createEventDispatcher()
</script>

<div
	class="card"
	class:creates
	class:clickable
	class:has-icon={hasIcon}
	on:click={() => {
		if (clickable) emit("click")
	}}
>
	<slot />
</div>

<style>
.card {
	border: 0.175em solid var(--gray-light);
	border-radius: 0.7rem;
	/* padding: 1.125rem; */
	height: 20rem;
	width: 15rem;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: 0 1rem 3rem transparent;
}

.card.creates {
	border: 1px solid var(--ortforange);
	background-color: var(--ortforange-light);
	justify-content: center;
	align-items: center;
	color: var(--ortforange);
}

.card.has-icon {
	font-size: 7em;
}

.card.clickable {
	cursor: pointer;
	transition: all 0.25s;
}
.card.clickable:not(.creates):hover {
	background-color: var(--ortforange-light);
	transform: translateY(-1rem);
	box-shadow: 0 1rem 3rem var(--gray-light);
}
.card.clickable:not(.creates):active {
	background-color: var(--ortforange-light);
	box-shadow: 0 1rem 3rem transparent;
	transform: translateY(0);
}

.card.clickable.creates.has-icon:hover {
	background-color: var(--ortforange);
	color: var(--white);
	font-size: 5em;
}
.card.clickable.creates.has-icon:active {
	background-color: var(--ortforange-light);
	color: var(--black);
	font-size: 5em;
}
</style>
