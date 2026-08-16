#!/usr/bin/env bash
#
# WISE² Paperclip launcher — thin wrapper around the paperclipai CLI.
# Pins to a known version and loads this directory's .env if present.
#
# Usage:
#   ./paperclip.sh onboard      # first-run wizard (stands up embedded Postgres + server)
#   ./paperclip.sh run          # onboard + doctor + start
#   ./paperclip.sh doctor       # diagnose an existing setup
#   ./paperclip.sh org          # org-chart operations
#   ./paperclip.sh --help       # full command list
#
# onboard/run are STATEFUL: they create a local Postgres data directory and a
# long-running server process. Run them in an interactive terminal, not headless.

set -euo pipefail

PAPERCLIP_VERSION="${PAPERCLIP_VERSION:-2026.707.0}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$HERE/.env" ]; then
  # shellcheck disable=SC1091
  set -a; . "$HERE/.env"; set +a
fi

exec npx -y "paperclipai@${PAPERCLIP_VERSION}" "$@"
