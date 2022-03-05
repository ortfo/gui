package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

var ThemeNames = [...]string{"dark", "light"}

type Settings struct {
	Theme          string `json:"theme"`
	Surname        string `json:"surname"`
	ProjectsFolder string `json:"projectsFolder"`
	ShowTips       bool   `json:"showTips"`
}

func ConfigurationDirectory(segments ...string) string {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "~/.config/ortfo/"
	}
	path := filepath.Join(configDir, "ortfo")
	for _, segment := range segments {
		path = filepath.Join(path, segment)
	}
	return path
}

func ValidateSettings(settings Settings) error {
	// check if theme name is valid
	for _, themeName := range ThemeNames {
		if themeName == settings.Theme {
			return nil
		}
	}
	return fmt.Errorf("invalid theme name %q, valid theme names are %v", settings.Theme, ThemeNames)
}

func SaveSettings(settings Settings) error {
	// validate
	err := ValidateSettings(settings)
	if err != nil {
		return fmt.Errorf("settings are not valid: %w", err)
	}

	// marshal
	content, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("while turning settings into JSON: %w", err)
	}

	// write to disk
	err = os.WriteFile(ConfigurationDirectory("settings.json"), content, 0644)
	if err != nil {
		return err
	}

	return nil
}

func DefaultSettings() Settings {
	return Settings{Theme: "light"}
}

func LoadSettings() (settings Settings, err error) {
	// check if file exists
	if _, err = os.Stat(ConfigurationDirectory("settings.json")); os.IsNotExist(err) {
		// file does not exist, use default settings
		settings = DefaultSettings()
		err = SaveSettings(settings)
		if err != nil {
			return settings, fmt.Errorf("settings file not found, but couldn't create one with default values: %w", err)
		}
		return
	}

	// load from file
	content, err := os.ReadFile(ConfigurationDirectory("settings.json"))
	if err != nil {
		return Settings{}, err
	}

	// parse
	err = json.Unmarshal(content, &settings)

	return
}

func InitializeConfigurationDirectory() error {
	err := os.MkdirAll(ConfigurationDirectory(), 0775)
	if err != nil {
		return fmt.Errorf("couldn't create configuration directory: %w", err)
	}

	// initialize settings file if it doesn't exist
	err = WriteIfNotExist(ConfigurationDirectory("settings.json"), []byte("{}"))
	if err != nil {
		return fmt.Errorf("couldn't initialize settings file: %w", err)
	}

	err = WriteIfNotExist(ConfigurationDirectory("ortfodb.yaml"), []byte(""))
	if err != nil {
		return fmt.Errorf("couldn't initialize database settings file: %w", err)
	}

	return nil
}
