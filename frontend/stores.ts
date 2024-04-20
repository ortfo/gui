import { diff, type Operation } from "just-diff"
import type { Readable, Writable } from "svelte/store"
import { derived, writable } from "svelte/store"
import type { BuildProgress } from "./backend"
import { WorkLocalized, Database, DatabaseOneLang, localize } from "./ortfo"
import {
    ColorPalette,
    Settings,
    Tag,
    Technology,
    UIState,
    Work,
} from "./backend.generated"

export type PageName =
    | "works"
    | "tags"
    | "technologies"
    | "sites"
    | "settings"
    | "editor"

export type WorkID = string

// export type State = {
//     openTab: PageName
//     editingWorkID: WorkID | null
//     lang: "en" | "fr"
//     metadataPaneSplitRatio: number
//     scrollPositions: { [tab in PageName]: number }
// }

export const DEFAULT_SETTINGS: Settings = {
    theme: "light",
    portfolioLanguages: ["en"],
    surname: "",
    projectsfolder: "",
    language: "en",
    showtips: true,
    poweruser: false,
}
export const settings: Writable<Settings> = writable(DEFAULT_SETTINGS)

export const DEFAULT_UI_STATE: UIState = {
    openTab: "works",
    editingWorkID: "",
    lang: "en",
    metadataPaneSplitRatio: 0.333,
    rebuildingDatabase: false,
    scrollPositions: {
        works: 0,
        tags: 0,
        technologies: 0,
        sites: 0,
        settings: 0,
        editor: 0,
    },
}
export const state: Writable<UIState> = writable(DEFAULT_UI_STATE)

export const colorPickersSelectedColors: Writable<{
    [hash: string]: ColorPalette
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

export const workInEditor: Writable<Work | null> = writable(null)
export const workOnDisk: Writable<Work | null> = writable(null)

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
                .map(w => Object.keys(w.content ?? {}))
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

export const workOnDiskCurrentLanguage: Readable<WorkLocalized | undefined> =
    derived(
        [databaseCurrentLanguage, state],
        ([databaseCurrentLanguage, state]) =>
            Object.values(databaseCurrentLanguage).find(
                w => w.id === state.editingWorkID,
            ),
    )

export const tagsRepository: Writable<Tag[]> = writable([])
export const technologiesRepository: Writable<Technology[]> = writable([])
