package main

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
	"github.com/webview/webview"
)

type layoutElementWithID struct{ortfomk.LayedOutElement; ResolvedID string `json:"id"`}
type layoutWithIDs []layoutElementWithID

func main() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("ortfo")
	w.SetSize(800, 600, webview.HintNone)
	w.Navigate("http://localhost:3000")
	w.Bind("backend__initializeConfigurationDirectory", InitializeConfigurationDirectory)
	w.Bind("backend__settingsRead", func() (Settings, error) {
		return LoadSettings()
	})
	w.Bind("backend__settingsWrite", func(newSettings interface{}) error {
		settings, _ := LoadSettings()
		mapstructure.Decode(newSettings, &settings)
		fmt.Printf("Writing settings %s\n", settings)
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
	w.Bind("backend__getMedia", func(path string) (string, error) {
		return GetMedia(path)
	})
	w.Bind("backend__layout", func(workUntyped interface{}) (layoutWithIDs, error) {
		var work ortfomk.WorkOneLang
		var layoutWithIDs layoutWithIDs
		mapstructure.Decode(workUntyped, &work)
		layedout, err := Layout(work)
		if err != nil {
			return nil, fmt.Errorf("while laying out %s (in %s): %w", work.ID, work.Language, err)
		}
		
		for i := range layedout {
			layoutWithIDs = append(layoutWithIDs, layoutElementWithID{
				LayedOutElement: layedout[i],
				ResolvedID:      layedout[i].ID(),
			})
		}
		return layoutWithIDs, nil
	})
	w.Bind("backend__writeback", func(work ortfodb.Work) error {
		settings, err := LoadSettings()
		if err != nil {
			return fmt.Errorf("while loading settings: %w", err)
		}

		return writeback(settings, work)
	})
	w.Run()
}
