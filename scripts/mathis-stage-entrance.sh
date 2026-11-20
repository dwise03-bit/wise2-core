#!/usr/bin/env bash
# Stage the approved Mathis Electric entrance asset in a local WISE² checkout.
# Usage: bash scripts/mathis-stage-entrance.sh /absolute/path/to/entrance.mp4
set -euo pipefail
SOURCE="${1:-}"
if [[ -z "$SOURCE" || ! -f "$SOURCE" ]]; then
  echo "Usage: $0 /path/to/approved-entrance.mp4" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/apps/website/public/mathis/entrance.mp4"
mkdir -p "$(dirname "$DEST")"
if [[ "$SOURCE" != "$DEST" ]]; then
  cp "$SOURCE" "$DEST"
fi
if command -v ffprobe >/dev/null 2>&1; then
  CODEC="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=nw=1:nk=1 "$DEST")"
  if [[ "$CODEC" != "h264" ]]; then
    echo "Unexpected codec: $CODEC; expected H.264" >&2
    exit 1
  fi
fi
test -s "$DEST"
echo "Staged approved video: $DEST"
echo "Size: $(wc -c < "$DEST") bytes"
echo "SHA256: $(sha256sum "$DEST" | awk '{print $1}')"
echo "Note: asset is staged locally; this script does NOT deploy or restart services."
