# WISE² Changelog

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
