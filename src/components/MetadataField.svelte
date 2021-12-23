<script lang="ts">
import { metadataReadableNames } from "../ortfo"

export let key: string
export let colon: boolean = false
export let partOfObject: boolean = false
export let oneline: boolean = false
</script>

<div class="entry" class:oneline class:part-of-object={partOfObject}>
	<dt class:colon >
		{metadataReadableNames[key] || key}
	</dt>
	<dd><slot /></dd>
</div>

<style>
.oneline {
	display: grid;
	grid-template-columns: 1fr auto;
}
dt, dd {
	display: flex;
	flex-direction: row;
	align-items: center;
}
dt {
	font-weight: bold;
}
dt.colon::after {
	content: ": ";
}
.part-of-object > dt::before {
	content: "└";
	font-weight: bold;
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
