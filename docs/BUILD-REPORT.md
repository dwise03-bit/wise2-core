# WISE² Linux — Build Report

**Machine:** WISE² Surface (`Wise2-surface`) · Microsoft Surface Laptop 4
**Date:** 2026-10-02 · **Builder:** Claude Code (Opus 4.8), session as `dwise`
**Baseline audit:** `/opt/wise2/logs/setup-audit-20261002-122926.txt`
**Diagnostic at report time:** `wise2 doctor` → **21 PASS · 3 WARN · 0 FAIL**

---

## Completed (this session — safe, non-destructive, no sudo)

| Phase | Deliverable |
|---|---|
| 0 Audit | Full non-destructive audit + PASS/WARN/MISSING/ACTION summary |
| 1 Hardware | `docs/SURFACE-HARDWARE.md` validation matrix |
| 3 Workspace | Normalized `/opt/wise2` canonical tree (20 dirs, dwise-owned) |
| 4 Context | `context/*` (12 docs + handoff template) + `/opt/wise2/CLAUDE.md` + `agents/handoffs/` |
| 5 Git (safe) | Comprehensive `/opt/wise2/.gitignore` (secrets-protecting) |
| 6 Hermes | `hermes/README.md` skeleton + config dir + durable-vs-chat-memory doc |
| 7 Shannon | Verified + preserved launchers; `security/configs/command-center-adapter.md` |
| 8 Command Center | Working read-only scaffold (`server.py` + dashboard), localhost-only, tested |
| 9 CLI | `wise2` CLI + `scripts/lib/common.sh` (20 subcommands), tested |
| 10 Services | Hardened unit **templates** staged in `services/` (not installed) |
| 11 Remote | `docs/REMOTE-ACCESS.md` |
| 12 Backup/Recovery | `wise2 backup` (tested), `recovery/README.md` + `RECOVERY.md`, backups README |
| 13 Branding | WISE² text banner (CLI) + Command Center visual identity (partial — see pending) |
| 14 Device node | `devices/wise2-surface.json` (non-secret manifest, valid JSON) |
| 15 Report | This document |

## Working & validated

- Surface kernel `6.19.8-surface-3` (GRUB default; generic fallbacks retained).
- Touch stack (`iptsd@dev-hidraw0`), Wi-Fi, Bluetooth, graphics (Wayland).
- OpenSSH (22), Tailscale (100.97.230.73), Docker 29.1.3 + Compose.
- Node v22.23.3, Python 3.12.3, git 2.43.0; jq/rg/fd/tmux/htop present.
- Claude Code 2.1.287 (native, authenticated).
- Shannon 3.3.0 via `wise2-shannon`; `wise2-pentest` authorization gate intact.
- `wise2` CLI (`status`/`doctor`/`backup`/`version`/… all run).
- Command Center: live read-only API, localhost-only, traversal-guarded, tested.

## Installed 2026-10-02

git identity (Daniel Wise) · git-lfs/btop/tree/shellcheck · GitHub CLI gh 2.102.0 (authed dwise03-bit) · OpenAI Codex @openai/codex 0.160.0 (logged in via ChatGPT) · Shannon AI backend available · wise2 CLI symlink still pending (sudo) · 2 local commits (no remote). `wise2 doctor`: 24 PASS / 0 WARN / 0 FAIL.

## Pending — needs Daniel (auth / secret / sudo / approval)

1. **apt installs** (sudo): `git-lfs btop tree shellcheck` — see `docs/INSTALL-PLAN.md`.
2. **GitHub CLI `gh`** (sudo + `gh auth login`) — official repo, verified commands.
3. **OpenAI Codex** (`sudo npm i -g @openai/codex` + `codex login`) — also Shannon's
   AI backend (`SHANNON_AI_MODEL=openai-codex:gpt-5.6-sol`).
4. **Git identity** — set `user.name` / `user.email` (your choice).
5. **`wise2` CLI install** — `sudo ln -sf /opt/wise2/scripts/wise2 /usr/local/bin/wise2`.
6. **systemd units** — install templates once you want CC/Hermes always-on (sudo).
7. **Git repo + remote + first push** — I will show remotes/status and ask first.
8. **Branding (GRUB/Plymouth/GDM/wallpaper)** — sudo + approval; back up originals first.
9. **Hermes implementation** — confirm stack / whether an existing Hermes should be ported.

## Warnings (from `wise2 doctor`)

- `gh (GitHub CLI)` — not installed (WARN).
- `codex` — not installed (WARN).
- `git identity configured` — not set (WARN).
- (All three clear after the Daniel steps above. 0 FAIL.)

## Services

- Active: ssh, tailscaled, docker, bluetooth, iptsd@dev-hidraw0.
- WISE² units: **not created** (templates staged; policy = only real software gets a unit).

## Ports (listening)

- `0.0.0.0:22` SSH (LAN + Tailscale; no router port-forward) · `:631` CUPS localhost
- `:53` systemd-resolved localhost · Tailscale 41641/udp.
- Command Center `127.0.0.1:3010` only when run (not a daemon yet).

## Key directories

`/opt/wise2/{context,docs,scripts,services,recovery,devices,command-center,hermes,security,backups}`
— full map in `context/ARCHITECTURE.md`.

## Versions

OS 24.04.5 LTS · kernel 6.19.8-surface-3 · Node v22.23.3 · Python 3.12.3 ·
Docker 29.1.3 · Claude 2.1.287 · Shannon 3.3.0 · Tailscale 1.102.4 · wise2 CLI 0.1.0.

## Recovery

`recovery/README.md` → `recovery/RECOVERY.md`. Fallback kernels retained.
Config restore from `/opt/wise2/backups/`. `wise2 doctor` for quick diagnosis.

## Recommended next actions

1. Run the sudo block in `docs/INSTALL-PLAN.md` (gh, codex, git-lfs, wise2 symlink).
2. `gh auth login` + `codex login` + set git identity.
3. Re-run `wise2 doctor` (expect WARNs → 0).
4. Decide Hermes stack; then I wire the Command Center Shannon adapter.
5. When ready, approve Git repo init + remote so context can sync (no secrets).
6. Schedule branding (Phase 13) after infra is confirmed stable.
