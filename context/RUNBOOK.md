# WISE² Runbook

> Operational procedures. Commands assume user `dwise` on `Wise2-surface`.
> Last updated: 2026-10-02.

## Health check
- `wise2 doctor` (once Phase 9 lands) — PASS/WARN/FAIL diagnostic.
- Manual: `systemctl is-active ssh tailscaled docker bluetooth`,
  `tailscale status`, `df -h /`, `free -h`.

## Remote in
- `ssh dwise@100.97.230.73` from an authorized tailnet device. See
  `/opt/wise2/docs/REMOTE-ACCESS.md`.

## Shannon (authorized testing only)
- Guarded: `wise2-pentest` (prompts for authorization; type `yes`).
- Direct: `wise2-shannon <args>` (Shannon CLI).
- **Never** run against systems not owned/authorized. See `context/SECURITY.md`.

## Docker
- `docker ps`, `docker compose version`. User `dwise` is in `docker` group.

## Updating context after a task
1. Edit `CURRENT-STATE.md`. 2. Append to `CHANGELOG.md`.
3. Add `DECISIONS.md` entry if architectural. 4. Handoff record if needed.

## Backups (Phase 12)
- `wise2 backup` (once available) snapshots config + context to `/opt/wise2/backups`.
- Back up unknown/production config **before** modifying it.

## Recovery
- See `/opt/wise2/recovery/RECOVERY.md`. Generic Ubuntu kernels are the fallback;
  never remove them.
