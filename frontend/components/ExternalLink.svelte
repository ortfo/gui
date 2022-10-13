<script lang="ts">
import { backend } from "../backend"

export let href: string
</script>

<a {href} on:click|preventDefault={() => backend.openInBrowser(href)}>
	<slot>{href}</slot>
</a>
