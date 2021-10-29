package main

import (
	"fmt"
	"path/filepath"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
	ortfomk "github.com/ortfo/mk"
)

type wrappedWork struct {
	ortfomk.Work
}

func (w wrappedWork) Card(ctx *state) fyne.CanvasObject {
	work := w.Work.InLanguage(ctx.data.defaultWorksLanguage)
	title := work.Title
	location := filepath.Join(ctx.data.projectsRoot, work.ID)
	thumbnailSource := strings.TrimPrefix(work.ThumbnailSource(400), "file://")
	thumbnail := canvas.NewImageFromFile(thumbnailSource)
	thumbnail.SetMinSize(fyne.NewSize(220, 320))
	thumbnail.FillMode = canvas.ImageFillContain

	card := NewTappableCard(title, location, thumbnail, func() {
		ctx.ui.main = ctx.buildEditorUI(w)
		ctx.ui.refresh()
	})
	return card
}

func buildWorksUI(ctx *state) *fyne.Container {
	greetingText := "Good to see you."
	if ctx.data.surname != "" {
		greetingText = fmt.Sprintf("Good to see you, %s.", ctx.data.surname)
	}

	addWorkButton := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		widget.NewModalPopUp(Atop(
			Heading("Create a new portfolio entry from…"),
			container.NewVBox(),
		), ctx.window().Canvas())
	})
	addWork := widget.NewCard("", "", addWorkButton)

	cards := make([]fyne.CanvasObject, 0, len(ctx.data.Works))
	cards = append(cards, addWork)
	for _, work := range ctx.data.Works {
		cards = append(cards, Margins(wrappedWork{Work: work}.Card(ctx), 20))
	}
	scrollable := container.NewVScroll(
		container.NewAdaptiveGrid(6, cards...),
	)

	return Atop(Heading(greetingText), scrollable)
}
