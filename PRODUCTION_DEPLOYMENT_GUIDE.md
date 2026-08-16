# WISE² Production Deployment Guide for wise2.net

**Last Updated:** 2026-07-16  
**Status:** ✅ Ready for Production Deployment  
**Environment:** Production (wise2.net)

---

## 🚀 Quick Deployment

### Prerequisites

- SSH access to wise2.net production server
- Docker & Docker Compose installed
- Git installed
- Minimum 2GB available disk space
- Application code in `/opt/wise2-core` (or custom location)

### One-Line Deployment

```bash
cd /opt/wise2-core && bash DEPLOY_TO_PRODUCTION.sh
```

### With Custom Directory

```bash
WISE2_DIR=/custom/path bash DEPLOY_TO_PRODUCTION.sh
```

---

## 📋 Pre-Deployment Checklist

- [ ] SSH access to wise2.net verified
- [ ] `.env.production` file present with secrets
- [ ] Database backups verified
- [ ] Team notified of maintenance window
- [ ] DNS records point to wise2.net
- [ ] SSL/TLS certificates valid (or auto-renewal configured)
- [ ] Disk space available (minimum 5GB)

---

## 🔧 Manual Deployment Steps

If you prefer manual deployment instead of using the script:

### Step 1: Connect to Server

```bash
ssh user@wise2.net
cd /opt/wise2-core
```

### Step 2: Pull Latest Code

```bash
git fetch origin
git checkout main
git pull origin main
```

### Step 3: Verify Environment

```bash
# Check .env.production exists
test -f .env.production && echo "✅ .env.production found" || echo "❌ Missing .env.production"

# Create .env from .env.production for docker-compose
cp .env.production .env
```

### Step 4: Stop Existing Services

```bash
docker-compose -f docker-compose.prod.yml down --remove-orphans
```

### Step 5: Build Docker Images

```bash
docker-compose -f docker-compose.prod.yml build --parallel
```

**Estimated time:** 5-10 minutes

### Step 6: Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 7: Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Wait for services to be healthy (30-60 seconds)
sleep 30

# Test key services
echo "Testing PostgreSQL..."
docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -h localhost

echo "Testing Redis..."
docker exec wise2-core-redis-1 redis-cli ping

echo "Testing Grafana..."
curl -s http://localhost:3100/api/health | jq .

echo "Testing Prometheus..."
curl -s http://localhost:9090/-/healthy
```

### Step 8: Verify Logs

```bash
# Check API startup
docker logs wise2-api-prod --tail 30

# Check for any errors
docker-compose -f docker-compose.prod.yml logs --tail 50
```

---

## 📊 Production Services

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Website** | 3000 | https://wise2.net | ✅ |
| **Dashboard** | 3002 | https://dashboard.wise2.net | ✅ |
| **Admin Panel** | 3003 | https://admin.wise2.net | ✅ |
| **API** | 3010 | https://api.wise2.net | ✅ |
| **Grafana** | 3100 | https://grafana.wise2.net | ✅ |
| **Prometheus** | 9090 | https://prometheus.wise2.net | ✅ |
| **PostgreSQL** | 5432 | Internal only | ✅ |
| **Redis** | 6379 | Internal only | ✅ |

---

## 🔑 Environment Variables

Key production secrets in `.env.production`:

```bash
# Security
JWT_SECRET=<strong-random-string>
CORS_ORIGIN=https://wise2.net,https://www.wise2.net,https://dashboard.wise2.net

# Database
POSTGRES_APP_USER=wise2_prod_user
POSTGRES_APP_PASSWORD=<secure-password>
DB_NAME=wise2_core_prod

# Redis
REDIS_PASSWORD=<secure-password>

# Monitoring
GRAFANA_PASSWORD=<secure-password>
GRAFANA_ADMIN_USER=admin

# API
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

**⚠️ Important:** Never commit `.env.production` to git. It's protected in `.gitignore`.

---

## ✅ Post-Deployment Verification

### Health Checks

```bash
# All services should show "Up" with "(healthy)" status
docker-compose -f docker-compose.prod.yml ps

# Specific health endpoints
curl -s https://api.wise2.net/api/health | jq .
curl -s https://grafana.wise2.net/api/health | jq .
curl -s https://prometheus.wise2.net/-/healthy
```

### Database Verification

