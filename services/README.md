# WISE² services

`wise2-command-center.user.service` is the versioned unit for the existing
installed **systemd user service**, running as dwise on 127.0.0.1:3010.
It is enabled with user linger, Restart=on-failure, RestartSec=3,
NoNewPrivileges and PrivateTmp. Earlier baseline recovery/reboot tests passed;
fresh live state is unobservable in the current restricted session.

The v0.2 source upgrade does **not modify this unit**. Use:

```
systemctl --user status wise2-command-center
wise2 command-center status
wise2 command-center restart
wise2 command-center logs
```

Legacy `.service.template` files are PLANNED templates, not the installed
configuration. Do not install a competing root Command Center unit. Hermes is
a client of the existing production control plane; do not install the legacy
local Hermes service template. System Docker, SSH, Tailscale, Bluetooth and
Surface iptsd services are preserved. Dynamic iptsd instances are discovered
at runtime; device enumeration changes after boot.

Live recovery and reboot procedures: `docs/ACCEPTANCE.md`. Future dependency,
resource-limit or hardening changes require live validation and a rollback;
network-online.target in a user manager alone is not proof that networking is
ready. The dashboard handles unavailable probes without treating them as PASS.
