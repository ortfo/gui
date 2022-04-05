package main

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/mitchellh/go-homedir"
)

type mediaRoot struct {
	projectsRoot string
	databaseRoot string
}

func (m mediaRoot) Open(name string) (http.File, error) {
	name = strings.TrimPrefix(name, "/")
	command, path, _ := strings.Cut(name, "/")
	path = filepath.Clean(path)
	println(path)
	switch command {
	case "projects":
		return http.Dir(m.projectsRoot).Open(path)
	case "database":
		return http.Dir(m.databaseRoot).Open(path)
	}
	ErrorToBrowser("Unknown command: %q", command)
	return nil, fmt.Errorf("unknown command %q", command)
}

func startFilesystemServer(directory string) error {
	expandedPath, _ := homedir.Expand(directory)
	err := http.ListenAndServe(":4444", http.FileServer(mediaRoot{
		projectsRoot: expandedPath,
		databaseRoot: ConfigurationDirectory("portfolio-database"),
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
