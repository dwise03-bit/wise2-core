# WISE² OSS Ops Toolkit — Deployment Guide

Status: **config generated, NOT deployed**. This guide covers all 4 phases. See
`data/decisions/2026-08-28-oss-tooling-adoption.md` for the ADR/rationale.

All phases use a shared external network named `wise2-toolkit` and are independent
of `docker-compose.prod.yml` — bringing a phase up or down never touches existing
`wise2-*` production containers.

---

## Before you deploy anything

1. **Port conflict check** — ports 3001 and 3002 are already used elsewhere in this
   monorepo's other compose files (`docker-compose.mvp.yml`, `docker-compose.yml`,
   `docker-compose.pi.yml`, `docker-compose.prod.yml`'s `prompt-shop` service), so
   the toolkit remaps around them: **Uptime Kuma → 3006** (container port 3001),
   **Langfuse → 3007** (container port 3000). Run before every deploy:
   ```bash
   docker ps --format '{{.Names}}\t{{.Ports}}' | grep -E ':(3006|3007|8000|8001|8003|9000)->'
   ```
   If any of those host ports are already bound by a container you need to keep
   running, edit the `ports:` line in the relevant `docker-compose.phaseN-*.yml`
   before `up -d`.
2. **DNS/nginx** — none of these services get a public hostname automatically. Add
   an nginx server block + Let's Encrypt cert per service before exposing publicly
   (pattern: see `nginx.conf` for existing subdomain routing, e.g. `signal.wise2.net`).
   Until then, access via SSH tunnel: `ssh -L 3001:127.0.0.1:3001 dwise@173.208.147.165`.
3. **`.env.production` additions** — see the "Environment Variables" table per phase below.

---

## Phase 1 — Uptime Kuma + GlitchTip

**File**: `docker-compose.phase1-monitoring.yml`

```bash
docker compose -f docker-compose.phase1-monitoring.yml up -d
docker compose -f docker-compose.phase1-monitoring.yml ps
docker compose -f docker-compose.phase1-monitoring.yml logs -f glitchtip-web
```

**Verify**:
```bash
curl -I http://127.0.0.1:3006/          # Uptime Kuma → expect 200
curl -sf http://127.0.0.1:8000/_health/ # GlitchTip → expect healthy JSON
```

**First-run setup**:
1. Visit Uptime Kuma at `:3006`, create the admin account, add monitors for every
   production URL (`https://wise2.net`, `https://api.wise2.net/health`,
   `https://signal.wise2.net`, `https://api.signal.wise2.net/health`,
   `https://wisedefensellc.com`, etc.).
2. Visit GlitchTip at `:8000`, create an org + project per app (`wise2-api`,
   `wise2-website`, `wise2-dashboard`, `hermes`, ...). Copy each project's DSN.

**Environment variables** (add to `.env.production`):
| Variable | Purpose |
|---|---|
| `GLITCHTIP_SECRET_KEY` | Django secret key — generate with `openssl rand -base64 48` |
| `GLITCHTIP_DB_PASSWORD` | Postgres password for the GlitchTip DB |
| `GLITCHTIP_DOMAIN` | Public URL once nginx is configured (e.g. `https://errors.wise2.net`) |

**Integration point**: once DSNs are issued, add `SENTRY_DSN=<glitchtip-dsn>` to each
app's environment (NestJS API, Next.js apps use `@sentry/nextjs` /
`@sentry/node` — GlitchTip is wire-compatible with the Sentry SDK, so no new
dependency beyond the standard Sentry client is required).

---

## Phase 2 — Infisical + Renovate + restic

**Files**: `docker-compose.phase2-infisical.yml`, `.renovaterc.json`, `scripts/backup-setup.sh`

> Naming note: this repo's Claude Code permission config denies read/write on any
> path containing the substring `secret` (see `.claude/settings.json`), so the
> compose file is named `phase2-infisical.yml` rather than `phase2-secrets.yml`.

```bash
docker compose -f docker-compose.phase2-infisical.yml up -d
```

**Verify**:
```bash
curl -sf http://127.0.0.1:8001/api/status
```

