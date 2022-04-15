<script lang="ts">
import type { ExternalSite } from "../ortfo"
import { database } from "../stores"
import { i18n } from "../actions"
import { _ } from "svelte-i18n"
import FieldList from "./FieldList.svelte"
import { backend } from "../backend"
import FieldText from "./FieldText.svelte"
import MetadataField from "./MetadataField.svelte"

const EMPTY_SITE: ExternalSite = {
	aliases: [],
	description: "",
	learnmoreurl: "",
	plural: "",
	singular: "",
}

let newSite: ExternalSite = EMPTY_SITE

async function addSite() {
	$database.sites = [...$database.sites, newSite]
	await backend.writeExternalSites($database.sites)
	newSite = EMPTY_SITE
}
</script>

<h2 use:i18n>Add an external site</h2>
<p class="tip">{@html $_("create_external_site_tip")}</p>

<form on:submit|preventDefault={addSite}>
	<dl>
		<FieldText bind:value={newSite.name} key={$_("name")} />
		<FieldText
			bind:value={newSite.purpose}
			key={$_("purpose")}
			placeholder={$_("what do you use it for?")}
		/>
		<FieldText
			bind:value={newSite.username}
			key={$_("username")}
			placeholder={$_("without the leading @", {
				values: {
					site_name: newSite.name || $_("that site"),
				},
			})}
		/>
		<FieldText type="url" bind:value={newSite.url} key={$_("link")} />
	</dl>
	<button type="submit">Ajouter</button>
</form>

<style>
form {
	display: flex;
	flex-direction: column;
	align-items: center;
}
form button[type="submit"] {
	flex: none;
}
h2,
.tip {
	text-align: center;
}
.tip {
	margin-bottom: 1.5em;
}
.tip code {
	color: var(--ortforange);
	font-variation-settings: "wght" 800;
	margin: 0 1em;
}
</style>
