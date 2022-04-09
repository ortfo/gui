<script lang="ts">
import { entries } from "lodash"
import MarkdownEditor from "./MarkdownEditor.svelte"
import { tooltip } from "../actions"
import { createEventDispatcher } from "svelte"

const dispatch = createEventDispatcher()
type K = any
type V = any

export let placeholderKey: string = "name"
export let placeholderValue: string = "value"
export let value: { [key: string]: string }

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

function changeValue(key: string) {
	return e => {
		console.log("changing value", e)
		value = Object.fromEntries(
			Object.entries(value).map(([k, v]) => [k, k === key ? e.detail : v])
		)
		dispatch("input", value)
	}
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
	{#each buffer as [key, val], index}
		<div class="entry">
			<dt>
				<input value={key} on:change={changeKey(index)} />
			</dt>
			<dd>
				<MarkdownEditor
					value={val}
					active={focusedValueField === index}
					on:input={changeValue(key)}
					on:blur={() => (focusedValueField = null)}
					on:focus={() => (focusedValueField = index)}
				/>
			</dd>
			<button
				use:tooltip={"Remove this footnote"}
				class="remove"
				data-variant="none"
				on:click={remove(key)}>&times;</button
			>
		</div>
	{/each}
	<div class="entry new">
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
			<MarkdownEditor
				bind:value={newValue}
				placeholder={placeholderValue}
				active={focusedValueField === -1}
				on:focus={() => (focusedValueField = -1)}
				on:blur={() => (focusedValueField = null)}
				on:blur={add}
			/>
		</dd>
	</div>
</dl>

<style>
dl {
	display: flex;
	flex-direction: column;
	gap: 2em;
}
.entry {
	display: flex;
	gap: 2em;
	align-items: center;
}
input {
	border: none;
}
dt input {
	margin-top: 30px; /* XXX: height of markdown toolbar for value field */
	width: 2em;
	font-size: 1em;
}
button.remove {
	font-size: 2em;
	line-height: 0.7;
	opacity: 0;
	transition: all 0.25s ease;
}
.entry:hover button.remove {
	opacity: 1;
}
</style>
