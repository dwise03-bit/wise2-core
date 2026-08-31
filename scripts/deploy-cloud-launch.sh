#!/usr/bin/env bash
# Deploy WISE² Cloud storefront + API to production VPS.
# Does not print secrets. Keeps CLOUD_STOREFRONT_LIVE=false until launch gates pass.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="dwise@173.208.147.165"
REMOTE_REPO="/home/dwise/wise2-core"
LOCAL_ENV="$ROOT/packages/api/.env"
REMOTE_ENV="$REMOTE_REPO/.env.production"

echo "==> Syncing WISE² Cloud code to VPS..."
rsync -az --relative \
  "$ROOT/./apps/website/app/cloud" \
  "$ROOT/./apps/website/components/cloud" \
  "$ROOT/./apps/website/lib/cloud-brand.ts" \
  "$ROOT/./apps/website/lib/wise-api.ts" \
  "$ROOT/./apps/website/public/cloud" \
  "$ROOT/./packages/api/src/v1/cloud" \
  "$ROOT/./packages/api/src/v1/billing/billing.module.ts" \
  "$ROOT/./packages/api/src/v1/billing/stripe.webhook.ts" \
  "$ROOT/./packages/api/src/app.module.ts" \
  "$ROOT/./docker-compose.prod.yml" \
  "$ROOT/./infrastructure/nginx/cloud.wise2.net.conf" \
  "$REMOTE:$REMOTE_REPO/"

echo "==> Merging cloud environment variables into .env.prod (no output)..."
if [[ -f "$LOCAL_ENV" ]]; then
  grep -E '^(CLOUD_|TWENTYI_|STRIPE_CLOUD_)' "$LOCAL_ENV" > /tmp/wise2-cloud-env.fragment || true
  scp -q /tmp/wise2-cloud-env.fragment "$REMOTE:/tmp/wise2-cloud-env.fragment"
  ssh "$REMOTE" "python3 - <<'PY'
from pathlib import Path
fragment = Path('/tmp/wise2-cloud-env.fragment')
env_path = Path('$REMOTE_ENV')
lines = fragment.read_text().splitlines() if fragment.exists() else []
existing = {}
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            existing[k.strip()] = v
for line in lines:
    if '=' not in line:
        continue
    k, v = line.split('=', 1)
    existing[k.strip()] = v
existing.setdefault('CLOUD_STOREFRONT_LIVE', 'false')
existing.setdefault('CLOUD_HOSTING_PROVIDER', 'twentyi')
existing.setdefault('CLOUD_STRIPE_MODE', 'live')
existing.setdefault('CLOUD_BASE_URL', 'https://cloud.wise2.net')
ordered = list(env_path.read_text().splitlines()) if env_path.exists() else []
keys_written = set()
out = []
for line in ordered:
    if '=' in line and not line.startswith('#'):
        k = line.split('=', 1)[0].strip()
        if k in existing:
            out.append(f'{k}={existing[k]}')
            keys_written.add(k)
        else:
            out.append(line)
    else:
        out.append(line)
for k, v in existing.items():
    if k.startswith(('CLOUD_', 'TWENTYI_', 'STRIPE_CLOUD_')) and k not in keys_written:
        out.append(f'{k}={v}')
    if k == 'STRIPE_SECRET_KEY' and k not in keys_written:
        out.append(f'{k}={v}')
env_path.write_text('\\n'.join(out) + '\\n')
PY
rm -f /tmp/wise2-cloud-env.fragment"
  rm -f /tmp/wise2-cloud-env.fragment
else
  echo "WARN: $LOCAL_ENV not found — add CLOUD_* vars to server .env.prod manually"
fi

echo "==> Installing nginx cloud.wise2.net server block..."
ssh "$REMOTE" "sudo cp $REMOTE_REPO/infrastructure/nginx/cloud.wise2.net.conf /etc/nginx/snippets/cloud-wise2.conf 2>/dev/null || true"
ssh "$REMOTE" 'if ! sudo grep -q "cloud.wise2.net" /etc/nginx/sites-enabled/wise2.net 2>/dev/null; then
  sudo tee -a /etc/nginx/sites-enabled/wise2.net > /dev/null <<'"'"'NGINX'"'"'

# WISE² Cloud storefront
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cloud.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net-0001/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/wise2.net-0001/chain.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_read_timeout 90;
    }
}
NGINX
  sudo nginx -t && sudo systemctl reload nginx
fi'

echo "==> Rebuilding API + website containers (this may take several minutes)..."
ssh "$REMOTE" "cd $REMOTE_REPO && docker compose -f docker-compose.prod.yml build api website && docker compose -f docker-compose.prod.yml up -d api website"

echo "==> Health checks..."
ssh "$REMOTE" "sleep 15 && curl -sS -o /dev/null -w 'api_cloud:%{http_code}\n' http://127.0.0.1:3010/api/v1/cloud/health && curl -sS -o /dev/null -w 'website:%{http_code}\n' http://127.0.0.1:3000/cloud"

echo "==> Deploy complete. Storefront remains PRIVATE until CLOUD_STOREFRONT_LIVE=true on server."
