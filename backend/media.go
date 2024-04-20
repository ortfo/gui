package main

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/mitchellh/go-homedir"
	statikfs "github.com/rakyll/statik/fs"

	_ "github.com/ortfo/gui/statik"
)

type mediaRoot struct {
	projectsRoot     string
	databaseRoot     string
	staticFileserver http.FileSystem
}

func (m mediaRoot) Open(name string) (http.File, error) {
	name = strings.TrimPrefix(name, "/")
	command, path, _ := strings.Cut(name, "/")
	path = filepath.Clean(path)
	println(command, path)
	switch command {
	case "projects":
		return http.Dir(m.projectsRoot).Open(path)
	case "database":
		return http.Dir(m.databaseRoot).Open(path)
	default:
		return m.staticFileserver.Open("/" + name)
	}
}

func startFilesystemServer(directory string) error {
	fmt.Printf("Starting filesystem server on port %d\n", Port)
	expandedPath, _ := homedir.Expand(directory)
	statikFS, err := statikfs.New()
	if err != nil {
		return fmt.Errorf("while starting resources static server part: %w", err)
	}

	err = http.ListenAndServe(fmt.Sprintf(":%d", Port), http.FileServer(mediaRoot{
		projectsRoot:     expandedPath,
		databaseRoot:     ConfigurationDirectory("portfolio-database"),
		staticFileserver: statikFS,
	}))
	fmt.Println(err.Error())

	return err
}

// BringOutsideMedia copies media files from outside the media folder to the media folder,
// assuming that the media file belongs to the work with ID belongsTo.
// It returns the path to the media file in the media folder.
func BringOutsideMedia(source string, belongsTo string) (string, error) {
	return "Not implemented yet", fmt.Errorf("not implemented yet")
}
