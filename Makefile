.PHONY: build

build:
	pnpm frontend-build
	statik -f -src=dist/
	cd backend && go build

format:
	go mod tidy
	gofmt -s -w .
	prettier --write frontend/** --plugin-search-dir=.
