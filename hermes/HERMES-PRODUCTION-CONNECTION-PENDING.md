# HERMES-PRODUCTION-CONNECTION-PENDING

> Tracking record for the unresolved production work required before Surface can
> actually connect to Hermes. Opened 2026-10-02. Last reviewed 2026-10-05 —
> still blocked on the items below. **No production changes made.**

## Target architecture (approved, 2026-10-06 — superseded split)
**Two reach paths** (see `context/DECISIONS.md` ADR-0008):
- **Browser → Hermes:** `wss://hermes.wise2.net/brain-stream`, Cloudflare
  Tunnel origin behind a Cloudflare Access policy. Access cookie carries
  auth; no Hermes token in the JS bundle. Browser does NOT join the tailnet.
- **Host-to-host (CLI, device agents) → Hermes:** Tailscale-private; scoped
  WISE² device credential (see DEVICE-CREDENTIAL.md). Never share JWT_SECRET.
- Surface browser UI built but **DISABLED by default**; opt-in with
  `?source=hermes` once the production path is live.

## Progress (2026-10-06)
- [x] **cloudflared installed locally** on Surface at `~/.local/bin/cloudflared`
      (v2026.10.0; user-local, no sudo).
- [x] **Cloudflare account cert** written at `~/.cloudflared/cert.pem` (0600)
      via `cloudflared tunnel login` on the `wise2.net` zone.
- [x] **Tunnel object created** — name `wise2-hermes`,
      UUID `caa3dcb1-a944-4e46-9478-8490629f3b23`. Credentials JSON stored
      at `~/.cloudflared/<UUID>.json` (0400). Not committed; never leaves disk.
- [x] **DNS CNAME live** — `hermes.wise2.net` → `<UUID>.cfargotunnel.com`.
      Verified propagation; HTTPS probe currently returns Cloudflare 530
      (expected until tunnel origin is running on gpu-nmls-1).
- [x] **Browser-path reach architecture recorded** — ADR-0008, runbook at
      `hermes/HERMES-CLOUDFLARE-TUNNEL-RUNBOOK.md`.

## 2026-10-05 findings (read-only probe from Surface)

- **VPS confirmed as `gpu-nmls-1`** (tailnet `100.68.145.5`), owner `dwise03@`.
  TSMP pong 264 ms — peer is live and reachable from Surface.
- **Loopback-only ports as documented:** TCP 3012 (Hermes) and 3099 (control-bridge)
  are closed from the tailnet — expected, no change needed.
- **nginx is running** (`nginx/1.24.0 Ubuntu`) and open on 80 + 443. Port 80
  redirects everything to HTTPS same-host.
- **nginx TLS gap:** every HTTPS handshake to `100.68.145.5:443` fails with
  `TLSv1.3 internal error` for every SNI tried (`100.68.145.5`, `gpu-nmls-1`,
  `command.wise2.net`, `wise2.net`, `brain.wise2.net`). nginx has no cert
  matching any hostname Surface can reach. Either fix the nginx TLS config, or
  (preferred) bypass it entirely with `tailscale serve` (see runbook below).

## Blocking items (owner: Daniel / production)

### Common
- [ ] **VPS status** — confirm `wise2-second-brain` (PM2) is running on
      `gpu-nmls-1`; confirm Mongo + Ollama health.
- [ ] **Impl confirm** — Express `second-brain/api-server` (evidence: live) vs
      NestJS `packages/api/brain-auth` (next-gen?). Confirm on the box, and
      ensure the chosen service exposes `/brain-stream` as SSE or WS.
- [ ] **Public DNS** — `command.wise2.net` has NO A/AAAA/CNAME now. Decide:
      intentionally down vs restore. Private path preferred regardless.

### Host-to-host path (CLI, device agents) — Tailscale serve
- [ ] **Private reach (preferred: `tailscale serve`)** — on `gpu-nmls-1`, run
      the steps in `docs/VPS-TAILSCALE-SERVE-RUNBOOK.md` to publish
      `/brain-api → 127.0.0.1:3012` on the tailnet. Record the resulting
      `https://gpu-nmls-1.<tailnet>.ts.net/brain-api` URL in `HERMES_BASE_URL`.
- [ ] **Device credential** — mint scoped device JWT server-side, deliver
      out-of-band, install to 0600 credential file.
- [ ] **Enable** — set `HERMES_ENABLED=true` + `HERMES_BASE_URL` for CLI;
      verify CONFIGURED→REACHABLE→AUTHENTICATED→MEMORY→READY via
      `wise2 hermes`.

### Browser path — Cloudflare Tunnel + Access (per ADR-0008)
- [ ] **Tunnel origin on gpu-nmls-1** — install `cloudflared` on the VPS +
      drop the credentials JSON for tunnel `wise2-hermes`
      (UUID `caa3dcb1-a944-4e46-9478-8490629f3b23`) + ingress to
      `http://127.0.0.1:3012`. Full runbook:
      `hermes/HERMES-CLOUDFLARE-TUNNEL-RUNBOOK.md`. SSH deploy from Surface
      is currently blocked by a Tailscale ACL check-mode prompt that must
      be approved interactively (not from a backgrounded `!` command).
- [ ] **Cloudflare Access policy** — create a Zero Trust Access application
      for `hermes.wise2.net`; identity provider = Google (dwise03@gmail.com)
      or email OTP allow-list; `/brain-stream` must require authentication.
- [ ] **Browser verify** — hit `http://127.0.0.1:3011/?source=hermes` in a
      Cloudflare-Access-logged-in browser; expect at least one `node.status`
      event in the Command Graph UI.

## Must NOT change without explicit approval
Production VPS, DNS, nginx, production Hermes, MongoDB, JWT config,
Tailscale ACL, Cloudflare Access policies, Cloudflare Tunnel config.
(All currently untouched by this session.)

## Evidence
Read-only inspection: `hermes/HERMES-INTEGRATION.md`. Temp clone (~610 MB) kept
in the session scratchpad only — NOT committed into /opt/wise2.
