package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
)

func (settings *Settings) InitializeDatabase() error {
	err := os.MkdirAll(ConfigurationDirectory("portfolio-database"), 0775)
	if err != nil {
		return fmt.Errorf("couldn't create data directories: %w", err)
	}
	// initialize portfolio database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "database.json"), []byte("{}"))
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio database file: %w", err)
	}

	// initialize tags database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "tags.yaml"), []byte("[]"))
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio tags database: %w", err)
	}

	// initialize technologies database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "technologies.yaml"), []byte("[]"))
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio technologies database: %w", err)
	}

	// initialize sites database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "sites.yaml"), []byte("[]"))
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio sites database: %w", err)
	}

	// initialize collections database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "collections.yaml"), []byte("{}"))
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio collections database: %w", err)
	}

	return nil
}

func (settings *Settings) LoadDatabase() (db ortfodb.Database, err error) {
	// Check if projects folder exists
	projectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return db, fmt.Errorf("while expanding ~: %w", err)
	}

	if _, err = os.Stat(projectsFolder); os.IsNotExist(err) {
		return db, fmt.Errorf("projects folder %q does not exist", settings.ProjectsFolder)
	}
	if _, err = os.Stat(ConfigurationDirectory("portfolio-database", "database.json")); os.IsNotExist(err) {
		println("Database file does not exist, building...")
		settings.RebuildDatabase()
	}

	println("Not re-building database...")
	return ortfodb.LoadDatabase(ConfigurationDirectory("portfolio-database", "database.json"), true)
}

func (settings *Settings) RebuildDatabase() error {
	os.Chdir(ConfigurationDirectory("portfolio-database"))
	LogToBrowser("Rebuilding database...")
	LogToBrowser(fmt.Sprintf("context is %#v", ctx))
	projectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return fmt.Errorf("while expanding ~: %w", err)
	}
	ortfodbConfig, err := ortfodb.NewConfiguration(ConfigurationDirectory("ortfodb.yaml"))
	if err != nil {
		return fmt.Errorf("couldn't load database configuration: %w", err)
	}

	LogToBrowser("building with ctx %#v", ctx)
	ctx.BuildAll(
		projectsFolder,
		ConfigurationDirectory("portfolio-database", "database.json"),
		ortfodb.Flags{Scattered: true, Silent: true, ProgressInfoFile: ConfigurationDirectory("progress.jsonl")},
		ortfodbConfig,
	)
	if crash := recover(); crash != nil {
		return fmt.Errorf("couldn't build the portfolio's database: unknown error: %#v", crash)
	}
	if err != nil {
		return fmt.Errorf("couldn't build the portfolio's database: %w", err)
	}
	return nil
}

func (settings *Settings) DeleteWorks(ids []string) error {
	var err error
	for _, id := range ids {
		LogToBrowser("Deleting %s", JoinPaths(settings.ProjectsFolder, id, ".ortfo"))
		err = os.RemoveAll(JoinPaths(settings.ProjectsFolder, id, ".ortfo"))
		if err != nil {
			ErrorToBrowser(err.Error())
			return err
		}
	}
	return nil
}

func (settings *Settings) ProgressFile() ortfodb.ProgressInfoEvent {
	var progressFile ortfodb.ProgressInfoEvent
	progressFilePath := ConfigurationDirectory("progress.jsonl")
	if _, err := os.Stat(progressFilePath); os.IsNotExist(err) {
		return progressFile
	}
	raw, err := os.ReadFile(progressFilePath)
	if string(raw) == "" {
		return settings.ProgressFile()
	}
	// keep only the last line
	if err != nil {
		ErrorToBrowser("Couldn't read progress file: %s", err)
		return progressFile
	}
	// Keep only the last line
	lines := strings.Split(string(raw), "\n")
	raw = []byte(lines[len(lines)-2])
	err = json.Unmarshal(raw, &progressFile)
	if err != nil {
		ErrorToBrowser("Couldn't parse progress file: %s. Raw was %q", err, string(raw))
		return progressFile
	}
	return progressFile
}
