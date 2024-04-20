package main

import (
	"fmt"
	"math/rand"
	"net"
	"os"
	"path/filepath"
	"strings"

	"github.com/mitchellh/go-homedir"
)

func prepareQuotedString(message string, a ...interface{}) string {
	return strings.ReplaceAll(fmt.Sprintf(message, a...), "`", "\\`")
}

func LogToBrowser(message string, a ...interface{}) {
	w.Eval("console.info(`[backend] " + prepareQuotedString(message, a...) + "`)")
}
func ErrorToBrowser(message string, a ...interface{}) {
	w.Eval("console.error(`[backend] " + prepareQuotedString(message, a...) + "`)")
}

func WriteIfNotExist(filePath string, data []byte) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		println("Writing file:", filePath)
		return os.WriteFile(filePath, data, 0644)
	}
	return nil
}

func JoinPaths(paths ...string) string {
	result, err := homedir.Expand(filepath.Join(paths...))
	if err != nil {
		ErrorToBrowser("while expanding ~: %s", err)
		return filepath.Join(paths...)
	}
	return result
}

// func LanguagesIn(description ortfodb.ParsedWork) (languages []string) {
// 	languages = make([]string, 0)
// 	for lang := range description.Title {
// 		languages = append(languages, lang)
// 	}
// 	for lang := range description.Paragraphs {
// 		languages = append(languages, lang)
// 	}
// 	for lang := range description.Footnotes {
// 		languages = append(languages, lang)
// 	}
// 	for lang := range description.Links {
// 		languages = append(languages, lang)
// 	}
// 	for lang := range description.MediaEmbedDeclarations {
// 		languages = append(languages, lang)
// 	}
// 	return
// }

// changeKeys changes the entries of m to replace its keys with the new keys described by replaceMap.
// if the new key is the empty string, the corresponding entry is deleted.
func changeKeys[K string, V any](m map[K]V, replaceMap map[K]K) map[K]V {
	for oldKey, value := range m {
		if newKey, ok := replaceMap[oldKey]; ok {
			if newKey != "" {
				m[newKey] = value
			}
			delete(m, oldKey)
		}
	}
	return m
}

func LogExpression[T any](expression T) T {
	fmt.Printf("[[[LOG EXPR]]] %#v", expression)
	return expression
}

func randomAvailablePort() int {
	for {
		port := rand.Intn(65535)
		ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
		if err != nil {
			continue
		}
		ln.Close()
		return port
	}
}
