.PHONY: build

build:
# Build frontend
	pnpm frontend-build
# Gather generated files
	statik -f -src=dist/
# Build backend
	cd backend && go build -o ../ortfo

format:
	go mod tidy
	gofmt -s -w .
	prettier --write frontend/** --plugin-search-dir=.

setup:
# Install frontend dependencies
	pnpm install || yarn install || npm install
# Install backend dependencies
	go mod tidy
# Install the statik tool
	go mod install github.com/rakyll/statik

test:
	go test
