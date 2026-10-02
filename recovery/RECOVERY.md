# WISE² Recovery

> Last updated: 2026-10-02. Keep this readable from a rescue shell.
> **Golden rule: never remove the generic Ubuntu fallback kernels.**

## Boot / kernel

- **Working Surface kernel:** `6.19.8-surface-3` (GRUB default via
  *Advanced options for Ubuntu → Ubuntu, with Linux 6.19.8-surface-3*).
- **Fallback:** the generic Ubuntu kernels (kept intentionally). If the Surface
  kernel fails to boot, pick a generic kernel from the GRUB *Advanced options*
  submenu.
- Show installed kernels: `dpkg -l | grep -E 'linux-image'`.
- Rebuild GRUB (only if needed, with care): `sudo update-grub`.
- Secure Boot is **disabled** by design (unsigned Surface modules).

## GRUB recovery

- Hold **Shift** (BIOS) or press **Esc** (UEFI) during boot for the GRUB menu.
- Boot a known-good kernel from *Advanced options*.
- Do not change the bootloader for cosmetic reasons. Back up `/etc/default/grub`
  and `/boot/grub/grub.cfg` before any GRUB edit.

## Network recovery

- Wi-Fi iface: `wlp0s20f3`. Check: `ip -brief address`, `nmcli device status`.
- Restart networking: `sudo systemctl restart NetworkManager`.
- DNS: `resolvectl status`; LAN resolver `192.168.1.1`, MagicDNS `100.100.100.100`.

## SSH recovery

- Status: `systemctl status ssh`. Restart: `sudo systemctl restart ssh`.
- Config: `/etc/ssh/sshd_config` (back up before editing; test with
  `sudo sshd -t`). Port 22.

## Tailscale recovery

- `tailscale status`; reconnect: `sudo tailscale up`.
- Service: `sudo systemctl restart tailscaled`.
- This node IP: `100.97.230.73`. **Do not alter the tailnet ACL here** — that is
  done in the Tailscale admin console by Daniel.

## Docker recovery

- `systemctl status docker`; restart: `sudo systemctl restart docker`.
- User `dwise` is in the `docker` group. Data root: `/var/lib/docker`.

## Touch / Surface recovery

- Touch daemon: `systemctl status 'iptsd@dev-hidraw0'`.
- Restart: `sudo systemctl restart 'iptsd@dev-hidraw0'`.
- Packages: `iptsd`, `libwacom-surface`.

## Command Center recovery

- Scaffold under `/opt/wise2/command-center`. If a service exists:
  `sudo systemctl restart wise2-command-center` and `journalctl -u wise2-command-center`.
- Binds to localhost; no external exposure to restore.

## Hermes recovery

- `/opt/wise2/hermes`. If a service exists: `sudo systemctl restart wise2-hermes`,
  logs via `journalctl -u wise2-hermes`. Historic port 3012 (localhost).

## WISE² context recovery

- Restore from a backup in `/opt/wise2/backups/` (made by `wise2 backup`):
  `tar -xzf /opt/wise2/backups/wise2-config-<stamp>.tar.gz -C /opt/wise2`.
- Context layer is also version-controllable via Git (no secrets).

## Full re-audit

- Re-run the audit anytime: compare against
  `/opt/wise2/logs/setup-audit-20261002-122926.txt`, or run `wise2 doctor`.
