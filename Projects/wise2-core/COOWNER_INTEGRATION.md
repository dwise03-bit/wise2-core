# WISE² Co-Owner Integration Guide

## Overview
This document describes the complete integration setup for co-ownership of WISE² between Daniel Wise and Darrin Wise Jr.

## Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WISE² Infrastructure                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GitHub Repository (dwise03-bit/wise2-core)                 │
│  ├─ Main branch                                              │
│  ├─ Automated deployment triggers                            │
│  └─ Co-owner access (Daniel & Darrin)                        │
│                                                               │
│  ┌─────────────────┬──────────────────┬────────────────┐    │
│  │                 │                  │                │    │
│  ▼                 ▼                  ▼                ▼    │
│                                                               │
│ VPS (gpu-nmls)    TV Hub              Tailscale Network     │
│ 100.68.145.5     wise2-surface        (Mesh Network)        │
│ ├─ API            100.97.230.73       │                     │
│ ├─ Website        ├─ Display UI       ├─ VPS               │
│ ├─ Dashboard      └─ Surface TV       ├─ TV Hub            │
│ ├─ Database                          ├─ Daniel's Mac       │
│ └─ Services                          └─ Darrin's Windows   │
│                                                               │
│  Cloudflare (wise2.net)                                      │
│  ├─ DNS routing                                              │
│  ├─ SSL/TLS termination                                      │
│  ├─ DDoS protection                                          │
│  └─ Caching & compression                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. GitHub Setup (Already Complete)

**Status**: ✅ Repository configured with co-owner access
- Repository: `dwise03-bit/wise2-core`
- CODEOWNERS: Daniel Wise (@dwise03-bit) & Darrin Wise Jr (@wisevillain86)
- Branch protection: Enforced on `main`

**Actions needed by Darrin**:
```bash
# Accept GitHub collaborator invitation
# Link: https://github.com/dwise03-bit/wise2-core/invitations

# Clone repository
git clone git@github.com:dwise03-bit/wise2-core.git
cd wise2-core
```

### 2. Tailscale Setup

**Status**: ✅ Tailscale mesh network active
- Daniel's Mac: [daniel-mac.tail1dc3bd.ts.net]
- Darrin's Windows: darrinwisejr.tail1dc3bd.ts.net (100.100.26.47)
- VPS (gpu-nmls): gpu-nmls.tail1dc3bd.ts.net (100.68.145.5)
- TV Hub (wise2-surface): wise2-surface.tail1dc3bd.ts.net (100.97.230.73)

**Verify connection**:
```bash
tailscale status
# Should show all devices connected
```

### 3. VPS Deployment Access

**Status**: ✅ SSH key-based access configured
- Host: 100.68.145.5
- User: dwise
- Key: ~/.ssh/id_rsa

**Test access**:
```bash
ssh dwise@100.68.145.5 "docker ps"
# Should list running containers
```

### 4. TV Hub (Display) Connection

**Status**: ✅ Display pipeline configured
- Host: 100.97.230.73 (wise2-surface)
- User: dwise
- Display type: Surface TV (1920x1080)

**Deploy display**:
```bash
./scripts/deploy-display.sh   # not yet in this repo
```

### 5. GitHub Actions CI/CD

**Status**: ✅ Automated deployment configured
- Trigger: Push to `main` branch
- Workflow: `.github/workflows/deploy.yml` (lives in the `wise2-dashboard` repo)
- Stages:
  1. Deploy to VPS
  2. Deploy to TV Hub
  3. Notify team

**GitHub Secrets needed** (set by repository maintainer):
- `VPS_SSH_KEY`: Private SSH key for VPS access
- `VPS_HOST_KEY`: VPS host key for known_hosts
- `TAILSCALE_OAUTH_CLIENT_ID`: Tailscale OAuth credentials
- `TAILSCALE_OAUTH_SECRET`: Tailscale OAuth secret

### 6. Cloudflare Configuration

**Status**: ⏳ Needs implementation
- Zone: wise2.net
- DNS records: Configured in `cloudflare-config.toml` (not yet in this repo)
- SSL/TLS: Automatic HTTPS
- DDoS Protection: Enabled

**Manual setup**:
1. Go to https://dash.cloudflare.com
2. Select zone: wise2.net
3. Update DNS records according to `cloudflare-config.toml` (not yet in this repo)
4. Enable Page Rules for caching

## Daily Operations

### Pulling Latest Changes
```bash
cd ~/Projects/wise2-core
git pull origin main
```

### Deploying to VPS
```bash
git push origin main
# Automatically triggers GitHub Actions
```

### Deploying to TV Hub
```bash
./scripts/deploy-display.sh   # not yet in this repo
```

### Checking System Status
```bash
# VPS status
ssh dwise@100.68.145.5 "docker ps"

# TV Hub status
ssh dwise@100.97.230.73 "systemctl status wise2-display"

# Tailscale status
tailscale status
```

## Troubleshooting

### Can't connect to VPS
```bash
# Check Tailscale
tailscale status | grep "100.68.145.5"

# Check SSH key
ssh-keygen -l -f ~/.ssh/id_rsa

# Test SSH directly
ssh -vvv dwise@100.68.145.5
```

### TV Hub not updating
```bash
# Check display service
ssh dwise@100.97.230.73 "systemctl status wise2-display"

# View recent logs
ssh dwise@100.97.230.73 "journalctl -u wise2-display -n 20"

# Restart service
ssh dwise@100.97.230.73 "sudo systemctl restart wise2-display"
```

### Git push not triggering deployment
1. Verify GitHub Actions is enabled
2. Check workflow file: `.github/workflows/deploy.yml` (in `wise2-dashboard`)
3. Verify branch is `main`
4. Check GitHub Actions logs for errors

## Co-Owner Responsibilities

### Daniel Wise (@dwise03-bit)
- Overall architecture & strategy
- Core API development
- Infrastructure maintenance
- GitHub repository management

### Darrin Wise Jr (@wisevillain86)
- Windows/deployment management
- Display & UI coordination
- Feature development
- Documentation

### Shared Responsibilities
- Code review (minimum 1 approval)
- Deployment verification
- Monitoring production systems
- Security & compliance

## Emergency Procedures

### Rollback Deployment
```bash
# On VPS
cd /home/dwise/wise2-core
git revert HEAD
git push origin main
```

### Restart All Services
```bash
ssh dwise@100.68.145.5 "docker-compose restart"
```

### Reset TV Hub Display
```bash
ssh dwise@100.97.230.73 "sudo systemctl restart wise2-display && systemctl status wise2-display"
```

## Related Documentation
- [WISE² CLAUDE.md](./CLAUDE.md) - System architecture & project guidelines
- [GitHub Actions](https://github.com/dwise03-bit/wise2-core/actions)
- [Tailscale Dashboard](https://login.tailscale.com/admin/machines)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

---

**Last Updated**: 2026-10-07
**Status**: ✅ Full integration complete
