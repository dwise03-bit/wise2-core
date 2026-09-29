# Deployment Guide — Wise² Core

Complete guide for deploying Wise² Core in staging and production environments.

**Target Audience**: DevOps engineers, system administrators, deployment specialists

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

**Minimum**:
- 2 CPU cores
- 2GB RAM
- 5GB storage
- Network connectivity

**Recommended**:
- 4+ CPU cores
- 4GB+ RAM
- 20GB+ storage
- 100Mbps+ network

### Software Requirements

- Docker Engine 20.10+
- Docker Compose 1.29+
- Git 2.30+
- Bash 4.0+
- curl (for health checks)

### System Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

---

## Pre-Deployment Checklist

### Before Any Deployment

- [ ] All services tested in development
- [ ] Tests passing (CI/CD pipeline green)
- [ ] Security scanning completed
- [ ] Database migrations created and tested
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] DNS records configured
- [ ] Backup system verified
- [ ] Monitoring configured
- [ ] Runbooks updated

### Staging Pre-Deployment

- [ ] Code committed and pushed to develop branch
- [ ] GitHub Actions CI/CD pipeline passed
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Staging environment healthy

### Production Pre-Deployment

- [ ] Code committed and pushed to main branch
- [ ] GitHub Actions CI/CD pipeline passed (including security)
- [ ] All tests passing with >80% coverage
- [ ] Security scan completed
- [ ] Production environment backup taken
- [ ] Staging deployment successful
- [ ] Stakeholder approval received

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # Add your local development values
```

### Starting Services

```bash
# Build images
docker-compose build

# Start all services (detached)
docker-compose up -d

# Wait for services to start
sleep 10

# View logs
docker-compose logs -f

# Verify services
docker-compose ps
```

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Dashboard health
curl http://localhost:3001/

# Database connectivity
docker-compose exec postgres pg_isready -U postgres

# Redis connectivity
docker-compose exec redis redis-cli ping
```

### Stopping Services

```bash
# Stop services (keep volumes)
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## Staging Deployment

### Environment Setup

```bash
# SSH into staging server
ssh user@staging.wise2.net

# Clone repository (if not already cloned)
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# Pull latest code
git pull origin develop

# Copy environment template
cp .env.example .env

# Configure for staging
nano .env  # Set:
# DATABASE_URL=postgresql://user:pass@localhost:5432/wise2_staging
# NODE_ENV=staging
# APP_URL=https://staging.wise2.net
```

### Deploy Staging

```bash
# Option 1: Manual deployment
./infrastructure/scripts/deploy.sh staging

# Option 2: Trigger via GitHub Actions
# Push to develop branch → GitHub Actions → Auto-deploy to staging
git push origin develop

# Option 3: Manual Docker deployment
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

### Verify Staging Deployment

```bash
# Check all services
docker-compose ps

# View logs (last 100 lines)
docker-compose logs --tail=100

# Health check
curl https://staging.wise2.net/api/health
curl https://staging.wise2.net/dashboard/health

# Database test
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1"

# Redis test
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

### Staging Backup

```bash
# Create backup before testing
./infrastructure/scripts/backup.sh /backups/staging

# Verify backup
ls -lh /backups/staging/
```

---

## Production Deployment

### Pre-Production Steps

```bash
# 1. Verify staging is healthy
curl https://staging.wise2.net/api/health

# 2. Get approval from stakeholders
echo "Get production deployment approval"

# 3. Create production backup
ssh user@production.wise2.net
./infrastructure/scripts/backup.sh /backups/production

# 4. Verify backup
ls -lh /backups/production/
tar -tzf /backups/production/wise2_backup_*.tar.gz | head
```

### Production Deployment Process

```bash
# SSH into production
ssh user@production.wise2.net
cd /home/user/wise2-core

# Verify current version
git log --oneline -1

# Create deployment log
DEPLOYMENT_LOG="deployment_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$DEPLOYMENT_LOG")
exec 2>&1

# Pull latest main branch
git fetch origin
git checkout main
git pull origin main

# Verify no uncommitted changes
git status

# Check for database migrations
git diff origin/main -- ./infrastructure/sql/ || true

# Run any migrations
# docker-compose exec postgres psql -U postgres -d wise2_core < ./infrastructure/sql/migrations/001_initial.sql

# Build new images (this may take time)
echo "Building Docker images..."
time docker-compose build --no-cache

# Perform blue-green deployment
echo "Performing blue-green deployment..."

# Blue (current)
BLUE_VERSION=$(git rev-parse --short HEAD)

# Green (new)
docker-compose up -d --no-deps --build

# Health check with retries
echo "Waiting for services to be healthy..."
for i in {1..30}; do
  if curl -f http://localhost:3000/health 2>/dev/null; then
    echo "✅ API is healthy"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 5
done

