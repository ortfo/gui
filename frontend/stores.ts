import { writable, derived } from "svelte/store"
import type { Writable, Readable } from "svelte/store"
import type {
    DatabaseOneLang,
    Database,
    ParsedDescription,
    Work,
    WorkOneLang,
} from "./ortfo"
import { inLanguage } from "./ortfo"
import { diff, Operation } from "just-diff"
import { toParsedDescription } from "./description"

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
    editingWorkID: "neptune",
    editingLanguage: "en",
    metadataPaneSplitRatio: 0.333,
})

export const database: Writable<Database> = writable({} as Database)

export const workInEditor: Writable<ParsedDescription> = writable(
    {} as ParsedDescription
)

export const workOnDisk: Readable<Work | null> = derived(
    [database, state],
    ([$database, $state]) =>
        $state.editingWorkID
            ? $database.works.find(w => w.id === $state.editingWorkID)
            : null
)

export const unsavedChanges: Readable<
    { op: Operation; path: (string | number)[]; value: any }[]
> = derived([workInEditor, workOnDisk], ([workInEditor, workOnDisk]) =>
    workOnDisk && workInEditor
        ? diff(toParsedDescription(workOnDisk), workInEditor)
        : []
)

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
    ([$databaseLanguages, $settings]) => {
        if (Object.keys($databaseLanguages).length) {
            return {
                ...$databaseLanguages,
                works: $databaseLanguages.works.map(
                    inLanguage($settings.language)
                ),
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
