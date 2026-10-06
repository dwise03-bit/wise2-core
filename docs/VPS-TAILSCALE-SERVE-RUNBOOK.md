# VPS Runbook — publish Hermes + control-bridge to the tailnet (Option A)

> Target: **`gpu-nmls-1`** (tailnet `100.68.145.5`). Owner: Daniel.
> This runbook is for the **VPS**, not Surface. Claude does **not** have shell
> access to `gpu-nmls-1` and will not run these commands.
> Last updated: 2026-10-05.

## Why `tailscale serve` (not nginx)

Surface's probe on 2026-10-05 found nginx:443 fails the TLS handshake with a
`TLSv1.3 internal error` for every SNI (`100.68.145.5`, `gpu-nmls-1`,
`command.wise2.net`, `wise2.net`, `brain.wise2.net`) — nginx has no cert the
tailnet can present. `tailscale serve` sidesteps nginx entirely and uses the
automatic Tailscale per-node LetsEncrypt cert (`gpu-nmls-1.<tailnet>.ts.net`),
which Surface already trusts. **No new public port. No nginx edit.** The
production public path (`command.wise2.net` → Cloudflare → nginx → :3012) is
untouched.

## Preconditions (verify, don't change)

Run **on `gpu-nmls-1`** (as `dwise`, with `sudo` where required):

```bash
# 1. Tailscale is installed, authed, and running
tailscale version
sudo tailscale status | head -5

# 2. Hermes brain is actually running on loopback 3012
curl -fsS http://127.0.0.1:3012/api/health | head -5

# 3. control-bridge is actually running on loopback 3099
curl -fsS http://127.0.0.1:3099/v1/control/health

# 4. Record this node's MagicDNS name — you'll need it for the client URLs
tailscale status --self --json | grep -E '"DNSName"|"HostName"' | head -4
```

If any of 2/3 fails, fix that first — tailscale serve will only expose what
already answers on loopback.

## Enable HTTPS on the node

```bash
# One-time: let Tailscale provision a TLS cert for this node's MagicDNS name.
sudo tailscale cert "$(tailscale status --self --json | jq -r '.Self.DNSName' | sed 's,\.$,,')"
```

If `jq` isn't installed, read the DNSName from the earlier `tailscale status
--self --json` output and pass it as a literal string
(`gpu-nmls-1.<tailnet>.ts.net`, no trailing dot).

## Publish `/brain-api` → :3012 (Hermes) and `/v1/control` → :3099 (control-bridge)

```bash
# These add two reverse-proxy mounts to the per-node tailscale serve config.
# Both are tailnet-only; nothing is published publicly (we do NOT use `funnel`).
sudo tailscale serve --bg --https=443 --set-path=/brain-api http://127.0.0.1:3012
sudo tailscale serve --bg --https=443 --set-path=/v1/control  http://127.0.0.1:3099

# Verify
sudo tailscale serve status
```

Expected `status` output names both mounts under
`https://gpu-nmls-1.<tailnet>.ts.net/` with `(tailnet only)`.

## Smoke-test from Surface (I will run this)

Once you confirm the two mounts are live, I will run:

```bash
# both unauthenticated — just proves the route reaches the service
curl -fsS https://gpu-nmls-1.<tailnet>.ts.net/brain-api/api/health
curl -fsS https://gpu-nmls-1.<tailnet>.ts.net/v1/control/health
```

Both should return 200 with the service's own JSON.

## Mint & deliver device credentials (Daniel — out of band)

- **Hermes JWT** for `device:wise2-surface` — signed server-side by the
  Command Center / auth-gateway with `JWT_SECRET`. **Do not share `JWT_SECRET`
  with Surface.**
- **control-bridge Bearer** for `device:wise2-surface` — any 16+ char value
  added to the VPS environment as `WISE2_CONTROL_TOKEN` (**distinct** from the
  human/ChatGPT token), then `docker compose up -d control-bridge`.

Deliver both tokens to Surface by pasting them into chat or writing them
directly to:

```
/opt/wise2/hermes/credentials/device-token      # chmod 600 after
/opt/wise2/bridge/credentials/control-token     # chmod 600 after
```

## I then flip the switches on Surface (local only)

Once the tailnet URLs resolve + tokens are in place, I will:

1. Edit `/opt/wise2/hermes/config/hermes.conf`:
   `HERMES_ENABLED=true` + `HERMES_BASE_URL=https://gpu-nmls-1.<tailnet>.ts.net`.
2. Edit `/opt/wise2/bridge/config/bridge.conf`:
   `BRIDGE_ENABLED=true` + `BRIDGE_BASE_URL=https://gpu-nmls-1.<tailnet>.ts.net`.
3. Run `wise2 doctor` — Hermes + control-bridge should both report READY.
4. Commit + push the config change (never the credentials — `**/credentials*`
   is gitignored).

## Rollback

Everything in this runbook is reversible, per side:

```bash
# VPS: stop serving either or both mounts
sudo tailscale serve --https=443 --set-path=/brain-api off
sudo tailscale serve --https=443 --set-path=/v1/control off

# Surface: disable the client
sed -i 's/^BRIDGE_ENABLED=true/BRIDGE_ENABLED=false/' /opt/wise2/bridge/config/bridge.conf
sed -i 's/^HERMES_ENABLED=true/HERMES_ENABLED=false/' /opt/wise2/hermes/config/hermes.conf
```

Rotating a credential: remove it from the VPS environment, restart the
container/process, delete the file on Surface. `wise2 doctor` immediately
drops the service back to NOT READY.
