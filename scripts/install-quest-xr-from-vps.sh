#!/usr/bin/env bash
set -euo pipefail

APK="${TMPDIR:-/tmp}/WISE2-XR.apk"
DEVICE="${1:-}"
scp dwise@173.208.147.165:/sdb-disk/unity/builds/wise2-xr/WISE2-XR.apk "$APK"
if [[ -n "$DEVICE" ]]; then
  adb -s "$DEVICE" install -r "$APK"
  adb -s "$DEVICE" shell monkey -p com.wise2.xrcommandcenter 1
else
  adb install -r "$APK"
  adb shell monkey -p com.wise2.xrcommandcenter 1
fi
