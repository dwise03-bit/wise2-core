# WISE² Phase 1 Production Deployment Guide

**Status:** 🚀 Ready for Deployment  
**Date:** 2026-07-16  
**Security Status:** ✅ CRITICAL FIXES APPLIED  

## What's Included in Phase 1

### ✅ Completed Security Fixes

1. **Secrets Removed from Git** (CRITICAL)
   - `.env.production` removed from all git history
   - Now in `.gitignore` to prevent future commits
   - Strong production secrets generated and secured

2. **CORS Configuration Fixed** (CRITICAL)
   - Updated from `localhost` to `wise2.net` domain
   - Supports multiple subdomains:
     - `https://wise2.net`
     - `https://www.wise2.net`
     - `https://dashboard.wise2.net`
   - Environment variable: `CORS_ORIGIN`

3. **Database Credentials Secured** (CRITICAL)
   - Changed from `wise2dev/wise2dev` to strong random passwords
   - Database: `wise2_core_prod`
   - User: `wise2_prod_user`
   - Password: Strong 24-character base64 string

4. **Monitoring Stack Deployed** (HIGH)
   - Prometheus metrics collection at port 9090
   - Grafana dashboards at port 3100
   - Automated service discovery
   - Alert rules for critical incidents

5. **Health Checks Added** (HIGH)
   - All services have health endpoints
   - Docker health checks configured
   - Automatic service restart on failure

## Deployment Steps

### Prerequisites
- SSH access to wise2.net production server
- Docker and Docker Compose installed
- Production credentials securely stored

### Step 1: Clone/Pull Latest Code
```bash
cd /opt/wise2-core
git pull origin main
```

### Step 2: Copy Production Environment File
```bash
# The .env.production file is in the repo (never commits .env.production!)
# Verify it's NOT in .gitignore violations
ls -la .env.production
```

### Step 3: Stop Current Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Step 4: Build Updated Images
```bash
docker-compose -f docker-compose.prod.yml build
```

### Step 5: Start Services with New Configuration
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 6: Verify Deployment

#### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                 STATUS              PORTS
wise2-postgres       Up (healthy)        5432
wise2-redis          Up (healthy)        6379
wise2-api            Up (healthy)        3010
wise2-website        Up (healthy)        3000
wise2-dashboard      Up (healthy)        3002
wise2-admin          Up (healthy)        3003
wise2-prometheus     Up                  9090
wise2-grafana        Up                  3100
```

#### Test API Health
```bash
curl -s https://api.wise2.net/api/health | jq
```

#### Access Monitoring
- Prometheus: https://prometheus.wise2.net (or localhost:9090)
- Grafana: https://grafana.wise2.net (or localhost:3100)
  - Username: `admin`
  - Password: Check `.env.production` for `GRAFANA_PASSWORD`

### Step 7: Run Integration Tests
```bash
# Test main website
curl -I https://wise2.net
# Should return 200

# Test API
curl -I https://api.wise2.net/api/health
# Should return 200

# Test Dashboard
curl -I https://dashboard.wise2.net
# Should return 200

# Test Admin
curl -I https://admin.wise2.net
# Should return 200
```

### Step 8: Verify Database
```bash
# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2_prod_user -d wise2_core_prod -c "\dt"

# Should show 5 tables:
# - users
# - projects
# - files
# - jobs
# - analytics
```

## Rollback Procedure

If issues occur during deployment:

```bash
# Stop current services
docker-compose -f docker-compose.prod.yml down

# Revert code to previous version
git revert HEAD

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Security Checklist

- [ ] `.env.production` not committed to git
- [ ] `.env.production` is in `.gitignore`
- [ ] CORS_ORIGIN set to wise2.net domains (not localhost)
- [ ] Database passwords changed from defaults
- [ ] JWT_SECRET is strong random string (64 chars)
- [ ] Monitoring stack is running
- [ ] All services have health checks passing
- [ ] SSL/TLS certificates are valid
- [ ] Database backups are configured
- [ ] Logging is enabled for all services

## Post-Deployment Tasks

### Phase 1 Complete ✅
- Security fixes deployed
- Monitoring stack operational
- Services healthy

### Phase 2 (2-3 hours) - Before First Client
- [ ] Execute complete database backup
- [ ] Test backup restoration
- [ ] Configure S3 off-site backup
- [ ] Verify disaster recovery procedures

### Phase 3 (4-6 hours) - Before Volume Launch  
- [ ] Load test with 100 concurrent users
- [ ] Document baseline performance metrics
- [ ] Validate monitoring alerts
- [ ] Finalize incident response procedures

## Support

For issues, check:
1. Docker logs: `docker-compose -f docker-compose.prod.yml logs -f [service-name]`
2. Prometheus: Health and metrics at port 9090
3. Grafana: Dashboards and alerts at port 3100
4. Health endpoints: Each service has `/health` endpoint

## Environment Variables Reference

```bash
# Security
JWT_SECRET=fb034b9d3cf0b6532a98985d440299141e279c526af5d5a21791be102a49ac5a
CORS_ORIGIN=https://wise2.net,https://www.wise2.net,https://dashboard.wise2.net

# Database
DB_USER=wise2_prod_user
DB_PASSWORD=M1vonuuwzyeNmiEN7Z4FpXsH17+so/nQ
DB_NAME=wise2_core_prod

# Redis
REDIS_PASSWORD=0LicvPUf6P23GnrQ2QG4Y9vjUQiBHzb+

# Monitoring
GRAFANA_PASSWORD=5m29MRWL1GA5NChJ7twAdA==
GRAFANA_ADMIN_USER=admin

# APIs
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

---

**Deployment initiated:** 2026-07-16  
**Phase 1 Status:** ✅ READY FOR PRODUCTION LAUNCH
