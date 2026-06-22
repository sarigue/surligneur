#!/bin/bash
# Usage: ./build.sh [firefox|chrome|all]
# Packages the extension for the given browser into the dist/ directory.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$SCRIPT_DIR/src"
MANIFESTS="$SCRIPT_DIR/manifests"
DIST="$SCRIPT_DIR/dist"
VERSION=$(grep '"version"' "$MANIFESTS/firefox.json" | sed 's/.*"version": "\(.*\)".*/\1/')

build() {
    local BROWSER=$1
    local EXT
    [ "$BROWSER" = "firefox" ] && EXT="xpi" || EXT="zip"
    local OUT="$DIST/surligneur-${BROWSER}-${VERSION}.${EXT}"

    local TMP
    TMP=$(mktemp -d)
    cp -r "$SRC"/. "$TMP/"
    cp "$MANIFESTS/${BROWSER}.json" "$TMP/manifest.json"
    cp "$SCRIPT_DIR/LICENSE" "$TMP/"

    mkdir -p "$DIST"
    (cd "$TMP" && zip -qr "$OUT" .)
    rm -rf "$TMP"

    echo "Built: $OUT"
}

TARGET=${1:-all}
case "$TARGET" in
    firefox) build firefox ;;
    chrome)  build chrome ;;
    all)     build firefox; build chrome ;;
    *) echo "Usage: $0 [firefox|chrome|all]"; exit 1 ;;
esac
