# WISE² Website Deployment

WISE² production hosting is self-hosted on the WISE² VPS. Vercel is not part of the production path.

## Production target

- Domain: https://wise2.net
- VPS: 173.208.147.165
- Repository path: /home/dwise/wise2-core
- Website container: wise2-website
- Local website port: 3001
- Reverse proxy: Nginx
- Compose file: docker-compose.prod.yml

## Automatic deployment

Pushes to `main` that change the website or its shared packages trigger:

`.github/workflows/deploy-website-vps.yml`

The workflow checks out main, syncs the repo to the VPS, rebuilds only the website container, restarts it, and verifies both the local and public /travel route.

## Required GitHub secret

Use one SSH private-key secret with access to `dwise@173.208.147.165`:

- Preferred: `WISE2_VPS_SSH_KEY`
- Fallback: `SSH_PRIVATE_KEY`

Application secrets remain on the VPS in `/home/dwise/wise2-core/.env.production`.

## Manual deployment

```bash
cd /home/dwise/wise2-core
bash scripts/deploy-website-vps.sh
```

## Verification

```bash
curl -I http://127.0.0.1:3001/travel
curl -I https://wise2.net/travel
docker ps --filter name=wise2-website
docker logs --tail=100 wise2-website
```

## Rollback

Restore the desired known-good revision in `/home/dwise/wise2-core` and run `bash scripts/deploy-website-vps.sh`.
