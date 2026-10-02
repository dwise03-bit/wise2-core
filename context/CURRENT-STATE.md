# WISE² Current State

> **Living document.** Every agent updates this at the end of a task.
> Last updated: 2026-10-02 by Claude (Opus 4.8) — initial WISE² build session.

## Machine (audited 2026-10-02)

- Host: `Wise2-surface` · Ubuntu 24.04.5 LTS · kernel `6.19.8-surface-3`
- CPU i7-1185G7 (4C/4T) · 15 GiB RAM + 4 GiB swap · ~222 GB free on `/`
- Secure Boot disabled · Firmware 33.108.143
- Tailscale IP: `100.97.230.73` · LAN: `192.168.1.14/24`
- `wise2 doctor`: 24 PASS / 0 WARN / 0 FAIL

## Done this session (safe, no sudo)

Audit · SURFACE-HARDWARE.md · canonical tree · context layer + CLAUDE.md ·
.gitignore · Hermes skeleton · Shannon adapter contract · Command Center scaffold
(tested, localhost) · wise2 CLI (tested) · unit templates (staged) ·
REMOTE-ACCESS.md · backup (tested) + recovery docs · device manifest ·
BUILD-REPORT.md · INSTALL-PLAN.md.

**Installed 2026-10-02:** git identity (Daniel Wise), git-lfs/btop/tree/shellcheck, GitHub CLI `gh` 2.102.0 (authed as dwise03-bit), OpenAI Codex `@openai/codex` 0.160.0 (installed + **logged in via ChatGPT** 2026-10-02). First local git commit 720da6b (no remote).

## Pending — needs Daniel (auth / secret / sudo / approval)

- [x] wise2 CLI installed: /usr/local/bin/wise2 -> scripts/wise2
- [ ] systemd units (install templates when always-on wanted) (sudo)
- [ ] Git repo init + remote + first push (show status first; never force-push)
- [ ] branding Phase 13 (GRUB/Plymouth/GDM/wallpaper) (sudo + approval, back up first)
- [ ] Hermes implementation (confirm stack / existing port)

## Milestone

Toolchain complete; Codex authenticated; Shannon AI backend (openai-codex:gpt-5.6-sol) available. `wise2 doctor` 24 PASS / 0 WARN / 0 FAIL. Local commits 720da6b, 9c7e8cc (no remote).

## Known warnings

- SSH on `0.0.0.0:22` (LAN + Tailscale; no router port-forward). Documented.
- Shannon depends on npx + network + npm cache; offline first-run may fail.
- Shannon AI backend (`openai-codex:gpt-5.6-sol`) unavailable until Codex installed.

## Do-not-touch (validated working)

Surface kernel · generic fallback kernels · touch stack · Claude native install ·
Tailscale + its ACL · OpenSSH config · Docker · Shannon launchers · existing
`/opt/wise2/security` contents.
