package main

import (
	ortfomk "github.com/ortfo/mk"
)

func Layout(work ortfomk.WorkOneLang) (ortfomk.Layout, error) {
	return work.LayedOut()
}
