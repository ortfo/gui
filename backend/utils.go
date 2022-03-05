package main

import (
	"os"

	ortfodb "github.com/ortfo/db"
)

func WriteIfNotExist(filePath string, data []byte) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		println("Writing file:", filePath)
		return os.WriteFile(filePath, data, 0644)
	}
	return nil
}

func LanguagesIn(description ortfodb.ParsedDescription) (languages []string) {
	languages = make([]string, 0)
	for lang := range description.Title {
		languages = append(languages, lang)
	}
	for lang := range description.Paragraphs {
		languages = append(languages, lang)
	}
	for lang := range description.Footnotes {
		languages = append(languages, lang)
	}
	for lang := range description.Links {
		languages = append(languages, lang)
	}
	for lang := range description.MediaEmbedDeclarations {
		languages = append(languages, lang)
	}
	return
}
