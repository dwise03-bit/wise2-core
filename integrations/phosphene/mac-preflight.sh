#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then echo "FAIL: run on macOS"; exit 1; fi
echo "== WISE2 PHOSPHENE MAC PREFLIGHT =="
uname -m
if [[ "$(uname -m)" != "arm64" ]]; then echo "FAIL: Apple Silicon required"; exit 1; fi
sw_vers -productVersion
mem=$(sysctl -n hw.memsize)
awk -v m="$mem" 'BEGIN { printf "Unified memory: %.1f GiB\n",m/1073741824; if (m < 16*1073741824) exit 1 }'
echo "Free space on home volume:"
df -h "$HOME"
echo "Existing Phosphene processes:"
pgrep -afil 'phosphene' || true
echo "Existing Phosphene app:"
find /Applications "$HOME/Applications" -maxdepth 2 -iname '*Phosphene*.app' -print 2>/dev/null || true
echo "PREFLIGHT ONLY: no packages installed, no services modified."
