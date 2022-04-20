package main

import (
	"fmt"
	"os"

	"github.com/davecgh/go-spew/spew"
	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
	"github.com/skratchdot/open-golang/open"
	"github.com/sqweek/dialog"
	"github.com/webview/webview"
	"gopkg.in/yaml.v2"
)

type DirEntry struct {
	Name  string
	IsDir bool
	Type  os.FileMode
	Info  os.FileInfo
}

type PickFileConstraint struct {
	Accept string
}

var w webview.WebView

const (
	Port    = "4444"
	Version = "0.1.0-alpha.1"
)

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
	w.SetSize(800, 600, webview.HintMin)
	w.Navigate("http://localhost:" + func() string {
		if os.Getenv("DEV") == "yes" {
			return "3000"
		} else {
			return Port + "/index.html"
		}
	}())
	w.Bind("backend__initialize", Initialize)
	w.Bind("backend__settingsRead", func() (Settings, error) {
		return LoadSettings()
	})
	w.Bind("backend__settingsWrite", func(settings Settings) error {
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
	w.Bind("backend__layout", func(description ortfodb.ParsedDescription) (map[string][]LayedOutElement, error) {
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
	w.Bind("backend__writeTags", func(tags []ortfomk.Tag) error {
		spew.Dump(tags)
		tagsBytes, err := yaml.Marshal(tags)
		if err != nil {
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "tags.yaml"), tagsBytes, 0644)
	})
	w.Bind("backend__writeTechnologies", func(technologies []ortfomk.Technology) error {
		tagsBytes, err := yaml.Marshal(technologies)
		if err != nil {
			ErrorToBrowser(fmt.Sprintf("while converting to YAML: %v", err))
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "technologies.yaml"), tagsBytes, 0644)
	})
	w.Bind("backend__writeExternalSites", func(externalSites []ortfomk.ExternalSite) error {
		tagsBytes, err := yaml.Marshal(externalSites)
		if err != nil {
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "sites.yaml"), tagsBytes, 0644)
	})
	w.Bind("backend__saveState", func(state UIState) error {
		err := SaveUIState(state)
		if err != nil {
			return fmt.Errorf("while saving UI state: %w", err)
		}
		return nil
	})
	w.Bind("backend__loadState", func() (UIState, error) {
		return LoadUIState()
	})
	w.Bind("backend__getBuildProgress", func() ortfomk.ProgressFile {
		settings, _ := LoadSettings()
		return settings.ProgressFile()
	})
	w.Bind("backend__listDirectory", func(directory string) ([]DirEntry, error) {
		expanded, _ := homedir.Expand(directory)
		entries := make([]DirEntry, 0)
		lazyEntries, err := os.ReadDir(expanded)
		if err != nil {
			return entries, fmt.Errorf("while reading directory: %w", err)
		}
		for _, entry := range lazyEntries {
			info, err := entry.Info()
			if err != nil {
				return entries, fmt.Errorf("while reading %q: %w", entry.Name(), err)
			}
			entries = append(entries, DirEntry{
				Name:  entry.Name(),
				IsDir: entry.IsDir(),
				Type:  entry.Type(),
				Info:  info,
			})
		}
		return entries, nil
	})
	w.Bind("backend__openInBrowser", func(url string) error {
		return open.Start(url)
	})
	w.Bind("backend__pickFile", func(title string, startIn string, constraint PickFileConstraint) (string, error) {
		fmt.Printf("Starting in %s, with title %q\n", title, startIn)
		if constraint.Accept == "directory" {
			return dialog.Directory().Title(title).SetStartDir(startIn).Browse()
		} else {
			return dialog.File().Title(title).SetStartDir(startIn).Filter(constraint.Accept).Load()
		}
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
