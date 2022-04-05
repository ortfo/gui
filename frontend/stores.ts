import { diff, Operation } from "just-diff"
import type { Readable, Writable } from "svelte/store"
import { derived, writable } from "svelte/store"
import { toParsedDescription } from "./description"
import type {
    Database,
    DatabaseOneLang,
    ParsedDescription,
    Work,
    WorkOneLang,
} from "./ortfo"
import { inLanguage } from "./ortfo"

export type Settings = {
    theme: string
    surname: string
    projectsfolder: string
    language: "en" | "fr"
    showTips: boolean
}

export type PageName =
    | "works"
    | "tags"
    | "technologies"
    | "sites"
    | "settings"
    | "editor"

export type WorkID = string

export type State = {
    openTab: PageName
    rebuildingDatabase: boolean
    editingWorkID: WorkID | null
    lang: "en" | "fr"
    metadataPaneSplitRatio: number
}

export const settings: Writable<Settings> = writable({
    theme: "light",
    surname: "",
    projectsfolder: "",
    language: "en",
    showTips: true,
})

export const state: Writable<State> = writable({
    openTab: "editor",
    rebuildingDatabase: false,
    editingWorkID: "illiimité",
    lang: "en",
    metadataPaneSplitRatio: 0.333,
})

export const database: Writable<Database> = writable({} as Database)

export const workInEditor: Writable<ParsedDescription> = writable(
    {} as ParsedDescription
)

export const workOnDisk: Readable<Work | null> = derived(
    [database, state],
    ([$database, $state]) =>
        // FIXME #5 everything breaks down if the work is not found
        // (try setting the state to a non-existent work)
        $database?.works.find(w => w.id === $state.editingWorkID) ?? null
)

export const unsavedChanges: Readable<
    { op: Operation; path: (string | number)[]; value: any }[]
> = derived([workInEditor, workOnDisk], ([workInEditor, workOnDisk]) => {
    try {
        return diff(toParsedDescription(workOnDisk), workInEditor)
    } catch (err) {
        return []
    }
})

export const hasUnsavedChanges: Readable<boolean> = derived(
    [unsavedChanges],
    ([unsavedChanges]) => unsavedChanges.length > 0
)

export const layoutChanged: Readable<boolean> = derived(
    [unsavedChanges],
    ([unsavedChanges]) =>
        unsavedChanges.some(change => change.path.includes("layout"))
)

export const databaseLanguages: Readable<Set<string>> = derived(
    [database],
    ([$database]) =>
        new Set(
            $database.works
                .map(w => Object.keys(w.title))
                .flat()
                .filter(l => l !== "default")
        )
)

export const databaseCurrentLanguage: Readable<DatabaseOneLang> = derived(
    [database, settings],
    ([$database, $settings]) => {
        if (!$settings.language) {
            throw Error("No language set")
        }
        if (Object.keys($database).length) {
            return {
                ...$database,
                works: $database.works.map(inLanguage($settings.language)),
            }
        }
        throw Error("No database")
    }
)

export const workOnDiskCurrentLanguage: Readable<WorkOneLang> = derived(
    [databaseCurrentLanguage, state],
    ([databaseCurrentLanguage, state]) =>
        databaseCurrentLanguage.works.find(w => w.id === state.editingWorkID)
)
