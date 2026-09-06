#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TS="$(date +%Y%m%d%H%M%S)"; mkdir -p "$HOME/.local/bin" "$HOME/.local/share/wise2-ghostty" "$HOME/.config/wise2"
NODE_BIN="$(command -v node)"; [ -x /opt/homebrew/bin/node ] && NODE_BIN=/opt/homebrew/bin/node
pnpm --dir "$ROOT" build
for f in "$HOME/.config/ghostty/config" "$HOME/.zshrc"; do [ -f "$f" ] && cp -p "$f" "$f.wise2-backup.$TS" || true; done
rm -rf "$HOME/.local/share/wise2-ghostty/dist"; cp -R "$ROOT/dist" "$HOME/.local/share/wise2-ghostty/"; ln -sfn "$HOME/.local/share/wise2-ghostty/dist/cli.js" "$HOME/.local/bin/wise"; chmod +x "$HOME/.local/bin/wise"
rm -rf "$HOME/.local/share/wise2-ghostty/node_modules"; cp -RL "$ROOT/node_modules" "$HOME/.local/share/wise2-ghostty/"
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
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$HOME/Library/LaunchAgents/com.wise2.api.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wise2.api</string>
  <key>WorkingDirectory</key><string>$(cd "$ROOT/../../packages/api" && pwd)</string>
  <key>ProgramArguments</key><array><string>$NODE_BIN</string><string>dist/main.js</string></array>
  <key>EnvironmentVariables</key><dict><key>NODE_ENV</key><string>development</string><key>API_PORT</key><string>3010</string></dict>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/wise2-api.log</string>
  <key>StandardErrorPath</key><string>/tmp/wise2-api.log</string>
</dict></plist>
EOF
if command -v launchctl >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/com.wise2.api" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.wise2.api.plist" || true
  launchctl kickstart -k "gui/$(id -u)/com.wise2.api" || true
fi
echo 'WISE² installed'; "$HOME/.local/bin/wise" doctor || true
