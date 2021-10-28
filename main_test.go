package main

import (
	"fyne.io/fyne/v2/app"
	_ "fyne.io/fyne/v2/test"
)

func initUI() state {
	gui := app.New()
	window := gui.NewWindow("testing")
	state := state{
		ui: ui{
			gui: &gui,
			window: &window,
		},
	}
	return state
}
