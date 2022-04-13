<script lang="ts">
import { first, second } from "../utils"
import type Fuse from "fuse.js"

export let indices: (readonly Fuse.RangeTuple[])[] = []
export let text: string = ""

const startsHighlight = (index: number) =>
	indices.flat(1).map(first).includes(index)

const endsHighlight = (index: number) =>
	indices.flat(1).map(second).includes(index)
</script>

{@html Array.from(text)
	.map((character, index) => {
		if (startsHighlight(index)) {
			return `<span class="highlight">${character}`
		} else if (endsHighlight(index)) {
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
