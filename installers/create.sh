#!/usr/bin/env bash
fsorg "version: $(git describe --tags --abbrev=0 | sed s/^v//)" debian.fsorg --root $(realpath ./ortfo) 
dpkg-deb --build ortfo && rm -r ortfo

for format in rpm slp lsb tgz; do
	alien --to-$format ortfo.deb 
done
