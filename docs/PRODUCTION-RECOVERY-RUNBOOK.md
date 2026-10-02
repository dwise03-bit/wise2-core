# WISE² Production Recovery Runbook — gpu-nmls

> Ordered, reversible steps to run **on the production VPS `gpu-nmls`**
> (173.208.147.165 / tailnet 100.68.145.5) as user `dwise`.
> Compiled 2026-10-02 from read-only diagnosis. **Claude cannot execute these**
> (the safety layer blocks production changes); run them yourself and paste
> output back for verification.
>
> Golden rules: run services **one at a time**, never a bare `docker compose up`
> (that starts the whole stack). `docker compose stop` keeps data; **never**
> `down -v`. Back up before editing configs. Redact secrets.

Verified live state (2026-10-02): website `:3001` ✅, api `:3010` ✅, postgres
`:5432` ✅, redis ✅; command-center `:3004` ❌ down; Hermes `:3012` ❌ down;
MongoDB ❌ down (data intact in volume `wise2-core_mongodb_data`, 304M, on /sdb-disk).

---

## STEP 1 — Fix SoundLabs / wise2.net login ("network error fetching resource")

**Cause:** running `wise2-website` has `NEXT_PUBLIC_API_URL=http://api:3000/api`
(docker-internal host, browser-unreachable). Production value should be
`https://api.wise2.net` (live, /api/health=200). Next.js bakes NEXT_PUBLIC_* at
build time → needs `--build`.

```bash
cd /opt/wise2-core
# confirm the current (wrong) value:
docker inspect wise2-website --format '{{range .Config.Env}}{{println .}}{{end}}' | grep NEXT_PUBLIC_API_URL

# rebuild the website from the PRODUCTION compose with the correct public API base:
NEXT_PUBLIC_API_URL=https://api.wise2.net \
  docker compose -f docker-compose.production.yml up -d --build wise2-website
```
**Verify:** hard-refresh https://wise2.net/login and log in. In DevTools→Network
the login request should now go to `https://api.wise2.net/...` and succeed.
**Rollback:** `docker compose up -d wise2-website` (previous definition).

> If login still fails, capture the failing Network request URL+status:
> - request to `http://api:3000/...` → rebuild didn't take (check build args/.env)
> - request to `https://api.wise2.net/...` CORS-blocked/5xx → go to STEP 3 (OAuth)
>   or check API CORS_ORIGIN (currently includes https://wise2.net ✅).

---

## STEP 2 — Bring Hermes / Second Brain back up (MongoDB + brain)

**Cause:** MongoDB container removed (data volume intact) and `wise2-second-brain`
not in pm2. Start Mongo (reattach volume) → start brain.

```bash
cd /opt/wise2-core
# 2a. confirm the compose mongodb volume resolves to the EXISTING data volume:
docker compose config --volumes | grep mongodb        # expect mongodb_data (-> wise2-core_mongodb_data)

# 2b. start ONLY mongodb (pulls mongo:7, reattaches 304M volume on /sdb-disk):
docker compose up -d mongodb
docker ps --filter name=wise2-mongodb
docker inspect wise2-mongodb --format '{{range .Mounts}}{{.Name}} {{end}}'   # expect wise2-core_mongodb_data
docker exec wise2-mongodb mongosh --quiet --eval 'db.runCommand({ping:1}).ok'  # expect 1

# 2c. start Hermes (adds it back to pm2 — it was NOT in the saved dump):
cd /opt/wise2-core/second-brain/api-server
pm2 start ecosystem.config.js
pm2 save

# 2d. verify health (expect status ok, mongo: connected):
curl -s http://127.0.0.1:3012/api/health
```
**Rollback:**
```bash
pm2 delete wise2-second-brain && pm2 save
cd /opt/wise2-core && docker compose stop mongodb       # keeps data; never down -v
```
**Watch-for:** if health shows `mongo: disconnected` or
*"createIndexes requires authentication"*, the brain's `MONGODB_URI` creds don't
match the admin user stored in the existing volume — **stop**, do NOT
re-initialize; align the URI/creds (server-side) first.

---

## STEP 3 — (Only if Google login specifically still fails) OAuth redirect-URI alignment

**Cause:** three different Google callback URLs configured:
- frontend `GOOGLE_REDIRECT_URI = https://wise2.net/api/auth/google/callback`
- backend  `GOOGLE_CALLBACK_URL  = https://api.wise2.net/api/v1/auth/google/callback` (handler live, 302)
- historical `command.wise2.net/...` (dead)

**Fix:** pick ONE canonical (recommend backend `https://api.wise2.net/api/v1/auth/google/callback`):
1. Set frontend `GOOGLE_REDIRECT_URI` = backend `GOOGLE_CALLBACK_URL` (identical).
2. Google Cloud Console → Credentials → OAuth client → **Authorized redirect URIs**
   must contain that exact URL; Authorized JS origins include `https://wise2.net`.
3. Recreate the changed container(s):
   ```bash
   cd /opt/wise2-core && docker compose -f docker-compose.production.yml up -d --no-deps wise2-website wise2-api
   ```
**Rollback:** restore prior env values + `up -d` again.

---

## STEP 4 — (Optional, later) nginx /brain-api routing + command-center

- `command.wise2.net` → `/` proxies to `:3004` (command-center, **down**) and
  `/brain-api/` → `:3011` (but Hermes binds **:3012**). Also `command.wise2.net`
  has **no public DNS**.
- For the **Surface** Hermes client we do NOT need this — Surface will reach
  Hermes privately over Tailscale at `100.68.145.5:3012` (see
  `hermes/HERMES-PRECHANGE-PLAN.md`). Fix nginx only if you want the public
  Command Center back:
  - correct `/brain-api/` `proxy_pass` 3011 → 3012 (backup conf, `nginx -t`, reload),
  - start the command-center service on `:3004`,
  - restore `command.wise2.net` DNS.

---

## Disk note
Root `/` is at **91% (23G free)**; docker volumes/images live on `/sdb-disk`
(590G free), so STEP 1–3 are not disk-blocked. Consider trimming root later
(`/home/dwise/wise2-core` 43G, `/var/log` 6.2G) — review before deleting.

## After production is healthy → Surface↔Hermes (separate approval)
Once STEP 2 shows `mongo: connected` and `:3012` healthy, the remaining
Surface-side work (expose `:3012` over Tailscale + mint the scoped device
credential, then enable the disabled Surface client) is in
`hermes/HERMES-PRECHANGE-PLAN.md` and `hermes/DEVICE-CREDENTIAL.md`.
