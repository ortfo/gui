build:
	pnpm frontend-build
	statik -f -src=dist/
	cd backend && go build -o ../ortfo

install:
	mv ortfo ~/.local/bin/

installers:
	just build
	cd installers && ./create.sh

format:
	go mod tidy
	gofmt -s -w .
	prettier --write frontend/** --plugin-search-dir=.

setup:
	pnpm install || yarn install || npm install
	go install github.com/rakyll/statik
	mkdir -p dist/
	statik -f -src=dist/
	go mod tidy

test:
	go test
