# WISE² Changelog

## 2026-10-06 — Hermes Cloudflare Tunnel created (not yet running) (Claude)
- Installed `cloudflared` v2026.10.0 locally on Surface at `~/.local/bin/`
  (user-local, no sudo).
- Authenticated to Cloudflare for the `wise2.net` zone;
  `~/.cloudflared/cert.pem` (0600).
- Created tunnel `wise2-hermes`,
  UUID `caa3dcb1-a944-4e46-9478-8490629f3b23`. Credentials JSON at
  `~/.cloudflared/<UUID>.json` (0400) — never commited, never left disk.
- Added DNS CNAME `hermes.wise2.net` → `<UUID>.cfargotunnel.com` (proxied,
  via `cloudflared tunnel route dns`). Verified propagation; HTTPS probe
  returns Cloudflare 530 (expected — tunnel origin not yet running).
- Tunnel origin deploy on `gpu-nmls-1` still pending: Tailscale ACL demands
  one-time interactive check-mode approval before the backgrounded `!`
  deploy script can SSH in. Documented in
  `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`.
- Cloudflare Access policy for `hermes.wise2.net` not yet created
  (dashboard clicks). Public endpoint is currently reachable without auth
  only because there is no tunnel origin; once origin is up, Access must be
  in place before anyone hits it with a real identity.
- No change to production VPS, DNS beyond the single tunnel CNAME,
  Tailscale ACL, nginx, or Hermes code.

## 2026-10-06 — Voice control + camera preview + Hermes reach via Cloudflare Access (Claude)
- Agent Command Graph UI (`command-center-ui/`): voice control panel using
  Web Speech API with command dispatcher (`fit view`, `zoom in/out`,
  `select <node>`, `clear selection`, `follow execution` / `exit follow`,
  `replay` / `play` / `pause`). Chrome/Edge supported; Firefox shows an
  "unsupported" message. All processing in-browser, no audio off-page.
- Local-only camera preview panel using `getUserMedia`; mirrors the frame;
  releases the track on panel close/unmount; graceful states for denied,
  unsupported, error.
- `WebSocketEventSource` rewritten to target
  `wss://hermes.wise2.net/brain-stream` with 3-second reconnect backoff;
  authentication is carried by the Cloudflare Access session cookie, so no
  Hermes token lives in the JS bundle. Still OFF by default — opt in with
  `?source=hermes`.
- Fixed infinite-render loop from zustand selectors returning fresh
  arrays/functions (Inspector + AnimatedEdge now subscribe to raw state and
  derive via `useMemo`; FollowCamera deps narrowed to last-step node id).
- ADR-0008 recorded; `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`
  updated to split browser (Cloudflare Access) vs host-to-host (Tailscale +
  device JWT) reach paths. Production work still owned by Daniel.
- `CURRENT-STATE.md` component row updated.
- No production changes. No Cloudflare, Tailscale ACL, VPS or DNS writes.

## 2026-10-06 — Agent Command Graph UI first-slice staged (Claude)
- Added `command-center-ui/`: Vite + React + TypeScript + `@xyflow/react` +
  `zustand`, bound to 127.0.0.1:3011 via `vite.config.ts` (`strictPort`).
- First-slice vertical: Hermes node (breathing + rotating activity rings),
  five registered nodes (Planner, Claude Agent, QA, Deploy, GitHub tool) plus
  an Approval node, animated edges with per-packet SVG `animateMotion`,
  drag/pan/zoom, selection, right-side Inspector, bottom Timeline with
  live/replay toggle, step/speed controls, and Follow Execution camera that
  recenters on each new execution step.
- Event schema in `src/types/events.ts`; `EventSource` adapter in
  `src/events/adapter.ts` with `SimulatedEventSource` (used by default) and
  `WebSocketEventSource` (stubbed to a 127.0.0.1 loopback path; not active).
- Hermes gateway host recorded as `hermes.wise2.net`; production connection
  still a pause point (ADR-0005, hermes/HERMES-PRODUCTION-CONNECTION-PENDING).
- No change to Python `command-center/` or its service; existing 127.0.0.1:3010
  port and read-only loopback contract preserved.
- `npm run build` passes (416 kB JS / 130 kB gzipped, 27 kB CSS).
- No push, no new systemd unit, no sudo required; feature is staged.
- ADR-0007 recorded.

## 2026-10-03 — Master level-up staged in isolated checkout (Codex)
- Read-only audit reconfirmed clean c04bfb2 and existing stable tag on `/opt/wise2`.
- Restricted session cannot observe host D-Bus/network/socket state or write to
  `/opt/wise2`; original source/unit/launchers preserved.
- STAGED CLI v0.2/shared functional doctor, verified metadata backups, safe
  rotated logs, registry, read-only dashboard modules/cache/stale labels and
  credential-safe existing Hermes probe. No backend or telemetry invented.
- Offline regression tests and real staging backup creation/verification pass;
  fixture success is not live workstation acceptance.
- Updated architecture/context/operations/recovery/enrollment/approval docs;
  acceptance/recovery script prepared. Live rollout/recovery/reboot blocked.
