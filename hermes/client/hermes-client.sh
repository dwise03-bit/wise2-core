#!/usr/bin/env bash
# Existing Hermes client entry point; read-only, no token in process arguments.
set -euo pipefail
WISE2_ROOT="${WISE2_ROOT:-/opt/wise2}"
exec python3 "$WISE2_ROOT/core/cli.py" hermes "$@"
