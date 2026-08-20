# Phase 9: Production Readiness

**Status**: Planning Phase  
**Scope**: Deployment, monitoring, runbooks, documentation  
**Timeline**: 2-3 days estimated  
**Priority**: Critical - gates commercial launch

---

## Deployment Strategy

### Target Infrastructure

```
┌──────────────────────────────────────┐
│        Domain & CDN                  │
│   wise2.io (Cloudflare)              │
└──────────────────────────────────────┘
            ↓ HTTP/HTTPS
┌──────────────────────────────────────┐
│      Load Balancer                   │
│   AWS ALB / Nginx Reverse Proxy      │
│   - SSL/TLS termination              │
│   - Health checks                    │
│   - Request routing                  │
└──────────────────────────────────────┘
       ↙            ↓            ↖
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  API Pod 1   │ │  API Pod 2   │ │  API Pod 3   │
│ (services/   │ │ (services/   │ │ (services/   │
│  api)        │ │  api)        │ │  api)        │
│ Port: 3000   │ │ Port: 3000   │ │ Port: 3000   │
└──────────────┘ └──────────────┘ └──────────────┘
       ↓                ↓                ↓
┌──────────────────────────────────────────────┐
│        PostgreSQL (Managed RDS)              │
│   - Primary: us-east-1                       │
│   - Replica: us-west-1                       │
│   - Automated backups (30-day retention)     │
│   - Point-in-time recovery enabled           │
└──────────────────────────────────────────────┘
```

### Deployment Pipeline

```
Git Push
    ↓
GitHub Actions CI
  ├─ Lint
  ├─ Tests
  └─ Build
    ↓
[Approval Gate]
    ↓
Docker Build & Push
    ↓
Deploy to Staging
    ↓
Smoke Tests
    ↓
Approval to Production
    ↓
Blue-Green Deploy
    ↓
Health Checks
    ↓
Production Live ✅
```

---

## Phase 9A: Deployment Setup (1 day)

### Task 1: Docker Configuration

**File**: `services/api/Dockerfile`

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.production .env.production

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/server.js"]
```

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
      target: runtime
    image: wise2-api:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/wise2
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      FACEBOOK_PAGE_ACCESS_TOKEN: ${FACEBOOK_PAGE_ACCESS_TOKEN}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - wise2-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wise2
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - wise2-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - wise2-network

volumes:
  postgres_data:
  redis_data:

networks:
  wise2-network:
    driver: bridge
```

### Task 2: Kubernetes Deployment (Optional)

**File**: `k8s/api-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wise2-api
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: wise2-api
  template:
    metadata:
      labels:
        app: wise2-api
    spec:
      containers:
      - name: api
        image: wise2-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wise2-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: wise2-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Task 3: CI/CD Pipeline

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: wise2-api

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: image
        run: echo "image=${{ env.REGISTRY }}/${{ github.repository }}/api:${{ github.sha }}" >> $GITHUB_OUTPUT
      - uses: docker/build-push-action@v4
        with:
          context: ./services/api
          push: true
          tags: ${{ steps.image.outputs.image }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.wise2.io
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          docker pull ${{ needs.build.outputs.image }}
          docker-compose -f docker-compose.staging.yml up -d
      - name: Run Smoke Tests
        run: npm run test:smoke

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://wise2.io
    steps:
      - uses: actions/checkout@v3
      - name: Blue-Green Deploy
        env:
          PRODUCTION_HOST: ${{ secrets.PRODUCTION_HOST }}
          PRODUCTION_USER: ${{ secrets.PRODUCTION_USER }}
          PRODUCTION_KEY: ${{ secrets.PRODUCTION_KEY }}
        run: |
          # SSH into production server
          ssh -i $PRODUCTION_KEY $PRODUCTION_USER@$PRODUCTION_HOST <<'EOF'
            # Pull new image
            docker pull ${{ needs.build.outputs.image }}
            
            # Start green deployment
            docker-compose -f docker-compose.prod.yml \
              -f docker-compose.prod.green.yml up -d
            
            # Wait for health checks
            sleep 30
            
            # Switch load balancer to green
            curl http://localhost:8080/switch-green
            
            # Stop blue deployment
            docker-compose -f docker-compose.prod.yml \
              -f docker-compose.prod.blue.yml down
          EOF
```

---

## Phase 9B: Monitoring & Observability (1 day)

### Task 4: Logging Setup

**File**: `services/api/src/logger.ts` (Enhanced)

