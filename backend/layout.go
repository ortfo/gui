package main

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
)

func Layout(description ortfodb.ParsedDescription) (layouts map[string]ortfomk.Layout, err error) {
	// Create a stubbed-out WorkOneLang from a ParsedDescription,
	// because LayedOut() needs a WorkOneLang
	// (for good reasons, we need those when actually building the site from the layout,
	// and I won't make two separate .LayedOut(), it's too much of a hassle
	// (looked into it, not feasible without duplicating code))
	layouts = make(map[string]ortfomk.Layout)
	for _, language := range LanguagesIn(description) {
		layout, err := StubOutWorkOneLang(description, language).LayedOut()
		if err != nil {
			return layouts, fmt.Errorf("while laying out work in %s: %w", language, err)
		}
		layouts[language] = layout
	}
	return
}

func StubOutWorkOneLang(description ortfodb.ParsedDescription, language string) ortfomk.WorkOneLang {
	var structuredMetadata ortfomk.WorkMetadata
	err := mapstructure.Decode(description.Metadata, &structuredMetadata)

	if err != nil {
		panic(err)
	}

	stubbedOutMedia := make([]ortfodb.Media, 0, len(description.MediaEmbedDeclarations[language]))
	for _, media := range description.MediaEmbedDeclarations[language] {
		stubbedOutMedia = append(stubbedOutMedia, ortfodb.Media{
			Alt:        media.Alt,
			Title:      media.Title,
			Source:     media.Source,
			Attributes: media.Attributes,
		})
	}

	return ortfomk.WorkOneLang{
		Metadata:   structuredMetadata,
		ID:         "sus",
		Title:      description.Title[language],
		Paragraphs: description.Paragraphs[language],
		Media:      stubbedOutMedia,
		Links:      description.Links[language],
		Footnotes:  description.Footnotes[language],
	}
}
