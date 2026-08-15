# Infrastructure — Wise² Core

Infrastructure-as-Code configuration for Wise² Core services and deployment.

## Overview

This directory contains all infrastructure definitions:
- Docker Compose service orchestration
- Docker container definitions
- Configuration files for all services
- Deployment and maintenance scripts

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 1.29+
- 2GB+ RAM available
- 5GB+ disk space

### First Time Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your configuration
nano .env

# 3. Create required directories
mkdir -p config data logs

# 4. Build Docker images
docker-compose build

# 5. Start all services
docker-compose up -d

# 6. Verify services are running
docker-compose ps
```

### Verify Service Health

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs postgres
redis-cli -a YOUR_PASSWORD ping
curl http://localhost:3000/health
curl http://localhost:9090/-/healthy
```

## Directory Structure

```
infrastructure/
├── README.md (this file)
├── docker-compose.yml — Main service orchestration
├── docker-compose.override.yml — Local development overrides (not committed)
├── .dockerignore — Build context exclusions
│
├── docker/ — Dockerfile definitions
│   ├── api.Dockerfile — Main API service
│   ├── worker.Dockerfile — Background worker
│   ├── backup.Dockerfile — Backup service
│   └── ...
│
├── config/ — Service configuration files
│   ├── postgres.conf — PostgreSQL configuration
│   ├── redis.conf — Redis configuration
│   ├── prometheus.yml — Prometheus config
│   ├── nginx.conf — NGINX configuration
│   └── ...
│
├── scripts/ — Deployment and utility scripts
│   ├── deploy.sh — Deployment script
│   ├── backup.sh — Backup script
│   ├── restore.sh — Restore script
│   ├── health-check.sh — Health checking
│   └── ...
│
└── environments/
    ├── production.yml — Production overrides
    ├── staging.yml — Staging overrides
    └── local.yml — Local development overrides
```

## Services

### Data Services
- **postgres** — PostgreSQL database (primary data storage)
- **redis** — Redis cache and session store

### AI Services
- **ollama** — Local LLM inference engine

### Application Services
- **api** — Main application API (Phase 2)

### Monitoring
- **prometheus** — Metrics collection
- **grafana** — Metrics visualization

## Configuration

### Environment Variables

All configuration is managed via `.env` file. See `.env.example` for complete reference:

```bash
# Database
DB_HOST=postgres
DB_PASSWORD=secure_password

# Redis
REDIS_PASSWORD=secure_password

# API Keys
CLAUDE_API_KEY=sk-...
GITHUB_TOKEN=ghp_...

# Security
JWT_SECRET=generated_secret_here

# More in .env.example
```

### Service-Specific Config

Configuration files for each service:
- `config/postgres.conf` — PostgreSQL tuning
- `config/redis.conf` — Redis optimization
- `config/prometheus.yml` — Monitoring setup
- `config/nginx.conf` — Reverse proxy (Phase 2)

## Common Tasks

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 postgres
```

### Execute Commands
```bash
# Database management
docker-compose exec postgres psql -U postgres -d wise2_core

# Redis operations
docker-compose exec redis redis-cli -a $REDIS_PASSWORD

# API shell
docker-compose exec api bash
```

### Database Management

#### Backup
```bash
./scripts/backup.sh
```

#### Restore
```bash
./scripts/restore.sh backup_file.sql
```

#### Migrations
```bash
docker-compose exec api npm run migrate
```

### Monitoring

#### View Metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

#### Custom Dashboards
1. Log into Grafana
2. Add data source (Prometheus: http://prometheus:9090)
3. Create dashboard or import template

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs service_name

# Verify configuration
docker-compose config

# Force rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Reduce memory limit in docker-compose.yml
# Optimize service configuration in config/
```

### Network Issues
```bash
# Check network
docker network inspect infrastructure_wise2-network

# Restart networking
docker-compose down
docker network prune
docker-compose up -d
```

### Database Issues
```bash
# Check database status
docker-compose exec postgres pg_isready

# Check logs
docker-compose logs postgres

# Manual connection test
docker-compose exec postgres psql -U postgres
```

## Deployment

### Local Development
```bash
docker-compose up -d
# Services available at localhost:*
```

### Raspberry Pi
```bash
# Use Raspberry Pi specific compose file
docker-compose -f docker-compose.yml -f docker-compose.rpi.yml up -d
```

### Staging/Production
```bash
# Use environment-specific overrides
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## Security

### Secrets Management
- **Never** commit `.env` file
- Store production secrets in secure vault
- Use strong passwords for all services
- Rotate secrets regularly

### Network Security
- All traffic between containers encrypted (production)
- Firewall rules restrict external access
- Regular security updates

### Credential Management
```bash
# Generate secure password
openssl rand -base64 32

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scaling

### Horizontal Scaling
For Phase 7 upgrade to Kubernetes or container orchestration platform.

### Vertical Scaling
Adjust in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      cpus: '1'
      memory: 512M
```

## Monitoring & Alerts

### Health Checks
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- API: `/health` endpoint
- Prometheus: `/-/healthy`

### Metrics Collection
- CPU, memory, disk usage
- Service response times
- Error rates
- Request volumes

### Alerting
- Prometheus alert rules (to be configured)
- Webhook to notification service
- Dashboard alerts in Grafana

## Maintenance

### Regular Tasks
- Weekly: Check logs and metrics
- Monthly: Review and optimize configurations
- Quarterly: Security audit
- Annually: Disaster recovery drill

### Backup Strategy
- Daily automated backups
- 30-day retention
- Off-site backup replication
- Regular restore testing

### Updates
- Security patches: Apply immediately
- Service updates: Test in staging first
- Docker image updates: Monthly or as needed

## Documentation

- [MASTER.md](../MASTER.md) — System architecture
- [DECISIONS.md](../DECISIONS.md) — Infrastructure decisions
- [docs/CONFIGURATION.md](../docs/CONFIGURATION.md) — Detailed config guide
- [docs/runbooks/deployment.md](../docs/runbooks/deployment.md) — Deployment procedures

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review [docs/runbooks/troubleshooting.md](../docs/runbooks/troubleshooting.md)
3. Check [DECISIONS.md](../DECISIONS.md) for rationale
4. Create GitHub issue with details

## Version

**Infrastructure Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: CTO / Lead Systems Engineer

---

See [docs/README.md](../docs/README.md) for complete documentation index.
