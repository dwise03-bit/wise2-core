# Cherry Count™ — Deployment

**Live URL:** https://wise2.net/cherry-count  
**Presentation:** https://wise2.net/cherry-count/presentation  
**Health:** https://wise2.net/cherry-count/api/health

## Architecture

```
Internet → nginx (wise2.net) → 127.0.0.1:3025 → PM2 (cherry-count)
```

- **PM2 process:** `cherry-count` on port `3025`
- **App path:** `/home/dwise/wise2-apps/cherry-count`
- **basePath:** `/cherry-count`
- **API:** `https://api.wise2.net/api` (WISE² backend)

## Deploy

From repo root (builds locally, rsyncs to VPS):

```bash
./scripts/deploy-cherry-count.sh
```

## Verify

```bash
curl https://wise2.net/cherry-count/api/health
pm2 logs cherry-count --lines 20
```

## Nginx

Location block lives in `/etc/nginx/sites-enabled/wise2.net`.  
Snippet tracked at `infrastructure/nginx/cherry-count.wise2.net.snippet.conf`.

## Provision live tenant

On the VPS (after migration):

```bash
cd /home/dwise/wise2-core
OWNER_EMAIL=client@example.com pnpm exec tsx scripts/provision-cherry-count.ts
```

Deploy script runs this automatically when `OWNER_EMAIL` is set (default: `dwise03@gmail.com`).

## OAuth redirect URIs

Register in Google Cloud Console and Discord Developer Portal:

- `https://wise2.net/cherry-count/api/auth/google/callback`
- `https://wise2.net/cherry-count/api/auth/discord/callback`

Google login still requires a valid `GOOGLE_CLIENT_SECRET` in `.env.production` matching the OAuth app.

## Redeploy

Re-run `./scripts/deploy-cherry-count.sh` — idempotent.
