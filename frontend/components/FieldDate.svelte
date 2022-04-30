<script lang="ts">
import { noSpaces } from "../utils"
import { _ } from "svelte-i18n"
import MetadataField from "./MetadataField.svelte"

export let value: string
export let key: string
export let help: string = ""
export let oneline: boolean = true
export let partOfObject = false
</script>

<MetadataField {key} {help} {oneline} {partOfObject}>
	<input
		class:unset={!value}
		type="date"
		placeholder={$_("unspecified")}
		name={key}
		id="metadata-field-{noSpaces(key)}"
		bind:value
	/>
</MetadataField>

<style lang="scss">
input::-webkit-datetime-edit {
	// XXX for some reason, the date fields are not vertically-centered. This bug may be platform-dependent.
	padding-top: 4px;
}

input.unset {
	position: relative;
	&::-webkit-datetime-edit {
		opacity: 0;
	}
	&::after {
		content: attr(placeholder);
		color: var(--gray);
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		text-align: center;
	}
}
</style>
