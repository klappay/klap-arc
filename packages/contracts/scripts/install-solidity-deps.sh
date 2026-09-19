#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACTS_DIR="$(dirname "$SCRIPT_DIR")"
LIB_DIR="$CONTRACTS_DIR/lib"

# Plain tarball downloads into a gitignored lib/, never `forge install` —
# `forge install` registers each dep as a real git submodule (.gitmodules +
# a gitlink in the index), which bypasses .gitignore entirely and keeps
# re-staging itself on every future `forge install`, no matter how many
# times it's `git rm --cached`'d. Same reasoning as vendor-contracts.sh's
# own tarball-over-git approach for the vendored 0xSplits source itself.
download() {
  local repo="$1" ref="$2" dest="$3"
  local tmp
  tmp=$(mktemp -d)
  curl -sL "https://codeload.github.com/$repo/tar.gz/$ref" -o "$tmp/pkg.tar.gz"
  tar -xzf "$tmp/pkg.tar.gz" -C "$tmp"
  local extracted
  extracted=$(find "$tmp" -mindepth 1 -maxdepth 1 -type d)
  rm -rf "$LIB_DIR/$dest"
  mv "$extracted" "$LIB_DIR/$dest"
  rm -rf "$tmp"
  echo "  $dest ($repo@$ref)"
}

mkdir -p "$LIB_DIR"
echo "Installing Solidity dependencies (pinned to splits-v2's own versions)..."
download foundry-rs/forge-std v1.16.2 forge-std
download OpenZeppelin/openzeppelin-contracts v4.9.3 openzeppelin-contracts
download vectorized/solady v0.0.156 solady
echo "Done."
