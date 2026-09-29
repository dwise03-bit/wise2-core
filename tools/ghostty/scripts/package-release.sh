#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
pnpm --dir "$ROOT" test
pnpm --dir "$ROOT" build
mkdir -p "$ROOT/release"
rm -f "$ROOT/release/wise2-ghostty-command-center.zip" "$ROOT/release/wise2-ghostty-command-center.zip.sha256"
(cd "$ROOT/.." && zip -qr "$ROOT/release/wise2-ghostty-command-center.zip" ghostty -x 'ghostty/release/*' 'ghostty/node_modules/*')
test -s "$ROOT/release/wise2-ghostty-command-center.zip"
unzip -t "$ROOT/release/wise2-ghostty-command-center.zip" >/dev/null
shasum -a 256 "$ROOT/release/wise2-ghostty-command-center.zip" > "$ROOT/release/wise2-ghostty-command-center.zip.sha256"
