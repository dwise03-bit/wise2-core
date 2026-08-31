#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# Corepack must never block on the interactive "download pnpm?" prompt when it
# runs during a non-interactive Cloud Agent build/install.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Docker (+ fuse-overlayfs) is required by cloud-agent-start.sh to bring up the
# Postgres/Redis stack. The default base image does not ship it, so install it
# here (idempotently) where the filesystem is captured into the environment
# snapshot. The daemon itself is started per-boot by cloud-agent-start.sh.
if ! command -v docker >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update -qq
  # fuse-overlayfs's postinst can exit non-zero in this sandbox even though the
  # binary installs fine, so don't let it abort the whole install.
  sudo apt-get install -y -qq docker.io docker-compose-v2 fuse-overlayfs || true
fi

corepack enable
pnpm install --frozen-lockfile
pnpm --filter @wise2/db prisma:generate
