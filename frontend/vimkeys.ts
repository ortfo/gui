import { get } from "svelte/store"
import { State, state } from "./stores"

const tab = (name: State["openTab"]) =>
    state.set({ ...get(state), openTab: name })

export const vimkeys = (scrollSpeed: number) => ({
    "g g": () => window.scrollTo({ top: 0, behavior: "smooth" }),
    "Shift+g": () =>
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        }),
    j: () => window.scrollBy({ behavior: "smooth", top: scrollSpeed }),
    k: () => window.scrollBy({ behavior: "smooth", top: -scrollSpeed }),
    h: () => window.scrollBy({ behavior: "smooth", left: -scrollSpeed }),
    l: () => window.scrollBy({ behavior: "smooth", left: scrollSpeed }),
    "w o": () => tab("works"),
    "w k": () => tab("works"),
    "p r": () => tab("works"),
    "e d": () => {
        if (get(state).editingWorkID !== "") {
            tab("editor")
        }
    },
    "t a": () => tab("tags"),
    "t e": () => tab("technologies"),
    "s i": () => tab("sites"),
    "s e": () => tab("settings"),
    "r é": () => tab("settings"),
})
