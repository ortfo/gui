import { writable } from "svelte/store"
import type { Writable } from "svelte/store"

export type Settings = {
    theme: string;
    surname: string;
    projectsFolder: string;
}

export type PageName = "works" | "tags" | "technologies" | "sites" | "settings"

export type State = {
    openTab: PageName;
}

export const settings: Writable<Settings> = writable({theme: "light"})

export const state: Writable<State> = writable({openTab: "works"})
