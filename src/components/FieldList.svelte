<script lang="ts">
import { metadataReadableNames } from "../ortfo"
import MetadataField from "./MetadataField.svelte"

export let value: string[]
export let key: string
</script>

<MetadataField {key}>
	<ul>
		{#each value as item, index (index)}
			<li>
				<input
					value={item}
					on:change={e => {
						value[index] = e.target.value
					}}
				/>
				<button data-variant="none" on:click={() => delete value[index]}
					>&times;</button
				>
			</li>
		{/each}
		<li class="new">
			<input
				placeholder="another one?"
				type="text"
				on:blur={e => {
					console.log({ before: value })
					value.push(e.target.value)
					console.log({ after: value })
					e.target.value = ""
				}}
			/>
		</li>
	</ul>
</MetadataField>
