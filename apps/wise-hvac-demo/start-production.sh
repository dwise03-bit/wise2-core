#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

export NODE_ENV=production
export PORT="${PORT:-3024}"
# Do not inherit a workstation/server HOSTNAME value; Next treats it as a bind address.
export HOSTNAME="${WISE_HVAC_BIND_HOST:-127.0.0.1}"
exec node server.js
