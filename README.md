<center><div align=center>
<img src="./screenshots/home.png" alt="The home page, showing a grid of project cards that you can click to edit the descriptions of">
<h1>A graphical user interface for <a href="https://github.com/ortfo/mk">ortfo</a></h1>
</div></center>

[![time spent on project](https://wakatime.com/badge/github/ortfo/gui.svg)](https://wakatime.com/badge/github/ortfo/gui)

## Installation

### Ubuntu / Debian

.deb archives will be available, starting with the next release.

### Fedora / CentOS

.rpm archives will be available, starting with the next release.

### Arch Linux / Manjaro

The <abbr title="Arch User Repository">AUR</abbr> has 3 ortfo packages:

- **ortfo**  compiles from latest version
- **ortfo-bin** pre-compiled binary of the latest version
- **ortfo-git** compiles from the latest git commit

### Slackware

.tgz archives will be available, starting with the next release.

### AppImage

AppImages will be available, starting with the next release.

### Compiled binaries

See [releases](https://github.com/ortfo/gui/releases)

### From source

#### Requirements

-   [Go](https://go.dev) 1.18 or newer
-   [pnpm](https://pnpm.js.org) (or another node package manager)
-   [git](https://git-scm.com)
-   [make](https://www.gnu.org/software/make/manual/make.html) (You could also run the commands specified in the `build:` section of `Makefile` instead of executing `make`, if you have problems installing it (especially on Windows))

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
