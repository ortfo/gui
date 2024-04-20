// import { normalizeLayout } from "./layout"
// import { except, lcm, logExpr, mapToTranslated } from "./utils"
// import type { Database as AnalyzedWork, BlockElement, ContentValue } from "@ortfo/db/dist/database"

type Abbreviation = { [abbr: string]: string }

// export function collectAbbreviations(
//     paragraphs: BlockElement[],
//     portfolioLanguages: string[]
// ): [BlockElement[], Abbre] {
//     let abbreviations: Translated<Abbreviations> = {}
//     let paragraphsNoAbbreviations: Translated<Paragraph[]> = {}
//     for (const language of portfolioLanguages) {
//         let abbreviationsCurrentLanguage: Abbreviations = {}
//         let paragraphsCurrentLanguage: Paragraph[] = []
//         for (const paragraph of paragraphs[language]) {
//             let paragraphNodes = document.createElement("p")
//             paragraphNodes.innerHTML = paragraph.content
//             for (const abbr of paragraphNodes.querySelectorAll("abbr")) {
//                 abbreviationsCurrentLanguage[abbr.textContent] = abbr.title
//                 abbr.parentNode.replaceChild(
//                     document.createTextNode(abbr.textContent),
//                     abbr
//                 )
//             }
//             paragraphsCurrentLanguage.push({
//                 ...paragraph,
//                 content: paragraphNodes.innerHTML,
//             })
//         }
//         paragraphsNoAbbreviations[language] = paragraphsCurrentLanguage
//         abbreviations[language] = abbreviationsCurrentLanguage
//     }
//     return [paragraphsNoAbbreviations, abbreviations]
// }

// export function applyAbbreviations(
//     work: ParsedDescription
// ): OrtfodbParsedDescription {
//     const newWork: OrtfodbParsedDescription = except("abbreviations")(
//         work as unknown as { [k: string]: any }
//     ) as unknown as OrtfodbParsedDescription
//     for (const language of Object.keys(work.abbreviations)) {
//         newWork.paragraphs[language] = [...work.paragraphs[language]]
//         for (const [index, paragraph] of Object.entries(
//             work.paragraphs[language]
//         )) {
//             for (const [name, definition] of Object.entries(
//                 work.abbreviations[language]
//             )) {
//                 newWork.paragraphs[language][index].content =
//                     paragraph.content.replace(
//                         // TODO regex word boundaries don't work with unicode (exemple: apostrophe ’)
//                         // TODO look at how gomarkdown handles this and copy the behavior so it's consistent
//                         new RegExp(`${name}`, "g"),
//                         `<abbr title="${definition}">${name}</abbr>`
//                     )
//             }
//         }
//     }
//     return newWork
// }
// function emptyMetadata(): WorkMetadata {
//     return {
//         thumbnails: {},
//         aliases: [],
//         colors: {
//             primary: "",
//             secondary: "",
//             tertiary: "",
//         },
//         created: "",
//         finished: "",
//         layout: [],
//         madewith: [],
//         pagebackground: "",
//         started: "",
//         tags: [],
//         titlestyle: "filled",
//         wip: false,
//     }
// }
