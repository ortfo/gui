<script lang="ts">
import { createEventDispatcher } from "svelte"
import { _ } from "svelte-i18n"
import { tooltip } from "../actions"
import MarkdownEditor from "./MarkdownEditor.svelte"

const dispatch = createEventDispatcher<{ input: Record<string, string> }>()
type K = any
type V = any

export let placeholderKey: string = $_("name")
export let placeholderValue: string = $_("value")
export let removeTooltip: string = $_("Remove this one")
export let value: { [key: string]: string }
export let richText: boolean = false

let buffer: [string, string][] = Object.entries(value)
$: buffer = Object.entries(value)

let newValue: string = ""
let newKey: string = ""
let readyToAdd: boolean = false
$: readyToAdd = newValue !== "" && newKey !== ""

let focusedValueField: number | null = null // -1 means the "new" field

function remove(key: string) {
	return () => {
		value = Object.fromEntries(
			Object.entries(value).filter(([k]) => k !== key)
		)
		dispatch("input", value)
	}
}

function add(e) {
	if (!readyToAdd) return
	value = { ...value, [newKey]: newValue }
	newKey = newValue = ""
	dispatch("input", value)
}

function changeValue(key: string, to: string) {
	value = Object.fromEntries(
		Object.entries(value).map(([k, v]) => [k, k === key ? to : v])
	)
	dispatch("input", value)
}

function changeKey(index: number) {
	return e => {
		if (e.target.value === "") return
		value = Object.fromEntries(
			buffer.map(([k, v], i) =>
				i === index ? [e.target.value, v] : [k, v]
			)
		)
		dispatch("input", value)
	}
}
</script>

<dl>
	{#each buffer as [key, val], index (key)}
		<div
			class="entry"
			class:richText
			class:active={focusedValueField === index}
		>
			<dt>
				<input value={key} on:change={changeKey(index)} />
			</dt>
			<dd>
				{#if richText}
					<MarkdownEditor
						value={val}
						active={focusedValueField === index}
						on:input={e => changeValue(key, e.detail)}
						on:blur={() => (focusedValueField = null)}
						on:focus={() => (focusedValueField = index)}
					/>
				{:else}
					<textarea
						value={val}
						on:input={e => changeValue(key, e.target.value)}
						on:blur={() => (focusedValueField = null)}
						on:focus={() => (focusedValueField = index)}
					/>
				{/if}
			</dd>
			<button
				use:tooltip={removeTooltip}
				class="remove"
				data-variant="none"
				on:click={remove(key)}>&times;</button
			>
		</div>
	{/each}
	<div
		class="entry new"
		class:richText
		class:active={focusedValueField === -1}
	>
		<dt>
			<input
				placeholder={placeholderKey}
				type="text"
				bind:value={newKey}
				on:blur={add}
				on:keypress={e => e.code === "Enter" && add(e)}
			/>
		</dt>
		<dd>
			{#if richText}
				<MarkdownEditor
					bind:value={newValue}
					placeholder={placeholderValue}
					active={focusedValueField === -1}
					on:blur={() => (focusedValueField = null)}
					on:focus={() => (focusedValueField = -1)}
				/>
			{:else}
				<textarea
					placeholder={placeholderValue}
					bind:value={newValue}
					on:blur={() => (focusedValueField = null)}
					on:focus={() => (focusedValueField = -1)}
				/>
			{/if}
		</dd>
	</div>
</dl>

<style>
dl {
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	width: 100%;
}
.entry {
	display: grid;
	width: 100%;
	gap: 2em;
	align-items: flex-start;
	grid-template-columns: 2fr 8fr 1fr;
}
input,
textarea {
	font-size: 1em;
	width: 100%;
	min-height: 1em;
}
button.remove {
	font-size: 2em;
	line-height: 0.7;
	opacity: 0;
	transition: all 0.25s ease;
	align-self: center;
}
.entry:hover button.remove,
.entry:focus button.remove,
.entry.active button.remove {
	opacity: 1;
}
</style>
