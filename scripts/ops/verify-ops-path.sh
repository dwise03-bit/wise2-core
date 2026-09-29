#!/usr/bin/env bash
# WISE² — read-only verification of the Discord → relay → bridge control path.
# Runs FROM the MacBook. Changes nothing; every check is a GET.
#
#   bash scripts/ops/verify-ops-path.sh [target-alias]
set -uo pipefail

ALIAS="${1:-wise2-core}"
REGISTRY="${WISE2_RELAY_TARGETS_FILE:-$HOME/.wise2/targets.json}"
RELAY="http://${WISE2_RELAY_HOST:-127.0.0.1}:${WISE2_RELAY_PORT:-4600}"
pass=0; fail=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }
note() { printf '  \033[33m····\033[0m %s\n' "$1"; }

echo "1. Target registry"
if [ ! -f "$REGISTRY" ]; then
  bad "no registry at $REGISTRY  (cp packages/ops-protocol/targets.example.json \"$REGISTRY\")"
else
  ok "registry present"
  mode="$(stat -f '%A' "$REGISTRY" 2>/dev/null || stat -c '%a' "$REGISTRY")"
  [ "$mode" = "600" ] && ok "registry is chmod 600" || bad "registry is chmod $mode — the relay will refuse to start (chmod 600 \"$REGISTRY\")"
  python3 -c "import json,sys; json.load(open('$REGISTRY'))" 2>/dev/null && ok "registry is valid JSON" || bad "registry is not valid JSON"
fi

echo "2. Tailnet reachability"
if ! command -v tailscale >/dev/null; then
  bad "tailscale CLI not found"
else
  tailscale status >/dev/null 2>&1 && ok "tailnet up" || bad "tailnet down (tailscale up)"
  host_line="$(tailscale status 2>/dev/null | grep -v offline | grep -c . || true)"
  note "$host_line peers online"
fi

echo "3. Control bridge on $ALIAS"
base="$(python3 - "$REGISTRY" "$ALIAS" <<'PY' 2>/dev/null
import json, sys
try:
    targets = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
for t in targets:
    if t.get('alias') == sys.argv[2]:
        if t.get('baseUrl'):
            print(t['baseUrl'].rstrip('/'))
        elif t.get('transport') == 'ssh':
            print(f"http://127.0.0.1:{t.get('forwardPort')}")
        else:
            print(f"http://{t.get('address')}:{t.get('controlPort', 3099)}")
        break
PY
)"
if [ -z "$base" ]; then
  bad "no target named '$ALIAS' in the registry"
else
  note "origin resolved from the registry (not printed — it names a private host)"
  if curl -sf --max-time 8 "$base/v1/control/health" >/dev/null 2>&1; then
    ok "bridge health responds"
    # Only meaningful once the bridge answers at all; skipped otherwise so an
    # undeployed bridge reports one honest failure instead of two.
    if curl -s --max-time 8 "$base/v1/control/status" 2>/dev/null | grep -q UNAUTHORIZED; then
      ok "bridge refuses unauthenticated reads"
    else
      bad "bridge did NOT refuse an unauthenticated read — check WISE2_CONTROL_TOKEN"
    fi
  else
    bad "bridge unreachable — deploy it (docker compose -f docker-compose.production.yml up -d control-bridge) and run scripts/ops/setup-ops-ingress.sh on the host"
    note "skipping the bridge auth check until it responds"
  fi
fi

echo "4. Relay"
if curl -sf --max-time 5 "$RELAY/v1/relay/health" >/dev/null 2>&1; then
  ok "relay health responds"
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$RELAY/v1/relay/targets")"
  [ "$code" = "401" ] && ok "relay refuses an unauthenticated request" || bad "relay returned $code for an unauthenticated request (expected 401)"
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -X POST "$RELAY/v1/relay/jobs" -H 'content-type: application/json' -d '{}')"
  [ "$code" = "401" ] && ok "relay refuses an unsigned job" || bad "relay returned $code for an unsigned job (expected 401)"
else
  bad "relay not running (cd services/control-relay && npm start)"
fi

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
