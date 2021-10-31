package main

import (
	"fmt"
	"os"

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

	return nil
}

func (settings *Settings) LoadDatabase() (db ortfomk.Database, err error) {
	// Check if projects folder exists
	if _, err = os.Stat(settings.ProjectsFolder); os.IsNotExist(err) {
		return db, fmt.Errorf("projects folder %q does not exist", settings.ProjectsFolder)
	}
	ortfodbConfig := ortfodb.Configuration{}
	err = ortfodb.LoadConfiguration(ConfigurationDirectory("ortfodb.yaml"), &ortfodbConfig)
	if err != nil {
		return db, fmt.Errorf("couldn't load database configuration: %w", err)
	}

	err = ortfodb.Build(
		settings.ProjectsFolder,
		ConfigurationDirectory("portfolio-database", "database.json"),
		ortfodb.Flags{Scattered: true},
		ortfodbConfig,
	)
	if err != nil {
		return db, fmt.Errorf("couldn't build the portfolio's database: %w", err)
	}

	return ortfomk.LoadDatabase(ConfigurationDirectory("portfolio-database"))
}
