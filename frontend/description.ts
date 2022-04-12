import { normalizeLayout } from "./layout"
import {
    Abbreviations,
    OrtfodbParsedDescription,
    Paragraph,
    ParsedDescription,
    replaceLanguageDefault,
    Translated,
    Work,
    WorkMetadata,
} from "./ortfo"
import { except, lcm, mapToTranslated } from "./utils"

export function toParsedDescription(work: Work): ParsedDescription | null {
    if (!work) {
        return null
    }
    const { media, metadata, ...rest } = replaceLanguageDefault(work, [
        "fr",
        "en",
    ])
    const [paragraphs, abbreviations] = collectAbbreviations(work.paragraphs)
    // XXX: the row capacity should be supplied as an argument, in case the user adds additional rows
    metadata.layout = normalizeLayout(
        metadata.layout,
        lcm(...metadata.layout.map(row => row.length))
    )
    return {
        ...rest,
        paragraphs,
        abbreviations,
        metadata: except("thumbnails")(
            metadata as any
        ) as unknown as WorkMetadata,
        mediaembeddeclarations: mapToTranslated(media => {
            const { alt, title, source, attributes } = media
            return { alt, title, source, attributes }
        }, media),
    }
}

export function collectAbbreviations(
    paragraphs: Translated<Paragraph[]>
): [Translated<Paragraph[]>, Translated<Abbreviations>] {
    let abbreviations: Translated<Abbreviations> = {}
    let paragraphsNoAbbreviations: Translated<Paragraph[]> = {}
    for (const language of Object.keys(paragraphs)) {
        let abbreviationsCurrentLanguage: Abbreviations = {}
        let paragraphsCurrentLanguage: Paragraph[] = []
        for (const paragraph of paragraphs[language]) {
            let paragraphNodes = document.createElement("p")
            paragraphNodes.innerHTML = paragraph.content
            for (const abbr of paragraphNodes.querySelectorAll("abbr")) {
                abbreviationsCurrentLanguage[abbr.textContent] = abbr.title
                abbr.parentNode.replaceChild(
                    document.createTextNode(abbr.textContent),
                    abbr
                )
            }
            paragraphsCurrentLanguage.push({
                ...paragraph,
                content: paragraphNodes.innerHTML,
            })
        }
        paragraphsNoAbbreviations[language] = paragraphsCurrentLanguage
        abbreviations[language] = abbreviationsCurrentLanguage
    }
    return [paragraphsNoAbbreviations, abbreviations]
}

export function applyAbbreviations(
    work: ParsedDescription
): OrtfodbParsedDescription {
    const newWork: OrtfodbParsedDescription = except("abbreviations")(
        work as unknown as { [k: string]: any }
    ) as unknown as OrtfodbParsedDescription
    for (const language of Object.keys(work.paragraphs)) {
        newWork.paragraphs[language] = [...work.paragraphs[language]]
        for (const [index, paragraph] of Object.entries(
            work.paragraphs[language]
        )) {
            for (const [name, definition] of Object.entries(
                work.abbreviations[language]
            )) {
                newWork.paragraphs[language][index].content =
                    paragraph.content.replace(
                        // TODO regex word boundaries don't work with unicode (exemple: apostrophe ’)
                        // TODO look at how gomarkdown handles this and copy the behavior so it's consistent
                        new RegExp(`${name}`, "g"),
                        `<abbr title="${definition}">${name}</abbr>`
                    )
            }
        }
    }
    return newWork
}
