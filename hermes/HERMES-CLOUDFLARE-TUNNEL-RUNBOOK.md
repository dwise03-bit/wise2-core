# Hermes · Cloudflare Tunnel + Access Runbook

> Owner: Daniel. Opens the browser path from `wss://hermes.wise2.net/brain-stream`
> to the production second-brain service on the VPS, per ADR-0008. Nothing here
> is run from this Claude session — every command is yours to execute.
> Last updated: 2026-10-06.

## Prereqs you need in hand

- SSH access to the VPS (`173.208.x.x`, Ubuntu 22.04, user with sudo).
- Cloudflare dashboard access for the `wise2.net` zone.
- Second-brain service already listening on `127.0.0.1:3012`. If it doesn't
  expose a `/brain-stream` SSE or WS endpoint yet, that's a separate code
  change on the second-brain repo — flag before starting this runbook.

---

## 1. Install `cloudflared` on the VPS

```bash
# SSH to the VPS first.
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared --version        # verify
```

## 2. Authenticate `cloudflared` to your Cloudflare account

```bash
cloudflared tunnel login
# Opens a browser URL. On the VPS this prints a URL — copy it to a browser
# where you're signed into Cloudflare, pick the `wise2.net` zone to authorize.
# A cert.pem lands in ~/.cloudflared/ when it succeeds.
ls -l ~/.cloudflared/cert.pem
```

## 3. Create the tunnel

```bash
cloudflared tunnel create wise2-hermes
# Prints a tunnel UUID like 7a3b…-….-…-…-…
# A credentials JSON file is written to ~/.cloudflared/<UUID>.json
# Record the UUID; the next step references it.
TUNNEL_UUID=<paste UUID>
```

## 4. Write the config

```bash
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml >/dev/null <<EOF
tunnel: ${TUNNEL_UUID}
credentials-file: /root/.cloudflared/${TUNNEL_UUID}.json

ingress:
  - hostname: hermes.wise2.net
    service: http://127.0.0.1:3012
  - service: http_status:404
EOF

sudo cp ~/.cloudflared/${TUNNEL_UUID}.json /root/.cloudflared/
sudo cp ~/.cloudflared/cert.pem /root/.cloudflared/
```

Why `http://` and not `ws://`: Cloudflare Tunnel upgrades HTTP ⇄ WS
transparently when the client sends `Upgrade: websocket`. The browser's
`new WebSocket("wss://hermes.wise2.net/brain-stream")` handles that.

## 5. Point DNS at the tunnel

```bash
cloudflared tunnel route dns wise2-hermes hermes.wise2.net
# Creates a CNAME in Cloudflare DNS for wise2.net pointing hermes.wise2.net
# at <TUNNEL_UUID>.cfargotunnel.com (proxied).
```

Verify from any shell:

```bash
dig +short hermes.wise2.net CNAME
# → <uuid>.cfargotunnel.com
```

## 6. Install `cloudflared` as a service and start it

```bash
sudo cloudflared service install
sudo systemctl status cloudflared --no-pager | head -20
```

Check tunnel is healthy:

```bash
cloudflared tunnel info wise2-hermes
# Expect at least one connector connected to a Cloudflare edge POP.
```

## 7. Create a Cloudflare Access Application

In the Cloudflare dashboard: **Zero Trust → Access → Applications → Add an
application → Self-hosted**.

- **Application name:** `WISE² Hermes`
- **Session duration:** 24h (or shorter)
- **Application domain:** `hermes.wise2.net`
- **Identity providers:** keep whichever you've set up (One-time PIN or
  Google SSO are the fastest).

Add a **policy**:

- **Name:** `wise2-owner`
- **Action:** Allow
- **Include → Emails:** `dwise03@gmail.com` (add any teammate emails as needed).

Save. On first visit to `https://hermes.wise2.net/anything`, the browser is
bounced to Cloudflare Access login; after sign-in a cookie
(`CF_Authorization`) is set on `hermes.wise2.net` for the session duration.

## 8. Verify the full path (before touching Claude)

From the Cloudflare-logged-in Firefox you already have open:

- Visit `https://hermes.wise2.net/healthz` (or any safe GET on the second-brain
  service). Expect the Access login once, then a 200 from the backend.
- Open DevTools → Network. Note the `CF_Authorization` cookie is set.

## 9. Flip the UI to the real source

In the browser that just completed Access login:

```
http://127.0.0.1:3011/?source=hermes
```

The `WebSocketEventSource` opens `wss://hermes.wise2.net/brain-stream`. The
browser automatically includes the `CF_Authorization` cookie because that WS
is same-origin for the hostname. If Cloudflare 302s to login, you'll see the
WebSocket close with a 401/403; sign in once more and the next connect
succeeds.

## 10. Update context on success

Once a `node.status` or `packet.send` event lands in the Command Graph UI:

- Edit `context/CURRENT-STATE.md`: flip the UI component row from
  "simulated events default" to "simulated default, Hermes verified live
  <YYYY-MM-DD>".
- Append the proof to `context/CHANGELOG.md`.
- Close the open items in `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`.

## Rollback (reversible at every step)

- Stop + disable `cloudflared` service: `sudo systemctl disable --now cloudflared`
- Delete the DNS CNAME in the dashboard
- Delete the Cloudflare Access application
- Delete the tunnel: `cloudflared tunnel delete wise2-hermes`

Nothing in this runbook touches the second-brain code or the Hermes JWT
secret. The browser-side auth is additive and lives entirely in Cloudflare.

## What NOT to do

- Do **not** add the Hermes JWT or device credential anywhere a browser can
  read it. Cloudflare Access cookies are the only auth material the browser
  may hold for the Hermes path.
- Do **not** make `hermes.wise2.net` public (bypassing Access). The Access
  policy is the gate; without it anyone with the URL hits the second-brain.
- Do **not** reuse the production JWT_SECRET as a device credential, per
  ADR-0005 which still binds the host-to-host (CLI, device agent) path.
