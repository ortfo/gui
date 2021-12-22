<script>
import Grid from "svelte-grid"
import gridHelp from "svelte-grid/build/helper"
import Card from "./Card.svelte"
const id = () => "_" + Math.random().toString(36).substr(2, 9)
const randomHexColorCode = () => {
	let n = (Math.random() * 0xfffff * 1000000).toString(16)
	return "#" + n.slice(0, 6)
}
function generateLayout(col) {
	return new Array(10).fill(null).map(function (item, i) {
		const y = Math.ceil(Math.random() * 4) + 1
		return {
			[col]: gridHelp.item({
				x: (i * 2) % col,
				y: Math.floor(i / 6) * y,
				w: 1,
				h: y,
			}),
			id: id(),
			data: {
				start: randomHexColorCode(),
				end: randomHexColorCode(),
			},
		}
	})
}
let cols = [[1200, 2]]
let items = gridHelp.adjust(generateLayout(2), 2)
</script>

<code>{JSON.stringify(items, null, "\t")}</code>
<Grid
	bind:items
	{cols}
	rowHeight={100}
	let:item
	fillSpace={true}
	fastStart={true}
	on:change={e => console.log("hello", e)}
>
	<pre>
		{JSON.stringify(item, null, "\t")}
	</pre>
</Grid>
<div class="card-wrapper">
	<Card creates>
		<h2>Add a new block?</h2>
	</Card>
</div>

<!-- 
	- remove space (if any) at top: get minimum `y` and translate all items with `y <- y - minY`
	- stretch items to fill horizontal space (spacers are here to fill empty space): group by `x`, for groups of length 1, set `w = number of columns on current breakpoint`
 -->
<style>
:global(.svlt-grid-item) {
	background-color: var(--ortforange);
}

h2 {
	text-align: center;
	color: var(--ortforange);
}

.card-wrapper {
	display: flex;
	align-items: center;
	flex-direction: column;
}
</style>
