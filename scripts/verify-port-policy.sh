#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
expected='0.0.0.0:3001:3000'
for file in "$ROOT/docker-compose.prod.yml" "$ROOT/docker-compose.stable.yml"; do
  grep -Fq "$expected" "$file" || { echo "Port policy violation: website must use $expected in $file" >&2; exit 1; }
done
echo "Port policy OK: website public port is immutable at 3001."
