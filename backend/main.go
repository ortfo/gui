package main

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
	"github.com/webview/webview"
)

var w webview.WebView

func main() {
	settings, _ := LoadSettings()
	fmt.Printf("Settings: %#v\n", settings)
	go startFilesystemServer(settings.ProjectsFolder)
	startWebview()
}

func startWebview() {
	w = webview.New(true)
	defer w.Destroy()
	w.SetTitle("ortfo")
	w.SetSize(800, 600, webview.HintNone)
	w.Navigate("http://localhost:3000")
	w.Bind("backend__initialize", Initialize)
	w.Bind("backend__settingsRead", func() (Settings, error) {
		return LoadSettings()
	})
	w.Bind("backend__settingsWrite", func(newSettings interface{}) error {
		settings, _ := LoadSettings()
		mapstructure.Decode(newSettings, &settings)
		fmt.Printf("Writing settings %#v\n", settings)
		return SaveSettings(settings)
	})
	w.Bind("backend__quit", func() error {
		println("Quitting...")
		w.Terminate()
		return nil
	})
	w.Bind("backend__databaseRead", func() (ortfomk.Database, error) {
		settings, _ := LoadSettings()
		return settings.LoadDatabase()
		// db, err := settings.LoadDatabase()
		// spew.Dump(db, err)
		// return db, err
	})
	w.Bind("backend__rebuildDatabase", func() error {
		settings, _ := LoadSettings()
		return settings.RebuildDatabase()
	})
	w.Bind("backend__layout", func(workUntyped interface{}) (map[string][]LayedOutElement, error) {
		var description ortfodb.ParsedDescription
		mapstructure.Decode(workUntyped, &description)
		layedout, err := Layout(description)
		if err != nil {
			return nil, fmt.Errorf("while laying out: %w", err)
		}
		return layedout, nil
	})
	w.Bind("backend__writeback", func(description ortfodb.ParsedDescription, workID string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settings: %w", err)
		}

		return Writeback(settings, description, workID)
	})
	w.Bind("backend__saveState", func(stateUntyped interface{}) error {
		var state UIState
		mapstructure.Decode(stateUntyped, &state)
		err := SaveUIState(state)
		if err != nil {
			return fmt.Errorf("while saving UI state: %w", err)
		}
		return nil
	})
	w.Bind("backend__loadState", func() (UIState, error) {
		return LoadUIState()
	})
	w.Run()
}

func Initialize() error {
	err := InitializeConfigurationDirectory()
	if err != nil {
		return err
	}

	settings, err := LoadSettings()
	if err != nil {
		return fmt.Errorf("couldn't save default settings: %w", err)
	}

	err = SaveSettings(settings)
	if err != nil {
		return fmt.Errorf("couldn't save default settings: %w", err)
	}

	err = settings.InitializeDatabase()
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio database: %w", err)
	}

	ortfomk.WarmUp(ortfomk.GlobalData{
		Flags: ortfomk.Flags{
			ProgressFile: ConfigurationDirectory(".progress.json"),
			Silent:       true,
		},
		// TODO make configurable
		OutputDirectory: ConfigurationDirectory("built"),
		// TODO #4 make configurable
		TemplatesDirectory: ConfigurationDirectory("templates"),
		HTTPLinks:          make(map[string][]string),
	})
	return nil
}
