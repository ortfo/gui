import { getContext } from "svelte"

export function createModalSummoner() {
    const modalContext = getContext("simple-modal")
    return (modal, props = {}) => {
        modalContext.open(modal, props)
    }
}
