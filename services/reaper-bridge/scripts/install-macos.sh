#!/usr/bin/env bash
set -euo pipefail
bridge_dir="$(cd "$(dirname "$0")/.." && pwd)"
launch_dir="$HOME/Library/LaunchAgents"
pnpm_bin="$(command -v pnpm)"
node_bin="$(command -v node)"
token="${WISE2_REAPER_BRIDGE_TOKEN:-}"
if [[ -z "$token" ]]; then
  token="$(openssl rand -hex 32)"
fi
pnpm --dir "$bridge_dir" build
mkdir -p "$launch_dir"
plist="$launch_dir/net.wise2.reaper-bridge.plist"
cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>net.wise2.reaper-bridge</string>
<key>ProgramArguments</key><array><string>$node_bin</string><string>$bridge_dir/dist/reaper-bridge/src/server.js</string></array>
<key>EnvironmentVariables</key><dict><key>WISE2_REAPER_BRIDGE_TOKEN</key><string>$token</string></dict>
<key>WorkingDirectory</key><string>$bridge_dir</string><key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
</dict></plist>
PLIST
chmod 600 "$plist"
launchctl unload "$plist" 2>/dev/null || true
launchctl load -w "$plist"
echo "Installed and loaded WISE² REAPER bridge launch agent"
