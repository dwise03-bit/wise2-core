# WISE² HVAC Field Tech — Cloudflare Tunnel Deployment

Public target: `https://hvac.wise2.net/field-tech`  
Local service: `http://127.0.0.1:3024`  
Internal path: `/wise-hvac-demo/field-tech`

## Verified local state

| Check | Status |
|-------|--------|
| Next.js 14 app on port 3024 | Running via PM2 (`wise-hvac-demo`) |
| Field tech page | `curl -I http://127.0.0.1:3024/wise-hvac-demo/field-tech` → 200 |
| Clean URL redirect | `curl -IL http://127.0.0.1:3024/field-tech` → 307 → 200 |
| Health endpoint | `curl http://127.0.0.1:3024/wise-hvac-demo/api/health` → `{"status":"ok"}` |
| cloudflared installed | Homebrew `2026.8.2` |
| Cloudflare tunnel auth | **Pending** — requires browser login or `CLOUDFLARE_TUNNEL_TOKEN` |

## DNS note

`wise2.net` uses **IONOS** nameservers (`ui-dns.*`), not Cloudflare NS. After creating the tunnel, add this CNAME in IONOS:

```
hvac.wise2.net  CNAME  <tunnel-id>.cfargotunnel.com
```

`cloudflared tunnel route dns` only works if the zone uses Cloudflare nameservers.

## One-time setup

1. Ensure the app is running:
   ```bash
   cd apps/wise-hvac-demo
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

2. Authenticate cloudflared (pick one):
   - **Interactive:** `cloudflared tunnel login` (select `wise2.net` zone)
   - **Token:** Create a tunnel in Cloudflare Zero Trust → copy token → `export CLOUDFLARE_TUNNEL_TOKEN='...'`

3. Run the setup script:
   ```bash
   ./scripts/setup-hvac-cloudflare-tunnel.sh
   ```

4. If using IONOS DNS, add the CNAME record manually (see above).

5. Verify:
   ```bash
   curl -IL https://hvac.wise2.net/field-tech
   curl https://hvac.wise2.net/wise-hvac-demo/api/health
   ```

## Architecture

```
Internet → Cloudflare (TLS) → cloudflared tunnel → 127.0.0.1:3024 → Next.js wise-hvac-demo
```

Clean URL `/field-tech` redirects (307) to `/wise-hvac-demo/field-tech` via `next.config.js` redirects.

## Security

- Port 3024 stays on localhost; only the tunnel is public.
- Demo mode is on (`WISE_HVAC_DEMO_MODE` not `false`); auth middleware is bypassed.
- No `.env`, tokens, or credentials are committed.

## Persistence

- **App:** `pm2 save` + `pm2 startup` (run the command PM2 prints)
- **Tunnel:** `cloudflared service install` (run by setup script after login)
