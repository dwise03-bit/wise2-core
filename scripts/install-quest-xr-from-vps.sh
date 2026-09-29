#!/usr/bin/env bash
set -euo pipefail

APK="${TMPDIR:-/tmp}/WISE2-XR.apk"
DEVICE="${1:-3497C10H8Q04C0}"
scp dwise@173.208.147.165:/sdb-disk/unity/builds/wise2-xr/WISE2-XR.apk "$APK"
adb -s "$DEVICE" install -r "$APK"
adb -s "$DEVICE" shell am force-stop com.wise2.xrcommandcenter
adb -s "$DEVICE" shell monkey -p com.wise2.xrcommandcenter 1
