#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TS="$(date +%Y%m%d%H%M%S)"; mkdir -p "$HOME/.local/bin" "$HOME/.local/share/wise2-ghostty" "$HOME/.config/wise2"
pnpm --dir "$ROOT" build
for f in "$HOME/.config/ghostty/config" "$HOME/.zshrc"; do [ -f "$f" ] && cp -p "$f" "$f.wise2-backup.$TS" || true; done
cp -R "$ROOT/dist" "$HOME/.local/share/wise2-ghostty/"; ln -sfn "$HOME/.local/share/wise2-ghostty/dist/cli.js" "$HOME/.local/bin/wise"; chmod +x "$HOME/.local/bin/wise"
[ -e "$HOME/.config/wise2/config.yaml" ] || { cp "$ROOT/config/config.example.yaml" "$HOME/.config/wise2/config.yaml"; chmod 600 "$HOME/.config/wise2/config.yaml"; }
cp "$ROOT/config/ghostty.wise2.conf" "$HOME/.config/wise2/ghostty.wise2.conf"; cp "$ROOT/config/zsh.wise2.zsh" "$HOME/.config/wise2/zsh.wise2.zsh"
mkdir -p "$HOME/.config/ghostty"; touch "$HOME/.config/ghostty/config"; grep -q '# >>> WISE2 GHOSTTY >>>' "$HOME/.config/ghostty/config" || cat >> "$HOME/.config/ghostty/config" <<'EOF'
# >>> WISE2 GHOSTTY >>>
config-file = ~/.config/wise2/ghostty.wise2.conf
# <<< WISE2 GHOSTTY <<<
EOF
grep -q '# >>> WISE2 SHELL >>>' "$HOME/.zshrc" 2>/dev/null || cat >> "$HOME/.zshrc" <<'EOF'
# >>> WISE2 SHELL >>>
[ -f "$HOME/.config/wise2/zsh.wise2.zsh" ] && source "$HOME/.config/wise2/zsh.wise2.zsh"
# <<< WISE2 SHELL <<<
EOF
echo 'WISE² installed'; "$HOME/.local/bin/wise" doctor || true
