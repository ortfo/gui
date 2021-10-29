package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
)

func (ctx *state) buildEditorUI(work wrappedWork) *fyne.Container {
	w := work.InLanguage(ctx.data.defaultWorksLanguage)
	println(w.Title)
	titleInput := widget.NewEntry()
	titleInput.SetPlaceHolder("Title")
	titleInput.SetText(w.Title)

	description := widget.NewMultiLineEntry()
	split := container.NewHSplit(
		container.NewVScroll(
			container.NewVBox(
				titleInput,
			),
		), container.NewVScroll(
			Heading("Metadata", fyne.TextAlignLeading),
		),
	)
	split.Offset = 0.66
	return container.New(layout.NewBorderLayout(nil, nil, nil, nil), split)
}
