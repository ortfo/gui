import type { ParsedDescription, Work, WorkMetadata } from "./ortfo"
import { except, mapToTranslated } from "./utils"

export function toParsedDescription(work: Work): ParsedDescription {
    const { media, metadata, ...rest } = work
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
