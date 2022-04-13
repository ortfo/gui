<script lang="ts">
import MetadataField from "./MetadataField.svelte"
import { _ } from "svelte-i18n"

export let value: string[]
export let key: string

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
</script>

<MetadataField {key}>
	<ul>
		{#each value as item, index}
			<li>
				<input
					value={item}
					on:change={change(index)}
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
				type="text"
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
