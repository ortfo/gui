<script lang="ts">
import { metadataReadableNames } from "../ortfo"
import { noSpaces } from "../utils"
import { _ } from "svelte-i18n"

export let key: string
export let help: string = ""
export let colon: boolean = false
export let partOfObject: boolean = false
export let oneline: boolean = false
export let nolabel: boolean = false
</script>

<div class="entry" class:oneline class:part-of-object={partOfObject}>
	<dt class:colon>
		<svelte:element
			this={nolabel ? "div" : "label"}
			for="metadata-field-{noSpaces(key)}"
		>
			{$_(metadataReadableNames[key] || key)}
			{#if help}
				<span class="help">{help}</span>
			{/if}
		</svelte:element>
	</dt>
	<dd><slot /></dd>
</div>

<style>
.oneline {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 1em;
}
dt,
dd {
	display: flex;
	flex-direction: row;
	align-items: center;
}
dt {
	font-variation-settings: "wght" 700;
}
dt .help {
	color: var(--gray);
	font-variation-settings: "wght" 700;
	margin-left: 1ch;
}
dt .help::before {
	content: "(";
}
dt .help::after {
	content: ")";
}
dt.colon::after {
	content: ": ";
}
.part-of-object > dt::before {
	content: "└";
	font-variation-settings: "wght" 700;
	font-size: 2em;
	color: var(--gray);
	margin-right: 0.25em;
	line-height: 0.7;
}
.entry {
	margin-bottom: 0.5em;
}
.entry.part-of-object {
	margin-bottom: 0.25em;
}
</style>
