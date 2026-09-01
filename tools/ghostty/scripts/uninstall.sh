#!/usr/bin/env bash
set -eu
remove_block(){ local f="$1"; [ -f "$f" ] || return 0; sed -i '' -e '/# >>> WISE2 GHOSTTY >>>/,/# <<< WISE2 GHOSTTY <<</d' -e '/# >>> WISE2 SHELL >>>/,/# <<< WISE2 SHELL <<</d' "$f" 2>/dev/null || true; }
if [ "${1:-}" = "--restore-backup" ]; then for f in "$HOME/.config/ghostty/config" "$HOME/.zshrc"; do b=$(ls -t "$f.wise2-backup."* 2>/dev/null | head -1 || true); [ -n "$b" ] && cp "$b" "$f"; done; else remove_block "$HOME/.config/ghostty/config"; remove_block "$HOME/.zshrc"; fi
rm -f "$HOME/.local/bin/wise" "$HOME/.config/wise2/ghostty.wise2.conf" "$HOME/.config/wise2/zsh.wise2.zsh"; rm -rf "$HOME/.local/share/wise2-ghostty"; echo 'WISE² removed; config.yaml preserved.'
