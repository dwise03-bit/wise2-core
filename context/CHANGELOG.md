# WISE² Changelog

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
