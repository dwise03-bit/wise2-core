# WISE² Deployment Documentation Archive

**Purpose**: Historical record of deployment documentation evolution  
**Status**: Archived (Use DEPLOYMENT_MASTER.md instead)  
**Last Updated**: 2026-09-13

---

## Archive Index

This document lists all archived deployment documentation that has been superseded by the unified **DEPLOYMENT_MASTER.md** guide.

### Why This Archive Exists

Over the course of WISE² development, multiple deployment guides were created as the system evolved. This resulted in 50+ conflicting, outdated, and partially correct documents. To eliminate confusion and ensure single-source-of-truth deployments, all legacy documentation has been archived here with brief descriptions of their purpose.

**Going forward**: Refer ONLY to `DEPLOYMENT_MASTER.md` for deployment procedures.

---

## Archived Files (50+)

The following files are historical records and should NOT be used for actual deployments:

### Phase 1: Initial Infrastructure Setup
- `DEPLOYMENT_AWS_EC2.md` — AWS EC2 deployment (superseded by VPS setup)
- `DEPLOYMENT_AWS_EC2.md.bak` — Backup copy
- `DEPLOYMENT_SETUP.md` — Initial server setup procedures
- `DEPLOYMENT_GUIDE.md` — Early deployment guide

### Phase 2: Docker & Compose Setup
- `DEPLOY_COMPLETE_SYSTEM.md` — Complete Docker Compose system
- `DEPLOYMENT.md` — Generic deployment documentation
- `docker-deploy.sh` — Early Docker deployment script
- `DEPLOYMENT_FIX.md` — Fix-focused deployment doc
- `DEPLOYMENT_PERMANENT_FIX.md` — Attempted permanent fixes

### Phase 3: MVP Launches
- `DEPLOYMENT_HANDOFF.md` — MLP handoff (2026-07-14, outdated)
- `DEPLOYMENT_FINAL_STATUS.md` — Final status before launch
- `DEPLOYMENT_FINAL_STEPS.md` — Final setup steps
- `DEPLOYMENT_COMPLETE.md` — MVP completion checklist
- `DEPLOYMENT_READY.md` — MVP readiness verification
- `PHASE_1_DEPLOYMENT_SUMMARY.md` — Phase 1 summary
- `PHASE2_DEPLOYMENT.md` — Phase 2 deployment plan

### Phase 4: Live Deployment & Ops
- `LIVE_DEPLOYMENT.md` — Live environment setup
- `LIVE_DEPLOYMENT_READY.md` — Live readiness checklist
- `LIVE_PHASE_1_DEPLOYMENT.md` — Live Phase 1
- `LIVE_PHASE_1_DEPLOYMENT_INFO.md` — Live Phase 1 info
- `DEPLOYMENT_WISE2_COMMAND_CENTER.md` — Command center deployment
- `WISE2_DEPLOYMENT_TO_PRODUCTION.md` — Production deployment
- `WISE2_DEPLOYMENT_READINESS.md` — Production readiness
- `WISE2_LIVE_DEPLOYMENT_GUIDE.md` — Live guide
- `DEPLOYMENT_REPORT.md` — Deployment report
- `DEPLOYMENT_REPORT_20260822.md` — Report from 2026-08-22

### Phase 5: Module & Service Deployments
- `DEPLOYMENT_CHECKLIST.md` — Deployment checklist
- `DEPLOYMENT_CHEATSHEET.md` — Quick reference (duplicate)
- `DEPLOYMENT_COMMANDS.md` — Common commands
- `DEPLOYMENT_INDEX.md` — Documentation index
- `DEPLOYMENT_SUMMARY.md` — Deployment summary
- `DEPLOYMENT_SUMMARY.txt` — Summary (duplicate)
- `DEPLOYMENT_QUICK_START.txt` — Quick start guide
- `BOTS_DEPLOYMENT.md` — Bot service deployment
- `DISCORD_DEPLOYMENT_CHECKLIST.md` — Discord integration deployment
- `DISCORD_INTEGRATION_DEPLOYMENT.md` — Discord integration details
- `GENERATION_DEPLOYMENT_STATUS.md` — Generation service status
- `GPU_GENERATION_DEPLOYMENT.md` — GPU-based generation
- `GOOGLE_VOICE_DEPLOYMENT.md` — Google Voice service
- `PROMPT_SHOP_DEPLOYMENT.md` — Prompt Shop service
- `CONSULTING_DEPLOYMENT_STATUS.md` — Consulting module
- `CREATIVE_STUDIO_DEPLOY.md` — Creative Studio module
- `JOBBER_DEPLOYMENT_CHECKLIST.md` — Jobber service
- `K10_DEPLOYMENT_GUIDE.md` — K10 deployment
- `KNIGHT_WING_DEPLOYMENT_CHECKLIST.md` — Knight Wing checklist
- `KNIGHT_WING_DEPLOYMENT_GUIDE.md` — Knight Wing guide

