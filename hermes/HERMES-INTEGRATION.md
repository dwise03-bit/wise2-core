# Hermes / Second Brain — Evidence-Based Discovery & Surface Integration

> Read-only discovery 2026-10-02 from **Wise2-surface**. Source of evidence:
> read-only clone of the **public** repo `dwise03-bit/wise2-core` (pushed
> 2026-10-02) + read-only DNS/network probes. Production was **not modified**,
> nothing deployed, **no secret values printed** (env var NAMES only). The VPS
> IP is already public in the repo's deploy docs; kept partly redacted here.

## HERMES LOCATION

- **Code:** `wise2-core/second-brain/api-server/` — package **`@wise2/second-brain-api`**.
- **Runs under PM2** as process **`wise2-second-brain`** (`ecosystem.config.js`).
- **Binds `127.0.0.1:3012`** (loopback only) — confirmed in `server.js`:
  `app.listen(PORT, '127.0.0.1', …)`, `PORT = process.env.PORT || 3012`.
- **Deployment host:** VPS **`173.208.x.x` (Ubuntu 22.04)**, path
  `/home/dwise/wise2-core` (from `DEPLOYMENT-COEXIST.md`, `DEPLOYMENT_CHEATSHEET.md`).
- **Public exposure:** only via **nginx** → `command.wise2.net` (Cloudflare), with
  the Command Center front-end calling same-origin **`/brain-api`**
  (`docker-compose.yml`: `NEXT_PUBLIC_BRAIN_API_URL: /brain-api`). Hermes itself
  is never exposed directly; nginx fronts it.

## CURRENT STATUS (as observable from Surface — unconfirmed-running)

- `:3012` is **loopback-bound on the VPS**, so it is correctly **not reachable**
  from Surface or the tailnet directly (not a fault — by design).
- The documented public endpoint **`command.wise2.net` has NO A/AAAA/CNAME
  record right now** (checked via 1.1.1.1). Apex `wise2.net` still resolves
  (Cloudflare). ⇒ The public `/brain-api` path is **not live at this moment**.
- I have **no authenticated VPS access** (no SSH key/token on Surface), so I
  **cannot confirm the PM2 process is currently running**. Status = *unknown /
  not publicly reachable now*. Do not assume it is up.

## IMPLEMENTATION

- **Express** app (`server.js`, ~460 lines). Deps: `express`, `mongodb`,
  `jsonwebtoken`, `cors`. Scripts: `start: node server.js`.
- **LLM backend:** Ollama (`OLLAMA_MODEL=qwen2.5-coder:7b`, `OLLAMA_HOST`).
- **Routes:**
  - `GET /api/health` — **unauthenticated**; reports `{status, service:
    'wise2-second-brain', mongo, ollama, model, …}`.
  - `GET /api/v1/brain-auth/status`, `…/knowledge/graph/stats`, `…/chat/health` — **auth**
  - `POST|GET /api/brain/knowledge`, `GET /api/brain/knowledge/search`,
    `DELETE /api/brain/knowledge/:id`, `POST /api/brain/chat` — **auth**
  - `POST /api/hermes/chat`, `GET /api/hermes/status` — **auth**
- A second, richer **NestJS** implementation exists at
  `packages/api/src/brain-auth/` (controller/service + Mongo schemas incl.
  `refresh-token.schema.ts`) — suggests an access+refresh-token evolution. The
  **PM2 + ecosystem + `wise2-second-brain`** evidence points to the Express
  `api-server` as the deployed Hermes; the NestJS module may be newer/parallel.
  *Confirm with Daniel which is live.*

## AUTH METHOD (as implemented — not invented)

- **JWT Bearer.** `requireAuth` middleware: reads `Authorization: Bearer <token>`,
  verifies with `jwt.verify(token, JWT_SECRET)` (shared-secret HS256). No token →
  rejected. `/api/health` is the only open route.
