.PHONY: build

format:
	go mod tidy
	gofmt -s -w .
