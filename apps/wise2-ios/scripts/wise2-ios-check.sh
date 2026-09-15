#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v xcodebuild >/dev/null 2>&1 || { echo "xcodebuild is required" >&2; exit 1; }
xcodebuild -list -project WISE2.xcodeproj
echo "Available simulators:"
xcrun simctl list devices available | head -15
