#!/usr/bin/env bash

set -euo pipefail

REPO="${REPO:-dwise03-bit/wise2-core}"
SOURCE="${SOURCE:-remote}"
REMOTE_USER="${REMOTE_USER:-dwise}"
REMOTE_HOST="${REMOTE_HOST:-173.208.147.165}"
REMOTE_DIR="${REMOTE_DIR:-/home/dwise/wise2-core}"
ENV_FILE="${ENV_FILE:-.env.production}"
ENV_FILES="${ENV_FILES:-$ENV_FILE .env apps/website/.env.production apps/dashboard/.env.production}"

required_secrets=(
  STRIPE_PUBLIC_KEY
  STRIPE_SECRET_KEY
  STRIPE_STARTER_PRICE_ID
  STRIPE_PRO_PRICE_ID
  STRIPE_WEBHOOK_SECRET
  SENDGRID_API_KEY
  SENDGRID_FROM_EMAIL
  DATABASE_URL
  APP_URL
  API_BASE_URL
)

get_local_value() {
  local key="$1"
  local file
  for file in $ENV_FILES; do
    [ -f "$file" ] || continue
    awk -F= -v key="$key" '
      $0 ~ "^[[:space:]]*#" { next }
      $1 == key {
        sub(/^[^=]*=/, "", $0)
        print $0
        exit
      }
    ' "$file"
  done | sed -n '1p'
}

get_remote_value() {
  local key="$1"
  ssh -o BatchMode=yes -o ConnectTimeout=8 "$REMOTE_USER@$REMOTE_HOST" \
    "cd '$REMOTE_DIR' && for file in $ENV_FILES; do
      [ -f \"\$file\" ] || continue
      awk -F= -v key='$key' '
        \$0 ~ \"^[[:space:]]*#\" { next }
        \$1 == key {
          sub(/^[^=]*=/, \"\", \$0)
          print \$0
          exit
        }
      ' \"\$file\"
    done | sed -n '1p'"
}

if ! command -v gh >/dev/null 2>&1; then
  echo "FAIL gh is not installed or not on PATH"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "FAIL gh is not authenticated; run gh auth login"
  exit 1
fi

echo "Syncing GitHub Actions secrets for $REPO from $SOURCE env files"

for secret in "${required_secrets[@]}"; do
  if [ "$SOURCE" = "remote" ]; then
    value="$(get_remote_value "$secret")"
  else
    value="$(get_local_value "$secret")"
  fi

  if [ -z "$value" ]; then
    echo "MISS $secret"
    continue
  fi

  printf "%s" "$value" | gh secret set "$secret" -R "$REPO" >/dev/null
  echo "OK   $secret"
done

echo "Done. Run scripts/codex-remote-check.sh to verify."
