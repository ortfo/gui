package main

import (
	"github.com/webview/webview"
)

func main() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("ortfo")
	w.SetSize(800, 600, webview.HintNone)
	w.Navigate("http://localhost:5000")
	w.Run()
}