```typescript
import winston from 'winston';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'wise2-api' },
  transports: [
    // File transport (local)
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    
    // CloudWatch transport (production)
    ...(process.env.NODE_ENV === 'production' ? [
      new WinstonCloudWatch({
        logGroupName: '/wise2/api',
        logStreamName: `${process.env.HOSTNAME}`,
        awsRegion: 'us-east-1',
      }),
    ] : []),
    
    // Console (development)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ] : []),
  ],
});

export { logger, Sentry };
```

### Task 5: Metrics & Monitoring

**File**: `services/api/src/metrics.ts`

```typescript
import prometheus from 'prom-client';

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

const tenantActiveConnections = new prometheus.Gauge({
  name: 'tenant_active_connections',
  help: 'Number of active connections per tenant',
  labelNames: ['tenant_id'],
});

const approvalExecutionTime = new prometheus.Histogram({
  name: 'approval_execution_time_ms',
  help: 'Time to execute approved actions',
  labelNames: ['action_type'],
});

const workflowExecutionDuration = new prometheus.Histogram({
  name: 'workflow_execution_duration_ms',
  help: 'Time to execute workflows',
  labelNames: ['workflow_id'],
});

// Middleware
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration.labels(req.method, req.route?.path, res.statusCode).observe(duration);
  });
  next();
};

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});

export { httpRequestDuration, tenantActiveConnections, approvalExecutionTime, workflowExecutionDuration };
```

### Task 6: Alerting Rules

**File**: `monitoring/alerts.yml`

```yaml
groups:
- name: wise2-api
  interval: 30s
  rules:
  
  # High error rate
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate on {{ $labels.instance }}"
      description: "Error rate is {{ $value | humanizePercentage }}"
    labels:
      severity: critical
  
  # High latency
  - alert: HighLatency
    expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
    for: 10m
    annotations:
      summary: "High latency on {{ $labels.instance }}"
      description: "p95 latency is {{ $value | humanizeDuration }}"
    labels:
      severity: warning
  
  # Database connection pool exhaustion
  - alert: DatabasePoolExhausted
    expr: database_pool_connections_used / database_pool_connections_max > 0.9
    for: 5m
    annotations:
      summary: "Database connection pool exhausted"
    labels:
      severity: critical
  
  # Workflow execution failure
  - alert: WorkflowExecutionFailure
    expr: rate(workflow_execution_failures[5m]) > 0
    for: 10m
    annotations:
      summary: "Workflows failing to execute"
      description: "{{ $value }} workflows failed in last 5 minutes"
    labels:
      severity: warning
```

---

## Phase 9C: Runbooks (1 day)

### Task 7: Incident Response Guide

**File**: `RUNBOOK_INCIDENTS.md`

```markdown
# Incident Response Runbook

## Alert: HighErrorRate

**Severity**: CRITICAL  
**Threshold**: > 5% error rate for 5 minutes

### Investigation
1. Check recent deployments: `git log --oneline -5`
2. Review error logs: `tail -f logs/error.log`
3. Check database status: `curl http://localhost:5432/health`
4. Check external services: Stripe, Twilio, SendGrid status pages

### Resolution
**If recent deployment**: Rollback
```bash
git revert <commit-hash>
git push origin main
# Wait for deployment
```

**If database issue**: Restart database
```bash
docker-compose restart postgres
# Wait 30 seconds
curl http://localhost:3000/health
```

**If external service outage**: Route to demo providers
```bash
# Set environment variable
export USE_DEMO_PROVIDERS=true
docker-compose restart api
```

## Alert: DatabasePoolExhausted

**Severity**: CRITICAL  
**Action**: Immediate

### Investigation
1. Count active connections: `SELECT count(*) FROM pg_stat_activity;`
2. Find long-running queries: `SELECT pid, usename, query, query_start FROM pg_stat_activity WHERE query_start < now() - interval '10 minutes';`
3. Check API logs for slow queries

### Resolution
1. Kill long-running queries:
```sql
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_start < now() - interval '10 minutes';
```

2. Scale API instances:
```bash
docker-compose up -d --scale api=5
```

3. Monitor recovery:
```bash
watch -n 1 'curl http://localhost:5432/health'
```

## Alert: WorkflowExecutionFailure

**Severity**: WARNING  
**Action**: Monitor, investigate root cause

### Investigation
1. Check workflow logs: `SELECT * FROM audit_logs WHERE action = 'WORKFLOW_EXECUTED' ORDER BY created_at DESC LIMIT 10;`
2. Check action execution errors: `SELECT * FROM workflow_execution_errors;`
3. Check external service availability

