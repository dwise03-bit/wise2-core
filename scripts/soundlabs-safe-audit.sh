#!/usr/bin/env bash
# WISE2 Sound Labs: safe read-only production diagnostics
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "WISE2 SOUND LABS AUDIT $(date -u +%FT%TZ)"
echo "Repository: $ROOT"
echo "Git HEAD: $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "Git status:"
git -C "$ROOT" status --short 2>/dev/null | head -30 || true
echo
echo "Audio prerequisites:"
for x in node npm ffmpeg ffprobe python3 docker; do
 if command -v "$x" >/dev/null 2>&1; then echo "OK $x: $(command -v "$x")"; else echo "MISSING $x"; fi
done
echo
echo "Expected Sound Labs components:"
for f in apps/studio/SOUNDLAB_AUDIO_PROCESSING.md apps/studio/lib/obs/audio/AudioMixing.ts services/sound-labs/README.md packages/api/src/v1/sound-labs/sound-labs.controller.ts apps/sound-labs-ui/MOBILE.md; do
 if [ -f "$ROOT/$f" ]; then echo "PRESENT $f"; else echo "MISSING $f"; fi
done
echo
echo "Bridge and studio manifests:"
find "$ROOT/services/sound-labs" "$ROOT/apps/studio" -maxdepth 3 -name package.json -print 2>/dev/null | head -20
echo
echo "Local HTTP health (no changes):"
for u in http://127.0.0.1:8788/health http://127.0.0.1:3000/health; do
 if command -v curl >/dev/null 2>&1; then
  code=$(curl -sS -m 3 -o /dev/null -w '%{http_code}' "$u" 2>/dev/null || true)
  echo "$u -> ${code:-unreachable}"
 fi
done
echo
echo "Audio smoke test:"
if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
 tmp=$(mktemp /tmp/wise2-soundlab-XXXXXX.wav)
 trap 'rm -f "$tmp"' EXIT
 if ffmpeg -hide_banner -loglevel error -f lavfi -i 'sine=frequency=440:duration=1' -ar 48000 -ac 2 -y "$tmp"; then
  audio_spec=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels -of csv=p=0 "$tmp" 2>/dev/null || true)
  echo "Decoded WAV spec: $audio_spec"
  if [ "$audio_spec" = '48000,2' ]; then
    echo 'PASS local WAV encode/decode'
  else
    echo 'FAIL local WAV encode/decode: expected 48000 Hz stereo'
    exit 1
  fi
 else echo 'FAIL local WAV encode/decode: ffmpeg failed'; exit 1; fi
else echo 'SKIP audio smoke test: ffmpeg/ffprobe unavailable'; fi
echo 'Audit complete. No services restarted, no production files modified.'
