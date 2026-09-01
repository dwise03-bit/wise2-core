#!/usr/bin/env bash
# Deploy CJAYS REKON APK, payment return page, and nginx routes to wise2.net
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CJAYS_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${CJAYS_DEPLOY_HOST:-dwise@173.208.147.165}"

echo "==> Sync payment return page"
ssh "$HOST" 'mkdir -p /var/www/html/cjays /var/www/html/downloads'
scp "$CJAYS_ROOT/public/payment-return.html" "$HOST:/var/www/html/cjays/payment-return.html"

if [[ "${SKIP_APK:-}" != "1" ]]; then
  APK="$CJAYS_ROOT/release/cjays-debug.apk"
  if [[ ! -f "$APK" ]]; then
    echo "Building debug APK..."
    "$CJAYS_ROOT/scripts/build-cjays-android.sh" debug
  fi
  echo "==> Upload APK"
  scp "$APK" "$HOST:/var/www/html/downloads/CJAYS.apk"
fi

echo "==> Patch nginx (cjays routes)"
ssh "$HOST" 'python3 - <<'"'"'PY'"'"'
from pathlib import Path
import re

paths = list(Path("/etc/nginx/sites-enabled").glob("wise2.net*"))
paths = [p for p in paths if p.is_file() and "bak" not in p.name]
if not paths:
    raise SystemExit("wise2.net nginx config not found")

block = """
    # CJAYS REKON — Stripe return + APK download
    location = /cjay/payment {
        alias /var/www/html/cjays/payment-return.html;
        default_type text/html;
        add_header Cache-Control '"'"'no-store'"'"' always;
    }

    location = /cjay/download {
        alias /var/www/html/downloads/CJAYS.apk;
        default_type application/vnd.android.package-archive;
        add_header Content-Disposition '"'"'attachment; filename=\"CJAYS-REKON.apk\"'"'"' always;
        add_header Cache-Control '"'"'public, max-age=3600'"'"' always;
        add_header X-CJAYS-Release-Channel '"'"'beta'"'"' always;
    }

    location = /cjay {
        return 302 /cjay/download;
    }
"""

for path in paths:
    text = path.read_text()
    text = re.sub(r"\n\s*# CJAYS REKON[^\n]*\n(?:\s*location[^\n]*\n(?:\s*[^\n]*\n)*?)*", "\n", text)
    text = re.sub(r"\n\s*location = /cjay[^\n]*\n(?:\s*[^\n]*\n)*?(?=\n\s*#|\n\s*location|\n\s*}\s*$)", "\n", text, flags=re.MULTILINE)
    anchor = "    location / {"
    if block.strip() in text:
        print(f"already patched: {path}")
        continue
    if anchor not in text:
        raise SystemExit(f"anchor not found in {path}")
    path.write_text(text.replace(anchor, block + "\n" + anchor, 1))
    print(f"patched: {path}")
PY
sudo nginx -t && sudo systemctl reload nginx'

echo "==> Verify"
curl -sfI "https://wise2.net/cjay/payment?payment=success" | head -5
curl -sfI "https://wise2.net/cjay/download" | head -5
echo "CJAYS REKON deployed."
