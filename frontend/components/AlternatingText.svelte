<script lang="ts">
import { onDestroy, onMount } from "svelte"
import { sleep, timeToRead } from "../utils"
import {
	setIntervalAsync,
	clearIntervalAsync,
} from "set-interval-async/dynamic"
import type { SetIntervalAsyncTimer } from "set-interval-async/dynamic"

export let strings: string[]
export let duration: number | null = null

let currentStringIndex = 0
let _duration
$: _duration = duration || timeToRead(strings[currentStringIndex]) + 2
let interval: SetIntervalAsyncTimer
let element

onMount(() => {
	interval = setIntervalAsync(async () => {
		if (element) {
			element.textContent = strings[currentStringIndex]
			element.style.opacity = 1
			await sleep(_duration + 0.5)
			element.style.opacity = 0
			await sleep(0.5)
			currentStringIndex = (currentStringIndex + 1) % strings.length
		}
	}, 10)
})

onDestroy(() => {
	clearIntervalAsync(interval)
})
</script>

<span bind:this={element} />

<style>
span {
	transition: opacity 0.5s ease-in-out;
}
</style>
