# WISE² Network

> Audited 2026-10-02. No secrets. Addresses here are private (LAN / tailnet).

## Interfaces

| Interface | Address | Notes |
|---|---|---|
| `wlp0s20f3` | 192.168.1.14/24 | Intel Wi-Fi 6 AX201, primary uplink |
| `tailscale0` | 100.97.230.73/32 | Tailscale private mesh |
| `docker0` | 172.17.0.1/16 | Docker bridge (DOWN when no containers) |
| `lo` | 127.0.0.1 | loopback |

IPv6 is active on Wi-Fi (global + ULA) and Tailscale.

## Routing / DNS

- Default route: `192.168.1.1` via `wlp0s20f3` (DHCP).
- LAN DNS: `192.168.1.1`.
- Tailscale MagicDNS: `100.100.100.100`.

## Listening sockets (audit snapshot)

| Socket | Service | Exposure |
|---|---|---|
| `0.0.0.0:22`, `[::]:22` | OpenSSH | LAN + Tailscale. **No router port-forward.** |
| `127.0.0.1:631`, `[::1]:631` | CUPS (printing) | localhost only |
| `127.0.0.53:53`, `127.0.0.54:53` | systemd-resolved | localhost only |
| `0.0.0.0:41641/udp` | Tailscale | mesh |
| `0.0.0.0:5353/udp` | mDNS/avahi | LAN |
| `127.0.0.1:38841` | local service | localhost only |

## Policy

- **Do not** expose services publicly.
- **Do not** add router port-forwarding to SSH; remote admin goes over Tailscale.
- **Do not** modify the Tailscale ACL automatically — standard OpenSSH over
  Tailscale is the supported remote-admin path.
- Development services (Command Center, Hermes) bind to **localhost** unless
  Daniel explicitly approves network/tailnet exposure.
- Tailscale SSH feature is enabled on the host but the tailnet ACL does not
  currently authorize it. Leave the ACL to Daniel.

## Remote administration

Supported: `ssh dwise@100.97.230.73` from any authorized tailnet device.
See `/opt/wise2/docs/REMOTE-ACCESS.md` for full procedures.
