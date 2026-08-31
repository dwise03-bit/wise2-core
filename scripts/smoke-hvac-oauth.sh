#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HVAC_URL="${HVAC_URL:-https://hvac.wise2.net}"
API_URL="${API_URL:-https://wise2.net/api}"
BASE_PATH="/wise-hvac-demo"
REDIRECT_URI="${HVAC_URL}${BASE_PATH}/api/auth/google/callback"

pass=0
fail=0

check() {
  local name="$1"
  shift
  if "$@"; then
    echo "PASS  $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name"
    fail=$((fail + 1))
  fi
}

echo "WISE² HVAC Field Tech OAuth smoke test"
echo "HVAC_URL=$HVAC_URL"
echo "API_URL=$API_URL"
echo "Redirect URI (must be in Google Cloud Console): $REDIRECT_URI"
echo

check "health endpoint" curl -sf "$HVAC_URL$BASE_PATH/api/health" >/dev/null

check "signin page loads" bash -c "test \"\$(curl -sf -o /dev/null -w '%{http_code}' \"$HVAC_URL$BASE_PATH/signin\")\" = '200'"

check "root redirects unauthenticated users to signin" \
  bash -c "curl -sfI \"$HVAC_URL/\" | tr -d '\r' | grep -qi 'location:.*/signin'"

check "field-tech redirects unauthenticated users to signin" \
  bash -c "curl -sfI \"$HVAC_URL$BASE_PATH/field-tech\" | tr -d '\r' | grep -qi 'location:.*/signin'"

check "google authorize redirects to accounts.google.com" \
  bash -c "curl -sfI \"$HVAC_URL$BASE_PATH/api/auth/google/authorize\" | tr -d '\r' | grep -qi 'location:.*accounts\.google\.com'"

check "jobs API rejects unauthenticated requests" \
  test "$(curl -s -o /dev/null -w '%{http_code}' "$HVAC_URL$BASE_PATH/api/field/jobs")" = "401"

check "wise2 oauth exchange endpoint reachable" \
  test "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API_URL/v1/auth/oauth/google/exchange" \
    -H 'Content-Type: application/json' \
    -d '{"code":"invalid","redirectUri":"'"$REDIRECT_URI"'"}')" != "000"

echo
echo "Results: $pass passed, $fail failed"
if [[ "$fail" -gt 0 ]]; then
  exit 1
fi

echo "Manual step: confirm Google OAuth client includes authorized redirect URI:"
echo "  $REDIRECT_URI"
