<script lang="ts">
import type { Technology } from "../ortfo"
import { database } from "../stores"
import { i18n } from "../actions"
import { _ } from "svelte-i18n"
import FieldList from "./FieldList.svelte"
import { backend } from "../backend"
import FieldText from "./FieldText.svelte"
import MetadataField from "./MetadataField.svelte"

const EMPTY_TECH: Technology = {
	aliases: [],
	description: "",
	learnmoreurl: "",
	author: "",
	displayname: "",
	urlname: "",
}

let newTech: Technology = EMPTY_TECH

async function addTech() {
	$database.tags = [...$database.technologies, newTech]
	await backend.writeTechnologies($database.technologies)
	newTech = EMPTY_TECH
}
</script>

<h2 use:i18n>Add a technology</h2>

<form on:submit|preventDefault={addTech}>
	<dl>
		<MetadataField key={$_("name")} colon>
			<dl>
				<FieldText
					partOfObject
					bind:value={newTech.displayname}
					key={$_("in the pages")}
				/>
				<FieldText
					partOfObject
					bind:value={newTech.urlname}
					key={$_("in the URLs")}
				/>
			</dl>
		</MetadataField>
		<FieldText
			rich
			bind:value={newTech.description}
			key={$_("description")}
			placeholder={$_("describe your technology")}
		/>
		<FieldText
			type="url"
			bind:value={newTech.learnmoreurl}
			key={$_("learn more at")}
			placeholder={$_("a link to a website")}
		/>
		<FieldList
			key={$_("aliases")}
			help={$_(
				"other singular-form names that should point to the same technology"
			)}
			bind:value={newTech.aliases}
		/>
	</dl>
	<button type="submit" use:i18n>Add</button>
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
