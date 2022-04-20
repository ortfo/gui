<script lang="ts">
import { noSpaces } from "../utils"

import MetadataField from "./MetadataField.svelte"

export let value: string
export let options: { [value: string]: string }
export let key: string
export let help: string = ""
export let oneline: boolean = false
export let radio: boolean | null = null

function useRadioButtons() {
	return radio === null ? Object.keys(options).length <= 4 : radio
}
</script>

<MetadataField {key} {help} {oneline} nolabel={radio}>
	{#if useRadioButtons()}
		{#each Object.entries(options) as [val, display]}
			<label for="metadata-field-{noSpaces(key)}-{val}">
				<input
					id="metadata-field-{noSpaces(key)}-{val}"
					type="radio"
					bind:group={value}
					name={key}
					value={val}
				/>
				{display}
			</label>
		{/each}
	{:else}
		<select name={key} bind:value>
			{#each Object.entries(options) as [val, display]}
				<option value={val}>{display}</option>
			{/each}
		</select>
	{/if}
</MetadataField>

<style lang="scss">
label:not(:last-of-type) {
	margin-right: 1em;
}
label {
	display: flex;
	align-items: center;
}
$height: 1.2em;
input[type="radio"] {
	flex-grow: 0;
	margin-right: 0.25em;
	appearance: none;
	-webkit-appearance: none;
	width: $height;
	height: $height;
	border-radius: $height;
	transition: all 0.25s ease;
	border: 1px solid transparent;

	&:not(:checked) {
		background: transparent;
		border-color: var(--black);
	}

	&:checked {
		box-shadow: inset 0 0 0 $height var(--ortforange);
		border-color: var(--ortforange);
	}
}
</style>
