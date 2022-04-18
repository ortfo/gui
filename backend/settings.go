package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

var ThemeNames = [...]string{"dark", "light"}

type Settings struct {
	Theme              string   `json:"theme"`
	Surname            string   `json:"surname"`
	ProjectsFolder     string   `json:"projectsFolder"`
	ShowTips           bool     `json:"showTips"`
	Language           string   `json:"language"`
	PortfolioLanguages []string `json:"portfolioLanguages"`
}

type UIState struct {
	OpenTab                string         `json:"openTab"`
	RebuildingDatabase     bool           `json:"rebuildingDatabase"`
	EditingWorkID          string         `json:"editingWorkID"`
	Lang                   string         `json:"lang"`
	MetadataPaneSplitRatio float64        `json:"metadataPaneSplitRatio"`
	ScrollPositions        map[string]int `json:"scrollPositions"`
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
	return Settings{Theme: "light", Language: "en", PortfolioLanguages: []string{"en"}}
}

func DefaultUIState() UIState {
	return UIState{
		OpenTab:                "works",
		Lang:                   "en",
		MetadataPaneSplitRatio: 0.333333333,
		ScrollPositions: map[string]int{
			"works":        0,
			"editor":       0,
			"tags":         0,
			"sites":        0,
			"technologies": 0,
			"settings":     0,
		},
	}
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

	err = WriteIfNotExist(ConfigurationDirectory("ortfodb.yaml"), []byte(""))
	if err != nil {
		return fmt.Errorf("couldn't initialize database settings file: %w", err)
	}

	return nil
}

func SaveUIState(settings UIState) error {
	// marshal
	content, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("while turning settings into JSON: %w", err)
	}

	// write to disk
	err = os.WriteFile(ConfigurationDirectory("ui_state.json"), content, 0644)
	if err != nil {
		return err
	}

	return nil
}

func LoadUIState() (state UIState, err error) {
	// check if file exists
	if _, err = os.Stat(ConfigurationDirectory("ui_state.json")); os.IsNotExist(err) {
		// file does not exist, use default settings
		state = DefaultUIState()
		err = SaveUIState(state)
		if err != nil {
			return state, fmt.Errorf("UI state file not found, but couldn't create one with default values: %w", err)
		}
		return
	}

	// load from file
	content, err := os.ReadFile(ConfigurationDirectory("ui_state.json"))
	if err != nil {
		return state, err
	}

	// parse
	err = json.Unmarshal(content, &state)
	if err != nil {
		// UI state is not user-editable, so when ortfo upgrades and the UI state schema changes,
		// it isn't the user's responsability to fix it (as the change does not constitute a breaking change).
		// Therefore we have to ighore errors, and discard UI state after an upgrade, if it fails.
		// It won't result in any significant data loss anyways.
		return DefaultUIState(), nil
	}

	return
}
