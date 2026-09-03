#!/usr/bin/env bash
set -Eeuo pipefail

# Canonical WISE² production deploy. Keep environment-specific compose files
# available, but route production deploys through this script so validation,
# service selection, and smoke tests stay consistent.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
REMOTE_HOST="${REMOTE_HOST:-dwise@173.208.147.165}"
REMOTE_ROOT="${REMOTE_ROOT:-/home/dwise/wise2-core}"

die() { echo "ERROR: $*" >&2; exit 1; }
command -v ssh >/dev/null || die "ssh is required"
command -v git >/dev/null || die "git is required"

cd "$ROOT"
[[ -f "$COMPOSE_FILE" ]] || die "compose file not found: $COMPOSE_FILE"

echo "==> Validating repository state"
git diff --check
git show-ref --verify --quiet refs/remotes/origin/main || die "origin/main is unavailable"

echo "==> Validating production Compose configuration"
docker compose -f "$COMPOSE_FILE" config --quiet

echo "==> Validating HVAC production build locally"
pnpm --filter @wise2/wise-hvac-demo build >/tmp/wise2-hvac-build.log 2>&1 || {
  tail -80 /tmp/wise2-hvac-build.log
  die "HVAC build failed"
}

echo "==> Deploying the exact pushed main revision"
ssh -o BatchMode=yes "$REMOTE_HOST" "set -Eeuo pipefail; cd '$REMOTE_ROOT'; git fetch origin main; git checkout --detach origin/main; sudo -n docker compose -f '$COMPOSE_FILE' build hvac; sudo -n docker compose -f '$COMPOSE_FILE' up -d hvac; sleep 8; test \"\$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3024/wise-hvac-demo/signin)\" = 200"

echo "==> Verifying public customer routes"
for url in \
  "https://wise2.net/wise-hvac-demo/signin" \
  "https://wise2.net/cloud/plans" \
  "https://wise2.net/cloud/status"; do
  code="$(curl -ksS -o /dev/null -w '%{http_code}' "$url")"
  [[ "$code" =~ ^2|^3 ]] || die "$url returned HTTP $code"
  echo "    $code $url"
done

echo "Deployment verified."
