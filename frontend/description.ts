import { normalizeLayout } from "./layout"
import type { ParsedDescription, Work, WorkMetadata } from "./ortfo"
import { except, lcm, mapToTranslated } from "./utils"

export function toParsedDescription(work: Work): ParsedDescription {
    if (!work) {
        throw Error("No work given")
    }
    const { media, metadata, ...rest } = work
    // XXX: the row capacity should be supplied as an argument, in case the user adds additional rows 
    metadata.layout = normalizeLayout(
        metadata.layout,
        lcm(...metadata.layout.map(row => row.length))
    )
    return {
        ...rest,
        metadata: except("thumbnails")(
            metadata as any
        ) as unknown as WorkMetadata,
        mediaembeddeclarations: mapToTranslated(media => {
            const { alt, title, source, attributes } = media
            return { alt, title, source, attributes }
        }, media),
    }
}
