export function createModalSummoner(simpleModalContext) {
    return modal => {
        simpleModalContext.open(modal)
    }
}
