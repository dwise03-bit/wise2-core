#!/usr/bin/env bash
set -euo pipefail

PACKAGE="com.wise2.xrcommandcenter"
DEVICE="${1:-}"

if [[ -n "$DEVICE" ]]; then
  adb -s "$DEVICE" shell monkey -p "$PACKAGE" 1
else
  adb shell monkey -p "$PACKAGE" 1
fi
