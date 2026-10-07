#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cp "$root/deploy.sh" "$tmp/deploy.sh"
mkdir -p "$tmp/deploy/nginx"
touch "$tmp/deploy/nginx/wise2-clipper.conf" "$tmp/HOSTING_SETUP_GUIDE.md" "$tmp/docker-compose.prod.yml"
git -C "$tmp" init -q
git -C "$tmp" config user.name "Deploy preflight test"
git -C "$tmp" config user.email "deploy-preflight@example.invalid"
git -C "$tmp" add .
git -C "$tmp" commit -qm "test baseline"
touch "$tmp/operator-data"

if ! (cd "$tmp" && bash ./deploy.sh </dev/null) >/dev/null; then
  echo "deploy preflight should allow unrelated untracked files" >&2
  exit 1
fi

printf 'tracked change\n' >> "$tmp/docker-compose.prod.yml"
if (cd "$tmp" && printf 'n' | bash ./deploy.sh >/dev/null 2>&1); then
  echo "deploy preflight should still prompt for tracked changes" >&2
  exit 1
fi

echo 'deploy preflight contract OK'
