package main

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
)

func Writeback(settings Settings, parsedDescription ortfodb.ParsedDescription, workID string) error {
	description, err := ortfodb.ReplicateDescription(parsedDescription)
	// println("Replicated description:", description)
	if err != nil {
		return fmt.Errorf("while replicating description: %w", err)
	}
	expandedProjectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return fmt.Errorf("while expanding home directory in projects path %q: %w", settings.ProjectsFolder, err)
	}

	return ioutil.WriteFile(filepath.Join(expandedProjectsFolder, workID, ".portfoliodb", "description.md"), []byte(description), 0644)
}
