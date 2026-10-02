#!/usr/bin/env bash
# =============================================================================
# WISE² Hermes client (Surface side) — READ-ONLY probe + honest status.
# Disabled until config is enabled AND a device credential exists.
# Never prints the credential. Never shares JWT_SECRET. No production writes.
#
# Usage:
#   hermes-client.sh status           # human-readable 4-state
#   hermes-client.sh status --json    # machine-readable (Command Center)
# States: CONFIGURED / REACHABLE / AUTHENTICATED / MEMORY — READY iff all true.
# =============================================================================
set -euo pipefail

CONF="${HERMES_CONF:-/opt/wise2/hermes/config/hermes.conf}"

# Defaults (overridden by conf)
HERMES_ENABLED=false
HERMES_BASE_URL=""
HERMES_BRAIN_PREFIX="/brain-api"
HERMES_HEALTH_PATH="/api/health"
HERMES_AUTH_CHECK_PATH="/api/v1/brain-auth/status"
HERMES_MEMORY_PATH="/api/v1/brain-auth/knowledge/graph/stats"
HERMES_DEVICE_ID="wise2-surface"
HERMES_CREDENTIAL_FILE="/opt/wise2/hermes/credentials/device-token"
HERMES_TIMEOUT=4
# shellcheck disable=SC1090
[ -f "$CONF" ] && source "$CONF"

configured=false; reachable=false; authenticated=false; memory=false
detail_configured=""; detail_reachable=""; detail_auth=""; detail_memory=""

# CONFIGURED: enabled + base url set + credential file present & non-empty
if [ "${HERMES_ENABLED,,}" = "true" ] && [ -n "$HERMES_BASE_URL" ]; then
  if [ -s "$HERMES_CREDENTIAL_FILE" ]; then
    configured=true; detail_configured="enabled, endpoint + credential present"
  else
    detail_configured="enabled but credential file missing/empty"
  fi
else
  detail_configured="disabled or endpoint not set (expected until production connection exists)"
fi

base="${HERMES_BASE_URL%/}${HERMES_BRAIN_PREFIX}"

_get() { # _get <path> [bearer]
  local url="$base$1" auth="${2:-}"
  if [ -n "$auth" ]; then
    curl -sS -m "$HERMES_TIMEOUT" -o /dev/null -w '%{http_code}' \
      -H "Authorization: Bearer $auth" "$url" 2>/dev/null || echo 000
  else
    curl -sS -m "$HERMES_TIMEOUT" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000
  fi
}
_get_body() { curl -sS -m "$HERMES_TIMEOUT" ${2:+-H "Authorization: Bearer $2"} "$base$1" 2>/dev/null || true; }

if [ "$configured" = true ]; then
  # REACHABLE: unauthenticated health returns 200
  code=$(_get "$HERMES_HEALTH_PATH")
  if [ "$code" = "200" ]; then reachable=true; detail_reachable="health 200"
  else detail_reachable="health HTTP $code"; fi

  if [ "$reachable" = true ]; then
    tok="$(cat "$HERMES_CREDENTIAL_FILE" 2>/dev/null)"
    # AUTHENTICATED: authed status endpoint returns 200 with device token
    acode=$(_get "$HERMES_AUTH_CHECK_PATH" "$tok")
    if [ "$acode" = "200" ]; then authenticated=true; detail_auth="auth status 200"
    else detail_auth="auth HTTP $acode"; fi
    unset tok
    # MEMORY: health JSON reports mongo connected (preferred) OR authed memory endpoint 200
    body="$(_get_body "$HERMES_HEALTH_PATH")"
    if printf '%s' "$body" | grep -q '"mongo"[[:space:]]*:[[:space:]]*"connected"'; then
      memory=true; detail_memory="mongo connected (health)"
    elif [ "$authenticated" = true ]; then
      tok="$(cat "$HERMES_CREDENTIAL_FILE" 2>/dev/null)"
      mcode=$(_get "$HERMES_MEMORY_PATH" "$tok"); unset tok
      [ "$mcode" = "200" ] && { memory=true; detail_memory="graph stats 200"; } || detail_memory="memory HTTP $mcode"
    else detail_memory="requires auth"; fi
  fi
fi

ready=false
[ "$configured" = true ] && [ "$reachable" = true ] && [ "$authenticated" = true ] && [ "$memory" = true ] && ready=true

if [ "${1:-status}" = "status" ] && [ "${2:-}" = "--json" ]; then
  printf '{"device":"%s","configured":%s,"reachable":%s,"authenticated":%s,"memory":%s,"ready":%s,"note":"%s"}\n' \
    "$HERMES_DEVICE_ID" "$configured" "$reachable" "$authenticated" "$memory" "$ready" "$detail_configured"
else
  yn(){ [ "$1" = true ] && echo "yes" || echo "NO"; }
  echo "WISE² Hermes (device: $HERMES_DEVICE_ID)"
  echo "  CONFIGURED       : $(yn $configured)   ($detail_configured)"
  echo "  REACHABLE        : $(yn $reachable)   (${detail_reachable:-not checked})"
  echo "  AUTHENTICATED    : $(yn $authenticated)   (${detail_auth:-not checked})"
  echo "  MEMORY AVAILABLE : $(yn $memory)   (${detail_memory:-not checked})"
  echo "  ----"
  if [ "$ready" = true ]; then echo "  STATUS: READY"; else echo "  STATUS: NOT READY (HERMES-PRODUCTION-CONNECTION-PENDING)"; fi
fi
