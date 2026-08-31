#!/usr/bin/env bash
# Add hvac.wise2.net A record via IONOS DNS API.
# Requires: IONOS_API_KEY=publicprefix.secret (in env or /opt/wise2-core/.env on VPS)
set -euo pipefail

if [[ -f /opt/wise2-core/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /opt/wise2-core/.env
  set +a
fi

: "${IONOS_API_KEY:?Set IONOS_API_KEY=publicprefix.secret}"

ZONE_NAME="wise2.net"
TARGET_IP="173.208.147.165"
HOSTNAME="hvac"

ZONE_ID="$(curl -sS -H "X-API-Key: $IONOS_API_KEY" \
  "https://api.hosting.ionos.com/dns/v1/zones?name=$ZONE_NAME" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")"

if [[ -z "$ZONE_ID" ]]; then
  echo "Could not find zone: $ZONE_NAME" >&2
  exit 1
fi

EXISTING="$(curl -sS -H "X-API-Key: $IONOS_API_KEY" \
  "https://api.hosting.ionos.com/dns/v1/zones/$ZONE_ID?records=true" | \
  python3 -c "import sys,json; z=json.load(sys.stdin); recs=z.get('records',[]); print('yes' if any(r.get('name')==\"$HOSTNAME\" and r.get('type')=='A' for r in recs) else 'no')")"

if [[ "$EXISTING" == "yes" ]]; then
  echo "DNS record $HOSTNAME.$ZONE_NAME already exists"
  exit 0
fi

curl -sS -X POST -H "X-API-Key: $IONOS_API_KEY" -H "Content-Type: application/json" \
  "https://api.hosting.ionos.com/dns/v1/zones/$ZONE_ID/records" \
  -d "{\"properties\":{\"name\":\"$HOSTNAME\",\"type\":\"A\",\"content\":\"$TARGET_IP\",\"ttl\":3600,\"enabled\":true}}"

echo "Created A record: $HOSTNAME.$ZONE_NAME -> $TARGET_IP"
