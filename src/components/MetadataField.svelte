<script lang="ts">
import { metadataReadableNames } from "../ortfo"

export let key: string
</script>

<dt>{metadataReadableNames[key]}</dt>
<dd><slot /></dd>

<style>
dt {
	font-weight: bold;
}
dt::after {
	content: ": ";
}
</style>
