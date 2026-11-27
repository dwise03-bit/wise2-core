#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
/usr/bin/time -f 'elapsed_seconds=%e peak_memory_kb=%M' python -m unittest discover -s tests -v
