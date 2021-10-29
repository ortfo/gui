package main

import (
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
)

const (
	tabWorks int = iota
	tabTags
	tabTechnologies
	tabSites
	tabSettings
)

// state holds all the application's state, ui & data.
type state struct {
	data data
	ui   ui
}

// data holds all the data, loaded at the start from the local filesystem
type data struct {
	ortfomk.Database
	currentWork          *ortfomk.Work
	currentTab           int
	surname              string
	projectsRoot         string
	defaultWorksLanguage string
}

// ui holds all the ui state: components that need to be accessed globally, and such.
type ui struct {
	// Global
	gui    *fyne.App
	window *fyne.Window
	navbar *fyne.Container
	main   *fyne.Container

	// Navbar
	publish *widget.Button
	logo    *canvas.Image
	tabbar  *container.AppTabs
	tabs    struct {
		works        *fyne.Container
		tags         *fyne.Container
		technologies *fyne.Container
		sites        *fyne.Container
		preferences  *fyne.Container
	}
}

func (ctx *state) window() fyne.Window {
	return *ctx.ui.window
}

// loadUI loads the user interface
func (ctx *state) loadUI() {
	ctx.ui.publish = widget.NewButton("publish!", ctx.publish)
	switch (*ctx.ui.gui).Settings().ThemeVariant() {
	case theme.VariantDark:
		ctx.ui.logo = canvas.NewImageFromResource(resourceDarkLogoSvg)
	case theme.VariantLight:
		ctx.ui.logo = canvas.NewImageFromResource(resourceLightLogoSvg)

	}

	ctx.ui.tabs.works = buildWorksUI(ctx)
	ctx.ui.tabs.tags = container.NewVBox()
	ctx.ui.tabs.technologies = container.NewVBox()
	ctx.ui.tabs.sites = container.NewVBox()
	ctx.ui.tabs.preferences = container.NewVBox()
	ctx.ui.tabbar = container.NewAppTabs(
		container.NewTabItem("works", container.NewVBox()),
		container.NewTabItem("tags", container.NewVBox()),
		container.NewTabItem("technologies", container.NewVBox()),
		container.NewTabItem("sites", container.NewVBox()),
		container.NewTabItem("preferences", container.NewVBox()),
	)

	ctx.ui.tabbar.OnSelected = func(ti *container.TabItem) {
		switch ti.Text {
		case "works":
			ctx.ui.main = ctx.ui.tabs.works
		case "tags":
			ctx.ui.main = ctx.ui.tabs.tags
		case "technologies":
			ctx.ui.main = ctx.ui.tabs.technologies
		case "sites":
			ctx.ui.main = ctx.ui.tabs.sites
		case "preferences":
			ctx.ui.main = ctx.ui.tabs.preferences
		}
		ctx.ui.refresh()
	}

	ctx.ui.navbar = container.New(
		layout.NewBorderLayout(nil, nil, ctx.ui.logo, ctx.ui.publish),
		ctx.ui.logo,
		ctx.ui.tabbar,
		ctx.ui.publish,
	)

	ctx.ui.logo.SetMinSize(fyne.Size{
		Height: ctx.ui.navbar.MinSize().Height,
		Width:  ctx.ui.navbar.MinSize().Height,
	})

	ctx.ui.tabbar.OnSelected(ctx.ui.tabbar.Selected())
	ctx.ui.refresh()
}

// refresh refreshes the entire UI by re-setting the window's content.
// Best not to call unless necessary.
func (ui *ui) refresh() {
	(*ui.window).SetContent(
		container.New(
			layout.NewBorderLayout(ui.navbar, nil, nil, nil),
			ui.navbar,
			ui.main,
		),
	)
}

type ortfoguiTheme struct {}
var _ fyne.Theme = (*ortfoguiTheme)(nil)

func (t *ortfoguiTheme) Icon(n fyne.ThemeIconName) fyne.Resource {
	return theme.DefaultTheme().Icon(n)
}

func (t *ortfoguiTheme) Color(n fyne.ThemeColorName, v fyne.ThemeVariant) color.Color {
	return theme.DefaultTheme().Color(n, v)
}

// TextFont returns the font resource for the regular font style
func (t *ortfoguiTheme) Font(style fyne.TextStyle) fyne.Resource {
	return theme.DefaultTheme().Font(style)
}

func (t *ortfoguiTheme) Size(s fyne.ThemeSizeName) float32 {
	switch s {
	case theme.SizeNameSeparatorThickness:
		return 1
	case theme.SizeNameInlineIcon:
		return 20
	case theme.SizeNamePadding:
		return 4
	case theme.SizeNameScrollBar:
		return 16
	case theme.SizeNameScrollBarSmall:
		return 3
	case theme.SizeNameText:
		return 14
	case theme.SizeNameHeadingText:
		return 24
	case theme.SizeNameSubHeadingText:
		return 18
	case theme.SizeNameCaptionText:
		return 11
	case theme.SizeNameInputBorder:
		return 2
	default:
		return 0
	}
}

func main() {
	ortfogui := app.New()
	ortfogui.Settings().SetTheme(&ortfoguiTheme{})
	window := ortfogui.NewWindow("ortfo")
	state := state{
		data: data{
			surname: "Ewen",
		},
		ui: ui{
			gui:    &ortfogui,
			window: &window,
		},
	}
	state.data.projectsRoot = "fixtures/works"
	state.data.defaultWorksLanguage = "en"
	state.data.Works = []ortfomk.Work{
		{
			Work: ortfodb.Work{
				ID:    "work-1",
				Title: map[string]string{"en": "Work 1"},
				Media: map[string][]ortfodb.Media{"en": {{
					Path: "work-1/media.png",
				}}},
			},
			Metadata: ortfomk.WorkMetadata{
				Thumbnails: map[string]map[uint16]string{
					"work-1/media.png": {
						300: "work-1/media.png",
					},
				},
			},
		},
		{
			Work: ortfodb.Work{
				ID:    "work-2",
				Title: map[string]string{"default": "Work 2"},
				Media: map[string][]ortfodb.Media{"default": {{
					Path: "work-2/media.png",
				}}},
			},
			Metadata: ortfomk.WorkMetadata{
				Thumbnails: map[string]map[uint16]string{
					"work-2/media.png": {
						300: "work-2/media.png",
					},
				},
			},
		},
	}
	state.loadUI()

	window.ShowAndRun()
}
