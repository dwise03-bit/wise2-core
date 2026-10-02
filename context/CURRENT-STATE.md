# WISE² Current State

> **Living document.** Every agent updates this at the end of a task.
> Last updated: 2026-10-02 by Claude (Opus 4.8) — initial WISE² build session.

## Machine (audited 2026-10-02)

- Host: `Wise2-surface` · Ubuntu 24.04.5 LTS · kernel `6.19.8-surface-3`
- CPU i7-1185G7 (4C/4T) · 15 GiB RAM + 4 GiB swap · ~222 GB free on `/`
- Secure Boot disabled · Firmware 33.108.143
- Tailscale IP: `100.97.230.73` · LAN: `192.168.1.14/24`
- `wise2 doctor`: 21 PASS / 3 WARN / 0 FAIL

## Done this session (safe, no sudo)

Audit · SURFACE-HARDWARE.md · canonical tree · context layer + CLAUDE.md ·
.gitignore · Hermes skeleton · Shannon adapter contract · Command Center scaffold
(tested, localhost) · wise2 CLI (tested) · unit templates (staged) ·
REMOTE-ACCESS.md · backup (tested) + recovery docs · device manifest ·
BUILD-REPORT.md · INSTALL-PLAN.md.

## Pending — needs Daniel (auth / secret / sudo / approval)

- [ ] apt: `git-lfs btop tree shellcheck` (sudo) — docs/INSTALL-PLAN.md
- [ ] GitHub CLI `gh` (sudo) + `gh auth login`
- [ ] OpenAI Codex `sudo npm i -g @openai/codex` + `codex login` (also Shannon backend)
- [ ] git identity (`user.name` / `user.email`)
- [ ] install wise2 CLI: `sudo ln -sf /opt/wise2/scripts/wise2 /usr/local/bin/wise2`
- [ ] systemd units (install templates when always-on wanted) (sudo)
- [ ] Git repo init + remote + first push (show status first; never force-push)
- [ ] branding Phase 13 (GRUB/Plymouth/GDM/wallpaper) (sudo + approval, back up first)
- [ ] Hermes implementation (confirm stack / existing port)

## Known warnings

- SSH on `0.0.0.0:22` (LAN + Tailscale; no router port-forward). Documented.
- Shannon depends on npx + network + npm cache; offline first-run may fail.
- Shannon AI backend (`openai-codex:gpt-5.6-sol`) unavailable until Codex installed.

## Do-not-touch (validated working)

Surface kernel · generic fallback kernels · touch stack · Claude native install ·
Tailscale + its ACL · OpenSSH config · Docker · Shannon launchers · existing
`/opt/wise2/security` contents.
