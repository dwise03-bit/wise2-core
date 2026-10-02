# WISE² Branding

Visual identity: deep black/navy · metallic chrome · electric green · premium
AI command-center aesthetic. **Placeholder assets only** — no official logo was
fabricated. Drop official assets in here (same filenames) to upgrade everything.

## Assets
- `wise2-logo.svg` — app/launcher icon (placeholder).
- `wise2-wallpaper.svg` — desktop wallpaper (placeholder; PNG optional).
- `applications/*.desktop` — canonical launcher definitions.

## Done (user-level, reversible, no sudo)
- Terminal banner: `wise2-fetch` (also `WISE2 System Info` launcher).
- Shell: `wise2.bashrc` adds `/opt/wise2/scripts` to PATH + a `wise²` prompt tag;
  sourced from `~/.bashrc` via a removable `# >>> WISE2-INTEGRATION >>>` block
  (original ~/.bashrc backed up in /opt/wise2/backups/).
- Desktop launchers installed to `~/.local/share/applications/`:
  Command Center, Claude, Shannon (status; no scan), System Info.
- Wallpaper applier: `wise2-apply-wallpaper` (run from the GNOME session).

## Deferred — require sudo + explicit approval (NOT done)
> Back up originals before ANY of these; do not risk boot reliability for cosmetics.
- **Plymouth** boot splash (`/usr/share/plymouth/themes/…`, `update-initramfs`).
- **GRUB** theme/text (`/etc/default/grub`, `/boot/grub/…`, `update-grub`).
  Never change kernel selection; keep Surface + generic fallback kernels.
- **GDM** login branding.
- System-wide wallpaper default (vs per-user gsettings).
- Installing launchers/icons system-wide (`/usr/share/applications`, icon themes).

## Where official assets go
Replace the placeholder SVGs here with official WISE² artwork (keep filenames),
then re-run `wise2-apply-wallpaper` and refresh the launcher icons.
