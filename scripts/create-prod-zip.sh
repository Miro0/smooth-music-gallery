#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_SLUG="smooth-music-gallery"
PLUGIN_MAIN_FILE="$ROOT_DIR/${PLUGIN_SLUG}.php"
ZIPS_DIR="$ROOT_DIR/zips"

if [[ ! -f "$PLUGIN_MAIN_FILE" ]]; then
  echo "Missing plugin bootstrap file: $PLUGIN_MAIN_FILE" >&2
  exit 1
fi

VERSION="$(sed -nE "s/^[[:space:]]*\\*[[:space:]]*Version:[[:space:]]*([^[:space:]]+).*$/\\1/p" "$PLUGIN_MAIN_FILE" | head -n 1)"

if [[ -z "$VERSION" ]]; then
  echo "Could not read plugin version from: $PLUGIN_MAIN_FILE" >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/build" ]]; then
  echo "Missing build directory. Run 'yarn build' first." >&2
  exit 1
fi

mkdir -p "$ZIPS_DIR"

ZIP_NAME="${PLUGIN_SLUG}-${VERSION}.zip"
ZIP_PATH="$ZIPS_DIR/$ZIP_NAME"
TMP_DIR="$(mktemp -d)"
STAGE_DIR="$TMP_DIR/$PLUGIN_SLUG"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$STAGE_DIR"

cp "$PLUGIN_MAIN_FILE" "$STAGE_DIR/"
cp "$ROOT_DIR/readme.txt" "$STAGE_DIR/"
cp "$ROOT_DIR/config.json" "$STAGE_DIR/"
cp -R "$ROOT_DIR/build" "$STAGE_DIR/"

if [[ -d "$ROOT_DIR/languages" ]]; then
  cp -R "$ROOT_DIR/languages" "$STAGE_DIR/"
fi

rm -f "$ZIP_PATH"
(
  cd "$TMP_DIR"
  zip -r -q "$ZIP_PATH" "$PLUGIN_SLUG"
)

echo "Created: $ZIP_PATH"
