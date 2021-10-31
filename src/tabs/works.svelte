<script lang="ts">
import {
    settings
} from "../stores";
</script>

{#if $settings.surname}
<h1>Good to see you, {$settings.surname}.</h1>
{:else}
<h1>Good to see you.</h1>
{/if}
