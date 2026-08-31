# WISE² Ghostty Command Center

Run `pnpm --dir tools/ghostty test`, then `bash tools/ghostty/scripts/install.sh`.
Configuration lives at `~/.config/wise2/config.yaml`; the Control Bridge token is
read only from `WISE2_CONTROL_TOKEN`. Local/GPU routing is explicit, and Claude
or Codex are launched only by `wise handoff claude|codex`. Uninstall preserves
`config.yaml`.
