<script lang="ts">
import { createEventDispatcher } from "svelte"

const emit = createEventDispatcher()

export let value: {
	primary: string
	secondary: string
	tertiary: string
}

export let key: string
</script>
