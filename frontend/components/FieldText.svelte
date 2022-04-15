<script lang="ts">
import { onMount } from "svelte"

import MarkdownEditor from "./MarkdownEditor.svelte"
import MetadataField from "./MetadataField.svelte"

export let value: string
export let key: string
export let help: string = ""
export let rich: boolean = false
export let required: boolean = false
export let type: string = "text"
export let placeholder: string = ""
export let partOfObject: boolean = false

let active: boolean = false

let inputElement: HTMLElement
$: inputElement?.setAttribute("type", type)
</script>

<MetadataField {key} {help} {partOfObject} oneline={!rich} >
	{#if rich}
		<MarkdownEditor
			bind:value
			{placeholder}
			{active}
			on:blur={_ => (active = false)}
			on:focus={_ => (active = true)}
		/>
	{:else}
		<input
			bind:this={inputElement}
			type="text"
			{required}
			{placeholder}
			bind:value
		/>
	{/if}
</MetadataField>
