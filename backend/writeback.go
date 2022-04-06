package main

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
)

func Writeback(settings Settings, parsedDescription ortfodb.ParsedDescription, workID string) error {
	// Put spaces back in metadata properties that should have them.
	// It also removes technical metadata properties that shouldn't be written back.
	// TODO: this behavior should be implemented in ortfo/mk.
	parsedDescription.Metadata = ChangeKeys(parsedDescription.Metadata, map[string]string{
		"madewith": "made with",
		"pagebackground": "page background",
		"layoutproper": "", // empty keys means just delete it.
		"title": "",
	})
	description, err := ortfodb.ReplicateDescription(parsedDescription)
	// println("Replicated description:", description)
	if err != nil {
		return fmt.Errorf("while replicating description: %w", err)
	}
	expandedProjectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return fmt.Errorf("while expanding home directory in projects path %q: %w", settings.ProjectsFolder, err)
	}

	writeTo := filepath.Join(expandedProjectsFolder, workID, ".portfoliodb", "description.md")
	LogToBrowser("Writing description to %s", writeTo)
	return ioutil.WriteFile(writeTo, []byte(description), 0644)
}
