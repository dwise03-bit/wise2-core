#!/usr/bin/env bash
# Deploy jo-credit-os-demo and auth-gateway on the VPS (moved off Vercel).
#
#   cp deploy/jo-auth.env.example deploy/.env.jo-auth   # fill in; the file is git-ignored
#   bash deploy/deploy-jo-auth.sh                       # DRY_RUN=1 prints commands without running them
#
# Only touches the wise2-jo-auth compose project (services jo-credit, auth-gateway).
# Never edits another project's compose file or port mapping.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="deploy/.env.jo-auth"
COMPOSE_FILE="deploy/docker-compose.jo-auth.yml"
NGINX_TEMPLATE="deploy/nginx/jo-auth.conf.template"
DRY_RUN="${DRY_RUN:-0}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

run() {
  if [ "$DRY_RUN" = "1" ]; then echo "+ $*"; else "$@"; fi
}

missing=0
for v in JOCREDIT_DOMAIN AUTH_DOMAIN JWT_SECRET AUTH_DB_HOST AUTH_DB_NAME AUTH_DB_USER AUTH_DB_PASSWORD; do
  if [ -z "${!v:-}" ]; then echo "Missing required setting: $v"; missing=1; fi
done
[ "$missing" = "0" ] || { echo "Set them in $ENV_FILE (see deploy/jo-auth.env.example)."; exit 1; }

for d in "$JOCREDIT_DOMAIN" "$AUTH_DOMAIN"; do
  echo "$d" | grep -qE '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' || { echo "Invalid domain: $d"; exit 1; }
done

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Neither 'docker compose' nor 'docker-compose' is installed."; exit 1
fi
COMPOSE+=(-f "$COMPOSE_FILE")

echo "1/6 Disk space"
df -h / /sdb-disk 2>/dev/null || true

echo "2/6 Port policy"
bash scripts/verify-port-policy.sh >/dev/null && echo "   port policy OK"

echo "3/6 Host ports 3031 and 3032 must be free or already ours"
for port in 3031 3032; do
  if (ss -ltnH 2>/dev/null || true) | awk '{print $4}' | grep -qE "[:.]${port}$"; then
    if ! docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null | grep -E "wise2-(jo-credit|auth-gateway)" | grep -q ":${port}->"; then
      echo "Port $port is in use by something that is not this project. Stopping."; exit 1
    fi
  fi
done
echo "   ports OK"

echo "4/6 Build and start (only jo-credit and auth-gateway)"
run "${COMPOSE[@]}" up -d --build jo-credit auth-gateway

wait_http() {
  local url="$1" tries=45
  while [ "$tries" -gt 0 ]; do
    if curl -fsS -m 5 -o /dev/null "$url"; then return 0; fi
    tries=$((tries - 1)); sleep 2
  done
  return 1
}

echo "5/6 Health checks"
status=0
if [ "$DRY_RUN" = "1" ]; then
  echo "+ wait for http://127.0.0.1:3031/ and http://127.0.0.1:3032/health, then check DB from inside auth-gateway"
else
  wait_http http://127.0.0.1:3031/ && echo "   jo-credit: OK" || { echo "   jo-credit: FAILED"; status=1; }
  wait_http http://127.0.0.1:3032/health && echo "   auth-gateway: OK" || { echo "   auth-gateway: FAILED"; status=1; }
  if docker exec wise2-auth-gateway node -e "
    const { Pool } = require('pg');
    const p = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME,
      user: process.env.DB_USER, password: process.env.DB_PASSWORD, max: 1, connectionTimeoutMillis: 5000 });
    p.query('select 1').then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
  "; then
    echo "   auth-gateway database: OK"
  else
    echo "   auth-gateway database: FAILED (logins will not work; check AUTH_DB_* and that Postgres accepts connections from containers)"
    status=1
  fi
fi

echo "6/6 nginx"
RENDERED="$(mktemp)"
sed -e "s/\${JOCREDIT_DOMAIN}/${JOCREDIT_DOMAIN}/g" -e "s/\${AUTH_DOMAIN}/${AUTH_DOMAIN}/g" "$NGINX_TEMPLATE" > "$RENDERED"
NGINX_STEPS=(
  "sudo cp $RENDERED /etc/nginx/sites-available/jo-auth.conf"
  "sudo ln -sf /etc/nginx/sites-available/jo-auth.conf /etc/nginx/sites-enabled/jo-auth.conf"
  "sudo nginx -t && sudo systemctl reload nginx"
)
if [ "$DRY_RUN" != "1" ] && command -v nginx >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  for step in "${NGINX_STEPS[@]}"; do eval "$step"; done
  echo "   nginx configured"
else
  echo "   Run these (sudo needs a password or nginx is not on this host):"
  for step in "${NGINX_STEPS[@]}"; do echo "     $step"; done
fi

cat <<EOF

Next steps (yours; the script cannot do these):
  1. DNS: point $JOCREDIT_DOMAIN and $AUTH_DOMAIN at this server (Cloudflare or your DNS provider).
  2. TLS:  sudo certbot --nginx -d $JOCREDIT_DOMAIN -d $AUTH_DOMAIN
  3. Verify: curl -I https://$JOCREDIT_DOMAIN   and   curl https://$AUTH_DOMAIN/health
  4. Only after both work: disconnect the wise2-jocredit and auth-gateway projects in the Vercel dashboard.
EOF

exit "$status"