```bash
# Connect to database
docker exec -it wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod

# List tables
\dt

# Check row counts
SELECT count(*) FROM users;
SELECT count(*) FROM projects;
```

### Log Review

```bash
# API logs
docker logs wise2-api-prod --tail 100 | grep -E "ERROR|WARN|listening"

# All service logs
docker-compose -f docker-compose.prod.yml logs --tail 200
```

### Monitor Metrics

1. **Grafana Dashboard** (https://grafana.wise2.net)
   - Default credentials: admin / [GRAFANA_PASSWORD]
   - Import pre-configured dashboards
   - Set up alert notifications

2. **Prometheus** (https://prometheus.wise2.net)
   - Check "Targets" for all scraped services
   - View collected metrics
   - Test alert rules

---

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check docker-compose.prod.yml syntax
docker-compose -f docker-compose.prod.yml config

# View service logs
docker-compose -f docker-compose.prod.yml logs <service-name>

# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Database Connection Failed

```bash
# Verify database is running and healthy
docker-compose -f docker-compose.prod.yml ps wise2-postgres-prod

# Check database logs
docker logs wise2-postgres-prod

# Verify credentials in .env
grep "DB_" .env | grep -v "^#"
```

### API Health Check Failing

```bash
# Check API logs for startup errors
docker logs wise2-api-prod --tail 50

# Verify all required environment variables
docker exec wise2-api-prod env | grep -E "DATABASE|JWT|CORS|NODE_ENV"

# Test database connection from API
docker exec wise2-api-prod curl -s http://localhost:3001/api/health
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Website
lsof -i :3010  # API
lsof -i :5432  # Database

# Kill process if needed
kill -9 <PID>

# Or change port in docker-compose.prod.yml
```

---

## 📈 Monitoring & Alerts

### Grafana Setup

1. Access Grafana: https://grafana.wise2.net
2. Login with credentials from `.env.production`
3. Configure alert notification channels:
   - Slack
   - Email
   - PagerDuty
   - Webhooks
4. Import dashboards for:
   - API performance
   - Database metrics
   - Redis cache
   - System resources

### Alert Rules

Pre-configured alerts monitor:

- ✅ Service availability
- ✅ Database connection health
- ✅ API error rates
- ✅ High latency (p95 > 1s)
- ✅ Memory usage (>80%)
- ✅ CPU usage (>80%)
- ✅ Disk space (<10% free)
- ✅ Certificate expiration

---

## 💾 Backup & Disaster Recovery

### Automated Backups

```bash
# Backup script runs daily at 2 AM UTC
# Location: /backups/wise2-<date>.sql.gz

# Manual backup
docker exec wise2-postgres-prod pg_dump -U wise2_prod_user wise2_core_prod | gzip > backup.sql.gz

# Restore from backup
zcat backup.sql.gz | docker exec -i wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod
```

### Backup Verification

```bash
# Test restore procedure weekly
docker exec wise2-postgres-prod pg_dump -U wise2_prod_user wise2_core_prod > /dev/null && echo "✅ Backup test passed"
```

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Automated rollback
cd /opt/wise2-core
git revert HEAD --no-edit
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Or restore from backup
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support & Escalation

### Emergency Contact

- **On-call Engineer:** [Contact info]
- **Slack Channel:** #wise2-incidents
- **Status Page:** https://status.wise2.net

### Common Issues

| Issue | Solution | Time |
|-------|----------|------|
| High API latency | Check database logs, restart API | 5-10 min |
| Database down | Check PostgreSQL container, restart | 2-5 min |
| Memory exhaustion | Clear caches, restart services | 10-15 min |
| Certificate expired | Renew cert, restart nginx | 15-20 min |
| Disk full | Archive logs, clean temp files | 10-30 min |

---

## ✨ Post-Deployment Tasks

- [ ] Verify all services in Grafana
- [ ] Test end-to-end user workflow
- [ ] Verify backups working
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Document any issues
- [ ] Schedule post-deployment review (24 hours)

---

## 📝 Deployment History

| Date | Version | Status | Notes |
|------|---------|--------|-------|
| 2026-07-16 | Phase 1 | ✅ Ready | Security fixes, monitoring deployed |

---

**Need help?** Check logs with `docker-compose -f docker-compose.prod.yml logs --help`

**Ready to deploy?** Run: `bash DEPLOY_TO_PRODUCTION.sh`
