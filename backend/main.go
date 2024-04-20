package main

import (
	"fmt"
	"os"
	"path/filepath"
	"reflect"

	"github.com/cloudfoundry-attic/jibber_jabber"
	"github.com/davecgh/go-spew/spew"
	"github.com/mitchellh/go-homedir"
	ortfodb "github.com/ortfo/db"
	"github.com/ortfo/tsreflect"
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
var ctx *ortfodb.RunContext
var settings Settings
var Port = randomAvailablePort()

const (
	Version = "0.1.0-alpha.2"
)

func projectsFolder() string {
	result, _ := homedir.Expand(settings.ProjectsFolder)
	return result
}

func main() {
	settings, _ = LoadSettings()
	fmt.Printf("Settings: %#v\n", settings)
	go startFilesystemServer(settings.ProjectsFolder)
	err := startWebview()
	if err != nil {
		fmt.Printf("error: while starting webview: %s", err)
	}
}

func newOrtfoContext() error {
	var err error
	// ortfodbConfig, err := ortfodb.NewConfiguration(ConfigurationDirectory("ortfodb.yaml"))
	ortfodbConfig, err := settings.InitializeOtfodbConfig()
	if err != nil {
		return fmt.Errorf("couldn't load database configuration: %w", err)
	}
	ctx, err = ortfodb.PrepareBuild(projectsFolder(), ConfigurationDirectory("portfolio-database", "database.json"), ortfodb.Flags{
		Scattered:        true,
		Silent:           true,
		ProgressInfoFile: ConfigurationDirectory("progress.jsonl"),
	}, ortfodbConfig)
	if err != nil {
		return fmt.Errorf("while preparing ortfodb build context: %w", err)
	}
	return nil
}

var BackendFunctions = map[string]interface{}{
	"fileserverPort": func() (int, error) {
		return Port, nil
	},
	"getUserLanguage": func() (string, error) {
		return jibber_jabber.DetectLanguage()
	},
	"initialize": Initialize,
	"settingsRead": func() (Settings, error) {
		return settings, nil
	},
	"settingsWrite": func(settings Settings) error {
		return SaveSettings(settings)
	},
	"quit": func() error {
		println("Quitting...")
		w.Terminate()
		return nil
	},
	"databaseRead": func() (ortfodb.Database, error) {
		return settings.LoadDatabase()
	},
	"rebuildDatabase": func() error {
		return settings.RebuildDatabase()
	},
	"rebuildWork": func(workID string) error {
		if workID == "" {
			return fmt.Errorf("workID is empty")
		}
		_, err := ctx.BuildSome(workID, projectsFolder(), ctx.OutputDatabaseFile, ctx.Flags, *ctx.Config)
		return err
	},
	"analyzeMedia": func(workID string, mediaEmbed ortfodb.Media) (ortfodb.Media, error) {
		_, media, _, err := ctx.AnalyzeMediaFile(workID, mediaEmbed)
		if err != nil {
			return ortfodb.Media{}, fmt.Errorf("while analyzing media: %w", err)
		}
		return media, nil
	},
	"writeback": func(description ortfodb.Work, workID string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settings: %w", err)
		}

		return Writeback(settings, description, workID)
	},
	"writeTags": func(tags []ortfodb.Tag) error {
		spew.Dump(tags)
		tagsBytes, err := yaml.Marshal(tags)
		if err != nil {
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "tags.yaml"), tagsBytes, 0644)
	},
	"writeTechnologies": func(technologies []ortfodb.Technology) error {
		tagsBytes, err := yaml.Marshal(technologies)
		if err != nil {
			ErrorToBrowser(fmt.Sprintf("while converting to YAML: %v", err))
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "technologies.yaml"), tagsBytes, 0644)
	},
	"writeExternalSites": func(externalSites []ExternalSite) error {
		sitesBytes, err := yaml.Marshal(externalSites)
		if err != nil {
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "sites.yaml"), sitesBytes, 0644)
	},
	"writeCollection": func(collections []Collection) error {
		collectionsByID := make(map[string]Collection)
		for _, c := range collections {
			collectionsByID[c.ID] = c
		}
		collectionsBytes, err := yaml.Marshal(collectionsByID)
		if err != nil {
			return fmt.Errorf("while converting to YAML: %w", err)
		}

		return os.WriteFile(ConfigurationDirectory("portfolio-database", "collections.yaml"), collectionsBytes, 0644)
	},
	"saveState": func(state UIState) error {
		err := SaveUIState(state)
		if err != nil {
			return fmt.Errorf("while saving UI state: %w", err)
		}
		return nil
	},
	"loadState": func() (UIState, error) {
		settings, err := LoadSettings()
		if err != nil {
			return UIState{}, fmt.Errorf("couldn't load settings: %w", err)
		}

		return settings.LoadUIState()
	},
	"getBuildProgress": func() ortfodb.ProgressInfoEvent {
		settings, _ := LoadSettings()
		return settings.ProgressFile()
	},
	"listDirectory": func(directory string) ([]DirEntry, error) {
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
	},
	"openInBrowser": func(url string) error {
		return open.Start(url)
	},
	"pickFile": func(title string, startIn string, constraint PickFileConstraint, relativeTo string) (picked string, err error) {
		startIn, err = homedir.Expand(startIn)
		if err != nil {
			return
		}
		err = os.MkdirAll(startIn, 0755)
		if err != nil {
			return "", fmt.Errorf("while creating directories for %q: %w", startIn, err)
		}

		fmt.Printf("Starting in %s, with title %q\n", startIn, title)
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
	},
	"deleteWorks": func(workIDs []string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settings: %w", err)
		}
		return settings.DeleteWorks(workIDs)
	},
	"rawDescription": func(workID string) (string, error) {
		settings, err := LoadSettings()
		if err != nil {
			return "", fmt.Errorf("while loading settings: %w", err)
		}
		bytes, err := os.ReadFile(JoinPaths(settings.ProjectsFolder, workID, ".ortfo", "description.md"))
		return string(bytes), err
	},
	"writeRawDescription": func(workID string, content string) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settigns: %w", err)
		}

		return os.WriteFile(JoinPaths(settings.ProjectsFolder, workID, ".ortfo", "description.md"), []byte(content), 0644)
	},
	"clearThumbnails": func() error {
		return os.RemoveAll(ConfigurationDirectory("portfolio-database", "media"))
	},
	"extractColors": func(imagePath string) (colors ortfodb.ColorPalette, err error) {
		return ortfodb.ExtractColors(ConfigurationDirectory("portfolio-database", imagePath))
	},
	"newDir": func(path string) error {
		return os.MkdirAll(path, 0755)
	},
	"newFile": func(path string) error {
		fmt.Println("creating file", path)
		err := os.MkdirAll(filepath.Dir(path), 0755)
		if err != nil {
			return fmt.Errorf("while creating parent directory: %w", err)
		}

		return os.WriteFile(path, []byte{}, 0666)
	},
	"mediaContent": func(path string) (string, error) {
		settings, err := LoadSettings()
		if err != nil {
			return "", fmt.Errorf("while loading media content of %s: %w", path, err)
		}

		absPath := filepath.Join(settings.ProjectsFolder, path)
		fmt.Println("reading contents of file", absPath)
		content, err := os.ReadFile(absPath)
		if err != nil {
			return "", err
		}

		return string(content), nil
	},
}