### Resolution
1. If approval provider failure: Switch to demo providers
2. If workflow syntax error: Update workflow definition
3. If data issue: Fix source data, re-trigger workflow
```bash
curl -X POST http://localhost:3000/api/v1/crm/tenants/:id/workflows/engine/trigger-event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerType":"LEAD_STATUS_CHANGE","entityId":"lead_123","data":{}}'
```
```

---

## Phase 9D: Documentation (1 day)

### Task 8: Admin Guide

**File**: `docs/ADMIN_GUIDE.md`

```markdown
# WISE² Command Center - Administrator Guide

## System Architecture

- **API Server**: Node.js + Express (services/api)
- **Database**: PostgreSQL (AWS RDS)
- **Cache**: Redis
- **Frontend**: Next.js (apps/command-center)
- **Infrastructure**: Docker + Kubernetes (optional)

## Deployment

### Manual Deployment (Simple)
```bash
# SSH into production server
ssh wise2@173.208.147.165

# Pull latest code
cd /opt/wise2-core
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Automated Deployment (CI/CD)
1. Commit to main branch
2. GitHub Actions runs tests
3. On success, builds Docker image
4. Deploys to staging
5. Runs smoke tests
6. Awaits manual approval
7. Deploys to production with blue-green strategy

### Rollback
```bash
git revert <commit-hash>
git push origin main
# Wait for automated deployment to complete
```

## Monitoring

### Metrics Dashboard
- Prometheus: http://monitor.wise2.io:9090
- Grafana: http://monitor.wise2.io:3000
- Alerts configured in `monitoring/alerts.yml`

### Key Metrics
- HTTP Error Rate (should be < 1%)
- API Response Time p95 (should be < 500ms)
- Database Pool Usage (should be < 80%)
- Workflow Success Rate (should be > 99%)

### Log Aggregation
- CloudWatch: All logs from production API
- Sentry: All errors and exceptions
- Application logs: `/var/log/wise2/api.log`

## Backup & Recovery

### Database Backups
- **Frequency**: Automated daily at 2 AM UTC
- **Retention**: 30 days
- **Location**: AWS S3

### Point-in-Time Recovery
```bash
# Restore from specific timestamp
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier wise2-prod \
  --db-instance-identifier wise2-prod-restore \
  --restore-time 2026-08-20T10:00:00Z
```

### Disaster Recovery
1. Database backup restored from S3
2. API servers restarted with new database connection
3. Redis cache rebuilt (auto-populated on first request)
4. DNS failover to backup region (optional)

## Security

### Access Control
- Production access requires:
  - SSH key authentication
  - GitHub 2FA
  - Approval from at least 2 admins

### Secret Management
- Secrets stored in AWS Secrets Manager
- Rotated every 90 days
- Never logged or exposed in errors

### API Key Rotation
```bash
# Generate new API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Secrets Manager
aws secretsmanager update-secret \
  --secret-id wise2/api-key \
  --secret-string <new-key>

# Restart API
docker-compose restart api
```

## Troubleshooting

### API Server Won't Start
1. Check logs: `docker logs wise2_api_1`
2. Verify database connectivity: `docker exec wise2_postgres_1 pg_isready`
3. Check environment variables: `docker-compose config | grep -E "^[A-Z_]+="`

### High Latency
1. Check database query performance: `EXPLAIN ANALYZE SELECT ...`
2. Check slow query log: `/var/log/wise2/slow-queries.log`
3. Monitor CPU/memory: `docker stats`

### Database Issues
1. Connect to database: `docker exec -it wise2_postgres_1 psql -U wise2 -d wise2`
2. Check table sizes: `SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables;`
3. Rebuild indexes: `REINDEX DATABASE wise2;`

### Approval Execution Failures
1. Check provider status: Stripe, Twilio, SendGrid dashboards
2. Review execution logs: `SELECT * FROM audit_logs WHERE action = 'APPROVAL_EXECUTED' ORDER BY created_at DESC LIMIT 20;`
3. Check provider credentials in Secrets Manager
4. Switch to demo providers: Set `USE_DEMO_PROVIDERS=true` environment variable
```

### Task 9: User Documentation

**File**: `docs/USER_GUIDE.md`

