<script lang="ts">
import db from "mime-db"
import { _ } from "svelte-i18n"
import { backend, localDatabase, localProjects } from "../backend"
import type { ContentBlock } from "../contentblocks"
import type { AnalyzedWorkLocalized } from "../ortfo"
import { settings, workOnDisk } from "../stores"
import FieldFilepath from "./FieldFilepath.svelte"
import FieldText from "./FieldText.svelte"
import FieldToggle from "./FieldToggle.svelte"

export let block: ContentBlock
export let work: AnalyzedWorkLocalized
export let activeBlock: string

function absoluteMediaPath(source: string): string {
	// TODO don't hardcode scattered mode folder to .ortfo
	return localProjects(`${$workOnDisk.id}/.ortfo/${source}`)
}

function thumbnailOfSource(source: string): string {
	let absolutePath = work.content.blocks.find(m => m.distSource === source)?.thumbnails?.[600]
	return absolutePath
		? localDatabase(absolutePath)
		: absoluteMediaPath(source)
}
function generalContentType(source: string): string {
	const ext = source.split("/").at(-1).split(".").at(-1)
	const matches = Object.entries(db)
		.filter(([mime, data]) => data.extensions?.includes(ext))
		.map(([mime, data]) => mime)
	return (matches.length ? matches[0] : "").split("/")[0]
}
</script>

<div class="media-preview" data-type={generalContentType(block.data.relativeSource)}>
	{#if generalContentType(block.data.relativeSource) === "image"}
		<img src={thumbnailOfSource(block.data.relativeSource)} alt="" />
	{:else if generalContentType(block.data.relativeSource) === "video"}
		<video
			controls={block.data.attributes.controls}
			loop={block.data.attributes.loop}
			muted={block.data.attributes.muted}
			src={absoluteMediaPath(block.data.relativeSource)}
		/>
	{:else if generalContentType(block.data.relativeSource) === "audio"}
		<audio
			controls={block.data.attributes.controls}
			loop={block.data.attributes.loop}
			src={absoluteMediaPath(block.data.relativeSource)}
		/>
		<!-- <audio src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" controls></audio> -->
	{:else if generalContentType(block.data.relativeSource) === "text"}
		{#await backend.mediaContent(block.data.relativeSource)}
			<div class="loading">{$_("loading text file…")}</div>
		{:then content}
			<pre>{content}</pre>
		{:catch error}
			<div class="error">{error}</div>
		{/await}
	{/if}
</div>
<dl>
	<FieldText
		key="name"
		bind:value={block.data.alt}
		on:focus={() => (activeBlock = block.id)}
		on:blur={() => (activeBlock = null)}
		placeholder={$_("describe your media")}
	/>
	<FieldFilepath
		relativeTo={`${$settings.projectsfolder}/${work.id}/.ortfo`}
		key="source"
		bind:value={block.data.relativeSource}
		on:focus={() => (activeBlock = block.id)}
		on:blur={() => (activeBlock = null)}
		placeholder={$_("put the path or url to the media here")}
	/>
</dl>

{#if ["video", "audio"].includes(generalContentType(block.data.relativeSource))}
	<dl class="attributes">
		<FieldToggle
			key="loop"
			bind:value={block.data.attributes.loop}
			on:focus={() => (activeBlock = block.id)}
			on:blur={() => (activeBlock = null)}
		/>
		{#if generalContentType(block.data.relativeSource) === "video"}
			<FieldToggle
				key="autoplay"
				help={$_("mutes the video")}
				value={block.data.attributes.autoplay}
				on:change={e => {
					if (e.detail) {
						block.data.attributes.muted = true
						block.data.attributes.playsinline = true
					}
					block.data.attributes.autoplay = e.detail
				}}
				on:focus={() => (activeBlock = block.id)}
				on:blur={() => (activeBlock = null)}
			/>
		{/if}
		<FieldToggle
			key="show controls"
			helptip={$_("expose play, pause, etc. buttons to the user")}
			bind:value={block.data.attributes.controls}
			on:focus={() => (activeBlock = block.id)}
			on:blur={() => (activeBlock = null)}
		/>
	</dl>
{/if}

<style lang="scss">
.media-preview {
	height: 8em;
	&[data-type="audio"] {
		height: 2em;
	}

	margin-bottom: 2em;

	img,
	video,
	audio {
		max-height: 100%;
		object-fit: contain;
		object-position: left;
	}
}

.attributes {
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 1em;
}
</style>