func startWebview() error {
	typescript := tsreflect.New(tsreflect.ExportEverything())
	typescript.Add(reflect.TypeOf(ortfodb.Work{}))
	typescript.Add(reflect.TypeOf(ortfodb.Tag{}))
	typescript.Add(reflect.TypeOf(ortfodb.Technology{}))
	typescript.Add(reflect.TypeOf(ortfodb.ProgressInfoEvent{}))
	typescript.Add(reflect.TypeOf(DirEntry{}))
	typescript.Add(reflect.TypeOf(UIState{}))
	typescript.Add(reflect.TypeOf(Settings{}))
	typescript.Add(reflect.TypeOf(ortfodb.Media{}))
	typescript.Add(reflect.TypeOf(Collection{}))
	typescript.Add(reflect.TypeOf(ExternalSite{}))
	typescript.Add(reflect.TypeOf(ortfodb.Database{}))

	ortfodb.LogFilePath = ConfigurationDirectory("ortfodb.log")
	ortfodb.PrependDateToLogs = true
	ortfodb.ReleaseBuildLock(ConfigurationDirectory("portfolio-database", "database.json"))
	err := newOrtfoContext()
	if err != nil {
		return err
	}

	w = webview.New(true)
	defer w.Destroy()
	w.SetTitle("ortfo")
	if os.Getenv("DEV") == "yes" {
		w.SetTitle("ortfo [dev]")
	}
	w.SetSize(800, 600, webview.HintMin)
	w.Navigate("http://localhost:" + func() string {
		if os.Getenv("DEV") == "yes" {
			return "3000"
		} else {
			return fmt.Sprintf("%d/index.html", Port)
		}
	}())
	for name, function := range BackendFunctions {
		argslist := ""
		for i := 0; i < reflect.TypeOf(function).NumIn(); i++ {
			if i > 0 {
				argslist += ", "
			}
			argslist += fmt.Sprintf("arg%d", i)
		}
		err := w.Bind(fmt.Sprintf("backend__%s", name), function)
		if err != nil {
			fmt.Printf("error while binding %s: %s\n", name, err)
		} else {
			typescript.AddFunc(reflect.TypeOf(function), name, true, fmt.Sprintf("\t// @ts-ignore backend__* functions are injected by the Go backend\n\treturn backend__%s(%s);", name, argslist))
		}
	}
	wd, _ := os.Getwd()
	os.WriteFile(filepath.Join(wd, "../frontend/backend.generated.ts"), []byte(typescript.DeclarationsTypeScript()), 0644)
	w.Run()
	return nil
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

	_, err = settings.InitializeOtfodbConfig()
	if err != nil {
		return fmt.Errorf("couldn't initialize configuration file: %w", err)
	}

	err = settings.InitializeDatabase()
	if err != nil {
		return fmt.Errorf("couldn't initialize portfolio database: %w", err)
	}

	return nil
}
