#!/usr/bin/env bash
set -euo pipefail

WEBROOT="/var/www"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

test "$(hostname -s)" = "wise2" || { echo "Run this on the wise2 server."; exit 1; }
test -d "$WEBROOT/queenbaby" || { echo "Live WISE2 webroot not found at $WEBROOT."; exit 1; }

curl --fail --silent --show-error --location   https://api.github.com/repos/dwise03-bit/wise2-gta6-atlas/tarball/main   -o "$STAGE/gta.tgz"
mkdir -p "$STAGE/gta" "$STAGE/3ddemo" "$STAGE/711"
tar -xzf "$STAGE/gta.tgz" -C "$STAGE/gta" --strip-components=1
test -f "$STAGE/gta/index.html"

cat > "$STAGE/3ddemo/index.html" <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WISE² 3D Demo</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#18285a,#050712 58%,#02030a);color:#fff;font-family:Inter,system-ui,sans-serif}.glow{position:absolute;width:55vmin;height:55vmin;border-radius:50%;background:#1d6bff33;filter:blur(35px)}main{text-align:center;z-index:1;padding:24px}h1{font-size:clamp(3rem,10vw,8rem);margin:0;letter-spacing:-.07em;background:linear-gradient(135deg,#fff,#69a8ff 55%,#8dfcff);background-clip:text;color:transparent}p{color:#aebfe7;font-size:clamp(1rem,2vw,1.35rem)}.cube{width:140px;height:140px;margin:55px auto;position:relative;transform-style:preserve-3d;animation:spin 8s linear infinite}.face{position:absolute;inset:0;border:1px solid #75caffaa;background:#0a5eff25;box-shadow:inset 0 0 35px #1e8aff55}.f{transform:translateZ(70px)}.b{transform:rotateY(180deg) translateZ(70px)}.l{transform:rotateY(-90deg) translateZ(70px)}.r{transform:rotateY(90deg) translateZ(70px)}.t{transform:rotateX(90deg) translateZ(70px)}.d{transform:rotateX(-90deg) translateZ(70px)}@keyframes spin{to{transform:rotateX(360deg) rotateY(360deg)}}a{color:#7fdcff}</style></head><body><div class="glow"></div><main><h1>WISE²</h1><p>Spatial business command center · Live 3D preview</p><div class="cube"><i class="face f"></i><i class="face b"></i><i class="face l"></i><i class="face r"></i><i class="face t"></i><i class="face d"></i></div><a href="/">Return to WISE²</a></main></body></html>
HTML

cat > "$STAGE/711/index.html" <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>7-Eleven × WISE²</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07130e;color:white;font-family:Inter,system-ui,sans-serif}main{width:min(920px,90vw);padding:clamp(30px,7vw,80px);border:1px solid #30f09045;border-radius:32px;background:linear-gradient(145deg,#0d2419dd,#07100c);box-shadow:0 30px 90px #0009}small{color:#4cff9c;letter-spacing:.18em;font-weight:800}h1{font-size:clamp(3rem,10vw,7rem);margin:.15em 0;line-height:.9;letter-spacing:-.07em}h1 span{color:#ff6d21}p{color:#b2cbbd;font-size:clamp(1rem,2vw,1.35rem);max-width:650px}.bar{height:8px;border-radius:9px;background:linear-gradient(90deg,#ff6d21 0 33%,#fff 33% 66%,#19b95b 66%);margin:35px 0}a{color:#53f5a2}</style></head><body><main><small>WISE² RETAIL EXPERIENCE</small><h1>7<span>·</span>ELEVEN</h1><div class="bar"></div><p>The public experience is online. Full interactive retail build is being connected.</p><a href="/">Return to WISE²</a></main></body></html>
HTML

for route in gta 3ddemo 711; do
  rm -rf "$WEBROOT/$route"
  install -d -m 755 "$WEBROOT/$route"
  cp -a "$STAGE/$route/." "$WEBROOT/$route/"
done

for url in https://wise2.net/gta/ https://wise2.net/3ddemo/ https://wise2.net/711/; do
  code="$(curl --silent --location --max-time 20 --output /dev/null --write-out '%{http_code}' "$url")"
  printf '%s %s\n' "$code" "$url"
  case "$code" in 2*|3*) ;; *) exit 1 ;; esac
done

echo "WISE2 public routes repaired."
