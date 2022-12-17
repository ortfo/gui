package main

import (
	"fmt"
	"os"
	"path/filepath"

	ortfodb "github.com/ortfo/db"
)

func Writeback(settings Settings, parsedDescription ortfodb.AnalyzedWork, workID string) error {
	// Put spaces back in metadata properties that should have them.
	// It also removes technical metadata properties that shouldn't be written back.
	// TODO: this behavior should be implemented in ortfo/mk.
	description, err := ortfodb.ReplicateDescription(parsedDescription)
	// println("Replicated description:", description)
	if err != nil {
		return fmt.Errorf("while replicating description: %w", err)
	}
	writeTo := JoinPaths(settings.ProjectsFolder, workID, ".portfoliodb", "description.md")
	err = os.MkdirAll(filepath.Dir(writeTo), 0755)
	if err != nil {
		return fmt.Errorf("couldn't create missing directories: %w", err)
	}

	LogToBrowser("Writing description to %s", writeTo)
	return os.WriteFile(writeTo, []byte(description), 0644)
}
