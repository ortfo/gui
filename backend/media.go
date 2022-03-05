package main

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/mitchellh/go-homedir"
)

func GetMedia(path string) (string, error) {
	expandedPath, err := homedir.Expand(path)
	if err != nil {
		return "", fmt.Errorf("while expanding path: %w", err)
	}
	// expandedPath = ConfigurationDirectory("portfolio-media", "media", expandedPath)

	if _, err := os.Stat(expandedPath); os.IsNotExist(err) {
		return "", fmt.Errorf("media file %q does not exist", expandedPath)
	}

	content, err := os.ReadFile(expandedPath)
	if err != nil {
		return "", fmt.Errorf("while reading file: %w", err)
	}

	// extension := strings.Split(expandedPath, ".")[len(expandedPath)-1]

	return "data:image/" + "webp" + ";base64," + base64.StdEncoding.EncodeToString(content), nil

}

// BringOutsideMedia copies media files from outside the media folder to the media folder,
// assuming that the media file belongs to the work with ID belongsTo.
// It returns the path to the media file in the media folder.
func BringOutsideMedia(source string, belongsTo string) (string, error) {
	return "Not implemented yet", fmt.Errorf("not implemented yet")
}
