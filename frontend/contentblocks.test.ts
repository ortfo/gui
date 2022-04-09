import { faker } from "@faker-js/faker"
import { describe, expect, it, vi } from "vitest"
import {
    ContentBlock,
    eachLanguage,
    fromBlocksToParsedDescription,
    toBlocks,
} from "./contentblocks"
import type { ParsedDescription } from "./ortfo"

const gridItem = (data: { x: number; y: number; w: number; h: number }) =>
    ({
        fixed: false,
        resizable: true,
        draggable: true,
        customDragger: true,
        customResizer: true,
        min: { h: 1, w: 1 },
        max: {},
        ...data,
    } as ContentBlock[number])

describe("eachLanguage", () => {
    it("does not modify when mapping with x => x", () => {
        expect(
            eachLanguage({
                en: [],
                fr: [12, 12],
            }).map(x => x)
        ).toEqual({
            en: [],
            fr: [12, 12],
        })
    })

    it("maps correctly", () => {
        expect(
            eachLanguage({
                en: [],
                vi: [1, 4, 3],
            }).map(x => 2 ** x)
        ).toEqual({
            en: [],
            vi: [2, 16, 8],
        })
    })

    it("filters correctly", () => {
        expect(
            eachLanguage({
                en: [],
                zh: [
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: 1,
                        y: 0,
                    },
                    {
                        x: 0,
                        y: 1,
                    },
                    {
                        x: 1,
                        y: 1,
                    },
                ],
            }).filter(({ x, y }) => x === y)
        ).toEqual({
            en: [],
            zh: [
                {
                    x: 0,
                    y: 0,
                },
                {
                    x: 1,
                    y: 1,
                },
            ],
        })
    })
})

