# Deployment Procedures — Wise² Core

Complete step-by-step procedures for deploying Wise² Core to all environments.

---

## Overview

Wise² Core uses GitHub-driven deployments with automated CI/CD pipelines.

**Deployment Environments**:
- **Development**: Local development, continuous deployment on every push
- **Staging**: Test environment, automatic on develop branch
- **Production**: Live environment, manual approval required on main branch

**Deployment Tools**:
- GitHub Actions (CI/CD automation)
- Docker (containerization)
- docker-compose (orchestration)
- Deploy webhook (Raspberry Pi)

---

## Pre-Deployment Checklist

### Code Quality (Required)
- [ ] All tests passing (GitHub Actions CI)
- [ ] Code review approved
- [ ] Security scan passed (Trivy)
- [ ] No critical issues
- [ ] Documentation updated

### Infrastructure (Required)
- [ ] Database backups taken
- [ ] Redis backups taken
- [ ] Monitoring configured
- [ ] Disk space available (>5GB)
- [ ] Network connectivity verified
- [ ] All services healthy

### Team Preparation (Required)
- [ ] On-call team notified
- [ ] Deployment window scheduled
- [ ] Rollback plan reviewed
- [ ] Team briefed on changes
- [ ] Communication sent to stakeholders
- [ ] Maintenance mode configured (if needed)

### Approvals (Required)
- [ ] Tech lead approval
- [ ] Operations approval (production only)
- [ ] Security approval (if security changes)
- [ ] Product owner approval (new features)

---

## Development Deployment

### Automatic Deployment

Development deployment is **automatic** on every push to any branch.

**Trigger**: GitHub Actions workflow on push
**Target**: Development environment (local machines, staging server)
**Time**: ~5-10 minutes

### Manual Development Deployment

If needed, manually deploy to development:

```bash
cd wise2-core
git pull origin main
docker-compose build --no-cache
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3000/health
```

### Development Verification

```bash
# All services running
docker-compose ps | grep "Up"

# API health
curl http://localhost:3000/health

# Dashboard accessible
curl http://localhost:3001/

# Database connected
docker-compose exec postgres pg_isready -U postgres

# Redis connected
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Check logs for errors
docker-compose logs | grep -i error || echo "✅ No errors"
```

---

## Staging Deployment

### Automatic Deployment

Staging deployment is **automatic** when code is merged to `develop` branch.

**Trigger**: GitHub Actions on merge to develop
**Target**: Staging environment
**Time**: ~15-20 minutes

**Process**:
1. GitHub Actions runs tests
2. Builds Docker images
3. Pushes to container registry
4. Deploys to staging via webhook
5. Runs health checks
6. Notifies team on success/failure

### Manual Staging Deployment

If needed, manually deploy to staging:

```bash
# SSH to staging server
ssh user@staging.wise2.net

# Navigate to deployment directory
cd /home/wise2-core

# Pull latest code
git fetch origin
git checkout develop
git pull origin develop

# Deploy
docker-compose build
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
curl https://staging.wise2.net/api/health
```

### Staging Verification

```bash
# Check all services
docker-compose ps

# API health check
curl https://staging.wise2.net/api/health

# Dashboard accessible
curl https://staging.wise2.net/

# Database check
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1"

# Redis check
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Performance check
curl -w "\nResponse time: %{time_total}s\n" https://staging.wise2.net/api/health

# Logs check
docker-compose logs --tail=100 | grep -i error
```

### Staging Testing

After deployment to staging, run these tests:

**Functional Tests**:
```bash
# User registration
curl -X POST https://staging.wise2.net/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# User login
curl -X POST https://staging.wise2.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Dashboard loads
curl -s https://staging.wise2.net/ | grep -q "<!DOCTYPE" && echo "✅ Dashboard loads"

# Database connectivity
curl -s https://staging.wise2.net/api/status | jq '.services.database'
```

**Performance Tests**:
```bash
# Response time baseline
for i in {1..5}; do
  curl -w "%{time_total}\n" -o /dev/null -s https://staging.wise2.net/api/health
done

# Load test (optional)
ab -n 100 -c 10 https://staging.wise2.net/api/health
```

---

## Production Deployment

### Pre-Production Requirements

**Mandatory**:
- [ ] Tested successfully in staging (minimum 24 hours)
- [ ] All stakeholders notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan reviewed with team
- [ ] On-call team assigned and briefed
- [ ] Production backup verified
- [ ] Monitoring dashboards prepared

