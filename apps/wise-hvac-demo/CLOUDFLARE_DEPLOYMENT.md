# WISE² HVAC Field Tech — Public Deployment

**Live now (VPS + Tailscale):**
- https://wise2.net/field-tech
- https://wise2.net/wise-hvac-demo/field-tech

**Pending DNS (hvac subdomain):**
- https://hvac.wise2.net/field-tech — nginx ready on VPS; add IONOS A record then run `./scripts/finish-hvac-dns-ssl.sh`

## Architecture (active)

```
Internet → VPS nginx (173.208.147.165, TLS) → Tailscale → Mac (100.64.72.14:3024) → wise-hvac-demo
```

Port 3024 is not exposed publicly. Tailscale carries traffic VPS → WISE² Mac.

## Local service

| Check | Command |
|-------|---------|
| Field tech | `curl -I http://127.0.0.1:3024/wise-hvac-demo/field-tech` |
| Clean path | `curl -IL http://127.0.0.1:3024/field-tech` |
| Health | `curl http://127.0.0.1:3024/wise-hvac-demo/api/health` |
| PM2 | `pm2 list` (app: `wise-hvac-demo`) |

## Finish hvac.wise2.net

1. In IONOS DNS for `wise2.net`, add:
   ```
   Type: A
   Host: hvac
   Points to: 173.208.147.165
   ```
2. Run:
   ```bash
   chmod +x scripts/finish-hvac-dns-ssl.sh
   ./scripts/finish-hvac-dns-ssl.sh
   ```

Optional: set `IONOS_API_KEY` on the VPS and run `scripts/add-hvac-ionos-dns.sh` to automate step 1.

## Cloudflare Tunnel (alternative)

Files remain in `infra/cloudflare/hvac/` if you prefer Cloudflare Tunnel later:
`./scripts/setup-hvac-cloudflare-tunnel.sh` (requires `cloudflared tunnel login` or `CLOUDFLARE_TUNNEL_TOKEN`).

## Security

- Demo mode is on; auth middleware is bypassed.
- Do not expose port 3024 on the public internet.

