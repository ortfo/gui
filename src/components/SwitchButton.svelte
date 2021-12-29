<script lang="ts">
import { createEventDispatcher } from "svelte"

export let value: string
export let options: string[] | Record<string, string> // List of valid options or map of valid values to display values.
export let showCodes: boolean // Show non-display values on buttons

const _options = Array.isArray(options)
	? Object.fromEntries(options.map(v => [v, v]))
	: options

let numberOfOptions: number = Object.keys(_options).length
const dispatch = createEventDispatcher()
</script>

<form class="switch" style="width: {100 * numberOfOptions}">
	{#each Object.entries(_options) as [code, display]}
		<input
			type="radio"
			on:change={() => {
				value = code
				dispatch("change", code)
			}}
			name="switch-{code}"
			id="switch-{code}"
			checked={value === code}
		/>
		<label
			for="switch-{code}"
			style="width: {(1 / numberOfOptions) * 100}%"
		>
			<span class="label">{display}</span>
			{#if showCodes}
				<span class="code">{code}</span>
			{/if}
		</label>
	{/each}
</form>

<style>
form {
	display: inline-flex;
	gap: 0.25em;
	border: 2px solid var(--black);
	border-radius: 0.5em;
	padding: 0.125em;
	width: 200px;
}

input {
	display: none;
}

input:checked + label {
	background-color: var(--ortforange);
	color: var(--white);
}

input:checked + label .code {
	color: var(--ortforange-light);
}

label {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0.25em 0.75em;
	border-radius: 0.5em;
	transition: all 0.2s ease;
}

input:not(:checked) + label {
	cursor: pointer;
}

.code {
	/* font-family: var(--mono); */
	letter-spacing: 0.25ch;
	text-transform: uppercase;
	color: var(--gray);
	font-weight: bold;
	font-size: 0.75em;
}
</style>
