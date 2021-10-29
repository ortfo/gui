package main

import (
    _ "embed"
	"github.com/wailsapp/wails"
)

func basic() string {
	return "World!"
}

//go:embed frontend/public/build/bundle.js
var js string

//go:embed frontend/public/build/bundle.css
var css string

func main() {

	app := wails.CreateApp(&wails.AppConfig{
		MinWidth:  1024,
		MinHeight: 768,
		Resizable: true,
		Title:  "ortfo",
		JS:     js,
		CSS:    css,
		Colour: "#FFF",
	})

	app.Bind(basic)
	app.Run()
}
