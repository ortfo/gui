import { diff, Operation } from "just-diff"
import type { Readable, Writable } from "svelte/store"
import { derived, writable } from "svelte/store"
import type { BuildProgress } from "./backend"
import { toParsedDescription } from "./description"
import type {
    Database,
    DatabaseOneLang,
    ExtractedColors,
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
    portfoliolanguages: string[]
    showtips: boolean
    poweruser: boolean
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
    editingWorkID: WorkID | null
    lang: "en" | "fr"
    metadataPaneSplitRatio: number
    scrollPositions: { [tab in PageName]: number }
}

export const DEFAULT_SETTINGS: Settings = {
    theme: "light",
    portfoliolanguages: ["en"],
    surname: "",
    projectsfolder: "",
    language: "en",
    showtips: true,
    poweruser: false,
}
export const settings: Writable<Settings> = writable(DEFAULT_SETTINGS)

export const DEFAULT_UI_STATE: State = {
    openTab: "works",
    editingWorkID: "",
    lang: null,
    metadataPaneSplitRatio: 0.333,
    scrollPositions: {
        works: 0,
        tags: 0,
        technologies: 0,
        sites: 0,
        settings: 0,
        editor: 0,
    },
}
export const state: Writable<State> = writable(DEFAULT_UI_STATE)

export const colorPickersSelectedColors: Writable<{
    [hash: string]: ExtractedColors
}> = writable({})

export const buildProgress: Writable<BuildProgress> = writable({
    current: {
        file: "",
        id: "",
        language: "",
        output: "",
        resolution: 0,
        step: "",
    },
    percent: 0,
    processed: 0,
    total: 0,
})
export const rebuildingDatabase: Readable<boolean> = derived(
    [buildProgress],
    ([$buildProgress]) => $buildProgress.total > 0
)

export const database: Writable<Database> = writable({} as Database)

export const volatileWorks: Writable<WorkID[]> = writable([] as WorkID[])

export const workInEditor: Writable<ParsedDescription | null> = writable(null)

export const debugFlyoutContent: Writable<any> = writable(null)

export const workOnDisk: Readable<Work | null> = derived(
    [database, state],
    ([$database, $state]) => {
        // FIXME #5 everything breaks down if the work is not found
        // (try setting the state to a non-existent work)
        if ($state.editingWorkID === "") {
            return null
        }
        try {
            const found = $database.works.find(w => w.id === $state.editingWorkID)
            if (!found) {
                console.error(`While computing workOnDisk(${$state.editingWorkID}): not found`)
                return null
            }
            return found
        } catch (e) {
            console.error(`Fatal error while getting workOnDisk ${e}`)
            return null
        }
    }
)

export const unsavedChanges: Readable<
    { op: Operation; path: (string | number)[]; value: any }[]
> = derived(
    [workInEditor, workOnDisk, settings],
    ([workInEditor, workOnDisk, settings]) => {
        try {
            return diff(
                toParsedDescription(workOnDisk, settings.portfoliolanguages),
                workInEditor
            )
        } catch (err) {
            return []
        }
    }
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

export const onboardingNeeded: Readable<boolean> = derived(
    [settings],
    ([$settings]) => !$settings.projectsfolder
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
        return {
            ...$database,
            works: $database?.works.map(inLanguage($settings.language)),
        }
    }
)

export const workOnDiskCurrentLanguage: Readable<WorkOneLang> = derived(
    [databaseCurrentLanguage, state],
    ([databaseCurrentLanguage, state]) =>
        databaseCurrentLanguage.works.find(w => w.id === state.editingWorkID)
)