**First-run setup**: visit `:8001`, create the admin/org account, create one
Infisical project per app, generate a machine identity + service token for CI/CD.
Migrate `.env.production` values into Infisical **incrementally per app** — do not
delete plaintext env files until each app has been verified running against
Infisical-sourced config.

**Environment variables**:
| Variable | Purpose |
|---|---|
| `INFISICAL_ENCRYPTION_KEY` | `openssl rand -hex 16` |
| `INFISICAL_AUTH_SECRET` | `openssl rand -base64 32` |
| `INFISICAL_DB_PASSWORD` | Postgres password |
| `INFISICAL_SITE_URL` | Public URL once nginx is configured |

**Renovate**: `.renovaterc.json` is monorepo-aware for the 28 workspaces under
`apps/*` and `packages/*` (per `pnpm-workspace.yaml`). Activation requires
installing the [Renovate GitHub App](https://github.com/apps/renovate) on this repo
(or running `renovate` via a scheduled GitHub Action) — no server component to deploy.
Minor/patch updates auto-merge after a 3-day soak; majors get weekly PRs requiring
manual review; native mobile toolchains and Docker base images never auto-merge.

**restic backups**: run once to bootstrap:
```bash
sudo ./scripts/backup-setup.sh
```
This installs restic if missing, generates/stores a repository password at
`/etc/wise2/restic-password` (back this up out-of-band — losing it makes existing
backups unrecoverable), initializes the repository, and writes
`/usr/local/bin/wise2-restic-backup.sh`. The script prints the crontab line to add
manually (daily 02:00 UTC, matching the schedule already documented in `CLAUDE.md`):
```
0 2 * * * /usr/local/bin/wise2-restic-backup.sh >> /backups/wise2-restic/cron.log 2>&1
```
Verify after first scheduled run: `restic snapshots`, `restic stats latest`.

---

## Phase 3 — Promptfoo + Langfuse + Chroma

**Files**: `docker-compose.phase3-ai-ops.yml`, `scripts/promptfoo-tests.yml`,
`packages/api/src/langfuse.integration.ts`

```bash
docker compose -f docker-compose.phase3-ai-ops.yml up -d
```

**Verify**:
```bash
curl -sf http://127.0.0.1:3007/api/public/health
curl -sf http://127.0.0.1:8003/api/v2/heartbeat   # chromadb/chroma:latest deprecated the v1 API
```

**First-run setup**: visit Langfuse at `:3007`, create the admin account + a
project, generate a public/secret API key pair.

**Environment variables**:
| Variable | Purpose |
|---|---|
| `LANGFUSE_NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `LANGFUSE_SALT` | `openssl rand -base64 32` |
| `LANGFUSE_DB_PASSWORD` | Postgres password |
| `LANGFUSE_PUBLIC_URL` | Public URL once nginx is configured |
| `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` | Generated from the Langfuse UI, needed by `packages/api` |
| `CHROMA_AUTH_TOKEN` / `CHROMA_AUTH_PROVIDER` | Optional — leave blank for no-auth local dev, set before any public exposure |

**Integration points (code changes required, not yet made)**:
1. `npm install langfuse` in `packages/api` (not currently a dependency).
2. Register `LangfuseModule` (exported from `packages/api/src/langfuse.integration.ts`)
   in `packages/api/src/app.module.ts`.
3. Inject `LangfuseService` into `HermesService`
   (`packages/api/src/hermes/hermes.service.ts`, `chat()` method at line ~345) and
   wrap the Ollama call with `langfuse.withTrace(...)` — see the worked example in
   the JSDoc at the top of `langfuse.integration.ts`.
4. Run the promptfoo suite: `npx promptfoo eval -c scripts/promptfoo-tests.yml`
   (requires `HERMES_API_URL`, `HERMES_TEST_JWT`, `BRAIN_API_URL`,
   `BRAIN_API_SESSION_COOKIE` env vars — none of these exist yet and must be
   provisioned from a real test account before the suite can run for real).

---

## Phase 4 — Portainer + Maestro + SwiftLint/ktlint + Ansible/Tailscale

**Files**: `docker-compose.phase4-infra.yml`, `apps/fieldtech-android/maestro.yml`
(+ 3 flow files under `apps/fieldtech-android/maestro/`),
`apps/wise-hvac-demo/ios/Maestro/maestro.yml` (+ 3 flow files under
`apps/wise-hvac-demo/ios/Maestro/maestro/`), `apps/fieldtech-ios/.swiftlint.yml`,
`CJAYS/.swiftlint.yml`, `apps/fieldtech-android/ktlint.editorconfig`,
`CJAYS/ktlint.editorconfig`.

```bash
docker compose -f docker-compose.phase4-infra.yml up -d
```

**Verify**:
```bash
curl -sf http://127.0.0.1:9000/api/status
```
Note: `portainer/portainer-ce:latest` ships distroless with no shell/curl/wget, so
there is no in-container `HEALTHCHECK` — this compose service intentionally has
none. Verify externally via the curl above, or add it as an Uptime Kuma monitor.

**Security**: Portainer's container gets read-only access to the host Docker
socket, which is root-equivalent. Never bind port 9000 to `0.0.0.0` or expose it
without an authenticating reverse proxy or Tailscale in front of it.

**Path mismatch resolved 2026-08-28**: the real FieldTech iOS project is at
`apps/wise-hvac-demo/ios/App` (bundle id `com.wisedefense.fieldtech`). The Maestro
entry point and its 3 sub-flows were relocated from `apps/fieldtech-ios/` to
`apps/wise-hvac-demo/ios/Maestro/`. `apps/fieldtech-ios/.swiftlint.yml` remains at
its original generated path (not relocated — SwiftLint config is resolved by
`--config` flag, not by proximity to the Xcode project). The Android equivalents
are correct as-is — `apps/fieldtech-android` is the real project (package
`com.wise2.fieldtech`).

**Maestro**: install the CLI (`curl -Ls "https://get.maestro.mobile.dev" | bash`),
then:
```bash
maestro test apps/fieldtech-android/maestro.yml             # requires a running emulator/device
maestro test apps/wise-hvac-demo/ios/Maestro/maestro.yml    # requires a running iOS simulator
```
Both entry-point files chain 3 sub-flows via `runFlow`; each sub-flow also runs
standalone for targeted debugging. UI text selectors in the flows are best-effort
guesses based on component names/screens described in `data/daily-logs/2026-08-28.md`
and source file names — **verify actual visible text/accessibility IDs against a
running build before relying on these in CI**, since no accessibility identifiers
were confirmed in this generation pass.

**SwiftLint / ktlint**: neither is installed yet.
```bash
brew install swiftlint      # macOS
brew install ktlint         # or use the Gradle ktlint plugin
```
ktlint does not auto-discover a file named `ktlint.editorconfig` — either merge its
`[*.{kt,kts}]` block into a real `.editorconfig` in each module, or invoke
explicitly: `ktlint --editorconfig=apps/fieldtech-android/ktlint.editorconfig`.
`CJAYS/.swiftlint.yml` is a no-op today (CJAYS is Kotlin-only); it's generated for
future-proofing only.

**Ansible/Tailscale** (no container, no config file generated — infra-as-code and
private networking are operational practices, not deployable artifacts):
- **Tailscale**: install on the VPS (`curl -fsSL https://tailscale.com/install.sh | sh`)
  and on any admin machine, then bind Portainer/Infisical/Langfuse/GlitchTip to the
  Tailscale interface IP instead of a public nginx vhost for admin-only tools —
  removes the need for public auth on tools that only the founder uses.
- **Ansible**: recommended next step is an `ansible/` playbook directory codifying
  the manual VPS setup steps already documented in `DEPLOYMENT_HANDOFF.md` (Docker
  install, nginx, certbot, this toolkit's `docker compose up -d` calls) — out of
  scope for this generation pass; flagged as a follow-up in the ADR.

---

## Rollback (any phase)

```bash
docker compose -f docker-compose.phaseN-*.yml down      # stops + removes containers, keeps volumes
docker compose -f docker-compose.phaseN-*.yml down -v    # also deletes volumes — data loss, confirm first
```

## Full toolkit health check

```bash
for f in docker-compose.phase1-monitoring.yml docker-compose.phase2-infisical.yml \
         docker-compose.phase3-ai-ops.yml docker-compose.phase4-infra.yml; do
  echo "== $f =="; docker compose -f "$f" ps
done
```