```markdown
# WISE² Command Center - User Guide

## Getting Started

### Login
1. Go to https://wise2.io
2. Click "Sign In"
3. Enter email and password
4. Complete 2FA if enabled

### Create First Tenant
1. Click "New Business"
2. Enter business name, location, service type
3. Select industry template (HVAC, Pressure Washing, Generic)
4. Complete setup wizard

## Core Features

### Lead Management
- **Create Lead**: Click "New Lead" button
  - Fill name, email, phone, estimated value
  - Optionally add notes and tags
  - Click "Save"
  
- **View Leads**: Dashboard → Leads
  - Filter by status: New, Contacting, Qualified, Booked
  - Sort by date, value, name
  - Quick actions: Edit, Delete, View Details

- **Advanced Search**: Search leads by name, email, phone number

### Estimates
- **Create Estimate**:
  1. Open lead detail
  2. Click "Create Estimate"
  3. Add line items (labor, materials, services)
  4. Adjust pricing
  5. Click "Send" to email customer
  6. System creates approval request

- **Send Estimate**:
  1. Click "Send" button
  2. Confirm recipient email
  3. Optionally add message
  4. System sends and creates approval workflow

- **Track Status**:
  - Pending: Not yet sent
  - Sent: Awaiting customer response
  - Accepted: Customer approved
  - Declined: Customer rejected

### Dispatch
- **View Queue**: Dashboard → Dispatch
  - Shows all unassigned jobs
  - Click job to see details
  - Click "Assign" to assign to technician

- **Assign Job**:
  1. Select job from queue
  2. Click "Assign"
  3. Choose technician
  4. Confirm date/time window
  5. Send notification to technician

### Approvals
- **View Pending Approvals**: Dashboard → Approvals
  - Shows SMS, Email, Social, Payment approvals
  - Each pending approval requires action

- **Approve/Reject**:
  1. Click approval to view details
  2. Click "Approve" to proceed
  3. Optionally add note
  4. System executes action

### Reports
- **Sales Report**: Pipeline → Reports → Sales
  - By lead status (New, Qualified, Booked)
  - Conversion rates
  - Export as CSV/PDF

- **Dispatch Report**: Dispatch → Reports
  - By technician
  - Jobs completed vs pending
  - Average completion time

- **Revenue Report**: Finance → Reports → Revenue
  - By service type
  - Monthly trend
  - Forecast for next 90 days

### AI Advisor
- **Ask Questions**: Dashboard → AI Advisor
  - "How many leads do I need to hit my revenue goal?"
  - "Which technicians are most efficient?"
  - "What's my estimated revenue for next month?"
  - System analyzes data and provides recommendations

## Settings

### Business Settings
- Business name, location, logo
- Default service types and pricing
- Team members and roles
- Integrations (Stripe, Twilio, SendGrid)

### Personal Settings
- Email, phone, password
- Notification preferences
- API keys (for integrations)

### Billing
- Current subscription
- Payment method
- Invoice history
- Usage analytics

## Best Practices

1. **Lead Management**: Update lead status regularly (at least weekly)
2. **Estimates**: Follow up on pending estimates after 3 days
3. **Dispatch**: Assign jobs within 1 hour of creation
4. **Approvals**: Review pending approvals daily
5. **Reports**: Review weekly sales and dispatch reports

## Support

- **Help**: Click "?" button in top right
- **Documentation**: https://docs.wise2.io
- **Email**: support@wise2.io
- **Chat**: Live chat available in-app (weekdays 8am-6pm EST)
```

---

## Success Criteria

✅ Production deployment is stable (99.9% uptime)  
✅ Monitoring alerts configured and working  
✅ Incident response documented and tested  
✅ Backups automated and verified  
✅ Admin and user documentation complete  
✅ Team trained on deployment and monitoring  
✅ Security audit passed  
✅ Performance benchmarks met (< 200ms p95 latency)  

---

## Timeline

- **Day 1**: Deployment setup (Docker, CI/CD, infrastructure)
- **Day 2**: Monitoring & observability (logs, metrics, alerts)
- **Day 3**: Documentation (runbooks, admin guide, user guide)

---

## Post-Launch Checklist

- [ ] Monitor error rate (should be < 1%)
- [ ] Monitor latency (p95 should be < 500ms)
- [ ] Review daily logs for issues
- [ ] Verify backups are working
- [ ] Test disaster recovery plan
- [ ] Get customer feedback
- [ ] Plan next features based on usage

---

## Next Steps (Post-MVP)

1. **Performance Optimization** - Cache frequently accessed data
2. **Mobile App** - Native iOS/Android apps
3. **Advanced Workflows** - Custom automation rules
4. **Advanced Analytics** - Predictive forecasting
5. **WhatsApp Integration** - Two-way messaging
6. **Voice Calling** - Integrated phone system
7. **Video Conferencing** - In-app video calls

---

Generated: 2026-08-20
Last Updated: 2026-08-20
