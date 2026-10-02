# Hermes Production Connection — PRE-CHANGE PLAN (Phase 2A)

> Discovery-only output, 2026-10-02. **No production change made.** Surface has
> NO SSH key, so live VPS inspection (step 4) could not run; live-state items
> below are marked accordingly and must be confirmed before any change.
> Secrets (JWT_SECRET, MONGODB_URI, passwords, tokens) never read or printed.

## HERMES HOST
- **VPS `173.208.x.x`, Ubuntu 22.04** (from repo deploy docs: `DEPLOYMENT-COEXIST.md`,
  `DEPLOYMENT_CHEATSHEET.md`), repo path `/home/dwise/wise2-core`.
- `:22` is reachable from Surface (TCP open). Public host; fronted by nginx +
  Cloudflare at `command.wise2.net` (currently no public DNS A/AAAA record).

## CURRENT PROCESS
- **From repo evidence:** Express `second-brain/api-server` under PM2 as
  **`wise2-second-brain`** (`PORT=3012`, `app.listen(…, '127.0.0.1')`).
- **Live state: UNVERIFIED** — cannot confirm PM2 is running without VPS access.

## CURRENT HEALTH
- **UNVERIFIED from Surface.** `:3012` is loopback-bound on the VPS (unreachable
  off-box by design); public `command.wise2.net` does not resolve now. Health
  (`GET /api/health` → mongo/ollama status) can only be read on the box or via a
  working proxy.

## TAILSCALE STATUS
- VPS is **not an online tailnet node**. Offline candidates that may be this VPS:
  `vps-0fa5d30a` (100.123.59.122, 49d), `wise2-cloud-agent` (100.111.95.119, 32d).
- Surface is on the tailnet (`100.97.230.73`). To reach Hermes privately, the VPS
  must (re)join the tailnet — a production change requiring approval.

## PORT
- Hermes: **3012** (loopback on VPS). nginx same-origin proxy prefix: **`/brain-api`**.
- Health `GET /api/health` (open); authed: `/api/brain/*`, `/api/hermes/*`,
  `/api/v1/brain-auth/*` (JWT Bearer).

## PRIVATE ENDPOINT DESIGN (target)
```
wise2-surface
   │  (Tailscale WireGuard, private)
   ▼
Hermes VPS (tailnet IP)
   │  proxy  /brain-api  →  127.0.0.1:3012
   ▼
brain-api :3012 (Express wise2-second-brain)
   │
   ▼
MongoDB  +  knowledge graph  +  Obsidian vault
```
Two ways to expose `/brain-api` over the tailnet (no new PUBLIC port either way):
- **Option P1 (preferred, no nginx edit, no Hermes restart):** on the VPS run
  `tailscale serve` to map a tailnet HTTPS path → `http://127.0.0.1:3012`
  (or → the existing nginx `/brain-api`). Surface then uses that tailnet URL.
- **Option P2:** add an nginx `server` block bound to the VPS tailnet IP that
  reverse-proxies `/brain-api` → `:3012` (requires nginx reload).

## AUTH DESIGN (dedicated wise2-surface device credential)
- **Model:** scoped device JWT — `sub=device:wise2-surface`, least-privilege
  `scope` (read context + read brain knowledge; no delete/admin), `exp` for
  expiration, `jti` recorded in a Mongo `device_tokens` collection for
  revocation/audit. **JWT_SECRET stays server-side only.** Browser never gets it.
- **Two implementation levels:**
  - **A1 (no Hermes code change):** sign a short-exp scoped JWT with the existing
    secret; the brain verifies it today. Revocation = rotate secret (affects all)
    → weak revocation. Acceptable only as a stopgap.
  - **A2 (recommended, small change):** add a `jti`/`device_tokens` revocation +
    scope check to `second-brain/api-server/server.js` `requireAuth`. Gives
    independent revocation + audit. Requires one `pm2 restart wise2-second-brain`.
- Token delivered out-of-band; stored at `/opt/wise2/hermes/credentials/device-token`
  (0600). **Claude does not mint it.**

## FILES THAT WOULD CHANGE
- **Production VPS:** Tailscale install (new pkg + `tailscaled`); `tailscale serve`
  config (P1) *or* an nginx tailnet server block (P2); **if A2:** edit
  `second-brain/api-server/server.js` (+ new Mongo `device_tokens` collection).
- **Surface (local):** `hermes/config/hermes.conf` (`HERMES_ENABLED=true`,
  `HERMES_BASE_URL=<vps-tailnet>`); new `hermes/credentials/device-token` (0600).
- **Not changed:** DNS, Cloudflare, MongoDB schema/data (beyond the new tokens
  collection in A2), JWT_SECRET, wise2-core history on other hosts.

## SERVICES THAT WOULD RESTART
- `tailscaled` on the VPS (starts on install) — **does not** affect Hermes.
- **P2 only:** `nginx -s reload` (graceful, no dropped connections).
- **A2 only:** `pm2 restart wise2-second-brain` (~1–2 s Hermes blip).
- **P1 + A1:** **no Hermes/nginx restart at all.**

