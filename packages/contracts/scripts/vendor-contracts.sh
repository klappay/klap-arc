#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACTS_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$CONTRACTS_DIR/vendor-manifest/UPSTREAM.json"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

REPO=$(jq -r '.repo' "$MANIFEST")
COMMIT=$(jq -r '.commit' "$MANIFEST")
SUBPATH=$(jq -r '.subpath' "$MANIFEST")
DEST="$CONTRACTS_DIR/$(jq -r '.vendoredAt' "$MANIFEST" | sed "s|^packages/contracts/||")"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Fetching $REPO @ $COMMIT ($SUBPATH)..."
curl -sL "https://codeload.github.com/$REPO/tar.gz/$COMMIT" -o "$TMP_DIR/src.tar.gz"
tar -xzf "$TMP_DIR/src.tar.gz" -C "$TMP_DIR"

EXTRACTED_ROOT=$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d)
SOURCE_DIR="$EXTRACTED_ROOT/$SUBPATH"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Expected subpath not found at $SOURCE_DIR — did the manifest's subpath or commit change?" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SOURCE_DIR/." "$DEST/"

MISSING=0
while IFS= read -r f; do
  [ -f "$DEST/$f" ] || { echo "Manifest lists $f but it wasn't vendored" >&2; MISSING=1; }
done < <(jq -r '.files[]' "$MANIFEST")

if [ "$MISSING" -eq 1 ]; then
  echo "Vendoring finished with missing files — update vendor-manifest/UPSTREAM.json's file list" >&2
  exit 1
fi

echo "Vendored $(jq -r '.files | length' "$MANIFEST") files from $REPO@${COMMIT:0:7} into $DEST"
