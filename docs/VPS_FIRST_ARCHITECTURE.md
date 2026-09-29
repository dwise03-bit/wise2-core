# VPS-First Deployment Architecture

**Status**: Specification Complete  
**Version**: 1.0  
**Date**: 2026-09-14

## Overview

WISE² Core deployments route **GitHub → VPS directly** for all production operations. The Desktop Commander has been retired from routine production operations, and website-only deployments use `--no-deps website` to preserve backend isolation.

## Architecture Diagram

```
GitHub (main branch)
  ↓
GitHub Actions CI/CD
  ↓ (on success)
VPS Direct Deployment
  ├─ Full stack: website + API + database
  └─ Website-only: website only, backend untouched (--no-deps website)
  ↓
Production State (live at 173.208.147.165)
```

## Deployment Flow

### 1. Full Stack Deployment (default)
- Trigger: Push to `main` branch
- Executed by: GitHub Actions workflow
- Target: VPS at 173.208.147.165 as user `dwise`
- Operations:
  - Pull latest from GitHub
  - Run `pnpm install --frozen-lockfile`
  - Build all packages
  - Run database migrations (Prisma)
  - Restart services via docker-compose

### 2. Website-Only Deployment
- Trigger: Cherry-picked commits or targeted PR merges
- Executed by: GitHub Actions workflow with `--no-deps website` flag
- Target: VPS, website service only
- Operations:
  - Pull latest
  - Build website app only
  - Restart website service via docker-compose
  - Backend API unchanged

### 3. Production Verification
- Pre-deployment: Syntax check, linting, type-check (GitHub Actions)
- Post-deployment: Nginx config validation, port consistency check, health endpoints
- Preflight checks run in CI; validation checks run on VPS after restart

## Desktop Commander Status

**Status: Deprecated from routine operations**

- Previously used for: 401-authenticated mutation operations on VPS
- Current limitation: Authentication against GitHub App credentials failing
- New pattern: All GitHub-authorized deployments go through GitHub Actions → VPS direct
- Exception: Manual VPS administration or troubleshooting (out-of-band operations)

## Port Governance

- Existing port mappings are **immutable** (enforced by `verify-port-policy.sh`)
- No reuse of existing host ports across projects
- New services require documented port allocation in Compose files
- Deployment scripts recreate only their own services

## Verification Strategy

### GitHub Actions (Pre-deployment)
1. Install dependencies
2. Type-check (TypeScript)
3. Lint (ESLint)
4. Run unit tests
5. Security scan (Trivy)

### VPS (Post-deployment)
1. **Nginx preflight** — validates config syntax, checks port consistency
2. **Health check** — calls `/health` endpoints on all services
3. **Smoke test** — verifies critical routes respond with expected status

### TDD Contract
- Regression test: `scripts/preflight-nginx-check.sh` validates Nginx config integrity
- Config must contain only expected port mappings for WISE² services
- Deployment fails if port conflict detected

## Known Blockers

### 1. Preflight Script Execution (Platform Boundary)
- **Issue**: Scripts that inspect `/etc/nginx/sites-enabled/` are blocked by platform safety layer
- **Impact**: Preflight validation must run on VPS, not in GitHub Actions
- **Mitigation**: Post-deployment health checks confirm successful restart
- **Status**: Waiting for platform access elevation

### 2. Desktop Commander Authentication
- **Issue**: 401 errors when Desktop Commander tries to authenticate via GitHub App
- **Workaround**: GitHub Actions provides authorization directly; no Desktop Commander needed for routine deploys
- **Status**: Resolved (design uses GitHub Actions instead)

## Next Steps

1. ✅ Architecture locked
2. ✅ Implementation plan written
3. ✅ Contract test written (TDD)
4. ✅ Existing deployment verified
5. ⏳ Preflight script implementation (awaiting platform access)
6. ⏳ Health check endpoints (backend teams)

## Related Documents

- `DEPLOYMENT_HANDOFF.md` — Operational runbook
- `scripts/verify-port-policy.sh` — Port consistency enforcement
- `docker-compose.prod.yml` — Service definitions
- `.github/workflows/*.yml` — CI/CD automation