- No push, reboot, credential/production/security-boundary change or scan.

## 2026-10-04 — Control-bridge client scaffolded on Surface (DISABLED)
- Read-only discovery of `services/control-bridge/` in `dwise03-bit/wise2-core`
  (Fastify + zod + rate-limit, container `wise2-control-bridge-prod`, binds
  `127.0.0.1:3099`, base path `/v1/control/*`, Bearer `WISE2_CONTROL_TOKEN`,
  HMAC-signed writes via `WISE2_OPS_SIGNING_KEYS`).
- Scaffolded Surface client at `/opt/wise2/bridge/{README.md,
  CONTROL-BRIDGE-INTEGRATION.md, CONTROL-BRIDGE-CONNECTION-PENDING.md,
  DEVICE-CREDENTIAL.md, config/bridge.conf, client/bridge-client.sh,
  credentials/README.md}`. `BRIDGE_ENABLED=false`,
  `BRIDGE_ALLOW_WRITES=false`, 0700 credentials dir.
- `wise2 bridge` subcommand added; `wise2 doctor` gains an informational
  control-bridge panel. Doctor remains 25 PASS / 0 WARN / 0 FAIL.
- NO production change. NO Tailscale/DNS/firewall change. NO credential minted.
  Blocked on Daniel (private tailnet reach + device Bearer).

## 2026-10-02 — Codex authenticated; Shannon AI backend available
- codex login complete (ChatGPT). codex login status OK; v0.160.0.
- Shannon backend openai-codex:gpt-5.6-sol now available (codex authed); launcher unchanged; no scan run.
- wise2 doctor: 24 PASS / 0 WARN / 0 FAIL. Commits: 720da6b, 9c7e8cc (local only).

## 2026-10-02 — Toolchain installs (Steps 1-3) + first commit
- git identity set (Daniel Wise); git-lfs, btop, tree, shellcheck installed.
- GitHub CLI gh 2.102.0 installed + authenticated (dwise03-bit). Read-only repo inventory recorded.
- OpenAI Codex @openai/codex 0.160.0 installed (official scoped). codex login PENDING (interactive).
- First LOCAL commit 720da6b (54 files); no remote, no push. wise2 doctor: 24 PASS / 0 WARN / 0 FAIL.

## 2026-10-02 — Desktop integration + WISE² branding (user-level)
- Branding assets (placeholder): branding/wise2-logo.svg, wise2-wallpaper.svg.
- wise2-fetch branded panel; wise2-cc-open; wise2-apply-wallpaper; run-wrappers.
- 4 desktop launchers installed to ~/.local/share/applications (validated).
- Shell: branding/wise2.bashrc (PATH + prompt tag) sourced via removable ~/.bashrc block; ~/.bashrc backed up.
- Deferred (sudo+approval): Plymouth/GRUB/GDM/system-wide. Documented in branding/README.md.

## 2026-10-02 — Hermes discovery + Surface client (disabled)
- Read-only audit of public dwise03-bit/wise2-core: Hermes = Express second-brain/api-server
  (PM2 wise2-second-brain, :3012 loopback on VPS 173.208.x.x), JWT auth, Mongo+Ollama.
- Built DISABLED Surface Hermes client (hermes/client + config); honest 4-state in wise2 CLI + Command Center.
- Approved: Tailscale-private target + dedicated device credential (design only, none minted).
- Records: HERMES-INTEGRATION.md, DEVICE-CREDENTIAL.md, HERMES-PRODUCTION-CONNECTION-PENDING.md. ADR-0005.

> Dated, append-only. Newest at top. One entry per meaningful change set.

## 2026-10-02 — Initial WISE² build session (Claude Opus 4.8)
- Phase 0: Full non-destructive audit -> logs/setup-audit-20261002-122926.txt.
- Phase 1: docs/SURFACE-HARDWARE.md (validation matrix).
- Phase 3: Normalized /opt/wise2 canonical tree (20 dirs, dwise-owned).
- Phase 4: context/* shared layer + HANDOFF-TEMPLATE + agents/handoffs/ + root CLAUDE.md.
- Phase 5 (safe): Comprehensive .gitignore. Git init/identity/remote deferred to Daniel.
- Phase 6: hermes/README.md skeleton + config dir (durable vs chat memory).
- Phase 7: Preserved Shannon launchers; security/configs/command-center-adapter.md.
- Phase 8: Command Center scaffold (server.py + dashboard), localhost-only, read-only,
  path-traversal guarded -- started/tested/stopped OK.
- Phase 9: wise2 CLI + scripts/lib/common.sh (20 subcommands). doctor=21 PASS/3 WARN/0 FAIL.
- Phase 10: Hardened systemd unit TEMPLATES in services/ (NOT installed).
- Phase 11: docs/REMOTE-ACCESS.md.
- Phase 12: wise2 backup tested; recovery/README.md + RECOVERY.md; backups/support READMEs.
- Phase 14: devices/wise2-surface.json (non-secret, valid JSON).
- Phase 15: docs/BUILD-REPORT.md. Phase 2 verified commands -> docs/INSTALL-PLAN.md.
- No destructive actions. No secrets. No sudo used.
