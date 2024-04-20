<script lang="ts">
import { createEventDispatcher } from "svelte"
import { settings } from "../stores"

export let creates: boolean = false
export let clickable: boolean = creates
export let selectable: boolean = false
export let selected: boolean = false
export let hasIcon: boolean = false
const emit = createEventDispatcher()
</script>

<article
	class="card"
	class:creates
	class:clickable
	class:selectable
	class:selected
	class:has-icon={hasIcon}
	on:click={(e) => {
		if (clickable) emit("click", e)
	}}
>
	{#if selectable}
		<input
			class="select"
			type="checkbox"
			name="select"
			data-theme={$settings.theme}
			bind:checked={selected}
			on:click|stopPropagation={() => {}}
		/>
	{/if}
	<slot />
</article>

<style lang="scss">
.card {
	border: 0.175em solid var(--gray-light);
	border-radius: 0.7rem;
	/* padding: 1.125rem; */
	height: 20rem;
	width: 15rem;
	display: flex;
	flex-direction: column;
	box-shadow: 0 1rem 3rem transparent;
	position: relative;
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
	transition:
		all 0.25s ease,
		background-color 0.5s ease;
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

@mixin absolute-center-padding($size) {
	top: $size;
	left: $size;
	bottom: $size;
	right: $size;
}

.card .select {
	position: absolute;
	top: -1em;
	right: -1em;
	width: 2em;
	height: 2em;
	z-index: 20;
	appearance: none;
	-webkit-appearance: none;
	border-radius: 100%;
	background: var(--black);
	cursor: pointer;

	&::after {
		content: "";
		position: absolute;
		@include absolute-center-padding(0.4em);
		background: url("/assets/icon-confirm-thick.svg") no-repeat
			center/contain;
		z-index: 11;
	}
	&[data-theme="light"]::after {
		filter: invert(100%);
	}
}

.card:not(:hover):not(:focus) .select {
	opacity: 0;
}

.card.selected {
	border-color: var(--black);
	.select::after {
		opacity: 0.75;
	}
}
</style>