- **Token issuance is elsewhere** (no `jwt.sign` in api-server). Minting happens
  in the Command Center / dashboard / `auth-gateway` (e.g.
  `apps/dashboard/app/api/auth/login`, `services/auth-gateway/server.js`,
  `services/api/src/services/auth.service.ts`), and **Google OAuth** is in play
  (`GOOGLE_CALLBACK_URL=https://command.wise2.net/api/auth/google/callback`).
  The brain API trusts tokens signed with the shared `JWT_SECRET`.
- ⇒ A Surface client needs a **valid JWT** (same `JWT_SECRET` audience) to call
  authenticated brain routes. Exact token-acquisition flow for a headless client
  is the main open item (see MISSING INFORMATION).

## DATABASE / MEMORY BACKEND

- **MongoDB** via `MONGODB_URI` (official `mongodb` driver). Health reports
  `mongo: connected|disconnected`.
- Knowledge model: documents + a **knowledge graph** (`…/knowledge/graph/stats`),
  plus an **Obsidian vault** structure under `second-brain/vault/*` (INBOX,
  PROJECTS, DECISIONS, ARCHITECTURE, …) and `obsidian-vault.schema.ts`.
- Companion services in repo: `second-brain/{search-service,sync-engine,integrations}`.

## Environment variable NAMES (values never read/printed)

`PORT` · `MONGODB_URI` · `JWT_SECRET` · `EVENTS_SECRET` · `COMMAND_CENTER_URL` ·
`OLLAMA_HOST` · `OLLAMA_MODEL` (+ Command Center: `GOOGLE_CALLBACK_URL`,
`APP_URL`, `NEXT_PUBLIC_BRAIN_API_URL`, `NEXT_PUBLIC_LOGIN_URL`).

## SAFE SURFACE INTEGRATION PATH (recommended — not yet implemented)

Preferred: **Surface → private Hermes endpoint → authenticated API** (no new
public exposure), in this order of preference:

1. **Tailscale-private reach (preferred).** If the VPS is on the tailnet (or is
   added), expose `:3012` to Surface **only over Tailscale** — e.g. a Tailscale
   Serve/`tailscale serve` or an nginx `/brain-api` listener bound to the
   tailnet IP — never a new public port. Surface client calls
   `http://<vps-tailscale-ip>/brain-api/api/*` with a Bearer JWT.
2. **Existing public path (if re-published).** Once `command.wise2.net` resolves
   again, Surface can use `https://command.wise2.net/brain-api/api/*` (Cloudflare
   + nginx already in place). Private path still preferred for a workstation.
3. **Surface client layer** (`/opt/wise2/hermes/client/`): thin, config-driven.
   - `config/hermes.conf` (non-secret): `HERMES_BASE_URL`, path prefix `/brain-api`.
   - `.env` (git-ignored): `HERMES_JWT` (or token-fetch creds) — **never committed**.
   - `wise2 hermes` extended to read `HERMES_BASE_URL` and probe `…/api/health`.
4. **Command Center mirror:** the Surface Command Center uses a **same-origin
   `/brain-api` proxy** (mirroring production) so the browser never holds the JWT.

## MISSING INFORMATION (to finish wiring — needs Daniel)

1. **Is `wise2-second-brain` currently running** on the VPS, and is the public
   endpoint intentionally down (DNS no record) or an outage?
2. **Which implementation is live** — the Express `api-server` or the NestJS
   `packages/api` brain-auth (refresh-token) service?
3. **Is the VPS reachable over Tailscale?** (It is not in this tailnet's visible
   node list; its IP `173.208.x.x` is a public VPS, not a 100.x tailnet addr.)
   If not, how should Surface reach Hermes privately?
4. **Headless token flow:** how should a non-browser Surface client obtain a JWT
   (service token signed with `JWT_SECRET`? a dedicated machine credential?).
   I will **not** invent this — confirm the intended mechanism.

## Guardrails honored

Public repo cloned read-only (no push/modify). No VPS login. No production
change. No new Hermes instance. No secret values printed. Clone lives in the
session scratchpad only (not committed, not under /opt/wise2).

