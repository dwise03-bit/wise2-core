#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STASH="$ROOT/.capacitor-stash"
cd "$ROOT"

cleanup() {
  if [[ -d "$STASH/api" && ! -d "$ROOT/app/api" ]]; then
    mv "$STASH/api" "$ROOT/app/api"
  fi
  if [[ -f "$STASH/middleware.ts" && ! -f "$ROOT/middleware.ts" ]]; then
    mv "$STASH/middleware.ts" "$ROOT/middleware.ts"
  fi
  if [[ -d "$STASH/download" && ! -d "$ROOT/app/download" ]]; then
    mv "$STASH/download" "$ROOT/app/download"
  fi
  if [[ -f "$STASH/page.tsx" ]]; then
    mv "$STASH/page.tsx" "$ROOT/app/page.tsx"
  fi
  if [[ -d "$ROOT/.next.server" ]]; then
    rm -rf "$ROOT/.next"
    mv "$ROOT/.next.server" "$ROOT/.next"
  fi
  rm -rf "$STASH"
}

trap cleanup EXIT

rm -rf "$STASH"
mkdir -p "$STASH"
if [[ -d "$ROOT/.next" ]]; then
  rm -rf "$ROOT/.next.server"
  mv "$ROOT/.next" "$ROOT/.next.server"
fi
mv "$ROOT/app/api" "$STASH/api"
mv "$ROOT/middleware.ts" "$STASH/middleware.ts"
if [[ -d "$ROOT/app/download" ]]; then
  mv "$ROOT/app/download" "$STASH/download"
fi
cp "$ROOT/app/page.tsx" "$STASH/page.tsx"
cat > "$ROOT/app/page.tsx" <<'EOF'
'use client';

export { default } from './field-tech/page';
EOF

export CAPACITOR_BUILD=1
export NEXT_PUBLIC_BASE_PATH=""
export NEXT_PUBLIC_HVAC_URL="${NEXT_PUBLIC_HVAC_URL:-https://hvac.wise2.net}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://wise2.net/api}"
export NEXT_PUBLIC_DEMO_MODE="${NEXT_PUBLIC_DEMO_MODE:-false}"

pnpm exec next build

if [[ ! -f "$ROOT/out/index.html" ]]; then
  echo "Native web export did not produce out/index.html" >&2
  exit 1
fi

if grep -q 'hvac.wise2.net/wise-hvac-demo/field-tech' "$ROOT/capacitor.config.json"; then
  echo "capacitor.config.json still points at the live Field Tech website" >&2
  exit 1
fi
