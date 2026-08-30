# Credential rotation after Git secret exposure

Secrets were removed from the repository in this change set. **Production credentials that appeared in Git history must still be rotated** on the VPS and in Discord/Stripe dashboards.

## Rotate immediately (Red — confirm before running on VPS)

SSH to `gpu-nmls-1.tail44396d.ts.net` as `dwise`, then:

### 1. Database and cache

```bash
# Generate new values locally on the VPS
export NEW_DB_PASS="$(openssl rand -base64 32)"
export NEW_REDIS_PASS="$(openssl rand -base64 32)"
export NEW_JWT="$(openssl rand -base64 48)"
export NEW_GRAFANA="$(openssl rand -base64 24)"

# Update ~/.env.production or compose env files with new values, then:
docker compose -f docker-compose.prod.yml up -d --force-recreate api postgres redis
```

Also rotate MongoDB password if used (`MONGODB_PASSWORD`).

### 2. Discord webhooks

In Discord Developer Portal / channel settings:

- Delete webhooks exposed in the old `services/bot/.env.webhooks` and `apps/website/.env.production`
- Regenerate via `node services/bot/create-webhooks.js` on a trusted machine
- Save URLs only to `services/bot/.env.webhooks` (gitignored)

### 3. JWT

After setting `JWT_SECRET` on the API container, all existing sessions invalidate. Users re-login once.

### 4. Git history scrub (optional, destructive)

If history must be purged of old secret blobs:

```bash
# Requires git-filter-repo; coordinate with all collaborators first
git filter-repo --path DEPLOYMENT_SETUP.md --path DEPLOYMENT_PHASE1.md \
  --path apps/website/.env.production --path services/bot/.env.webhooks --invert-paths
git push --force-with-lease origin main
```

Prefer rotation over history rewrite when both are possible.

## Verify

```bash
bash scripts/check-no-secrets.sh
curl -s https://api.wise2.net/api/health
curl -s -o /dev/null -w "%{http_code}" https://command.wise2.net/login
```

## Darrin audit trail

Use separate Control Bridge `actor` values (`dwise` vs `darrinwisejr`) in audit logs; do not share personal API tokens.
