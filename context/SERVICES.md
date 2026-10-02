# WISE² Services

> Audited 2026-10-02. Only services that actually exist are listed.
> **No fake services.** New units are created only when real software backs them.

## System services (enabled)

| Unit | State | Role |
|---|---|---|
| `ssh.service` | active, enabled | OpenSSH remote admin (port 22) |
| `tailscaled.service` | active, enabled | Tailscale mesh |
| `docker.service` + `docker.socket` | active, enabled | Containers |
| `iptsd@dev-hidraw0.service` | active (static template) | Surface touch daemon |
| `bluetooth.service` | active | Bluetooth |
| systemd-resolved | active | DNS |
| CUPS | active (localhost) | Printing |

## WISE² services (planned — not yet created)

| Unit | Backed by | Status |
|---|---|---|
| `wise2-command-center.service` | Command Center app (Phase 8) | ⛔ not created — app doesn't exist yet |
| `wise2-hermes.service` | Hermes (Phase 6, port 3012 localhost) | ⛔ not created — service doesn't exist yet |

### Rules for WISE² units (Phase 10)

- Create a unit **only** when the software it runs actually exists and runs.
- `Restart=on-failure`, explicit `WorkingDirectory`, least-privilege `User=`.
- Environment via `EnvironmentFile=` pointing outside Git; **never inline secrets**.
- Bind to localhost unless Daniel approves exposure.
- Logs via journald (`journalctl -u <unit>`).
- Installing units to `/etc/systemd/system` requires sudo → **pause for Daniel**.

## On-demand launchers (not daemons)

| Command | Purpose |
|---|---|
| `wise2-shannon` | Shannon via `npx @keygraph/shannon@latest` (cd /opt/wise2/shannon) |
| `wise2-pentest` | Guarded authorized-engagement wrapper (authorization gate) |
| `wise2` (planned) | WISE² control CLI (Phase 9) |
