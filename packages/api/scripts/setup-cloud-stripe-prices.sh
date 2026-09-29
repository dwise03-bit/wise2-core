#!/usr/bin/env bash
set -euo pipefail

# Create WISE² Cloud Stripe products and monthly prices.
#
# Usage:
#   export STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... / rk_live_...
#   bash packages/api/scripts/setup-cloud-stripe-prices.sh
#
# Or use saved restricted key from .env:
#   cd packages/api && set -a && source .env && set +a && bash scripts/setup-cloud-stripe-prices.sh

if ! command -v stripe >/dev/null 2>&1; then
  echo "Install Stripe CLI first: brew install stripe/stripe-cli/stripe"
  exit 1
fi

API_KEY="${STRIPE_SECRET_KEY:-${STRIPE_LIVE_RESTRICTED_KEY:-}}"
if [[ -z "${API_KEY}" ]]; then
  echo "Set STRIPE_SECRET_KEY or STRIPE_LIVE_RESTRICTED_KEY"
  exit 1
fi

LIVE_FLAG=()
if [[ "${API_KEY}" == sk_live_* || "${API_KEY}" == rk_live_* ]]; then
  LIVE_FLAG=(--live)
  echo "Creating LIVE Stripe prices..."
else
  echo "Creating TEST Stripe prices..."
fi

create_plan() {
  local slug="$1"
  local name="$2"
  local amount="$3"
  local description="$4"

  local product_id
  product_id="$(stripe products create "${LIVE_FLAG[@]}" \
    --api-key "${API_KEY}" \
    --name "WISE² Cloud ${name}" \
    --description "${description}" \
    -d "metadata[product]=cloud" \
    -d "metadata[planId]=${slug}" \
    --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')"

  local price_id
  price_id="$(stripe prices create "${LIVE_FLAG[@]}" \
    --api-key "${API_KEY}" \
    --product "${product_id}" \
    --unit-amount "${amount}" \
    --currency usd \
    -d "recurring[interval]=month" \
    -d "metadata[product]=cloud" \
    -d "metadata[planId]=${slug}" \
    --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')"

  local env_key
  env_key="$(echo "STRIPE_CLOUD_${slug}_PRICE_ID" | tr '[:lower:]' '[:upper:]')"
  echo "${env_key}=${price_id}"
}

echo "# Add these to packages/api/.env and production secrets"
create_plan starter "Starter" 1900 "WISE² Cloud Starter hosting ($19/mo)"
create_plan business "Business" 3900 "WISE² Cloud Business hosting ($39/mo)"
create_plan pro "Pro" 5900 "WISE² Cloud Pro hosting ($59/mo)"

echo ""
echo "# Production webhook endpoint:"
echo "https://api.wise2.net/api/v1/billing/webhook"
echo ""
echo "# Local webhook forwarding:"
echo "stripe listen --forward-to localhost:3010/api/v1/billing/webhook"
