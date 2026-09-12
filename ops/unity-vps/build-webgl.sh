#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT="$ROOT/apps/wise2-xr"
VERSION_FILE="$PROJECT/ProjectSettings/ProjectVersion.txt"
VERSION="$(awk '/m_EditorVersion:/ {print $2; exit}' "$VERSION_FILE")"
BUILD_DIR="${WISE2_XR_WEBGL_BUILD_DIR:-$PROJECT/Build/WebGL}"
LOG_FILE="${WISE2_UNITY_LOG:-$PROJECT/Build/webgl-build.log}"

find_unity() {
  if [[ -n "${UNITY_EDITOR:-}" && -x "${UNITY_EDITOR}" ]]; then printf '%s\n' "$UNITY_EDITOR"; return; fi
  local candidates=(
    "/opt/unity/editors/$VERSION/Editor/Unity"
    "/opt/Unity/Hub/Editor/$VERSION/Editor/Unity"
    "$HOME/Unity/Hub/Editor/$VERSION/Editor/Unity"
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    [[ -x "$candidate" ]] && { printf '%s\n' "$candidate"; return; }
  done
  command -v unity-editor 2>/dev/null || command -v unity 2>/dev/null || true
}

UNITY="$(find_unity)"
if [[ -z "$UNITY" ]]; then
  echo "Unity $VERSION was not found. Install Unity $VERSION with the Linux Editor and WebGL Build Support module, then set UNITY_EDITOR=/path/to/Editor/Unity." >&2
  exit 2
fi

mkdir -p "$BUILD_DIR" "$(dirname "$LOG_FILE")"
export WISE2_XR_WEBGL_BUILD_DIR="$BUILD_DIR"

echo "WISE2 Unity: $UNITY"
echo "Project: $PROJECT"
echo "WebGL output: $BUILD_DIR"

"$UNITY" -batchmode -nographics -quit \
  -projectPath "$PROJECT" \
  -executeMethod Wise2.XR.Editor.BuildWebGL.PerformBuild \
  -logFile "$LOG_FILE"

test -f "$BUILD_DIR/index.html"
echo "WISE2 WebGL build verified: $BUILD_DIR/index.html"