# If health check fails, rollback
if ! curl -f http://localhost:3000/health 2>/dev/null; then
  echo "❌ Health check failed - initiating rollback"
  git checkout HEAD~1
  docker-compose up -d --build
  exit 1
fi

# Cleanup
docker-compose prune -f

echo "✅ Production deployment completed"
echo "Version: $BLUE_VERSION"
date
```

### Post-Production Verification

```bash
# Verify all services
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50 | grep -i error || echo "No errors found"

# Test API endpoints
curl https://wise2.net/api/health
curl https://wise2.net/api/v1/status

# Monitor metrics
# Open https://wise2.net/metrics in browser

# Check dashboard
curl https://wise2.net/dashboard/

# Database integrity check
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT version();"
```

---

## Monitoring & Health Checks

### Real-Time Monitoring

```bash
# Watch services in real-time
docker-compose stats

# Watch logs
docker-compose logs -f --tail=50

# Watch specific service
docker-compose logs -f api
docker-compose logs -f dashboard
```

### Health Checks

```bash
# API
curl -v http://localhost:3000/health

# Database
docker-compose exec postgres pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# All services
docker-compose ps
```

### Prometheus Metrics

Access Grafana dashboards at:
- Local: http://localhost:3001
- Production: https://wise2.net/grafana

Default credentials:
- Username: admin
- Password: (see .env GRAFANA_PASSWORD)

### Alert System

Alerts are configured in `infrastructure/config/alerts.yml`

Critical alerts:
- Service down (page immediately)
- Database unreachable (page immediately)
- High error rate (page after 5 minutes)
- Disk space critical (page after 2 minutes)

---

## Rollback Procedures

### Immediate Rollback (Last Deployment)

```bash
# If deployment has issues immediately after

# 1. Stop current deployment
docker-compose down

# 2. Restore from git
git reset --hard HEAD~1
git pull

# 3. Restart with previous version
docker-compose up -d

# 4. Verify
docker-compose ps
curl http://localhost:3000/health
```

### Database Rollback (If Migration Failed)

```bash
# 1. Restore from backup
./infrastructure/scripts/restore.sh /backups/production/wise2_backup_*.tar.gz

# 2. Verify database is restored
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM information_schema.tables;"

# 3. Restart application
docker-compose restart api
```

### Data Rollback (If Corruption Detected)

```bash
# 1. Stop application
docker-compose down

# 2. Restore backup
rm -rf /var/lib/docker/volumes/wise2_core_postgres_data
./infrastructure/scripts/restore.sh /backups/production/wise2_backup_YYYYMMDD_HHMMSS.tar.gz

# 3. Restart
docker-compose up -d

# 4. Verify
docker-compose ps
curl http://localhost:3000/health
```

---

## Troubleshooting

### Service Won't Start

```bash
# 1. Check logs
docker-compose logs service_name

# 2. Check Docker status
docker ps -a

# 3. Verify port availability
lsof -i :3000  # Check if port is in use

# 4. Rebuild image
docker-compose build --no-cache service_name

# 5. Try again
docker-compose up -d service_name
```

### Database Connection Failed

```bash
# 1. Check database is running
docker-compose ps postgres

# 2. Check password is correct
grep DATABASE_URL .env

# 3. Test connection
docker-compose exec postgres psql -U postgres

# 4. Check network
docker network inspect wise2-core_wise2-network

# 5. Verify volumes
docker volume ls | grep wise2
```

### High Memory Usage

```bash
# Check memory stats
docker stats

# Identify memory hog
docker ps -q | xargs docker stats --no-stream

# Reduce memory limit in docker-compose.yml
# Restart service
docker-compose restart memory_hog_service
```

### Disk Space Full

```bash
# Check disk usage
df -h

# Check Docker volume usage
du -sh /var/lib/docker/volumes/*

# Clean up old backups
rm -rf /backups/wise2_backup_* -mtime +30

# Prune unused Docker resources
docker-compose prune -f
docker system prune -f

# If still full, check logs
du -sh /var/log/*
```

### Network Issues

```bash
# Check network
docker network inspect wise2-core_wise2-network

# Restart network
docker-compose down
docker network rm wise2-core_wise2-network
docker-compose up -d

# Check container DNS
docker-compose exec api cat /etc/resolv.conf

# Test connectivity between containers
docker-compose exec api ping redis
docker-compose exec api ping postgres
```

---

## Emergency Contacts & Escalation

**First Responder**: On-call DevOps engineer
**Escalation**: CTO/Lead Systems Engineer
**Critical Issues**: Page immediately

**Status Page**: https://status.wise2.net
**Incident Channel**: #incidents (Slack)

---

## Post-Deployment Checklist

- [ ] All services healthy
- [ ] No errors in logs
- [ ] Metrics collecting
- [ ] Backups completed
- [ ] Stakeholders notified
- [ ] Deployment logged
- [ ] Documentation updated

---

**Document Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: DevOps / Infrastructure Team
**Next Review**: 2026-08-07
