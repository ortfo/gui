# A graphical user interface for [ortfo](https://github.com/ortfo/mk)
[![time spent on project](https://wakatime.com/badge/github/ortfo/gui.svg)](https://wakatime.com/badge/github/ortfo/gui)

<!-- TODO: screenshots -->

## Installation

### Compiled binaries

See [releases](https://github.com/ortfo/gui/releases)

### From source

#### Requirements

- [Go](https://go.dev) 1.18 or newer
- [pnpm](https://pnpm.js.org) (or another node package manager)
- [git](https://git-scm.com)
- [make](https://www.gnu.org/software/make/manual/make.html) (You could also run the commands specified in the `build:` section of `Makefile` instead of executing `make`, if you have problems installing it (especially on Windows))

#### Commands

```bash
# Clone the repository
git clone https://github.com/ortfo/gui ortfogui
# Go into the repository
cd ortfogui
# Install dependencies
pnpm install
go mod tidy
# Install tools
go download github.com/rakyll/statik
# Build the binary
make
# Make it executable
chmod +x ortfogui
# Run it!
./ortfogui
```
