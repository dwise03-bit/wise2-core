# Deployment Resources Index

All deployment files created: 2026-07-24

## Quick Start (Read These First)

1. **DEPLOYMENT_STATUS.md** - Start here for quick deployment
2. **DEPLOYMENT_CHEATSHEET.md** - Common commands reference

## Deployment Files

### Executable Script
- **scripts/deploy-website.sh** - One-command deployment (recommended)
  - Executable: `chmod +x scripts/deploy-website.sh`
  - Usage: `./scripts/deploy-website.sh`
  - Does everything automatically

### Documentation
- **DEPLOYMENT_FIX.md** - Complete technical documentation
  - Root cause analysis
  - Detailed manual steps
  - Troubleshooting guide
  - Future improvements

- **DEPLOYMENT_CHEATSHEET.md** - Quick command reference
  - One-liners for common tasks
  - Status checks
  - Emergency procedures

- **DEPLOYMENT_STATUS.md** - Getting started guide
  - What was broken/fixed
  - Two deployment options
  - Success indicators

## The Solution (One Line)

```bash
cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start
```

## Files at a Glance

| File | Size | Purpose |
|------|------|---------|
| scripts/deploy-website.sh | 3.4 KB | Automated deployment |
| DEPLOYMENT_FIX.md | ~6 KB | Technical reference |
| DEPLOYMENT_CHEATSHEET.md | ~3 KB | Quick commands |
| DEPLOYMENT_STATUS.md | ~3 KB | Getting started |
| DEPLOYMENT_INDEX.md | This file | Navigation |

## Workflow

```
1. Make code changes
   ↓
2. cd apps/website && npm run build
   ↓
3. ./scripts/deploy-website.sh
   ↓
4. Wait for "HTTP 200" message
   ↓
5. Done - website is live
```

## Key Points

- **The Command**: `PORT=3000 npx next start` - This is what works
- **The Script**: `./scripts/deploy-website.sh` - Automates everything
- **The Build**: `.next/` directory - Pre-compiled, production-ready
- **The Port**: 3000 via PORT env var (not --port flag)

## Deployment Methods

| Method | Time | Reliability | Command |
|--------|------|-------------|---------|
| Automated | 30s | Highest | `./scripts/deploy-website.sh` |
| Manual | 45s | Good | See DEPLOYMENT_CHEATSHEET.md |
| Emergency | Varies | N/A | See DEPLOYMENT_STATUS.md |

## Testing & Verification

After deployment:

```bash
# Check it's running
ssh dwise@173.208.147.165 "lsof -i :3000"

# Verify it responds
ssh dwise@173.208.147.165 "curl -I http://localhost:3000"

# View logs
ssh dwise@173.208.147.165 "tail -50 /tmp/website.log"

# Test from browser
curl -I http://173.208.147.165:3000
# Should return HTTP 200
```

## If Something Goes Wrong

1. Check logs: `ssh dwise@173.208.147.165 tail -100 /tmp/website.log`
2. Check if running: `ssh dwise@173.208.147.165 lsof -i :3000`
3. Kill and restart manually (see DEPLOYMENT_CHEATSHEET.md)
4. Check disk space: `ssh dwise@173.208.147.165 df -h /home/dwise`

## Next Steps

1. **First time**: Run `./scripts/deploy-website.sh` to test
2. **Day to day**: Use the script for any changes
3. **Future**: Consider PM2 or systemd for auto-restart
4. **Monitoring**: Set up health checks on /health endpoint (future)

---

**Last Updated**: 2026-07-24  
**Status**: Production Ready  
**Tested**: ✓ All commands verified locally
