#!/usr/bin/env bash
# Core mode: do not install faster-whisper. AI tests skip.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m pytest -ra
