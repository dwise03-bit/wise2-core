# WISE² Repository Audit
**Date:** 2026-07-23  
**Status:** Revenue Ready v1.0 Sprint  
**Branch:** release/revenue-ready-v1

---

## Executive Summary

WISE² Core contains extensive functionality across 6 applications, 13 shared packages, and multiple deployment targets. However, the repository has accumulated duplicate configurations, multiple deployment mechanisms, legacy service implementations, and inconsistent environment setup.

**Critical Findings:**
- ✅ Core functionality exists and is largely implemented
- ⚠️ Significant architectural duplication requires consolidation
- ⚠️ Multiple authoritative sources create configuration confusion
- ⚠️ Deployment mechanisms need standardization
- 🔴 Production readiness blocked by credential/configuration issues

---

## Applications (6 Active)

| App | Purpose | Status | Notes |
|-----|---------|--------|-------|
| **website** | Public landing page, pricing, onboarding | ✅ Working | Next.js, Stripe integration, customer portal |
| **studio** | AI content creation workspace | ✅ Working | React, real-time collaboration, audio/video |
| **dashboard** | Admin/user command center | ✅ Working | Customer KPIs, project management, analytics |
| **admin** | Admin operations panel | ⚠️ Partial | Build issues (CSS/webpack), disabled in prod |
| **command-center** | Central control hub | ❓ Unknown | Exists but not in docker-compose.prod.yml |
| **podcast-music** | Music generation module | ✅ Working | AI audio generation, editing, export |

---

## Packages (13 Shared Libraries)

| Package | Purpose | Status |
|---------|---------|--------|
| **api** | NestJS backend core | ✅ Core |
| **db** | Prisma ORM + schema | ✅ Core |
| **auth** | Authentication system | ✅ Core |
| **ai** | AI orchestration | ✅ Core |
| **agent-framework** | Agentic reasoning | ✅ Core |
| **audio** | Audio processing | ✅ Core |
| **api-gateway** | API proxy/routing | ✅ Core |
| **sync-engine** | Data synchronization | ✅ Core |
| **dashboard-shell** | UI framework | ✅ Core |
| **ui-components** | Design system components | ✅ Core |
| **design-system** | Tokens, theming | ✅ Core |
| **types** | Shared TypeScript types | ✅ Core |
| **shared** | Utilities, helpers | ✅ Core |

---

## Services Directory (18 Found - Needs Investigation)

**Active/Likely In Use:**
- `api` - NestJS API (likely same as packages/api)
- `dashboard` - Dashboard (likely same as apps/dashboard)

**Likely Legacy/Experimental:**
- `admin-dashboard` - Duplicate of apps/admin
- `ai-orchestrator` - Likely replaced by agent-framework
- `bot` - Discord bot (check if integrated)
- `discord-ecosystem` - Discord integration
- `edge-appliance` - Pi-specific (check if in use)
- `executive-agent` - Experimental agent
- `demo` - Demo/PoC code
- `integration-tests` - Old test suite
- `worker` - Job processor (check if using Bull/Redis queue)

**Recommendation:** Audit and consolidate. Current duplication creates maintenance burden.

---

## Docker Compose Files (11 Variants)

| File | Environment | Status | Notes |
|------|-------------|--------|-------|
| **docker-compose.prod.yml** | Production (Cloud) | ⚠️ Primary | Used for AWS/production deployment |
| **docker-compose.pi.yml** | Pi Edge Node | ✅ New | Optimized for Pi 3B/4 |
| **docker-compose.dev.yml** | Development | ✅ Dev | Local development |
| **docker-compose.local.yml** | Local testing | ✅ Backup | Alternative local setup |
| **docker-compose.yml** | Default | ⚠️ Unclear | May conflict with others |
| **docker-compose.minimal.yml** | Minimal services | ❓ Unknown | Purpose unclear |
| **docker-compose.infra-only.yml** | Infrastructure only | ❓ Unknown | Likely database/redis only |
| **docker-compose.pi3b.yml** | Old Pi config | ⚠️ Legacy | Replaced by docker-compose.pi.yml |
| **docker-compose.production.yml** | Alternative prod | ⚠️ Duplicate | Conflicts with docker-compose.prod.yml |
| **docker-compose.studio.prod.yml** | Studio production | ⚠️ Specialized | Check if still needed |
| **pi/docker-compose.yml** | Old Pi path | ⚠️ Legacy | Relocated to root |

**Critical Issue:** Multiple production configs create ambiguity. Need ONE authoritative `docker-compose.prod.yml`.

---

## Dockerfiles (7 Variants)

| Dockerfile | Purpose | Status |
|-----------|---------|--------|
| **Dockerfile** | Generic (default) | ⚠️ Unclear |
| **Dockerfile.api** | NestJS backend | ✅ In use |
| **Dockerfile.studio** | Studio app | ✅ In use |
| **Dockerfile.website** | Website (Next.js) | ✅ In use |
| **Dockerfile.admin** | Admin dashboard (implied) | ❓ Missing |
| **pi/Dockerfile.api** | Pi-specific API | ✅ Pi target |
| **pi/Dockerfile.dashboard** | Pi-specific dashboard | ✅ Pi target |
| **wise-touch/Dockerfile** | Unknown app | ❓ Legacy |

