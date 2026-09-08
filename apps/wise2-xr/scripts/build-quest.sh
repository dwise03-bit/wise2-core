#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UNITY_BIN="${UNITY_BIN:-/sdb-disk/unity/Hub/Editor/Editor/Unity}"
[[ -x "$UNITY_BIN" ]] || { echo "Unity not found at $UNITY_BIN. Set UNITY_BIN to your Unity executable." >&2; exit 1; }
BUILD_DIR="${WISE2_XR_BUILD_DIR:-/sdb-disk/unity/builds/wise2-xr}"
LOG_DIR="${WISE2_XR_LOG_DIR:-/sdb-disk/unity/logs/wise2-xr}"
mkdir -p "$BUILD_DIR" "$LOG_DIR"
export TMPDIR="${TMPDIR:-/sdb-disk/unity/cache/tmp}"
mkdir -p "$TMPDIR"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export ANDROID_NDK_ROOT="${ANDROID_NDK_ROOT:-$ANDROID_HOME/ndk/27.2.12479018}"
export WISE2_USB_DEV="${WISE2_USB_DEV:-0}"
"$UNITY_BIN" -batchmode -nographics -quit -projectPath "$PROJECT_DIR" -buildTarget Android -executeMethod Wise2.XR.Editor.BuildQuest.PerformBuild -logFile "$LOG_DIR/unity-build.log"