describe("toBlocks", async () => {
    it("returns no blocks when given parsed description has no content", async () => {
        vi.stubGlobal(
            "backend__layout",
            vi.fn(async (work: ParsedDescription) => ({}))
        )
        expect(
            await toBlocks({
                metadata: {},
                footnotes: {},
                title: {},
                links: {},
                paragraphs: {},
                mediaembeddeclarations: {},
            })
        ).toEqual([{}, 1])
    })
    it("returns no blocks when given parsed description with no content, in each language", async () => {
        vi.stubGlobal(
            "backend__layout",
            vi.fn(async (work: ParsedDescription) => ({ fr: [], en: [] }))
        )

        expect(
            await toBlocks({
                metadata: {},
                footnotes: { fr: [], en: [] },
                title: { fr: "", en: "" },
                links: { fr: [], en: [] },
                paragraphs: { fr: [], en: [] },
                mediaembeddeclarations: { fr: [], en: [] },
            })
        ).toEqual([{ en: [], fr: [] }, 1])
    })

    /*
    it("correctly transforms a parsed description that has a satisfiable layout", async () => {
        // prettier-ignore
        vi.stubGlobal( "backend__layout", vi.fn(async (work: ParsedDescription) => ({ en: [ { type: "paragraph", layoutindex: 0, positions: [[0, 0]], generalcontenttype: "", alt: "", source: "", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: false, }, hassound: false, content: '<p>Poster for a preparatory evening for a psychology congress around a <a href="https://en.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a> quote: “La femme n’existe pas”<sup class="footnote-ref" id="fnref:1"><a href="#fn:1">1</a></sup></p>', name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "link", layoutindex: 0, positions: [[0, 1]], generalcontenttype: "", alt: "", source: "", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: false, }, hassound: false, content: "", name: "On ACF-VD’s website", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 0, positions: [[1, 0]], generalcontenttype: "", alt: "poster", source: "../illimité-affiche-02-22-1.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 1, positions: [[1, 1]], generalcontenttype: "", alt: "flyer (front side)", source: "../illimité-flyer-verso-02-22-1.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 2, positions: [ [2, 0], [2, 1], ], generalcontenttype: "", alt: "printed poster and flyers on a red background", source: "../photo-imprimés.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, ], fr: [ { type: "paragraph", layoutindex: 0, positions: [[0, 0]], generalcontenttype: "", alt: "", source: "", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: false, }, hassound: false, content: '<p>Affiche pour une soirée préparatoire d’un congrès de l’<abbr title="Association Mondiale de Psychanalyse">AMP</abbr> autour d’une citation de <a href="https://fr.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a>: “La femme n’existe pas”</p>', name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "link", layoutindex: 0, positions: [[0, 1]], generalcontenttype: "", alt: "", source: "", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: false, }, hassound: false, content: "", name: "Sur le site de l’ACF-VD", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 0, positions: [[1, 0]], generalcontenttype: "", alt: "affiche", source: "../illimité-affiche-02-22-1.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 1, positions: [[1, 1]], generalcontenttype: "", alt: "flyer (verso)", source: "../illimité-flyer-verso-02-22-1.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, { type: "media", layoutindex: 2, positions: [ [2, 0], [2, 1], ], generalcontenttype: "", alt: "affiche et flyer imprimmés sur fond rouge", source: "../photo-imprimés.png", path: "", contenttype: "", size: 0, dimensions: { width: 0, height: 0, aspectratio: 0 }, duration: 0, online: false, attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, hassound: false, content: "", name: "", url: "", metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "", }, pagebackground: "", title: "", wip: false, thumbnails: null, }, }, ], })))

        expect(
            // prettier-ignore
            await toBlocks({ title: { en: "L’illimité", fr: "L’illimité" }, paragraphs: { en: [ { id: "", content: '<p>Poster for a preparatory evening for a psychology congress around a <a href="https://en.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a> quote: “La femme n’existe pas”<sup class="footnote-ref" id="fnref:1"><a href="#fn:1">1</a></sup></p>', }, ], fr: [ { id: "", content: '<p>Affiche pour une soirée préparatoire d’un congrès de l’<abbr title="Association Mondiale de Psychanalyse">AMP</abbr> autour d’une citation de <a href="https://fr.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a>: “La femme n’existe pas”</p>', }, ], }, links: { en: [ { id: "on-acf-vds-website", name: "On ACF-VD’s website", title: "", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", }, ], fr: [ { id: "sur-le-site-de-lacf-vd", name: "Sur le site de l’ACF-VD", title: "", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", }, ], }, footnotes: { en: [ { name: "1", content: "lit. “The women does not exist”<br/>\n", }, ], fr: [], }, metadata: { created: "2022-02-19", started: "2022-02-19", finished: "2022-02-19", tags: ["poster", "flyer"], layout: [["p", "l"], ["m1", "m2"], "m3"], layoutproper: null, madewith: ["photoshop"], colors: { primary: "", secondary: "", tertiary: "" }, pagebackground: "", title: "", wip: false, }, mediaembeddeclarations: { en: [ { alt: "poster", title: "", source: "../illimité-affiche-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, { alt: "flyer (front side)", title: "", source: "../illimité-flyer-verso-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, { alt: "printed poster and flyers on a red background", title: "", source: "../photo-imprimés.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, ], fr: [ { alt: "affiche", title: "", source: "../illimité-affiche-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, { alt: "flyer (verso)", title: "", source: "../illimité-flyer-verso-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, { alt: "affiche et flyer imprimmés sur fond rouge", title: "", source: "../photo-imprimés.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, }, ], }, })
        ).toEqual<[Translated<ContentBlock[]>, number]>([
            // prettier-ignore
            { en: [ { "2": gridItem({ x: 0, y: 0, w: 1, h: 1, }), id: "paragraph:0", data: { content: '<p>Poster for a preparatory evening for a psychology congress around a <a href="https://en.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a> quote: “La femme n’existe pas”<sup class="footnote-ref" id="fnref:1"><a href="#fn:1">1</a></sup></p>', type: "paragraph", id: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 1, y: 0, w: 1, h: 1, }, id: "link:0", data: { name: "On ACF-VD’s website", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", type: "link", id: "", title: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 0, y: 1, w: 1, h: 1, }, id: "media:0", data: { alt: "poster", source: "../illimité-affiche-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, title: "", type: "media", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 1, y: 1, w: 1, h: 1, }, id: "media:1", data: { alt: "flyer (front side)", source: "../illimité-flyer-verso-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, type: "media", title: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 0, y: 2, w: 2, h: 1, }, id: "media:2", data: { alt: "printed poster and flyers on a red background", source: "../photo-imprimés.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, type: "media", title: "", }, }, ], fr: [ { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 0, y: 0, w: 1, h: 1, }, id: "paragraph:0", data: { content: '<p>Affiche pour une soirée préparatoire d’un congrès de l’<abbr title="Association Mondiale de Psychanalyse">AMP</abbr> autour d’une citation de <a href="https://fr.wikipedia.org/wiki/Jacques_Lacan">Jacques Lacan</a>: “La femme n’existe pas”</p>', type: "paragraph", id: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 1, y: 0, w: 1, h: 1, }, id: "link:0", data: { name: "Sur le site de l’ACF-VD", url: "https://www.acfvoiedomitienne.fr/evenements-de-lacfvd#img_comp-jx3c19bu__item-kfvhdt5k", type: "link", id: "", title: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 0, y: 1, w: 1, h: 1, }, id: "media:0", data: { alt: "affiche", source: "../illimité-affiche-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, type: "media", title: "", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 1, y: 1, w: 1, h: 1, }, id: "media:1", data: { alt: "flyer (verso)", source: "../illimité-flyer-verso-02-22-1.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, type: "media", }, }, { "2": { fixed: false, resizable: true, draggable: true, customDragger: true, customResizer: true, min: { w: 1, h: 1 }, max: {}, x: 0, y: 2, w: 2, h: 1, }, id: "media:2", data: { alt: "affiche et flyer imprimmés sur fond rouge", source: "../photo-imprimés.png", attributes: { looped: false, autoplay: false, muted: false, playsinline: false, controls: true, }, type: "media", }, }, ], },
            2,
        ])
    })
    */
})