**Manual Approval** required by:
- [ ] Tech lead or CTO
- [ ] Operations manager
- [ ] Product owner (if new features)

### Production Deployment Process

#### Step 1: Approval & Communication (T-2 hours)

```bash
# Get approval from required stakeholders
# Document approvals

# Send notification to team
# "Deployment of version X scheduled for T+0"

# Notify stakeholders
# "System maintenance window: T-1 hour to T+1 hour"

# Alert on-call team
# Brief review meeting: 15 minutes before deployment
```

#### Step 2: Pre-Deployment Verification (T-1 hour)

```bash
# SSH to production
ssh user@wise2.net

# Verify current system health
docker-compose ps
curl https://wise2.net/api/health
docker-compose exec postgres pg_isready -U postgres

# Take final backup
./infrastructure/scripts/backup.sh /backups/production/pre-deployment

# Verify backup
ls -lh /backups/production/pre-deployment/

# Prepare for deployment
# Ensure all dependencies ready
# Verify database migrations ready
# Review deployment logs location
```

#### Step 3: Code Promotion (T-30 minutes)

```bash
# Create release branch (if needed)
git checkout main
git pull origin main

# Tag version
git tag -a v1.X.X -m "Release v1.X.X"
git push origin v1.X.X

# GitHub Actions automatically builds and tests
# Monitor CI/CD pipeline in GitHub
```

#### Step 4: Deployment Execution (T-0)

**Automated via GitHub Actions**:
```
GitHub recognizes tag push to main branch
  ↓
CI/CD pipeline runs tests
  ↓
Builds all Docker images
  ↓
Security scan (Trivy)
  ↓
Pushes images to registry
  ↓
Triggers production webhook
  ↓
Production server pulls and deploys
  ↓
Health checks run
  ↓
Sends deployment status back to GitHub
```

**Manual fallback** (if automation fails):
```bash
# SSH to production
ssh user@wise2.net
cd /home/wise2-core

# Pull latest tagged release
git fetch --tags
git checkout v1.X.X

# Deploy
docker-compose build --no-cache
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
curl https://wise2.net/api/health
```

#### Step 5: Immediate Verification (T+5 minutes)

```bash
# Verify all services started
docker-compose ps | grep "Up" | wc -l
# Should be >= 8 services

# Health checks
curl https://wise2.net/api/health
curl https://wise2.net/
curl https://wise2.net/metrics/health

# Database connectivity
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"

# Redis connectivity
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info server

# Monitoring
curl http://localhost:9090/api/v1/alerts | jq '.data | length'
# Should be 0 critical alerts
```

#### Step 6: Extended Monitoring (T+30 minutes)

```bash
# Monitor error rates
curl http://localhost:9090/api/v1/query?query=rate(errors_total[5m])

# Check response times
curl http://localhost:9090/api/v1/query?query=api_request_duration_seconds

# Review logs for warnings
docker-compose logs | grep -i "warn" || echo "✅ No warnings"

# Check database performance
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"
```

#### Step 7: Notification (T+1 hour)

```bash
# Verify no critical issues
# Review monitoring dashboards
# Send all-clear notification to stakeholders

# Message template:
# "Production deployment of v1.X.X completed successfully.
#  All services operational.
#  No incidents detected.
#  Monitoring active."
```

---

## Rollback Procedures

### When to Rollback

Automatic rollback triggers:
- [ ] Service not starting (health check fails)
- [ ] Database connection errors (unable to connect)
- [ ] High error rate (>5% of requests failing)
- [ ] Critical endpoint not responding

Manual rollback triggers:
- [ ] Security issue discovered
- [ ] Data corruption detected
- [ ] Performance degradation (>50% slower)
- [ ] Major functionality broken

### How to Rollback

#### Immediate Stop (if services crashing)

```bash
ssh user@wise2.net
cd /home/wise2-core

# Stop all services immediately
docker-compose down

# This stops the deployment in progress
```

#### Rollback to Previous Version

```bash
ssh user@wise2.net
cd /home/wise2-core

# Check version history
git log --oneline | head -5

# Checkout previous version
git checkout v1.X.X-1  # Previous version

# Redeploy
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
curl https://wise2.net/api/health
```

#### Database Rollback (if needed)

```bash
# If database schema was changed
# Restore from pre-deployment backup

ssh user@wise2.net

# List available backups
ls -lh /backups/production/

# Restore specific backup
./infrastructure/scripts/restore.sh /backups/production/pre-deployment/wise2_backup_*.tar.gz

# Verify restoration
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"
```

### Post-Rollback Actions

