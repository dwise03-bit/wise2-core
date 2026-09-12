#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
BUILD="$ROOT/apps/wise2-xr/Build/WebGL/index.html"

if [[ ! -f "$BUILD" ]]; then
  echo "WebGL build missing. Run: bash ops/unity-vps/build-webgl.sh" >&2
  exit 2
fi

if [[ -z "${WISE2_PREVIEW_BIND:-}" ]]; then
  if command -v tailscale >/dev/null 2>&1; then
    WISE2_PREVIEW_BIND="$(tailscale ip -4 | head -n 1)"
  fi
  export WISE2_PREVIEW_BIND="${WISE2_PREVIEW_BIND:-127.0.0.1}"
fi

export WISE2_PREVIEW_PORT="${WISE2_PREVIEW_PORT:-8097}"
docker compose -f "$HERE/docker-compose.preview.yml" up -d

echo "WISE2 Unity preview: http://${WISE2_PREVIEW_BIND}:${WISE2_PREVIEW_PORT}"
docker compose -f "$HERE/docker-compose.preview.yml" ps
