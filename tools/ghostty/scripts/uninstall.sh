#!/usr/bin/env bash
set -eu
rm -f "$HOME/.local/bin/wise"
rm -rf "$HOME/.local/share/wise2-ghostty"
rm -f "$HOME/.config/wise2/ghostty.wise2.conf" "$HOME/.config/wise2/zsh.wise2.zsh"
echo 'WISE² runtime and generated fragments removed; config.yaml preserved.'
