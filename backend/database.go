package main

import (
	"fmt"
	"os"

	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
)

func (settings *Settings) InitializeDatabase() error {
	err := os.MkdirAll(ConfigurationDirectory("portfolio-database"), 0775)
	if err != nil {
		return fmt.Errorf("couldn't create data directories: %w", err)
	}
	// initialize portfolio database
	err = WriteIfNotExist(ConfigurationDirectory("portfolio-database", "database.json"), []byte("[]"))
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

	return nil
}

func (settings *Settings) LoadDatabase() (db ortfomk.Database, err error) {
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
	return ortfomk.LoadDatabase(ConfigurationDirectory("portfolio-database"))
}

func (settings *Settings) RebuildDatabase() error {
	projectsFolder, err := homedir.Expand(settings.ProjectsFolder)
	if err != nil {
		return fmt.Errorf("while expanding ~: %w", err)
	}
	ortfodbConfig, err := ortfodb.NewConfiguration(ConfigurationDirectory("ortfodb.yaml"), ConfigurationDirectory("portfolio-database"))
	if err != nil {
		return fmt.Errorf("couldn't load database configuration: %w", err)
	}

	err = ortfodb.Build(
		projectsFolder,
		ConfigurationDirectory("portfolio-database", "database.json"),
		ortfodb.Flags{Scattered: true, Silent: true},
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
