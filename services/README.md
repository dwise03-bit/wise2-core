# WISE² Service Templates

These are **templates**, not installed units. Per policy, a systemd unit is
created only when the software it runs actually exists and runs.

- `wise2-command-center.service.template` — install once Command Center is real.
- `wise2-hermes.service.template` — install once Hermes is real.

Hardening baked in: `User=dwise`, `NoNewPrivileges`, `ProtectSystem=strict`,
`ReadWritePaths=/opt/wise2`, `Restart=on-failure`, localhost binding, and
secrets via `EnvironmentFile` (outside Git), never inline.

Install (needs sudo + Daniel):
```
sudo cp wise2-<svc>.service.template /etc/systemd/system/wise2-<svc>.service
sudo systemctl daemon-reload && sudo systemctl enable --now wise2-<svc>
```
