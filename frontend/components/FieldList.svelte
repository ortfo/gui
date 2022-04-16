<script lang="ts">
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"
import { noSpaces } from "../utils"

export let value: string[]
export let help: string = ""
export let key: string
export let suggestions: { [value: string]: string } | null = null
export let disallowed: string[] = []

const disallowedPattern = disallowed =>
	disallowed.length > 0 ? `^(?!.*\\b(${disallowed.join("|")}\\b).*$` : null

$: if (value === undefined) {
	value = []
}

function remove(index: number) {
	return () => {
		value = value.filter((_, i) => i !== index)
	}
}

function add(e) {
	if (e.target.value === "") return
	value = [...value, e.target.value]
	e.target.value = ""
}

function change(index: number) {
	return e => {
		value = value.map((v, i) => (i === index ? e.target.value : v))
	}
}

function applySuggestion(event) {
	if (suggestions === null) {
		return
	}
	const suggestionsDisplayedToValue = Object.fromEntries(
		Object.entries(suggestions).map(([val, display]) => [
			`${val}: ${display}`,
			val,
		])
	)
	if (Object.keys(suggestionsDisplayedToValue).includes(event.target.value)) {
		event.target.value = suggestionsDisplayedToValue[event.target.value]
	}
}
</script>

<MetadataField {key} {help}>
	{#if suggestions !== null}
		<datalist id="metadata-field-{noSpaces(key)}-datalist">
			{#each Object.entries(suggestions) as [val, display]}
				<option value={`${val}: ${display}`} />
			{/each}
		</datalist>
	{/if}
	<ul>
		{#each value as item, index}
			<li>
				<input
					value={item}
					id="metadata-field-{noSpaces(key)}-{index}"
					list="metadata-field-{noSpaces(key)}-datalist"
					pattern={disallowedPattern(disallowed)}
					on:change={e => {
						applySuggestion(e)
						change(index)(e)
					}}
					on:blur={item === "" ? remove(index) : null}
					on:keypress={e =>
						e.code === "Enter" &&
						e.target.parentElement.nextElementSibling.focus()}
				/>
				<button
					class="remove"
					data-variant="none"
					on:click={remove(index)}
				>
					&times;</button
				>
			</li>
		{/each}
		<li class="new">
			<input
				placeholder={$_(
					value.length ? "another one?" : "add something"
				)}
				id="metadata-field-{noSpaces(key)}-new"
				type="text"
				list="metadata-field-{noSpaces(key)}-datalist"
				pattern={disallowedPattern(disallowed)}
				on:change={applySuggestion}
				on:blur={add}
				on:keypress={e => e.code === "Enter" && add(e)}
			/>
		</li>
	</ul>
</MetadataField>

<style>
li > button {
	opacity: 0;
}

li:hover > button,
li input:focus + button,
li button:hover,
li button:focus {
	opacity: 1;
}

ul {
	list-style: none;
	margin: 0;
}

li {
	display: flex;
	align-items: center;
}

li > input {
	border: none;
}

li.new > input::placeholder {
	color: var(--ortforange);
}

li::before,
li > input,
li > button.remove {
	height: 1.5rem;
}

li::before {
	content: "–";
	font-variation-settings: "wght" 700;
	font-size: 2em;
	color: var(--gray);
	margin-right: 0.25em;
	line-height: 0.7;
}

li > button.remove {
	font-size: 2em;
	line-height: 0.7;
}
</style>