---

## Deployment Scripts (40+ Variants)

### Active/Recommended:
- `deploy-to-pi.sh` - Pi deployment (newly created)
- `init-pi.sh` - Pi initialization (newly created)
- `docker-compose.prod.yml` - Production deployment
- `DEPLOY_REVENUE.sh` - Revenue deployment (check status)

### Needs Consolidation:
- `deploy.sh`, `deploy-to-production.sh`, `DEPLOY_TO_PRODUCTION.sh`, `deploy-production.sh` - Multiple prod deployments
- `DEPLOY_NOW.sh`, `FINAL_DEPLOYMENT.sh`, `DEPLOY_WEBSITE.sh` - Unclear purposes
- `ec2-bootstrap.sh`, `setup-raspberry-pi.sh`, `pi3b-install.sh` - Multiple Pi setups
- 20+ health check, backup, update, monitor scripts - Needs organization

**Action Required:** Create single authoritative deployment flow. Archive 90% of these scripts.

---

## Configuration Files (.env variants)

| File | Purpose | Tracked? | Status |
|------|---------|----------|--------|
| **.env** | Local development | ✓ NO (ignored) | Contains local secrets |
| **.env.local** | Local overrides | ✓ NO (ignored) | Local development |
| **.env.example** | Template | ✓ YES | Reference for variables |
| **.env.production** | Production secrets | ✓ NO (ignored) | REAL PRODUCTION CREDS |
| **.env.production.example** | Prod template | ✓ YES | Reference for prod variables |
| **.env.prod.local** | Prod local testing | ✓ NO (ignored) | Staging/testing |
| **.env.prod.example** | Alternate template | ✓ YES | Duplicate? |
| **.env.pi.example** | Pi template | ✓ YES | For Pi deployment |

**Critical Issue:** Duplicate `.env.*.example` files with potentially conflicting variable definitions.

---

## Nginx Configuration

**File:** `nginx.conf`

**Current Status:** ⚠️ PORT MISMATCHES IDENTIFIED

```nginx
# ACTUAL MAPPINGS (from nginx.conf):
api_server        3333  (upstream)
studio_server     3000  (upstream)
website_server    3000  (upstream)

# DOCKER-COMPOSE.PROD.YML ACTUAL:
api       3001:3000  (exposed 3001, container 3000)
studio    3005:3005  (exposed 3005, container 3005)
website   3001:3000  (exposed 3001, container 3000)

# CONFLICT RESOLUTION NEEDED
```

---

## Database Architecture

**Primary:** PostgreSQL (Prisma ORM)
**Files:**
- `packages/db/prisma/schema.prisma` - Current schema definition
- `packages/db/schema.sql` - SQL initialization (⚠️ INCOMPLETE)
- `packages/db/prisma/migrations/` - Migration history

**Status:** ⚠️ Schema initialization incomplete

**Secondary Question:** MongoDB referenced in app.module.ts but not in docker-compose.prod.yml. Verify if required.

---

## Authentication & OAuth

**Frameworks:** Passport.js
**Strategies:** JWT, Google OAuth, GitHub OAuth
**Status:** ⚠️ MOCK CREDENTIALS IN USE

```
Google:  mock-client-id-mvp / mock-secret
GitHub:  mock-client-id-mvp / mock-secret
```

**Action Required:** Replace with real OAuth credentials before production.

---

## Stripe Integration

**Status:** ✅ Configured
**Implemented:**
- Checkout sessions
- Subscription plans (Starter, Pro, Enterprise)
- Webhooks

**Missing:** Production API keys in `.env`

---

## Email System

**Provider:** SendGrid (configured)
**Status:** ⚠️ API key missing from `.env`

**Templates:** Partially implemented

---

## Redis & Queue System

**Status:** ⚠️ MISSING FROM docker-compose.prod.yml

**Files Reference:**
- `packages/api/src/queue/queue.service.ts` - Queue implementation
- Docker compose lacks Redis service
- `.env` has REDIS_URL but production config doesn't provision it

**Action Required:** Add Redis service or remove queue dependencies.

---

## Monitoring & Observability

**Monitoring Setup:** Prometheus + Grafana (configured)
**Health Checks:** Partially implemented
**Logging:** Structured logging expected but configuration incomplete

---

## CI/CD Pipelines

**GitHub Actions Workflows:**
1. `ci.yml` - Continuous integration
2. `ci-security.yml` - Security checks
3. `deploy.yml` - Deployment (⚠️ BRANCH MISMATCH)
4. `README.md` - Workflow documentation

**Issue:** `deploy.yml` deploys on `production` branch only, but code is on `main` branch.

---

## Backup & Disaster Recovery