describe("fromBlocksToParsedDescription", () => {
    it("handles void descriptions", () => {
        expect(
            fromBlocksToParsedDescription(
                {},
                42,
                {
                    metadata: { sth: 3 },
                    title: {},
                    paragraphs: {},
                    mediaembeddeclarations: {},
                    links: {},
                    footnotes: {},
                },
                "default"
            )
        ).toEqual({
            footnotes: {},
            paragraphs: {},
            links: {},
            mediaembeddeclarations: {},
            metadata: { sth: 3 },
            title: {},
        })
    })

    faker.locale = "ja"
    const title = faker.lorem.sentence()

    it("handles a simple single-row layout", () => {
        expect(
            fromBlocksToParsedDescription(
                {
                    ja: [
                        {
                            data: {
                                type: "paragraph",
                                content: "あいうえお",
                                id: "aiueo",
                            },
                            id: "paragraph:0",
                            1: gridItem({ x: 0, y: 0, w: 1, h: 2 }),
                        },
                        {
                            data: {
                                type: "link",
                                id: "",
                                name: "aaa_ja",
                                title: "",
                                url: "https://example.ja",
                            },
                            id: "link:0",
                            1: gridItem({ x: 0, y: 2, w: 1, h: 1 }),
                        },
                    ],
                },
                1,
                {
                    metadata: {
                        some: "metadata",
                        right: "here",
                        layout: ["p1", "p1", "l"],
                    },
                    title: { ja: title },
                    paragraphs: {},
                    mediaembeddeclarations: {},
                    links: {},
                    footnotes: {},
                },
                "ja"
            )
        ).toEqual({
            title: { ja: title },
            footnotes: {},
            paragraphs: {
                ja: [
                    {
                        content: "あいうえお",
                        id: "aiueo",
                    },
                ],
            },
            links: {
                ja: [
                    {
                        id: "",
                        name: "aaa_ja",
                        title: "",
                        url: "https://example.ja",
                    },
                ],
            },
            mediaembeddeclarations: { ja: [] },
            metadata: {
                some: "metadata",
                right: "here",
                layout: ["p1", "p1", "l1"],
            },
        } as ParsedDescription)
    })
})
