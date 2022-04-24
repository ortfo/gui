package main

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
)

type LayedOutElement struct {
	Type               string
	LayoutIndex        int
	Positions          [][]int
	GeneralContentType string
	ID                 string
	Alt                string
	Title              string
	Source             string
	Path               string
	ContentType        string
	Size               uint64
	Dimensions         ortfodb.ImageDimensions
	Duration           uint
	Online             bool
	Attributes         ortfodb.MediaAttributes
	HasSound           bool
	Content            string
	Name               string
	URL                string
}

func Layout(description ortfodb.ParsedDescription, languages []string) (layouts map[string][]LayedOutElement, err error) {
	// Create a stubbed-out WorkOneLang from a ParsedDescription,
	// because LayedOut() needs a WorkOneLang
	// (for good reasons, we need those when actually building the site from the layout,
	// and I won't make two separate .LayedOut(), it's too much of a hassle
	// (looked into it, not feasible without duplicating code))
	layouts = make(map[string][]LayedOutElement)
	for _, language := range languages {
		layout, err := StubOutWorkOneLang(description, language).LayedOut()
		if err != nil {
			return layouts, fmt.Errorf("while laying out work in %s: %w", language, err)
		}
		layouts[language] = make([]LayedOutElement, 0, len(layout))
		for _, element := range layout {
			layouts[language] = append(layouts[language], LayedOutElement{
				Type:               element.Type,
				LayoutIndex:        element.LayoutIndex,
				Positions:          element.Positions,
				GeneralContentType: element.GeneralContentType,
				ID:                 element.ID(),
				Alt:                element.Alt,
				Title:              element.Title(),
				Source:             element.Source,
				Path:               element.Path,
				ContentType:        element.ContentType,
				Size:               element.Size,
				Dimensions:         element.Dimensions,
				Duration:           element.Duration,
				Online:             element.Online,
				Attributes:         element.Attributes,
				HasSound:           element.HasSound,
				Content:            element.Content,
				Name:               element.Name,
				URL:                element.URL,
			})
		}

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