### Phase 6: Specific Platform Deployments
- `RASPBERRY_PI_DEPLOYMENT_GUIDE.md` — Raspberry Pi edge deployment
- `VPS_DEPLOYMENT_GUIDE.md` — VPS deployment guide
- `VPS_DEPLOYMENT_STATUS.md` — VPS status report
- `PRODUCTION_DEPLOYMENT_GUIDE.md` — Production guide
- `PRODUCTION_DEPLOYMENT.md` — Production procedures

### Operational Procedures (Miscellaneous)
- `DEPLOY_TO_AWS.md` — AWS deployment procedures
- `DEPLOYMENT_COEXIST.md` — Multi-version coexistence
- `DEPLOYMENT_STATUS.md` — Status at some point in time
- `CACHE_FIX_MANUAL_DEPLOY.md` — Cache fix procedures
- `DEPLOYMENT-COEXIST.md` — Duplicate coexistence doc
- `TAILSCALE_DEPLOYMENT_COMPLETE.md` — Tailscale VPN setup
- `DEPLOYMENT_HEALTH_CHECK.md` — Health check procedures (if exists)

### Shell Scripts (Deployment Automation)
- `deploy.sh` — **KEEP** (Main deployment script, see DEPLOYMENT_MASTER.md)
- `deploy-prod` — Old production deployment script
- `deploy-vps.sh` — VPS-specific deployment script
- `deploy-docker.sh` — Docker deployment automation
- `deploy-final.sh` — Final deployment attempt
- `deploy-trading.sh` — Trading module deployment
- `deploy-phone.sh` — Phone service deployment
- `DEPLOY_NOW.sh` — Immediate deployment script
- `DEPLOY_TO_WISE2.sh` — Wise2-specific deployment
- `DEPLOY_TO_PRODUCTION.sh` — Production deployment script
- `DEPLOY_WEBSITE.sh` — Website-only deployment
- `FINAL_DEPLOYMENT.sh` — Final deployment attempt
- `quick-deploy` — Quick deployment wrapper
- `deploy-to-server` — Server deployment script

### Makefile & Configuration
- `Makefile.deploy` — Deployment makefile
- `DEPLOYMENT_SETUP.md` — Setup procedures

---

## Critical Files (Do NOT Archive)

These files are referenced by the active deployment system and must be kept:

```
DEPLOYMENT_MASTER.md        ← Use this one and only this for deployments
deploy.sh                   ← Called by GitHub Actions workflow
docker-compose.prod.yml     ← Service definitions
.github/workflows/deploy.yml ← GitHub Actions workflow
scripts/sync-check.sh       ← Sync verification (new)
scripts/verify-port-policy.sh ← Port governance (new)
```

---

## Migration Path

If you were using an old deployment file:

1. **Stop using it immediately** — It's out of date
2. **Refer to DEPLOYMENT_MASTER.md** — Single source of truth
3. **If you need historical context** — See the section above for what that doc covered

---

## Cleanup Strategy

All archived files can be safely deleted. To clean up:

```bash
# Archive all old deployment docs (optional, for safety)
mkdir -p deployment-archive
for file in DEPLOYMENT*.md DEPLOY*.md; do
  [ "$file" != "DEPLOYMENT_MASTER.md" ] && mv "$file" deployment-archive/
done

# Or simply delete them
for file in DEPLOYMENT*.md DEPLOY*.md; do
  [ "$file" != "DEPLOYMENT_MASTER.md" ] && rm "$file"
done
```

---

## Notes

- **Why 50+ files?** — Different phases, modules, and problem domains created independent docs
- **Why consolidate?** — Single source of truth prevents deployment errors
- **Why keep archive?** — Historical record for future reference and understanding evolution
- **When to refer back?** — Only for understanding past decisions or debugging specific historical issues

---

**Going forward: Use only DEPLOYMENT_MASTER.md**

All deployment procedures, troubleshooting, and verification instructions are in the master guide.

---

*Archive created 2026-09-13*
