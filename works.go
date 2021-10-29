package main

import (
	"fmt"
	"path/filepath"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
	ortfomk "github.com/ortfo/mk"
)

type wrappedWork struct {
	ortfomk.Work
}

type workCard struct {
	title         string
	location      string
	thumbnailPath string
}

func (w wrappedWork) Card(ctx *state) fyne.CanvasObject {
	work := w.Work.InLanguage(ctx.data.defaultWorksLanguage)
	title := work.Title
	location := filepath.Join(ctx.data.projectsRoot, work.ID)
	fmt.Println(location)
	thumbnailSource := strings.TrimPrefix(work.ThumbnailSource(400), "file://")
	thumbnail := canvas.NewImageFromFile(thumbnailSource)
	thumbnail.SetMinSize(fyne.NewSize(220, 320))
	thumbnail.FillMode = canvas.ImageFillContain
	// thumbnail.SetMinSize(fyne.NewSize())
	fmt.Printf("%q\n", filepath.Join(thumbnailSource))

	return container.NewVBox(
		thumbnail,
		widget.NewLabel(title),
		widget.NewLabelWithStyle(location, fyne.TextAlignCenter, widget.RichTextStyleCodeInline.TextStyle),
	)
}

func buildWorksUI(ctx *state) *fyne.Container {
	greetingText := "Good to see you."
	if ctx.data.surname != "" {
		greetingText = fmt.Sprintf("Good to see you, %s.", ctx.data.surname)
	}
	cards := make([]fyne.CanvasObject, 0, len(ctx.data.Works))

	for _, work := range ctx.data.Works {
		cards = append(cards, Margins(wrappedWork{Work: work}.Card(ctx), 50))
	}

	heading := widget.NewLabelWithStyle(greetingText, fyne.TextAlignCenter, fyne.TextStyle{
		Bold: true,
	})
	scrollable := container.NewVScroll(
		container.NewAdaptiveGrid(6, cards...),
	)
	return container.New(
		layout.NewBorderLayout(heading, nil, nil, nil),
		heading, scrollable,
	)
}
