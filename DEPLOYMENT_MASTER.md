# WISE² Deployment Master Guide

**Status**: Active  
**Last Updated**: 2026-09-13  
**Owner**: dwise (dwise03@gmail.com)  
**Scope**: WISE² Core v1.0 production deployment

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Critical Requirements](#critical-requirements)
3. [Architecture](#architecture)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Deployment Process](#deployment-process)
6. [Verification](#verification)
7. [Rollback](#rollback)
8. [Troubleshooting](#troubleshooting)
9. [Known Issues](#known-issues)
10. [References](#references)

---

## Quick Start

**For immediate deployment (authorized users only):**

```bash
# 1. Verify Mac and VPS are in sync
./scripts/sync-check.sh

# 2. Push to main (triggers GitHub Actions deployment)
git push origin main

# 3. Monitor deployment
# Watch: https://github.com/dwise03-bit/wise2-core/actions

# 4. Verify production
curl https://wise2.net/
curl https://wise2.net/dashboard
curl https://api.wise2.net/api/health
```

**Manual deployment (if GitHub Actions fails):**

```bash
# On VPS (dwise@173.208.147.165)
cd /home/dwise/wise2-core
git fetch origin main
git reset --hard origin/main
./deploy.sh production
```

---

## Critical Requirements

### 🔐 Pre-Deployment Requirements

All of these MUST be satisfied before deployment:

1. **Mac and VPS must be in sync**
   - Same commit hash on both machines
   - No uncommitted changes on either machine
   - Verified by: `./scripts/sync-check.sh`

2. **Environment variables must be set**
   - On VPS: `/home/dwise/wise2-core/.env.production`
   - Required vars: See [Environment Variables](#environment-variables)
   - Verified by: `deploy.sh` environment validation

3. **All tests must pass locally**
   - Run: `pnpm run test` on Mac before pushing
   - CI runs tests automatically on GitHub

4. **Docker and Docker Compose must be available on VPS**
   - Version: Docker 20+, Docker Compose 2.0+
   - Verified on VPS: `docker --version && docker compose --version`

### 🔄 Mac ↔ VPS Sync Protocol

**This is CRITICAL and non-negotiable.**

- **Requirement**: Mac checkout and VPS checkout must ALWAYS be at the same commit
- **When**: Before every deployment
- **How to verify**: `./scripts/sync-check.sh` (see scripts/)
- **If out of sync**:
  1. Pull latest from GitHub on BOTH machines
  2. Ensure both are on `main` branch
  3. Run `git reset --hard origin/main` on both
  4. Verify with `sync-check.sh` again

---

## Architecture

### Services

```
┌─────────────────────────────────────────┐
│  nginx (reverse proxy)                  │
│  Port 80/443 → https://wise2.net        │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┬────────────┐
      ▼                  ▼            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ website:3001 │  │   api:3000   │  │   studio:... │
│ (Next.js)    │  │  (NestJS)    │  │  (React)     │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                  │
       └──────────┬───────┘
                  ▼
         ┌──────────────────┐
         │ postgres:5432    │
         │ (PostgreSQL 15)  │
         └──────────────────┘
```

### Data Flow

- **Landing Page** (https://wise2.net) → website:3001
- **Dashboard** (https://wise2.net/dashboard) → website:3001
- **API** (https://api.wise2.net) → api:3000
- **Database** → postgres:5432 (internal network)

### Volumes

```
postgres_data         → PostgreSQL data (persistent)
graphics_data         → Generated graphics cache
```

---

## Pre-Deployment Checklist

Run this BEFORE pushing to main:

```bash
# 1. Verify Mac checkout is clean
git status
# Expected: working tree clean, branch is main

# 2. Verify all tests pass
pnpm run test
# Expected: all tests passing

# 3. Verify sync with VPS
./scripts/sync-check.sh
# Expected: Mac and VPS are at same commit

# 4. Verify critical files exist
test -f docker-compose.prod.yml && echo "✓ docker-compose.prod.yml"
test -f deploy.sh && echo "✓ deploy.sh"
test -f Dockerfile.api && echo "✓ Dockerfile.api"
test -f Dockerfile.website && echo "✓ Dockerfile.website"
# Expected: all four files present

# 5. Verify environment is set (local testing)
test -n "$STRIPE_SECRET_KEY" && echo "✓ STRIPE_SECRET_KEY set"
test -n "$DATABASE_URL" && echo "✓ DATABASE_URL set"
# Expected: key env vars available locally

echo "✅ All pre-deployment checks passed"
```

---

## Deployment Process

### Step 1: Push to Main (Triggers GitHub Actions)

```bash
git push origin main
# GitHub Actions automatically:
# - Runs linter
# - Runs tests
# - Builds Docker images
# - Deploys to VPS
# - Runs verification
```

**Monitor deployment:**
```
https://github.com/dwise03-bit/wise2-core/actions
```

### Step 2: GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) performs:

1. **Test Job**
   - Checks out code
   - Installs dependencies
   - Runs linter (continue-on-error)
   - Runs tests (continue-on-error)
   - Database: PostgreSQL 15-alpine (auto-started)

2. **Build Job**
   - Validates critical files exist:
     - `docker-compose.prod.yml`
     - `deploy.sh`
     - `Dockerfile.api`, `Dockerfile.website`

3. **Deploy Job** (VPS: 173.208.147.165)
   - SSH into VPS as `dwise` user
   - Fetches latest code from GitHub
   - Repairs ownership if needed (sudo)
   - Sets all environment variables (from secrets)
   - Calls `./deploy.sh production`
   - Verifies services are running

4. **Verify Job**
   - Checks Docker services running
   - Verifies homepage parity
   - Runs health checks

### Step 3: Manual Deployment (If GitHub Actions Fails)

**On VPS:**

```bash
# SSH to VPS
ssh dwise@173.208.147.165

# Navigate to repo
cd /home/dwise/wise2-core || exit 1

# Sync with GitHub
git fetch origin main
git reset --hard origin/main

# Source environment (if not auto-loaded)
# Export STRIPE_SECRET_KEY, DATABASE_URL, etc.

# Run deployment
./deploy.sh production
```

---

## Environment Variables

### Required Variables

These MUST be set on VPS in `/home/dwise/wise2-core/.env.production`:

```bash
# Stripe (Payment Processing)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://wise2:PASSWORD@postgres:5432/wise2_prod
DATABASE_USER=wise2
DATABASE_PASSWORD=<secure-password>

# URLs
APP_URL=https://wise2.net
API_BASE_URL=https://api.wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net

# JWT
JWT_SECRET=<secure-random-key>
```

### Optional Variables

These can be empty (services degrade gracefully):

```bash
# Email (SendGrid)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Discord Integration
DISCORD_WEBHOOK_URL=
DISCORD_BOT_TOKEN=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Verification

After deployment completes, verify all services:

```bash
# 1. Check containers are running
ssh dwise@173.208.147.165
docker compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                STATUS
# wise2-db           Up X seconds (healthy)
# wise2-api          Up X seconds (healthy)
# wise2-website      Up X seconds (healthy)

# 2. Test homepage
curl -s https://wise2.net/ | grep -q "WISE²" && echo "✓ Homepage live"

# 3. Test API
curl -s https://api.wise2.net/api/health | grep -q "ok" && echo "✓ API healthy"

# 4. Test dashboard
curl -s https://wise2.net/dashboard | grep -q "dashboard" && echo "✓ Dashboard live"

# 5. Check logs (if something is wrong)
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f website
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

## Rollback

If deployment fails and production is broken:

### Quick Rollback (Last 5 Commits)

```bash
# SSH to VPS
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core

# Check recent commits
git log --oneline -5

# Rollback to previous commit
git reset --hard HEAD~1

# Redeploy
./deploy.sh production

# Verify
docker compose -f docker-compose.prod.yml ps
curl https://wise2.net/
```

### Full Rollback to Stable

```bash
# Find the last known-good commit
git log --grep="deployment\|released" --oneline | head -1

# Checkout that commit
git reset --hard <commit-hash>

# Redeploy
./deploy.sh production

# Verify
curl https://wise2.net/
```

### If Database Is Corrupt

```bash
# Stop containers
docker compose -f docker-compose.prod.yml down -v

# Remove persistent data
sudo rm -rf /var/lib/docker/volumes/wise2-core_postgres_data

# Restart (fresh database)
docker compose -f docker-compose.prod.yml up -d

# Restore from backup (if available)
# psql < /backups/wise2_prod.sql
```

---

## Troubleshooting

### Deployment Hangs on Git Fetch

**Problem**: Deployment times out during `git fetch origin main`

**Solution**:
```bash
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
# Check git status
git status
git log -1 --oneline

# If stuck, manually fetch
git fetch --verbose origin main

# Try deploy again
./deploy.sh production
```

### 502 Bad Gateway Errors

**Problem**: `https://wise2.net` returns 502

**Likely causes**:
1. API container not running
2. Website container not responding
3. nginx upstream misconfigured

**Debug**:
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check API logs
docker compose -f docker-compose.prod.yml logs api

# Check website logs
docker compose -f docker-compose.prod.yml logs website

# Restart if needed
docker compose -f docker-compose.prod.yml restart api website
```

### Port Conflicts

**Problem**: `docker compose up` fails with "port already in use"

**Solution**:
```bash
# Find process using port
sudo lsof -i :3001
sudo lsof -i :3000
sudo lsof -i :5432

# Kill if safe
sudo kill -9 <PID>

# Or update docker-compose.prod.yml port mapping
# Then restart: docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Errors

**Problem**: API fails to connect to PostgreSQL

**Solution**:
```bash
# Verify database is running
docker compose -f docker-compose.prod.yml logs postgres

# Check DATABASE_URL in .env.production
grep DATABASE_URL /home/dwise/wise2-core/.env.production

# Test connection
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U wise2 -d wise2_prod -c "SELECT 1"

# If connection fails, check network
docker network ls
docker network inspect wise2-core_wise2
```

### Mac and VPS Out of Sync

**Problem**: Deployment uses old code, or Mac has uncommitted changes

**Solution**:
```bash
# On Mac
./scripts/sync-check.sh
# If not synced:
git fetch origin
git reset --hard origin/main

# On VPS (verify)
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git log -1 --oneline

# Compare output - should be identical
```

---

## Known Issues

### 1. Admin Service Disabled for MVP

**Issue**: Admin module not deployed  
**Reason**: CSS/webpack build errors  
**Impact**: No admin panel available  
**Fix (post-launch)**: Resolve CSS issues and re-enable admin service in docker-compose.prod.yml

### 2. Email Delivery Optional

**Issue**: SENDGRID_API_KEY not set  
**Reason**: Not required for MVP  
**Impact**: Email notifications disabled  
**Fix**: Set SENDGRID_API_KEY when ready to enable email

### 3. Port Governance

**Critical**: Do not change port mappings for existing services. Each port is documented and used by nginx routing rules.

Current port mappings (immutable):
- `3001`: website (nginx → 80/443)
- `3010`: api (nginx → 80/443/api)
- `5432`: postgres (localhost only)
- `6379`: redis (if enabled)

Before adding a new service port, check `scripts/verify-port-policy.sh`.

---

## References

### Key Files

- **Deployment Script**: `deploy.sh`
- **Docker Compose**: `docker-compose.prod.yml`
- **GitHub Actions**: `.github/workflows/deploy.yml`
- **Sync Verification**: `scripts/sync-check.sh`
- **Port Policy**: `scripts/verify-port-policy.sh`

### Infrastructure

- **Server**: VPS at `173.208.147.165`
- **User**: `dwise` (passwordless sudo required for deployment)
- **Domain**: `wise2.net`
- **API Domain**: `api.wise2.net`

### Documentation (Archived)

All old deployment docs have been archived in `DEPLOYMENT_ARCHIVE.md`. Refer to this master guide instead.

---

## Support

**Deployment fails?**

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs: https://github.com/dwise03-bit/wise2-core/actions
3. SSH to VPS and check: `docker compose -f docker-compose.prod.yml logs`
4. Contact: dwise03@gmail.com

**Last verified**: 2026-09-13 (this master guide)
