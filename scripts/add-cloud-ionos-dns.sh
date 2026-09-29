#!/usr/bin/env bash
# Add cloud.wise2.net and my.wise2.net A records via IONOS DNS API.
set -euo pipefail

load_ionos_key() {
  local file key
  for file in /opt/wise2-core/.env /home/dwise/wise2-core/.env /home/dwise/wise2-core/.env.production; do
    [[ -f "$file" ]] || continue
    key="$(grep -m1 '^IONOS_API_KEY=' "$file" 2>/dev/null | cut -d= -f2- | tr -d '"'"'\r'"'"' || true)"
    if [[ -n "$key" ]]; then
      export IONOS_API_KEY="$key"
      return 0
    fi
  done
  return 1
}

if [[ -z "${IONOS_API_KEY:-}" ]]; then
  load_ionos_key || true
fi

: "${IONOS_API_KEY:?Set IONOS_API_KEY=publicprefix.secret (env or .env files on VPS)}"

ZONE_NAME="wise2.net"
TARGET_IP="173.208.147.165"
HOSTS=("cloud" "my")

ZONE_ID="$(curl -sS -H "X-API-Key: $IONOS_API_KEY" \
  "https://api.hosting.ionos.com/dns/v1/zones?name=$ZONE_NAME" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")"

if [[ -z "$ZONE_ID" ]]; then
  echo "Could not find zone: $ZONE_NAME" >&2
  exit 1
fi

for HOSTNAME in "${HOSTS[@]}"; do
  EXISTING="$(curl -sS -H "X-API-Key: $IONOS_API_KEY" \
    "https://api.hosting.ionos.com/dns/v1/zones/$ZONE_ID?records=true" | \
    python3 -c "import sys,json; z=json.load(sys.stdin); recs=z.get('records',[]); print('yes' if any(r.get('name')==\"$HOSTNAME\" and r.get('type')=='A' for r in recs) else 'no')")"

  if [[ "$EXISTING" == "yes" ]]; then
    echo "DNS record $HOSTNAME.$ZONE_NAME already exists"
    continue
  fi

  curl -sS -X POST -H "X-API-Key: $IONOS_API_KEY" -H "Content-Type: application/json" \
    "https://api.hosting.ionos.com/dns/v1/zones/$ZONE_ID/records" \
    -d "{\"properties\":{\"name\":\"$HOSTNAME\",\"type\":\"A\",\"content\":\"$TARGET_IP\",\"ttl\":3600,\"enabled\":true}}"

  echo "Created A record: $HOSTNAME.$ZONE_NAME -> $TARGET_IP"
done
