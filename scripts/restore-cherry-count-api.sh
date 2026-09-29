#!/usr/bin/env bash
# Restore production wise2-api after AiPhoneModule crash loop.
# Cherry Count phone routes use ai_phone_* tables via CherryCountPhoneService
# (no @wise2/ai-phone dependency in the container).
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OWNER_EMAIL="${OWNER_EMAIL:-brianna@briannasboutique.com}"

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Building cherry-count API dist locally..."
cd "${LOCAL_ROOT}/packages/api"
if ! pnpm exec nest build 2>/dev/null; then
  echo "    Full nest build failed; using existing dist/cherry-count if present"
fi
test -f dist/cherry-count/cherry-count.module.js

echo "==> Syncing cherry-count dist + source to server..."
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/packages/api/dist/cherry-count/" \
  "${SERVER}:/tmp/wise2-api-patch/cherry-count/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/packages/api/src/cherry-count/" \
  "${SERVER}:${REPO_ROOT}/packages/api/src/cherry-count/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/scripts/provision-cherry-count.js" \
  "${SERVER}:${REPO_ROOT}/scripts/provision-cherry-count.js"

echo "==> Patching wise2-api container..."
ssh "${SSH_OPTS[@]}" "$SERVER" bash -s <<REMOTE
set -euo pipefail
IMAGE=\$(docker inspect wise2-api --format '{{.Config.Image}}')
echo "Restoring app.module.js from image: \$IMAGE"
docker run --rm --entrypoint cat "\$IMAGE" /app/packages/api/dist/app.module.js > /tmp/app.module.restore.js

python3 - <<'PY'
from pathlib import Path
import re
code = Path('/tmp/app.module.restore.js').read_text()
for needle in [
    'const ai_phone_module_1 = require("./ai-phone/ai-phone.module");\n',
    '            ai_phone_module_1.AiPhoneModule,\n',
]:
    code = code.replace(needle, '')
if 'cherry_count_module_1' not in code:
    code = code.replace(
        'const app_controller_1 = require("./app.controller");',
        'const cherry_count_module_1 = require("./cherry-count/cherry-count.module");\nconst app_controller_1 = require("./app.controller");',
    )
if 'cherry_count_module_1.CherryCountModule' not in code:
    code = re.sub(
        r'(cjays_module_1\.CjaysModule,)\n',
        r'\1            cherry_count_module_1.CherryCountModule,\n',
        code,
        count=1,
    )
Path('/tmp/app.module.patched.js').write_text(code)
print('CherryCount:', 'cherry_count_module_1.CherryCountModule' in code)
print('AiPhone:', 'ai_phone_module_1.AiPhoneModule' in code)
PY

docker cp /tmp/wise2-api-patch/cherry-count/. wise2-api:/app/packages/api/dist/cherry-count/
docker cp /tmp/app.module.patched.js wise2-api:/app/packages/api/dist/app.module.js
docker restart wise2-api
sleep 15

echo "API health:" \$(curl -s -o /dev/null -w "%{http_code}" https://api.wise2.net/api/health)
curl -fsS https://api.wise2.net/api/health | head -c 200; echo
curl -fsS https://api.wise2.net/api/v1/cherry-count/health; echo

echo "-- Prisma generate (ai_phone models)..."
docker exec wise2-api sh -c 'cd /app/packages/db && pnpm exec prisma generate --schema prisma/schema.prisma' 2>&1 | tail -3

echo "-- Provision tenant ${OWNER_EMAIL}..."
docker cp ${REPO_ROOT}/scripts/provision-cherry-count.js wise2-api:/app/provision-cherry-count.js
docker exec -e OWNER_EMAIL="${OWNER_EMAIL}" -w /app wise2-api node provision-cherry-count.js 2>&1 | tail -20
REMOTE

echo ""
echo "Done. Verify: https://api.wise2.net/api/v1/cherry-count/health"
