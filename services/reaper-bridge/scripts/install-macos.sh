#!/usr/bin/env bash
set -euo pipefail
bridge_dir="$(cd "$(dirname "$0")/.." && pwd)"
launch_dir="$HOME/Library/LaunchAgents"
mkdir -p "$launch_dir"
cat > "$launch_dir/net.wise2.reaper-bridge.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>net.wise2.reaper-bridge</string>
<key>ProgramArguments</key><array><string>/usr/bin/env</string><string>pnpm</string><string>--dir</string><string>$bridge_dir</string><string>start</string></array>
<key>WorkingDirectory</key><string>$bridge_dir</string><key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
</dict></plist>
PLIST
launchctl load -w "$launch_dir/net.wise2.reaper-bridge.plist"
echo "Installed and loaded WISE² REAPER bridge launch agent"
