#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

deploy="$root/deploy.sh"
workflow="$root/.github/workflows/deploy.yml"

grep -q 'website-only' "$deploy"
grep -q -- '--no-deps website' "$deploy"
grep -q 'DEPLOY_MODE=website-only' "$workflow"
grep -q 'CHANGED_FILES=' "$workflow"
grep -q './deploy.sh "$DEPLOY_MODE"' "$workflow"

echo 'deploy isolation contract OK'