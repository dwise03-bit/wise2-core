# DEPLOYMENT GUIDE

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## DEPLOYMENT ENVIRONMENTS

### Development
```
Location: Local machine + Docker Compose
Database: PostgreSQL (local)
Cache: Redis (local)
Storage: MinIO (local S3)
Access: http://localhost:3000-3004
```

### Staging
```
Location: Cloud (DigitalOcean/AWS)
Database: Managed PostgreSQL
Cache: Managed Redis
Storage: S3 (regional)
Access: https://staging.wise2.dev
Auto-deploy: On main branch commit
```

### Production
```
Location: Cloud (Kubernetes)
Database: PostgreSQL with replicas
Cache: Redis cluster
Storage: S3 (multi-region)
Access: https://wise2.com
Manual approval required
```

---

## LOCAL DEVELOPMENT

### Setup
```bash
# 1. Clone and install
git clone https://github.com/dwise03-bit/wise2-enterprise
cd wise2-enterprise
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start services
docker-compose up -d

# 4. Run migrations
pnpm db:migrate

# 5. Start dev server
pnpm dev
```

### Access Points
- Website: http://localhost:3001
- Dashboard: http://localhost:3002
- Studio: http://localhost:3003
- Admin: http://localhost:3004
- API: http://localhost:3000
- Docs: http://localhost:3000/api/docs

---

## CI/CD PIPELINE

### GitHub Actions Workflow
```
1. Trigger: Push to branch / PR opened
2. Lint: ESLint, TypeScript check
3. Test: Unit + integration tests
4. Build: Docker images
5. Security: Vulnerability scan
6. Deploy (staging): Auto on main
7. Deploy (production): Manual approval
```

### Build & Push
```bash
# Docker image tagged with commit SHA
docker build -t wise2-api:$COMMIT_SHA .
docker push registry.example.com/wise2-api:$COMMIT_SHA
```

---

## STAGING DEPLOYMENT

### Manual Deployment
```bash
git push origin main
# GitHub Actions automatically:
# 1. Runs all tests
# 2. Builds images
# 3. Deploys to staging
# 4. Runs smoke tests
```

### Monitoring
```
Health check: https://staging.wise2.dev/api/health
Logs: CloudWatch / Loki
Metrics: Prometheus
Alerts: Slack notifications
```

---

## PRODUCTION DEPLOYMENT

### Prerequisites
- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan clean
- [ ] Staging verified
- [ ] Database backup taken
- [ ] Rollback plan documented

### Deployment Steps
```bash
# 1. Tag release
git tag -a v0.1.0 -m "Production release"
git push origin v0.1.0

# 2. GitHub Actions:
#    - Builds and tests
#    - Creates Docker images
#    - Waits for approval

# 3. Manual approval in Actions UI

# 4. Deployment:
#    - Update Kubernetes manifests
#    - Rolling update (0 downtime)
#    - Health checks
#    - Smoke tests

# 5. Verification:
#    - Monitor error rates
#    - Check response times
#    - Verify data integrity
```

### Rollback Procedure
```bash
# Immediate rollback to previous version
kubectl set image deployment/api api=registry.example.com/wise2-api:PREVIOUS_VERSION

# Verify rollback
kubectl rollout status deployment/api
```

### Deployment Strategy
- **Rolling Update**: 25% at a time
- **Health Checks**: HTTP 200 on /health
- **Timeout**: 5 minutes per pod
- **Rollback Trigger**: If error rate > 1%

---

## INFRASTRUCTURE

### Docker Images
```
wise2-api:latest
wise2-worker:latest
wise2-nginx:latest
```

### Kubernetes Manifests
```
deployments/
├── api-deployment.yaml
├── worker-deployment.yaml
├── nginx-deployment.yaml
services/
├── api-service.yaml
└── nginx-service.yaml
```

### Configuration
```
ConfigMaps: Environment config
Secrets: API keys, passwords
PVCs: Persistent volumes (if needed)
```

---

## DATABASE MIGRATIONS

### Apply Migrations
```bash
pnpm db:migrate

# Verify
pnpm db:status
```

### Rollback Migration
```bash
pnpm db:migrate:revert --number=1
```

### Zero-Downtime Migrations
1. Deploy code supporting both old + new schema
2. Run migrations
3. Remove backward compatibility code
4. Deploy updated code

---

## SCALING

### Horizontal Scaling
```bash
# Scale API pods
kubectl scale deployment api --replicas=5

# Scale workers
kubectl scale deployment worker --replicas=3
```

### Monitoring for Scaling
- CPU: Alert at 70%
- Memory: Alert at 80%
- Response time: Alert if > 500ms (p95)
- Auto-scaling: Enabled (2-10 replicas)

---

## MONITORING & ALERTS

### Key Metrics
- Error rate
- Response time (p50, p95, p99)
- CPU & memory usage
- Database connections
- Cache hit ratio

### Alert Triggers
- Error rate > 1%
- Response time > 500ms (p95)
- CPU > 80%
- Memory > 90%
- Database connections > 80

### On-Call Response
- Page: Immediate escalation
- Alert: Logged + email
- Review: 1-hour window

---

**Owner**: Wise Defense LLC  
**Last Updated**: 2026-07-11
