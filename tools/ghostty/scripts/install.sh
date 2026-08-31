#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$HOME/.local/bin" "$HOME/.local/share/wise2-ghostty" "$HOME/.config/wise2"
pnpm --dir "$ROOT" build
rm -rf "$HOME/.local/share/wise2-ghostty/dist"
cp -R "$ROOT/dist" "$HOME/.local/share/wise2-ghostty/"
ln -sfn "$HOME/.local/share/wise2-ghostty/dist/cli.js" "$HOME/.local/bin/wise"
chmod +x "$HOME/.local/bin/wise"
[ -e "$HOME/.config/wise2/config.yaml" ] || cp "$ROOT/config/config.example.yaml" "$HOME/.config/wise2/config.yaml"
cp "$ROOT/config/ghostty.wise2.conf" "$HOME/.config/wise2/ghostty.wise2.conf"
cp "$ROOT/config/zsh.wise2.zsh" "$HOME/.config/wise2/zsh.wise2.zsh"
echo 'WISE² installed. Add the managed blocks described in README to Ghostty and .zshrc.'
