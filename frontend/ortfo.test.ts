import { it, describe, expect } from "vitest"
import { inLanguage, Work, WorkMetadata } from "./ortfo"

describe("inLanguage", () => {
    it("correctly maps an empty work to an empty work", () => {
        expect(
            inLanguage("fr")({
                id: "",
                metadata: {} as WorkMetadata,
                title: {},
                paragraphs: {},
                links: {},
                media: {},
                footnotes: {},
            })
        ).toEqual({
            language: "fr",
            id: "",
            metadata: {} as WorkMetadata,
            title: "",
            paragraphs: [],
            links: [],
            media: [],
            footnotes: [],
        })
    })

    it("correctly maps a work with mixed default/target language available", () => {
        const work: Work = {
            id: "some id",
            metadata: { some: "metadata" } as unknown as WorkMetadata,
            footnotes: {
                default: [
                    {
                        content: "some footnote",
                        name: "fname",
                    },
                ],
            },
            links: {
                ua: [
                    {
                        url: "some url",
                        title: "some title",
                        id: "gregre",
                        name: "gregre",
                    },
                ],
            },
            media: { ua: [] },
            paragraphs: { ja: [{ content: "woops", id: "" }], ua: [] },
            title: { ua: "a title!!", default: "not that one!" },
        }

        expect(inLanguage("ua")(work)).toEqual({
            language: "ua",
            id: "some id",
            metadata: { some: "metadata" } as unknown as WorkMetadata,
            footnotes: [
                {
                    content: "some footnote",
                    name: "fname",
                },
            ],
            links: [
                {
                    url: "some url",
                    title: "some title",
                    id: "gregre",
                    name: "gregre",
                },
            ],
            media: [],
            paragraphs: [],
            title: "a title!!",
        })
    })
})
