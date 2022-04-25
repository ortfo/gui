package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

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
	Version = "0.1.0-alpha.2"
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
	w.Bind("backend__layout", func(description ortfodb.ParsedDescription, languages []string) (map[string][]LayedOutElement, error) {
		layedout, err := Layout(description, languages)
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
		settings, err := LoadSettings()
		if err != nil {
			return UIState{}, fmt.Errorf("couldn't load settings: %w", err)
		}

		return settings.LoadUIState()
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
	w.Bind("backend__pickFile", func(title string, startIn string, constraint PickFileConstraint, relativeTo string) (picked string, err error) {
		startIn, err = homedir.Expand(startIn)
		if err != nil {
			return
		}
		err = os.MkdirAll(startIn, 0755)
		if err != nil {
			return "", fmt.Errorf("while creating directories for %q: %w", startIn, err)
		}

		fmt.Printf("Starting in %s, with title %q\n", title, startIn)
		if constraint.Accept == "directory" {
			picked, err = dialog.Directory().Title(title).SetStartDir(startIn).Browse()
		} else {
			picked, err = dialog.File().Title(title).SetStartDir(startIn).Filter(constraint.Accept).Load()
		}
		if err != nil {
			return
		}

		if relativeTo != "" {
			picked, err = filepath.Rel(relativeTo, picked)
		}
		return
	})
	w.Bind("backend__deleteWorks", func(workIDs []string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settings: %w", err)
		}
		return settings.DeleteWorks(workIDs)
	})
	w.Bind("backend__rawDescription", func(workID string) (string, error) {
		settings, err := LoadSettings()
		if err != nil {
			return "", fmt.Errorf("while loading settings: %w", err)
		}
		bytes, err := ioutil.ReadFile(JoinPaths(settings.ProjectsFolder, workID, ".portfoliodb", "description.md"))
		return string(bytes), err
	})
	w.Bind("backend__writeRawDescription", func(workID string, content string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settigns: %w", err)
		}

		return ioutil.WriteFile(JoinPaths(settings.ProjectsFolder, workID, ".portfoliodb", "description.md"), []byte(content), 0644)
	})
	w.Bind("backend__clearThumbnails", func() error {
		return os.RemoveAll(ConfigurationDirectory("portfolio-database", "media"))
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
