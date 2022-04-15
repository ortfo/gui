<script lang="ts">
import type { Tag } from "../ortfo"
import { database } from "../stores"
import { i18n } from "../actions"
import { _ } from "svelte-i18n"
import FieldList from "./FieldList.svelte"
import { backend } from "../backend"
import FieldText from "./FieldText.svelte"
import MetadataField from "./MetadataField.svelte"

const EMPTY_TAG: Tag = {
	aliases: [],
	description: "",
	learnmoreurl: "",
	plural: "",
	singular: "",
}

let newTag: Tag = EMPTY_TAG

async function addTag() {
	$database.tags = [...$database.tags, newTag]
	console.log("addTag", $database.tags)
	await backend.writeTags($database.tags)
	newTag = EMPTY_TAG
}
</script>

<h2 use:i18n>Add a tag</h2>

<form on:submit|preventDefault={addTag}>
	<dl>
		<MetadataField key={$_("name")} colon>
			<dl>
				<FieldText
					partOfObject
					bind:value={newTag.singular}
					key={$_("singular")}
				/>
				<FieldText
					partOfObject
					bind:value={newTag.plural}
					key={$_("plural")}
				/>
			</dl>
		</MetadataField>
		<FieldText
			rich
			bind:value={newTag.description}
			key={$_("description")}
			placeholder={$_("describe your tag")}
		/>
		<FieldText
			type="url"
			bind:value={newTag.learnmoreurl}
			key={$_("learn more at")}
			placeholder={$_("un lien vers un site")}
		/>
		<FieldList
			key={$_("aliases")}
			help={$_(
				"other singular-form names that should point to the same category"
			)}
			bind:value={newTag.aliases}
		/>
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
h2 {
	text-align: center;
	margin-bottom: 1.5em;
}
</style>
