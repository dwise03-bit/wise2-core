# Tailscale operations — WISE² mesh network

Primary tailnet: **tail44396d.ts.net**  
Canonical registry: `config/tailscale/network.yaml`  
SSH template: `config/tailscale/ssh-config.example`

## Quick start (any Linux node)

```bash
# 1. Create auth key (one-time): https://login.tailscale.com/admin/settings/keys
export TS_AUTHKEY="tskey-auth-..."          # never commit
export WISE2_TAILSCALE_HOSTNAME="gpu-nmls-1" # per device — see network.yaml
export WISE2_TAILSCALE_SSH=1                 # optional: enable Tailscale SSH

bash scripts/tailscale-setup.sh
bash scripts/tailscale-verify.sh
```

## Device hostnames

| Device | MagicDNS |
|--------|----------|
| VPS / GPU | `gpu-nmls-1.tail44396d.ts.net` |
| MacBook | `daniels-macbook-pro.tail44396d.ts.net` |
| iPhone | `iphone175.tail44396d.ts.net` |
| Android | `motorola-razr-2025-xt2553v.tail44396d.ts.net` |
| BYTE MINI | `big-byte.tail44396d.ts.net` |
| Router | `gl-mt3600be.tail44396d.ts.net` |
| Darrin | `darrinwisejr.tail1dc3bd.ts.net` (linked tailnet — invite in admin) |
| Cloud agent | `wise2-cloud-agent.tail44396d.ts.net` |

## SSH (preferred over public IP)

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat config/tailscale/ssh-config.example >> ~/.ssh/config
ssh-keygen -t ed25519 -C "wise2-$(hostname)" -f ~/.ssh/id_ed25519 -N ""

# Add pubkey to VPS (from Mac or any device that can reach VPS):
ssh-copy-id -i ~/.ssh/id_ed25519.pub dwise@gpu-nmls-1.tail44396d.ts.net

ssh wise2-vps
```

## Cursor Cloud Agent

Add to environment secrets (not Git):

| Secret | Value |
|--------|-------|
| `TS_AUTHKEY` | Reusable or ephemeral auth key, tag `tag:ephemeral` optional |
| `WISE2_TAILSCALE_HOSTNAME` | `wise2-cloud-agent` |

Install runs in environment `install` script or manually:

```bash
bash scripts/tailscale-setup.sh
```

## VPS production access

Never use public IP for routine ops when Tailscale is up:

```bash
ssh dwise@gpu-nmls-1.tail44396d.ts.net
cd ~/wise2-core
bash scripts/rotate-vps-credentials.sh
bash scripts/deploy-command-center.sh
```

## Darrin (separate owner)

- Email: `darrinwisejr@gmail.com`
- Device: `darrinwisejr.tail1dc3bd.ts.net`
- Share tailnet or invite node in [Tailscale admin](https://login.tailscale.com/admin/machines)
- Use separate Control Bridge audit `actor` — do not share API tokens

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `tailscaled` not running (container) | `bash scripts/tailscale-daemon.sh` |
| DNS fails | `tailscale up --accept-dns=true` |
| SSH permission denied | Add `~/.ssh/id_ed25519.pub` to VPS `authorized_keys` |
| Device on wrong tailnet | Admin → share node or re-auth with correct account |

See also: `TAILSCALE_SETUP.md` (detailed guide)