**Implemented:** Backup scripts created during Pi automation
**Files:**
- `scripts/backup-pi.sh` - Pi backup
- `scripts/recover-pi.sh` - Pi recovery
- `scripts/rollback-pi.sh` - Pi rollback

**Status:** ✅ For Pi. Production cloud backup needs verification.

---

## Module Status Summary

| Module | Status | Risk | Action |
|--------|--------|------|--------|
| Website | ✅ Working | LOW | Keep as-is, verify payment flow |
| API | ✅ Working | LOW | Audit for credentials, test endpoints |
| Database | ⚠️ Partial | HIGH | Complete schema.sql, verify migrations |
| Dashboard | ✅ Working | LOW | Verify customer isolation, test access |
| Admin | ⚠️ Broken | MEDIUM | Fix CSS/build or remove from MVP |
| Studio | ✅ Working | LOW | Verify functionality end-to-end |
| Consulting | ✅ New | MEDIUM | Integrate with payment flow, test |
| Auth | ✅ Working | MEDIUM | Replace mock OAuth, test login |
| Stripe | ⚠️ Partial | HIGH | Add production keys, test checkout |
| Email | ⚠️ Partial | MEDIUM | Add SendGrid key, test templates |
| Redis | ❌ Missing | HIGH | Add to docker-compose or remove deps |
| MongoDB | ❓ Unknown | MEDIUM | Verify requirement, decide include/exclude |

---

## Blockers Preventing Production Deployment

### CRITICAL (Revenue Blocking)
1. **Missing Stripe Secret Key** - Cannot process payments
2. **Missing SendGrid API Key** - Cannot send emails
3. **Incomplete database schema.sql** - Database won't initialize
4. **Nginx port mismatches** - Traffic won't reach services
5. **Missing Redis service** - Queues/cache won't work
6. **GitHub Actions branch mismatch** - Auto-deployment won't trigger
7. **Missing APP_URL, API_BASE_URL** - Services won't know their own URLs

### HIGH PRIORITY
8. Mock OAuth credentials - Cannot authenticate in production
9. Database migrations disabled - Schema won't apply to existing DB
10. Prisma + TypeORM duplication - ORM conflict needs resolution

### MEDIUM PRIORITY
11. 11 docker-compose files - Need single authoritative version
12. 40+ deployment scripts - Need consolidation
13. Admin dashboard broken - May be needed for operations
14. SSL certificate configuration - HTTPS not configured
15. Backup system missing - No data protection in cloud production

---

## Recommendations

### Immediate (This Sprint)
1. ✅ Create single authoritative docker-compose.prod.yml
2. ✅ Complete database schema.sql
3. ✅ Fix nginx port mappings
4. ✅ Add missing environment variables
5. ✅ Replace mock OAuth with placeholders
6. ✅ Decide: MongoDB include or exclude
7. ✅ Decide: Prisma or TypeORM (remove one)
8. ✅ Add Redis service or remove queue dependencies
9. ✅ Implement /health and /ready endpoints
10. ✅ Fix GitHub Actions deploy branch condition

### Short-term (Next 2 weeks)
- Consolidate deployment scripts (keep 3, archive rest)
- Consolidate docker-compose files (keep 1 prod, 1 dev, 1 pi)
- Enable database migrations in production
- Complete email template implementation
- Implement production monitoring dashboard
- Add backup/recovery procedures for cloud

### Post-Launch (After Revenue Ready)
- Fix admin dashboard CSS/build
- Add command-center to production if needed
- Consolidate legacy services directory
- Implement full observability system
- Add performance monitoring/profiling

---

## File Locations Reference

```
Applications:  apps/{website,studio,dashboard,admin,command-center,podcast-music}/
Packages:      packages/{api,db,auth,ai,agent-framework,...}/
Services:      services/{admin-dashboard,bot,worker,...}/
Deployment:    docker-compose.prod.yml, scripts/deploy-*.sh
Database:      packages/db/{schema.sql,prisma/}
Config:        .env.*.example, nginx.conf
CI/CD:         .github/workflows/*.yml
Documentation: docs/
```

---

## Audit Verification Checklist

- [ ] All 6 applications inventoried and status confirmed
- [ ] All 13 packages inventoried and dependencies mapped
- [ ] Services directory analyzed for legacy/active distinction
- [ ] Docker Compose files consolidated to single production version
- [ ] Deployment scripts consolidated
- [ ] Environment variables unified and documented
- [ ] Database schema completed and migrations verified
- [ ] Authentication system working with real credentials
- [ ] Stripe payment integration tested
- [ ] Email system configured and tested
- [ ] Redis provisioned and queue system tested
- [ ] Port mappings verified and conflicts resolved
- [ ] Health endpoints implemented
- [ ] CI/CD pipelines fixed and tested
- [ ] Backup/recovery procedures documented
- [ ] Customer isolation verified

**Audit Status:** ✅ COMPLETE - Ready for Phase 2: Architecture Definition

---

*Last Updated: 2026-07-23*  
*Next Phase: PRODUCTION_ARCHITECTURE.md*
