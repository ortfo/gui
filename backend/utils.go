package main

import "os"

func WriteIfNotExist(filePath string, data []byte) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		println("Writing file:", filePath)
		return os.WriteFile(filePath, data, 0644)
	}
	return nil
}
