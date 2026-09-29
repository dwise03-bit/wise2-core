#!/usr/bin/env bash
# Hot-patch CloudModule into the running production API container.
# Safe to re-run after container recreate (until API image includes CloudModule).
set -euo pipefail

REPO="${REPO:-/home/dwise/wise2-core}"
ENV_FILE="${ENV_FILE:-$REPO/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO/docker-compose.prod.yml}"
CONTAINER="${CONTAINER:-wise2-api}"

cd "$REPO"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-deps --no-build api
  sleep 20
fi

CID="$(docker create wise2-core-api:latest)"
docker cp "$CID:/app/packages/api/dist/app.module.js" /tmp/prod-app.module.js
docker rm "$CID" >/dev/null

python3 - <<'PY'
from pathlib import Path
src = Path("/tmp/prod-app.module.js").read_text()
if "cloud_module_1" not in src:
    needle = 'const billing_module_1 = require("./v1/billing/billing.module");'
    src = src.replace(needle, needle + '\nconst cloud_module_1 = require("./v1/cloud/cloud.module");', 1)
    src = src.replace(
        "billing_module_1.BillingModule,\n",
        "billing_module_1.BillingModule,\n            cloud_module_1.CloudModule,\n",
        1,
    )
Path("/tmp/patched-app.module.js").write_text(src)
PY

docker cp "$REPO/packages/api/dist/v1/cloud" "$CONTAINER:/app/packages/api/dist/v1/"
docker cp "$REPO/packages/api/dist/v1/billing/billing.module.js" "$CONTAINER:/app/packages/api/dist/v1/billing/billing.module.js"
docker cp "$REPO/packages/api/dist/v1/billing/stripe.webhook.js" "$CONTAINER:/app/packages/api/dist/v1/billing/stripe.webhook.js"
docker cp /tmp/patched-app.module.js "$CONTAINER:/app/packages/api/dist/app.module.js"
docker restart "$CONTAINER"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:3010/api/v1/cloud/health" >/dev/null 2>&1; then
    echo "cloud_health:ok"
    exit 0
  fi
  sleep 2
done

echo "cloud_health:timeout" >&2
docker logs "$CONTAINER" --tail 20 >&2
exit 1
