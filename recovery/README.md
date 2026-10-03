# WISE² Recovery & Diagnostics

Start here if something is broken.

1. **Boot problem?** → GRUB *Advanced options* → a generic Ubuntu kernel
   (fallbacks are kept on purpose). See `RECOVERY.md` → Boot / kernel.
2. **Can't reach the machine?** → `RECOVERY.md` → Network / SSH / Tailscale.
3. **Service down?** → `wise2 doctor`, then `RECOVERY.md` for that component.
4. **Config broke after a change?** → verify a metadata archive, inspect selected files in a new staging directory,
   and review replacement first (`docs/BACKUP-RECOVERY.md`).

Quick diagnostic: `wise2 doctor` (PASS/WARN/FAIL).
Full reference: `RECOVERY.md` in this directory.
Baseline audit: `/opt/wise2/logs/setup-audit-20261002-122926.txt`.

**Never remove the generic Ubuntu kernels or the Surface kernel 6.19.8-surface-3.**
