#!/usr/bin/env bash
# Full-AI mode: install optional ASR, then run the suite including real transcription.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m pip install -r requirements.txt -r requirements-asr.txt -r requirements-dev.txt
python3 -m pytest -ra
