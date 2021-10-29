package main

import (
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
)

// Add margings around an element using a BorderLayout.
// The number of sizes provided follows CSS margin logic, see https://developer.mozilla.org/en-US/docs/Web/CSS/margin.
func Margins(element fyne.CanvasObject, sizes ...float32) *fyne.Container {
	// This is sizes, resolved to exactly four elements, in the same order as layout.NewBorderLayout: top, bottom, left, right.
	lengths := make([]float32, 4)
	switch len(sizes) {
	case 1:
		lengths = []float32{sizes[0], sizes[0], sizes[0], sizes[0]}
	case 2:
		lengths = []float32{sizes[0], sizes[0], sizes[1], sizes[1]}
	case 3:
		lengths = []float32{sizes[0], sizes[2], sizes[1], sizes[1]}
	case 4:
		lengths = []float32{sizes[0], sizes[2], sizes[3], sizes[1]}
	}

	sides := []fyne.CanvasObject{
		Spacer(lengths[0], lengths[0]), Spacer(lengths[1], lengths[1]), Spacer(lengths[2], lengths[2]), Spacer(lengths[3], lengths[3]),
	}

	return container.New(
		layout.NewBorderLayout(sides[0], sides[1], sides[2], sides[3]),
		append(sides, element)...,
	)
}

// Spacer returns a transparent canvas.Rectangle with the specified dimensions.
func Spacer(width float32, height float32) fyne.CanvasObject {
	rect := canvas.NewRectangle(color.Transparent)
	rect.SetMinSize(fyne.NewSize(width, height))
	return rect
}

// Atop is a shortcut to a border layout with top as a top border and main at the center.
func Atop(top, main fyne.CanvasObject) *fyne.Container {
	return container.New(
		layout.NewBorderLayout(top, nil, nil, nil),
		top, main,
	)
}

// Heading returns a canvas.Text with style, font size and alignement of a heading.
// align is an optional parameter to change the alignement. Default is center.
func Heading(text string, align ...fyne.TextAlign) fyne.CanvasObject {
	heading := canvas.NewText(text, color.Opaque)
	heading.TextStyle = fyne.TextStyle{
		Italic: true,
	}
	heading.TextSize = 36
	heading.Alignment = fyne.TextAlignCenter
	if len(align) > 0 {
		heading.Alignment = align[0]
	}
	return heading
}

type TappableCard struct {
	widget.Card
	tapped func()
}

func NewTappableCard(title string, subtitle string, content fyne.CanvasObject, tapped func()) *TappableCard {
	card := &TappableCard{}
	card.ExtendBaseWidget(card)
	card.SetTitle(title)
	card.SetSubTitle(subtitle)
	card.SetContent(content)
	card.tapped = tapped
	return card
}

func (c *TappableCard) Tapped(_ *fyne.PointEvent) {
	c.tapped()
}

func (c *TappableCard) TappedSecondary(_ *fyne.PointEvent) {}
