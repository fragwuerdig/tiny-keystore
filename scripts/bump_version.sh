#!/bin/bash

VERSION=$(grep -oP '(?<=export const VERSION = ")[^"]+' version.ts)
if [[ -z "$VERSION" ]]; then
  echo "Failed to extract version from version.js"
  exit 1
fi
jq --arg ver "$VERSION" '.version = $ver' package.json > package.tmp.json && mv package.tmp.json package.json
echo "Updated package.json to version $VERSION"
