# Legacy Files Archive

This directory contains archived files from the previous Wise Defense SaaS monorepo structure. These files are kept for historical reference and documentation purposes.

## Contents

### Old Dashboard (dashboard-v1/)
The previous version of the dashboard. **Not used in production.**

Use `services/dashboard/` for the current production dashboard (v2).

### Old Deployment Scripts

- **deploy-v4.sh** — Version 4 deployment script (deprecated)
- **deploy-v5.sh** — Version 5 deployment script (deprecated)

Current deployment script: `infrastructure/scripts/deploy.sh`

### Deployment Systems

- **deploy-engine/** — Version 5 deployment orchestration (reference)
- **deploy-v6/** — Version 6 deployment webhook listener (reference)

Current deployment: GitHub Actions CI/CD (see `.github/workflows/`)

### Docker Compose Versions

- **docker-compose.yml.backup** — Old backup
- **docker-compose.yml.bak** — Old backup
- **docker-compose.blue.yml** — Old blue-green deployment v1
- **docker-compose.green.yml** — Old blue-green deployment v2

Current deployment: `docker-compose.yml` with blue-green strategy in GitHub Actions

### Documentation

- **DEPLOYMENT.md** — Old deployment documentation (superseded by `docs/DEPLOYMENT_GUIDE.md`)

---

## Why These Files Are Here

During the consolidation of Wise Defense SaaS into Wise² Core:

1. **Code was preserved** to maintain git history
2. **Old versions archived** to reference if needed
3. **New structure created** in wise2-core/ with all services

This archive ensures nothing is lost while moving forward with the unified platform.

---

## What to Use Instead

### For Deployment
- Use: `infrastructure/scripts/deploy.sh` or GitHub Actions
- See: `.github/workflows/ci.yml` and `deploy.yml`

### For Dashboard
- Use: `services/dashboard/` (v2, Next.js)
- Not: `legacy/dashboard-v1/`

### For Deployment Documentation
- Use: `docs/DEPLOYMENT_GUIDE.md`
- Not: `legacy/DEPLOYMENT.md`

### For Docker Compose
- Use: `docker-compose.yml` (root)
- Not: `legacy/docker-compose.*.yml`

---

## Cleanup Policy

These files will be kept for:
- **3 months**: Available for reference during transition
- **6 months**: Reviewed for actual need
- **1 year**: Considered for archival to external storage

This allows time for team familiarity with new structure before cleanup.

---

## Questions?

Refer to:
- `MASTER.md` — Architecture decisions
- `DECISIONS.md` — Why changes were made
- `docs/DEPLOYMENT_GUIDE.md` — Deployment procedures
- `PROJECT_INDEX.md` — Complete component catalog

---

**Archive Created**: 2026-07-07
**Consolidation**: Phase C - Service Migration
**Status**: Reference only, not used in production
