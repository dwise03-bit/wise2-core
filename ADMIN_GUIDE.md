# WISE² Command Center - Production Administration Guide

**Last Updated**: 2026-08-20  
**Version**: 1.0  
**Audience**: System Administrators, DevOps Engineers

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Deployment](#deployment)
3. [Monitoring & Observability](#monitoring--observability)
4. [Database Management](#database-management)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)
7. [Backup & Recovery](#backup--recovery)

---

## System Overview

### Architecture

```
┌─────────────────────────────────────┐
│     Cloudflare CDN (wise2.io)       │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│        Nginx Reverse Proxy          │
│   - SSL/TLS Termination             │
│   - Request Routing                 │
│   - Rate Limiting                   │
└──────────────┬──────────────────────┘
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌────▼──────┐
│  API Server │  │  Next.js   │
│  (3000)     │  │ Dashboard  │
│             │  │  (3000)    │
└──────┬──────┘  └────┬───────┘
       │              │
       └──────┬───────┘
              │
       ┌──────▼──────────┐
       │  PostgreSQL 15  │
       │  - Primary DB   │
       │  - Backups: S3  │
       └─────────────────┘
```

### Technology Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (API), Next.js (Frontend)
- **Database**: PostgreSQL 15 (AWS RDS)
- **Cache**: Redis 7
- **Container**: Docker + Docker Compose
- **Orchestration**: Optional - Kubernetes support available

### Key Metrics

- **Target Uptime**: 99.9%
- **Max Response Time (p95)**: 500ms
- **Error Rate**: < 1%
- **Database Connections**: ~10-50 active

---

## Deployment

### Quick Start

```bash
# SSH into production server
ssh dwise@173.208.147.165

# Navigate to project
cd /opt/wise2-core

# Pull latest code
git pull origin main

# View current status
docker compose -f docker-compose.prod.yml ps

# Deploy with latest images
docker compose -f docker-compose.prod.yml up -d --build

# Monitor deployment
docker compose -f docker-compose.prod.yml logs -f api --tail 50
```

### Automated Deployment (CI/CD)

**Trigger**: Push to `main` or `production` branch

**Pipeline**:
1. GitHub Actions runs tests (5 min)
2. Build Docker image if tests pass (10 min)
3. Deploy to staging environment (5 min)
4. Run smoke tests (3 min)
5. Manual approval gate
6. Blue-green deploy to production (10 min)
7. Slack notification on success/failure

**View**: GitHub repo → Actions tab → Latest "Deploy" workflow

### Manual Rollback

```bash
# See recent commits
git log --oneline -10

# Rollback to previous commit
git revert <commit-hash>
git push origin main

# Wait for automated deployment OR manually:
git reset --hard <previous-commit-hash>
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

### Database Migrations

```bash
# Prisma migrations are applied automatically on startup
# To manually apply migrations:
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# To create new migration:
docker compose -f docker-compose.prod.yml exec api npx prisma migrate dev --name <migration-name>
```

---

## Monitoring & Observability

### Health Checks

```bash
# API health
curl https://api.wise2.io/health

# Database connection
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U wise2

# Redis connection
docker compose -f docker-compose.prod.yml exec redis redis-cli PING

# Overall system
docker compose -f docker-compose.prod.yml ps
```

### Log Aggregation

**Local Logs**:
```bash
# API logs
docker compose -f docker-compose.prod.yml logs api --tail 100 -f

# Database logs
docker compose -f docker-compose.prod.yml logs postgres --tail 50

# All services
docker compose -f docker-compose.prod.yml logs --tail 50 -f
```

**Production Logs** (CloudWatch):
- Dashboard: AWS CloudWatch → Log Groups → `/wise2/api`
- Real-time streaming available
- Retention: 30 days

**Error Tracking** (Sentry):
- Dashboard: https://sentry.io → wise2-core
- Alerts configured for high error rates
- Release tracking enabled

### Metrics & Dashboards

**Prometheus**:
- Endpoint: `http://monitor.wise2.io:9090`
- Metrics: `/metrics` endpoint on API
- Retention: 15 days

**Grafana**:
- Dashboard: http://monitor.wise2.io:3000
- Credentials: Stored in vault
- Pre-configured dashboards:
  - API Performance
  - Database Metrics
  - System Resources

**Key Metrics to Monitor**:
- HTTP error rate (target: < 1%)
- API response time p95 (target: < 500ms)
- Database connections (target: < 30)
- Workflow execution success rate (target: > 99%)

---

## Database Management

### Backup Strategy

**Automated Backups**:
- **Frequency**: Daily at 2 AM UTC
- **Retention**: 30 days
- **Location**: AWS S3 (WISE2-backups bucket)
- **Type**: Full backup + WAL archiving

**Manual Backup**:
```bash
# Create immediate backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U wise2 wise2_prod > backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U wise2 -F c wise2_prod > backup-$(date +%Y%m%d-%H%M%S).dump
```

### Point-in-Time Recovery

```bash
# List available backups
aws s3 ls s3://wise2-backups/ --recursive

# Restore to specific point in time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier wise2-prod \
  --db-instance-identifier wise2-prod-restore \
  --restore-time 2026-08-20T10:00:00Z
```

### Database Maintenance

**Vacuum & Analyze** (run weekly):
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "VACUUM ANALYZE;"
```

**Index Maintenance**:
```bash
# Find unused indexes
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "
  SELECT schemaname, tablename, indexname
  FROM pg_indexes
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND indexname NOT IN (SELECT indexname FROM pg_stat_user_indexes WHERE idx_scan > 0)
  ORDER BY indexname;"

# Reindex if needed
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "REINDEX INDEX <index_name>;"
```

### Connection Pool Management

**Check Pool Status**:
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "
  SELECT datname, count(*) as connections
  FROM pg_stat_activity
  GROUP BY datname;"
```

**Kill Idle Connections**:
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'wise2_prod'
  AND usename = 'wise2'
  AND state = 'idle'
  AND query_start < now() - interval '1 hour';"
```

---

## Security

### Access Control

**Production Access Requirements**:
1. SSH key authentication (no passwords)
2. GitHub 2FA enabled
3. Approval from 2 team members
4. Audit log entry created

**SSH Key Setup**:
```bash
# Add your public key
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys

# Test connection
ssh -i your-private-key dwise@173.208.147.165
```

### Secret Management

**Secrets Storage** (AWS Secrets Manager):
- Never commit secrets to git
- Rotate every 90 days
- Never log or expose in errors
- Access controlled via IAM

**Updating Secrets**:
```bash
# Update JWT secret
aws secretsmanager update-secret \
  --secret-id wise2/jwt-secret \
  --secret-string "new-secret-value"

# Restart API to use new secret
docker compose -f docker-compose.prod.yml restart api
```

### TLS/SSL Certificates

**Certificate Management** (Let's Encrypt via Certbot):
```bash
# Renew certificates
certbot renew --quiet

# Manual renewal
docker compose -f docker-compose.prod.yml exec nginx certbot renew

# Test certificate
openssl x509 -in /etc/nginx/ssl/wise2.crt -text -noout
```

### Firewall Rules

**Allowed Inbound**:
- Port 80 (HTTP → HTTPS redirect)
- Port 443 (HTTPS)
- Port 22 (SSH, admin only)

**Allowed Outbound**:
- All (for external API calls)

### Rate Limiting

**Configured Limits**:
- Per IP: 100 requests/minute
- Per authenticated user: 1000 requests/minute
- Per endpoint: Custom limits applied

**View Rate Limit Headers**:
```bash
curl -i https://api.wise2.io/health | grep -i rate-limit
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs api --tail 50

# Check dependencies
docker compose -f docker-compose.prod.yml ps

# Restart dependencies
docker compose -f docker-compose.prod.yml restart postgres redis

# Try restart
docker compose -f docker-compose.prod.yml restart api

# Check health
curl http://localhost:3000/health
```

### High Memory Usage

```bash
# Check current usage
docker stats

# Find memory leak
docker compose -f docker-compose.prod.yml logs api | grep -i "memory\|heap"

# Restart service
docker compose -f docker-compose.prod.yml restart api

# Monitor recovery
watch -n 2 'docker stats --no-stream'
```

### Database Connection Issues

```bash
# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "SELECT 1;"

# Check active connections
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
  "SELECT count(*) FROM pg_stat_activity;"

# Increase pool size (edit docker-compose.prod.yml)
# DATABASE_MAX_POOL_SIZE=20

# Restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Workflow Failures

```bash
# Check recent executions
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "
  SELECT id, status, error_message, created_at
  FROM workflow_executions
  WHERE status = 'FAILED'
  ORDER BY created_at DESC
  LIMIT 10;"

# Retry specific workflow
curl -X POST https://api.wise2.io/api/v1/workflows/<workflow-id>/retry \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Backup & Recovery

### Full System Recovery

**Scenario**: Complete data loss, need to restore from backup

```bash
# 1. Restore database from S3
aws s3 cp s3://wise2-backups/latest.dump ./backup.dump
docker compose -f docker-compose.prod.yml exec postgres pg_restore -U wise2 -d wise2_prod backup.dump

# 2. Restart API servers
docker compose -f docker-compose.prod.yml restart api

# 3. Verify data
curl https://api.wise2.io/health
curl https://api.wise2.io/api/v1/crm/leads -H "Authorization: Bearer $TOKEN"

# 4. Monitor for issues
docker compose -f docker-compose.prod.yml logs -f api --tail 50
```

### Disaster Recovery Plan

**RTO** (Recovery Time Objective): 30 minutes  
**RPO** (Recovery Point Objective): 1 hour

**Steps**:
1. Restore database backup
2. Spin up API servers
3. Clear Redis cache (will repopulate)
4. Run health checks
5. Monitor for 30 minutes
6. Update status page

---

## Useful Resources

- **Documentation**: https://docs.wise2.io
- **Status Page**: https://status.wise2.io
- **GitHub**: https://github.com/dwise03-bit/wise2-core
- **Runbooks**: See `RUNBOOK_INCIDENTS.md`
- **Architecture**: See `docs/ARCHITECTURE.md`

---

**Questions?** Contact @devops-team on Slack or email devops@wise2.io

---

**Last Review**: 2026-08-20  
**Next Review**: 2026-09-20
