#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UNITY_BIN="${UNITY_BIN:-/sdb-disk/unity/Hub/Editor/Editor/Unity}"
[[ -x "$UNITY_BIN" ]] || { echo "Unity not found at $UNITY_BIN. Set UNITY_BIN to your Unity executable." >&2; exit 1; }
mkdir -p "$PROJECT_DIR/Build"
"$UNITY_BIN" -batchmode -nographics -quit -projectPath "$PROJECT_DIR" -buildTarget Android -executeMethod Wise2.XR.Editor.BuildQuest.PerformBuild -logFile "$PROJECT_DIR/Build/unity-build.log"
