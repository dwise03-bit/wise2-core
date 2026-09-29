#!/usr/bin/env bash
# Cinematic streetwear montage from stills (ffmpeg zoom + crossfades)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="${CJAYS_CINEMATIC_ASSETS:-$HOME/.cursor/projects/Users-danielwise-Projects-wise2-core/assets}"
OUT="${CJAYS_CINEMATIC_OUT:-$ROOT/release/cjays-streetwear-cinematic.mp4}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

command -v ffmpeg >/dev/null || { echo "ffmpeg required" >&2; exit 1; }

IMAGES=(
  "$ASSETS/IMG_2713-ab2a4a90-c8bf-4b5f-8329-63214178a2da.jpg"
  "$ASSETS/IMG_2720-4daaaa4d-c09c-4a9a-9a7c-d6f733e2dee4.jpg"
  "$ASSETS/cjays-streetwear-cinematic-hero.png"
  "$ASSETS/IMG_2723-46a1b939-8b4a-45fb-baf0-3c457f16e67b.jpg"
)

DUR=4.5
FPS=30
FRAMES=$(( ${DUR%.*} * FPS ))
W=1920
H=1080
XFADE=1.0

VF_BASE="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p"
ZOOM="zoompan=z='min(1.0+0.0008*on,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${FRAMES}:s=${W}x${H}:fps=${FPS}"
GRADE="eq=contrast=1.08:brightness=-0.03:saturation=1.12"

mkdir -p "$(dirname "$OUT")"
n=0
for img in "$IMAGES"; do
  [[ -f "$img" ]] || { echo "Missing: $img" >&2; exit 1; }
  ffmpeg -y -hide_banner -loglevel error -loop 1 -i "$img" \
    -vf "${VF_BASE},${ZOOM},${GRADE}" -t "$DUR" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    "$WORK/part_${n}.mp4"
  n=$((n + 1))
done

COUNT=${#IMAGES[@]}
if [[ $COUNT -eq 1 ]]; then
  cp "$WORK/part_0.mp4" "$OUT"
  echo "Built $OUT"
  exit 0
fi

INPUT_ARGS=()
FILTER=""
prev="0:v"
offset=$(awk "BEGIN {print $DUR - $XFADE}")
acc="$offset"

for i in $(seq 1 $((COUNT - 1))); do
  INPUT_ARGS+=(-i "$WORK/part_${i}.mp4")
  out="v${i}"
  FILTER+="[${prev}][${i}:v]xfade=transition=fadeblack:duration=${XFADE}:offset=${acc}[${out}];"
  prev="$out"
  acc=$(awk "BEGIN {print $acc + $DUR - $XFADE}")
done

ffmpeg -y -hide_banner -loglevel error -i "$WORK/part_0.mp4" "${INPUT_ARGS[@]}" \
  -filter_complex "${FILTER%;}" -map "[${prev}]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart "$OUT"

echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
