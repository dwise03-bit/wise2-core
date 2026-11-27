#!/usr/bin/env bash
set -euo pipefail
mkdir -p fixtures
ffmpeg -hide_banner -loglevel error -y -f lavfi -i 'testsrc2=size=640x360:rate=24:duration=36' -f lavfi -i 'sine=frequency=440:sample_rate=44100:duration=36' -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -shortest fixtures/synthetic_36s.mp4
echo 'Synthetic fixture generated. Audio is a tone, NOT speech; cannot test transcription.'
