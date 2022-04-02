.PHONY: build

format:
	go mod tidy
	gofmt -s -w .
	prettier --write frontend/** --plugin-search-dir=.
