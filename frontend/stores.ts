import type { Database as AnalyzedWork, Colors } from "@ortfo/db/dist/database"
import { diff, type Operation } from "just-diff"
import type { Readable, Writable } from "svelte/store"
import { derived, writable } from "svelte/store"
import type { BuildProgress } from "./backend"
import {
    type AnalyzedWorkLocalized,
    type Database,
    type DatabaseOneLang,
    localize,
} from "./ortfo"
import { Tags } from "@ortfo/db/dist/tags"
import { Technologies } from "@ortfo/db/dist/technologies"

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
    lang: "en",
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
    [hash: string]: Colors
}> = writable({})

export const buildProgress: Writable<BuildProgress> = writable({
    details: [],
    phase: "",
    work_id: "",
    works_done: 0,
    works_total: 0,
})
export const rebuildingDatabase: Readable<boolean> = derived(
    [buildProgress],
    ([$buildProgress]) => $buildProgress.works_total > 0,
)

export const database: Writable<Database> = writable({} as Database)

export const volatileWorks: Writable<WorkID[]> = writable([] as WorkID[])

export const debugFlyoutContent: Writable<any> = writable(null)

export const workInEditor: Writable<AnalyzedWork | null> = writable(null)
export const workOnDisk: Writable<AnalyzedWork | null> = writable(null)

export const unsavedChanges: Readable<
    { op: Operation; path: (string | number)[]; value: any }[]
> = derived(
    [workInEditor, workOnDisk, settings],
    ([workInEditor, workOnDisk, settings]) => {
        try {
            return diff(workOnDisk ?? {}, workInEditor ?? {})
        } catch (err) {
            return []
        }
    },
)

export const hasUnsavedChanges: Readable<boolean> = derived(
    [unsavedChanges],
    ([unsavedChanges]) => unsavedChanges.length > 0,
)

export const layoutChanged: Readable<boolean> = derived(
    [unsavedChanges],
    ([unsavedChanges]) =>
        unsavedChanges.some(change => change.path.includes("layout")),
)

export const onboardingNeeded: Readable<boolean> = derived(
    [settings],
    ([$settings]) => !$settings.projectsfolder,
)

export const databaseLanguages: Readable<Set<string>> = derived(
    [database],
    ([$database]) =>
        new Set(
            Object.values($database)
                .map(w => Object.keys(w.content))
                .flat()
                .filter(l => l !== "default"),
        ),
)

export const databaseCurrentLanguage: Readable<DatabaseOneLang> = derived(
    [database, settings],
    ([$database, $settings]) => {
        if (!$settings.language) {
            throw Error("No language set")
        }
        if (!$database) return {}

        return Object.fromEntries(
            Object.entries($database).map(([id, work]) => [
                id,
                localize(work, $settings.language),
            ]),
        )
    },
)

export const workOnDiskCurrentLanguage: Readable<
    AnalyzedWorkLocalized | undefined
> = derived(
    [databaseCurrentLanguage, state],
    ([databaseCurrentLanguage, state]) =>
        Object.values(databaseCurrentLanguage).find(
            w => w.id === state.editingWorkID,
        ),
)

export const tagsRepository: Writable<Tags[]> = writable([])
export const technologiesRepository: Writable<Technologies[]> = writable([])
