package main

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
	"github.com/webview/webview"
)

func main() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("ortfo")
	w.SetSize(800, 600, webview.HintNone)
	w.Navigate("http://localhost:5000")
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
	w.Run()
}
