<script lang="ts">
import { diff, Operation } from "just-diff"
import JSONTree from "svelte-json-tree"

export let a: object
export let aLabel: string = "a"
export let b: object
export let bLabel: string = "b"

function access(obj: object, path: (string | number)[]): any {
	return path.reduce((o, i) => o[i], obj)
}
function pathHTML(path: (string | number)[]): string {
	return path.join("<b> > </b>")
}
</script>

<table>
	<tr>
		<th>at</th>
		<th>{aLabel}</th>
		<th />
		<th>{bLabel}</th>
	</tr>
	{#each diff(a, b) as difference}
		<tr>
			<td>{@html pathHTML(difference.path)}</td>
			{#if difference.op === "add"}
				<td><strong>+</strong></td>
				<td />
				<td><JSONTree value={difference.value} /></td>
			{:else if difference.op === "replace"}
				<td><JSONTree value={access(a, difference.path)} /></td>
				<td><strong>→</strong></td>
				<td><JSONTree value={access(b, difference.path)} /></td>
			{:else if difference.op === "remove"}
				<td><JSONTree value={access(a, difference.path)} /></td>
				<td />
				<td><strong>×</strong></td>
			{/if}
		</tr>
	{/each}
</table>