```bash
# Notify team of rollback
# Document reason for rollback
# Create incident in tracking system
# Schedule post-incident review (within 24 hours)
# Analyze root cause
# Plan fix
# Test fix in staging
# Re-schedule production deployment
```

---

## Emergency Procedures

### Service Down (P1)

```bash
# 1. Confirm issue
curl https://wise2.net/api/health
docker-compose ps

# 2. Check logs
docker-compose logs api | tail -50
docker-compose logs postgres | tail -50

# 3. Immediate restart (if service crashed)
docker-compose restart SERVICE_NAME

# 4. If restart doesn't help, check database
docker-compose exec postgres pg_isready -U postgres

# 5. If database down, restore from backup
# See "Database Rollback" above

# 6. Escalate if unable to recover
# Contact on-call DBA and infrastructure team
```

### Database Issues

```bash
# Connection errors
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# If unable to connect:
docker-compose restart postgres
docker-compose logs postgres

# Check disk space
docker exec wise2-postgres df -h

# If full, clean old backups
rm -rf /backups/production/wise2_backup_old/

# Check connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# If too many connections, restart
docker-compose restart postgres
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Identify high-usage service
docker stats | grep "wise2-*"

# Restart if needed
docker-compose restart SERVICE_NAME

# Check logs for memory leak
docker-compose logs SERVICE_NAME | grep -i "memory\|heap\|gc"

# Scale down if needed (traffic too high)
# Temporarily reduce instance count or redirect traffic
```

### Disk Full

```bash
# Check disk usage
docker exec wise2-postgres df -h /

# Find large files
docker exec wise2-postgres du -sh /var/lib/postgresql/data/*

# Clean old backups
rm -rf /backups/production/wise2_backup_old/

# Vacuum database
docker-compose exec postgres psql -U postgres -d wise2_core -c "VACUUM ANALYZE;"

# Clean Docker system
docker system prune -f
```

---

## Performance Monitoring During Deployment

### Key Metrics to Watch

```bash
# 1. Error rate (should be <1%)
curl http://localhost:9090/api/v1/query?query=rate(errors_total[5m])

# 2. Response time (should be <500ms p95)
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(request_duration_seconds_bucket[5m]))

# 3. Database connections (should be <80)
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 4. Redis memory (should be <80% of limit)
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info memory

# 5. Disk usage (should be >10% free)
df -h
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | >2% | >5% |
| Response Time (p95) | >1s | >2s |
| Database Connections | 70 | 90 |
| Memory Usage | 80% | 95% |
| Disk Usage | 80% | 90% |

---

## Deployment Automation

### GitHub Actions Workflow

The deployment pipeline is automated via GitHub Actions:

1. **On commit to develop branch**:
   - Run tests
   - Build images
   - Push to staging
   - Auto-deploy to staging

2. **On tag to main branch** (v*.*.* format):
   - Run tests (stricter)
   - Security scan
   - Build images
   - Push to production
   - Manual webhook trigger for deployment
   - Health checks

### Manual Webhook Trigger

If automatic deployment fails:

```bash
curl -X POST \
  -H "X-Secret: YOUR_DEPLOY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "version": "1.0.0",
    "commit": "abc123"
  }' \
  https://wise2.net:4000/deploy
```

---

## Post-Deployment Checklist

### Immediately After (T+1 hour)

- [ ] All services healthy (green on monitoring)
- [ ] No critical errors in logs
- [ ] API responding normally
- [ ] Dashboard loading
- [ ] Database healthy
- [ ] All alerts resolved
- [ ] Team notified of success

### After 24 Hours

- [ ] No issues reported
- [ ] Performance metrics normal
- [ ] Error rates normal
- [ ] No increase in support tickets
- [ ] Database backups working
- [ ] Monitoring working correctly

### After 7 Days

- [ ] No recurring issues
- [ ] Performance stable
- [ ] User feedback positive
- [ ] Document lessons learned
- [ ] Update deployment documentation if needed

---

## Support & Escalation

### During Deployment Issues

**First Level**: Check logs and restart services
```bash
docker-compose logs -f
docker-compose restart SERVICE_NAME
```

**Second Level**: Database issues
```bash
# Check database
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
# If database issue, restore from backup
```

**Third Level**: Escalate to on-call engineer
- Contact: See INCIDENT_RESPONSE.md
- Provide: Logs, errors, timeline
- Decision: Continue, pause, or rollback

---

**Deployment Procedures Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: DevOps / Operations Team
**Next Review**: After first production deployment
