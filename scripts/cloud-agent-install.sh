#!/usr/bin/env bash
set -euo pipefail

cd /workspace

corepack enable
pnpm install --frozen-lockfile
pnpm --filter @wise2/db prisma:generate