---

## DISCOVERY ROUND 2 (2026-10-02) — deeper, still read-only

### Deployment topology (from repo)
- **Hermes brain = Express** `second-brain/api-server`, run by its **own PM2
  ecosystem** (`second-brain/api-server/ecosystem.config.js`, app
  `wise2-second-brain`, `PORT:3012`, `cwd:__dirname`). Not a Docker service.
- Root `ecosystem.config.js` defines a different app (`wise2-bot`); second-brain
  is **not** in it (runs independently).
- `docker-compose.production.yml` services: postgres, redis, **mongodb**, api,
  ollama, open-webui, website, dashboard, admin, studio, command-center,
  control-bridge, wise2-ai-router, worker, prometheus, grafana. ⇒ The **NestJS
  `api`** service (:3000) is the platform API; the Express brain is separate.
- `/brain-api` nginx proxy is **not committed** in repo nginx configs (root
  `nginx.conf` has no brain-api/3012 block). The live `/brain-api → :3012`
  mapping lives in the **VPS nginx** (server-side; compose note says
  "3011 reserved for /brain-api/" while the brain listens on 3012 — a
  server-side detail only VPS inspection can confirm).
- Edge reference: `products/byte-k10/deploy-hermes.sh` is a **client** pattern —
  `HERMES_HOST=localhost:3012`, checks `/dev/tcp` reachability, sets
  `BYTE_AI_ENDPOINT=http://$HERMES_HOST/api/chat`. Good template for Surface.

### Canonical implementation (Phase B)
**Express `second-brain/api-server` is the intended/live Hermes.** Evidence:
dedicated PM2 app named `wise2-second-brain` (matches historic process), package
`@wise2/second-brain-api`, port 3012, `/api/hermes/*` + `/api/brain/*` routes,
health `service:'wise2-second-brain'`, and the byte-k10 deploy targets :3012.
The **NestJS `packages/api/src/brain-auth`** (refresh-token + scopes + Mongo
schemas incl. obsidian-vault) is part of the **platform API**, likely a
next-gen/parallel capability — not the deployed Hermes process. *VPS inspection
needed to confirm what is actually running.*

### Auth capabilities present in code (Phase C — concept scan)
- refresh tokens: **PRESENT** · scopes/scoped: **PRESENT**
- service accounts: **absent** · machine tokens: **absent**
- OAuth device/headless flow: **absent** · API keys: **absent**
⇒ **No built-in safe machine/headless credential.** Auth is user-JWT (Google
OAuth → access+refresh, scoped), verified by the brain via shared `JWT_SECRET`.

### Tailnet / reachability
- VPS running Hermes (`173.208.x.x`) is a **public VPS, not a 100.x tailnet
  node**. Historical tailnet VPS/cloud nodes (`vps-0fa5d30a`, `wise2-cloud-agent`)
  are **offline (49d / 32d)**. Only online WISE² linux nodes now: `gpu-nmls-1`,
  `gl-mt3600be` — both have `:3012` closed (no Hermes there).
- **SSH blocked from Surface:** no private key in `~/.ssh`, no agent. Remote
  node login (Phase A.3) cannot proceed without Daniel providing access —
  **stopped and asked, per instruction.**

### Recommended machine-auth (do NOT implement yet)
Since no service-account/API-key/device-flow exists, **do NOT share `JWT_SECRET`
with Surface.** Recommend a **dedicated WISE² device credential**:
- Add a server-side **machine/service token** type (scoped, revocable,
  per-device) — e.g. a signed device JWT with a `device:surface` subject and a
  read-scoped claim, issued once by the Command Center/auth-gateway and stored in
  Surface `hermes/.env` (git-ignored). Surface never holds `JWT_SECRET`.
- Or a per-device **API key** table in Mongo validated by the brain. Either is a
  small, additive change to the existing auth — to be designed with Daniel.
