#!/usr/bin/env bash
# List WISE² tailnet devices via Tailscale API. Requires TS_API_KEY in environment.
# Never commit API keys. Create at: https://login.tailscale.com/admin/settings/keys
set -euo pipefail

if [ -z "${TS_API_KEY:-}" ]; then
  echo "Set TS_API_KEY (tskey-api-...) in environment or Cursor secrets." >&2
  exit 1
fi

python3 << 'PY'
import json, os, urllib.request

key = os.environ["TS_API_KEY"]
req = urllib.request.Request(
    "https://api.tailscale.com/api/v2/tailnet/-/devices",
    headers={"Accept": "application/json"},
)
# HTTP basic auth: API key as username, empty password
import base64
auth = base64.b64encode(f"{key}:".encode()).decode()
req.add_header("Authorization", f"Basic {auth}")

with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.load(resp)

devices = data.get("devices", [])
print(f"WISE² tailnet devices: {len(devices)}\n")
print(f"{'HOSTNAME':32} {'IP':18} {'ONLINE':8} {'OS':10}")
print("-" * 72)
for d in sorted(devices, key=lambda x: x.get("hostname", "")):
    host = d.get("hostname", "?")[:32]
    ip = (d.get("addresses") or ["?"])[0][:18]
    online = "yes" if d.get("online") else "no"
    os_name = (d.get("os") or "?")[:10]
    print(f"{host:32} {ip:18} {online:8} {os_name:10}")
PY
