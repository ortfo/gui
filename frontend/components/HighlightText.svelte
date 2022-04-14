<script lang="ts">
import { first, second } from "../utils"
import type Fuse from "fuse.js"

export let indices: readonly Fuse.RangeTuple[] | undefined = []
export let text: string = ""

const startsHighlight = (index: number, indices) =>
	(indices || []).map(first).includes(index)
const endsHighlight = (index: number, indices) =>
	(indices || []).map(second).includes(index)
</script>

{@html Array.from(text)
	.map((character, index) => {
		if (startsHighlight(index, indices)) {
			return `<span class="highlight">${character}`
		} else if (endsHighlight(index, indices)) {
			return `${character}</span>`
		} else {
			return character
		}
	})
	.join("")}

<style>
:global(span.highlight) {
	font-variation-settings: "wght" 800;
}
</style>
