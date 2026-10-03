# WISE² recovery

Updated 2026-10-03. v0.2 recovery tooling is STAGED. No automatic destructive
restore. Read `docs/BACKUP-RECOVERY.md` before replacing files.

## Boot / kernel

Preserve Surface kernel 6.19.8-surface-3 and generic Ubuntu fallbacks. Use
GRUB Advanced options to choose a fallback if necessary. Do not change GRUB,
Secure Boot, firmware or the kernel as part of a cosmetic upgrade.
Historical hardware details: `docs/SURFACE-HARDWARE.md`.

## Diagnostics first

On an unrestricted host terminal: `wise2 doctor`, `wise2 services`,
`ip -brief address`, `ip route`, `resolvectl status`, `tailscale status`,
`docker info`, `systemctl --failed`, `systemctl --user --failed`.
A denied D-Bus/socket/network observation does not prove a service outage.
Do not restart unrelated system services to repair an observation restriction.

## Surface touch

Inspect `systemctl list-units --all 'iptsd@*.service'`. Instance identifiers
change after boot. Verify physical touch/stylus, then investigate the actual
current instance/logs. Never hardcode a historic hidraw device for recovery.
Restarting/changing a system touch service needs an appropriate approved host
session; preserve the working kernel and driver stack.

## Command Center

Use the existing **user** service, not a root unit:

```
systemctl --user status wise2-command-center
wise2 command-center status
wise2 command-center logs
```

After reviewing the intended local action, `wise2 command-center restart`
restarts only this service and verifies HTTP. Inspect 127.0.0.1:3010 and the
root page plus `/healthz`. Preserve linger, Restart=on-failure, RestartSec=3,
NoNewPrivileges, PrivateTmp and loopback binding. Do not install a duplicate
root template. Raw journals are private; redact before sharing.

## Hermes

Surface is a **client** of the existing production Hermes. Run
`wise2 hermes status`. Disabled is NOT CONFIGURED, not an outage or READY.
Do not start a local Hermes/Mongo replacement. Review the existing pending
connection record; credentials/VPS/DNS changes require Daniel's approval.

## SSH / Tailscale / Docker / network

Inspect the real service, route, resolver, ACL/exposure and socket errors before
acting. Existing system configurations are preserved by this level-up.
System-service restarts and config edits need a reviewed target/rollback and
appropriate access; do not re-authenticate Tailscale, alter ACLs or firewall,
replace Docker volumes, or reset networking blindly.

## Source / metadata recovery

The local stable tag preserves baseline versioned files at c04bfb2. Compare
selected files with `git show wise2-linux-stable-2026-10-03:path/to/file`.
Back up the current state and review a selected replacement rather than a
broad reset/clean/restore. No Git push is implied.

Verify a metadata archive before inspecting it in a new empty staging directory.
Do not extract directly over the workstation. Secrets, system configuration,
project data and Docker volumes are deliberately excluded and require separate
trusted recovery procedures. Full restore design: `docs/BACKUP-RECOVERY.md`.
After a reviewed recovery run `docs/ACCEPTANCE.md`; reboot requires approval.
