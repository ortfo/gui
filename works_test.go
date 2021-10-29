package main

import (
	"testing"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"github.com/alecthomas/assert"
	ortfodb "github.com/ortfo/db"
	ortfomk "github.com/ortfo/mk"
)

func TestWorksGreeting(t *testing.T) {
	state := initUI()

	state.data.surname = "Ewen Le Bihan"
	state.loadUI()
	assert.Equal(t, "Good to see you, Ewen Le Bihan.", state.ui.main.Objects[0].(*widget.Label).Text)

	state.data.surname = ""
	state.loadUI()
	assert.Equal(t, "Good to see you.", state.ui.main.Objects[0].(*widget.Label).Text)
}

func TestWorksGrid(t *testing.T) {
	state := initUI()

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

	// main > scrollable area > adaptative grid
	cards := state.ui.main.Objects[1].(*container.Scroll).Content.(*fyne.Container)

	assert.Equal(t, 2, len(cards.Objects))

	// adaptative grid > margins > vbox
	card1 := cards.Objects[0].(*fyne.Container).Objects[4].(*fyne.Container)
	assert.Equal(t, "fixtures/works/portfolio/media/work-1/media.png", card1.Objects[0].(*canvas.Image).File)
	assert.Equal(t, "Work 1", card1.Objects[1].(*widget.Label).Text)
	assert.Equal(t, "fixtures/works/work-1", card1.Objects[2].(*widget.Label).Text)

	// adaptative grid > margins > vbox
	card2 := cards.Objects[1].(*fyne.Container).Objects[4].(*fyne.Container)
	assert.Equal(t, "fixtures/works/portfolio/media/work-2/media.png", card2.Objects[0].(*canvas.Image).File)
	assert.Equal(t, "Work 2", card2.Objects[1].(*widget.Label).Text)
	assert.Equal(t, "fixtures/works/work-2", card2.Objects[2].(*widget.Label).Text)
}