## ROLLBACK PLAN
- Surface: set `HERMES_ENABLED=false`, delete the credential file → client inert.
- VPS Tailscale: `sudo tailscale down` (and/or uninstall) → private path removed.
- P2: remove the nginx tailnet block + reload. P1: `tailscale serve reset`.
- A2: `git checkout` the server.js change + `pm2 restart`; drop/ignore
  `device_tokens`. Revoke the device token (delete its `jti`).
- All steps reversible; no destructive data operations.

## EXPECTED DOWNTIME
- **P1 + A1:** zero Hermes downtime.
- **P2:** zero (nginx graceful reload).
- **A2:** ~1–2 s for `pm2 restart wise2-second-brain` only.

## SECURITY IMPACT
- Hermes becomes reachable to Surface over the **private tailnet only** — no new
  public exposure; public DNS stays as-is.
- Adding the VPS to the tailnet exposes it to tailnet peers → **Tailscale ACL
  must scope** who/what can reach it (ACL change is Daniel's, not automated).
- Device credential is scoped, expiring, revocable (A2), and audited; JWT_SECRET
  never leaves the server; the browser never receives the credential.
- Residual: a workstation credential is a new key to protect (0600 file / keyring)
  and to rotate.

## BLOCKER before ANY of this
Surface has **no SSH key** → it cannot inspect or configure the VPS. Options:
(a) Daniel runs the read-only VPS inspection and pastes results; or
(b) Daniel authorizes an SSH key for Surface→VPS (itself a change to approve); or
(c) do VPS steps from a machine that already has access (e.g. a Mac).

## STOP
No production change, no Tailscale install, no Hermes/nginx restart, no DNS/
Cloudflare/Mongo change, no credential minted, Surface client still DISABLED.
Awaiting Daniel's explicit approval + choice of P1/P2 and A1/A2.

---

## VERIFIED LIVE STATE (2026-10-02, via read-only SSH to the VPS)

> Surface→VPS SSH now works (dedicated key). Read-only; no secrets read; no changes.

- **Host identity:** hostname `gpu-nmls`, **Ubuntu 24.04.5 LTS** (NOT 22.04 as old
  docs said), uptime ~4 weeks, mem 62 GiB (GPU box), **disk / at 91% used (23 G free)**.
- **VPS IS ALREADY ON THE TAILNET:** `tailscale ip -4` = **100.68.145.5** = the
  online node **`gpu-nmls-1`**. Tailscale 1.102.4, active. ⇒ **No Tailscale install
  on production is needed** — Surface can already reach this box privately at
  100.68.145.5. (The production VPS and tailnet `gpu-nmls-1` are the same machine.)
- **Hermes / Second Brain is DOWN:** `pm2` has **0 processes** (but a saved
  `~/.pm2/dump.pm2` 33 KB exists → was pm2-managed, resurrectable); no
  `wise2-second-brain` systemd unit; **:3012 not listening**; `/api/health` no
  response. Implementation on disk confirmed (`second-brain/api-server/server.js`,
  `ecosystem.config.js`, requireAuth ×11).
- **MongoDB is DOWN:** `mongod` inactive, `:27017` not listening, no mongo container.
- **nginx is ACTIVE** and `command.wise2.net` is enabled, with:
  `location /brain-api/ { rewrite ^/brain-api/(.*)$ /$1 break; proxy_pass http://127.0.0.1:3011; }`
  ⇒ **/brain-api points at :3011, but Hermes code binds :3012** — a real routing
  mismatch (both moot right now since nothing is listening).
- `/opt/wise2-core` present on `main` (a few uncommitted edge-hub edits; untouched).

### What this means for the connection
1. **Private reach already exists** (Surface → tailnet 100.68.145.5). The P1/P2
   "put VPS on tailnet" step is UNNECESSARY. We only need a way to reach Hermes
   over the tailnet once it's running (bind :3012 to tailnet, or `tailscale serve`,
   or an nginx tailnet listener) + the device credential.
2. **Hermes + MongoDB must be STARTED** before Surface can connect — they are not
   running. This is a production action needing Daniel's decision: is the stack
   intentionally down? crashed? stopped due to 91% disk? Start order: Mongo → Hermes.
3. **Fix /brain-api → 3011 vs Hermes :3012** mismatch (or have Surface hit :3012
   directly over tailnet, bypassing nginx).
4. **Disk at 91%** should be reviewed before starting services.

### Revised blockers (owner: Daniel / production — NOT auto-done)
- [ ] Decide whether to start Hermes + MongoDB on gpu-nmls (and why they're down).
- [ ] Resolve /brain-api(3011) vs Hermes(3012) routing.
- [ ] Review disk pressure (91%).
- [ ] Choose private-exposure method for :3012 over tailnet (serve/bind/nginx).
- [ ] Mint + install the scoped device credential (A2).
Nothing above was performed. VPS unchanged.
