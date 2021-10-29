.PHONY: build

build:
	which pnpm || wget -qO- https://get.pnpm.io/install.sh | sh -
	pnpm install
	wails build
