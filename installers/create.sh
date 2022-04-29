#!/usr/bin/env bash
VERSION=`git describe --tags --abbrev=0 | sed s/^v//`

# Debian
fsorg "version: $VERSION" debian.fsorg --root $(realpath ./ortfo) 
dpkg-deb --build ortfo
rm -r ortfo

# Fedora, Stampede, Slackware
for format in rpm slp tgz; do
	alien --to-$format ortfo.deb 
done

# Gentoo
# TODO

# Alpine Linux
# TODO

# AppImage
fsorg "version: $VERSION" appimage.fsorg --root $(realpath ./ortfo.AppDir)
appimagetool ortfo.AppDir

# Flatpak
# flatpak install flathub org.freedesktop.Platform//21.08 org.freedesktop.Sdk//21.08
# fsorg "version: $VERSION" flatpak.fsorg --root $(realpath .)
# mkdir ortfo flatpak-repo
# flatpak-builder --user --repo=flatpak-repo --force-clean ortfo works.ewen.ortfo.yml
# flatpak-builder build-update-repo flatpak-repo
# rm -r ortfo flatpak-repo
