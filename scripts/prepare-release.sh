#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEW_VERSION="${1:-}"

if [[ -z "$NEW_VERSION" ]]; then
  echo "Usage: yarn release:prepare <version>" >&2
  exit 1
fi

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version must use the format x.y.z" >&2
  exit 1
fi

PACKAGE_FILE="$ROOT_DIR/package.json"
PLUGIN_FILE="$ROOT_DIR/smooth-music-gallery.php"
README_FILE="$ROOT_DIR/readme.txt"

CURRENT_VERSION="$(sed -nE "s/^[[:space:]]*\\*[[:space:]]*Version:[[:space:]]*([^[:space:]]+).*$/\\1/p" "$PLUGIN_FILE" | head -n 1)"

if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Could not read current version from $PLUGIN_FILE" >&2
  exit 1
fi

perl -0pi -e 's/"version":\s*"[^"]+"/"version": "'"$NEW_VERSION"'"/' "$PACKAGE_FILE"
perl -0pi -e 's/(\*\s+Version:\s+)[^\s]+/${1}'"$NEW_VERSION"'/g' "$PLUGIN_FILE"
perl -0pi -e "s/const MUSIC_GALLERY_VERSION = '[^']+';/const MUSIC_GALLERY_VERSION = '$NEW_VERSION';/g" "$PLUGIN_FILE"
perl -0pi -e 's/^(Stable tag:\s*).*$/${1}'"$NEW_VERSION"'/m' "$README_FILE"

echo "Updated release version: $CURRENT_VERSION -> $NEW_VERSION"
echo
echo "Next steps:"
echo "1. Review changelog and upgrade notice in readme.txt."
echo "2. Commit the release:"
echo "   git add package.json smooth-music-gallery.php readme.txt"
echo "   git commit -m \"Release $NEW_VERSION\""
echo "3. Push main and create the tag:"
echo "   git push origin main"
echo "   git tag $NEW_VERSION"
echo "   git push origin $NEW_VERSION"
