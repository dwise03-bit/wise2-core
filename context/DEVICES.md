# WISE² Devices

> Tailnet membership as observed 2026-10-02 via `tailscale status`.
> **Non-secret inventory only** — no keys, no tokens. Names/addresses are
> tailnet-internal (100.64.0.0/10 CGNAT range), not public.
> This reflects what was online/known at audit time; re-run `wise2 devices`.

## This node

| Field | Value |
|---|---|
| Name | `wise2-surface` |
| Role | AI / Security / Development Workstation (primary) |
| OS | Ubuntu 24.04.5 LTS |
| Kernel | 6.19.8-surface-3 |
| Arch | x86-64 |
| Tailscale IPv4 | 100.97.230.73 |
| LAN | 192.168.1.14/24 |
| Owner | dwise03@ |

## Tailnet members (owner: dwise03@ unless noted)

| Tailscale IP | Name | OS | Last seen (at audit) |
|---|---|---|---|
| 100.97.230.73 | wise2-surface | linux | online (self) |
| 100.109.186.4 | daniels-macbook-pro-2 | macOS | online |
| 100.64.72.14 | daniels-macbook-pro | macOS | 17d ago |
| 100.123.93.3 | gl-mt3600be | linux | online (GL.iNet router) |
| 100.68.145.5 | gpu-nmls-1 | linux | online |
| 100.103.232.8 | gpu-nmls | linux | 63d ago |
| 100.94.75.110 | cursor-cloud-iphone-deploy | linux | 34d ago |
| 100.127.154.29 | google-pixel-slate | android | 3d ago |
| 100.126.199.18 | iphone175 | iOS | online |
| 100.124.167.1 | iphone-15-pro-max | iOS | 7d ago |
| 100.115.148.15 | iphone182 | iOS | 6d ago |
| 100.113.211.91 | ipad-9th-gen-wifi | iOS | 3d ago |
| 100.114.246.23 | motorola-razr-2025-xt2553v | android | online |
| 100.123.139.58 | motorola-edge---2026 | android | 8d ago |
| 100.100.26.47 | darrinwisejr.tail1dc3bd.ts.net | windows | 13h ago (darrinwisejr@) |

> Notes: `gpu-nmls*` nodes look like GPU compute nodes — candidate WISE² remote
> compute. `gl-mt3600be` is a GL.iNet travel router on the tailnet. Confirm roles
> with Daniel before relying on them. The structured machine manifest for THIS
> node lives in `/opt/wise2/devices/` (Phase 14).
