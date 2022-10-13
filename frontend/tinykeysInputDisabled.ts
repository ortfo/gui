// thx https://github.com/jamiebuilds/tinykeys/issues/17#issuecomment-1163109758

import tinykeys from "tinykeys"

function isInsideEditable(target) {
    if (target === null) return false

    return (
        ["input", "textarea"].includes(target.tagName.toLowerCase()) ||
        target.hasAttribute("contenteditable")
    )
}

// key shortcut that could be used to enter text: the first combination of the chord does not use Ctrl or Cmd
function ambiguousShortcut(key) {
    return !key
        .split(" ")[0]
        .split("+")
        .some(stroke => ["Ctrl", "$mod"].includes(stroke))
}

export default function hotkeys(target, bindings) {
    const wrappedBindings = Object.fromEntries(
        Object.entries(bindings).map(([key, handler]) => [
            key,
            event => {
                // this disables shortcuts like "t e" when editing text but keeps Ctrl+s
                if (isInsideEditable(event.target) && ambiguousShortcut(key)) {
                    return
                }
                handler({
                    ...event,
                    insideEditable: isInsideEditable(event.target),
                })
            },
        ])
    )
    tinykeys(target, wrappedBindings)
}
