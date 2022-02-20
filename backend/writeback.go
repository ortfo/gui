package main

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
)

func writeback(settings Settings, work ortfodb.Work) error {
	description, err := ortfodb.ReplicateDescription(work)
	println("Replicated description:", description)
	if err != nil {
		return fmt.Errorf("while replicating description: %w", err)
	}
	expandedProjectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return fmt.Errorf("while expanding home directory in projects path %q: %w", settings.ProjectsFolder, err)
	}

	return ioutil.WriteFile(filepath.Join(expandedProjectsFolder, work.ID, ".portfoliodb", "description.md"), []byte(description), 0644)
}
