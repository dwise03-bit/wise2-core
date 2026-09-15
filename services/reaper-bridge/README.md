# WISE² REAPER Bridge

The bridge is intentionally bound to localhost by default. It requires a bearer token on every request and is designed to sit behind Tailscale when remote Discord/API access is needed. The current adapter is a deterministic mock so the HTTP contract can be tested without REAPER; the next workstation step is replacing it with the Lua ReaScript adapter in `src/` while preserving the same `ReaperAdapter` interface.

Run with `WISE2_REAPER_BRIDGE_TOKEN=... pnpm dev`. Never bind this service to `0.0.0.0` without a private network policy and firewall.

## Linux installation

From the repository root on a systemd Linux desktop or VPS:

```bash
bash services/reaper-bridge/scripts/install-linux.sh
systemctl --user status wise2-reaper-bridge
```

The installer persists a randomly generated token in `~/.config/wise2/reaper-bridge.env`, installs the user service, and copies `wise2_bridge.lua` into the REAPER resource directory. Native REAPER control still requires the REAPER Linux application to be installed and the script loaded from REAPER's Actions list; without it, the bridge remains the deterministic test adapter.
