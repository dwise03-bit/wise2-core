# WISE² AR/VR Monitoring Stack Setup

Complete production-ready monitoring infrastructure for the WISE² AR/VR ecosystem.

## Quick Start

```bash
cd monitoring
docker-compose up -d
```

Services start on:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Alertmanager**: http://localhost:9093

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WISE² AR/VR Services                      │
│                                                              │
│  ┌──────────────┬─────────────┬──────────────────────────┐ │
│  │   Router     │   Ollama    │  Second Brain + RAG      │ │
│  │  :3100       │  :11434     │  :3012                   │ │
│  └──────┬───────┴──────┬──────┴──────────┬───────────────┘ │
│         │              │                 │                  │
│         └──────────────┼─────────────────┘                  │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                    Metrics Scrape
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────┐             ┌────────▼──────┐
    │ Prometheus │             │ Node Exporter │
    │  :9090     │             │  :9100        │
    │            │             │               │
    │ • Router   │             │ • CPU usage   │
    │ • Ollama   │             │ • Disk usage  │
    │ • Latency  │             │ • Memory      │
    │ • Errors   │             │ • Network     │
    └─────┬──────┘             └────────┬──────┘
          │                             │
          └──────────────┬──────────────┘
                         │
                   Rules Evaluation
                         │
         ┌───────────────▼────────────────┐
         │   Alert Manager :9093          │
         │                                │
         │ • Route by severity            │
         │ • Deduplicate alerts           │
         │ • Send to Slack                │
         │ • Page on-call (PagerDuty)     │
         └───────────────┬────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       ┌────▼────┐          ┌────────▼───┐
       │  Slack  │          │ PagerDuty  │
       │  Webhook│          │ Integration│
       └─────────┘          └────────────┘
            │
       ┌────▼────────────┐
       │   Grafana       │
       │   :3000         │
       │                 │
       │ • Dashboards    │
       │ • Visualizations│
       │ • Alerting UI   │
       └─────────────────┘
```

## Configuration Files

### Prometheus (`prometheus.yml`)
- Scrapes Router, Ollama, Second Brain, PostgreSQL, Redis, Node metrics
- 15-30 second scrape intervals
- 30-day retention
- Loads alert rules from `alerts.yml`

### Alert Rules (`alerts.yml`)
- **25+ production rules** covering:
  - Service health (Router, Ollama, Second Brain down)
  - Performance (latency, error rate, FPS)
  - Resources (CPU, memory, disk, database)
  - Devices (Ray-Ban, Quest connectivity)
  - Budget enforcement
  - SLA breaches (99.9% uptime target)

### Alertmanager (`alertmanager.yml`)
- Route critical alerts → immediate Slack + PagerDuty
- Route warnings → standard Slack channel
- Route info → daily digest
- Alert deduplication + inhibition rules

### Grafana
- Auto-provision Prometheus data source
- Pre-built WISE² AR/VR Overview dashboard
- Dark theme optimized for 24/7 operations
- Real-time refresh every 30 seconds

### Docker Compose (`docker-compose.yml`)
- 7 services: Prometheus, Grafana, Alertmanager, Node Exporter, cAdvisor, PostgreSQL Exporter, Redis Exporter
- Isolated network (wise2-monitoring)
- Data persistence via volumes
- Health checks on each service

## Environment Variables

Create a `.env` file in the monitoring directory:

```env
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# PagerDuty Integration (optional)
PAGERDUTY_SERVICE_KEY=your-pagerduty-integration-key

# PostgreSQL Metrics
POSTGRES_PASSWORD=your-postgres-password

# Grafana
GF_SECURITY_ADMIN_PASSWORD=secure-admin-password
```

## Setup Checklist

### 1. Infrastructure Prerequisites
- [ ] Router running on :3100
- [ ] Ollama running on :11434
- [ ] Second Brain running on :3012
- [ ] PostgreSQL accessible on :5432
- [ ] Redis accessible on :6379
- [ ] Docker and docker-compose installed

### 2. Slack Integration
- [ ] Create Slack workspace (or use existing)
- [ ] Create incoming webhook in Slack
- [ ] Set `SLACK_WEBHOOK_URL` in `.env`
- [ ] Create channels: `#wise2-monitoring`, `#wise2-critical-alerts`, `#wise2-monitoring-info`

### 3. PagerDuty Integration (optional)
- [ ] Create PagerDuty account
- [ ] Create service integration
- [ ] Copy integration key to `PAGERDUTY_SERVICE_KEY`

### 4. Start Monitoring Stack
```bash
docker-compose up -d
sleep 10  # Give services time to start
```

### 5. Verify Services
```bash
# Check all containers running
docker-compose ps

# Verify Prometheus scraping targets
curl http://localhost:9090/api/v1/targets

# Verify alerts loaded
curl http://localhost:9090/api/v1/rules
```

### 6. Access Grafana
1. Navigate to http://localhost:3000
2. Login: admin / (password from .env)
3. View WISE² AR/VR Overview dashboard
4. Create additional dashboards as needed

## Monitoring Practices

### Alert Response

**Critical Alerts** (Severity: critical)
- **Response time**: < 5 minutes
- **Action**: Page on-call engineer (via PagerDuty)
- **Examples**: Router down, budget exceeded, Ollama down
- **Escalation**: If unresolved in 15 minutes, page manager

**Warning Alerts** (Severity: warning)
- **Response time**: < 30 minutes
- **Action**: Review and triage
- **Examples**: High latency, high error rate, slow queries
- **Escalation**: If persisting > 4 hours, escalate to critical

**Info Alerts** (Severity: info)
- **Response time**: Daily review
- **Action**: Log and monitor trends
- **Examples**: Device connectivity, FPS drops, battery drain
- **Escalation**: If pattern emerges, convert to warning

### Dashboard Updates

Add custom dashboards by:
1. Creating dashboard in Grafana UI
2. Export dashboard JSON
3. Save to `grafana/provisioning/dashboards/`
4. Reload provisioning via Grafana UI or API

### Alert Rules Maintenance

Update alert thresholds based on:
- **Baseline metrics** from 2-week production run
- **SLA requirements** (99.9% → 6 minutes downtime/month)
- **Cost implications** (budget alerts must enforce limits)
- **User impact** (FPS < 60 degrades VR experience)

### Metrics Retention

Current retention: **30 days**

For longer retention:
```bash
# Adjust Prometheus command in docker-compose.yml
--storage.tsdb.retention.time=365d  # 1 year
```

## Troubleshooting

### Prometheus not scraping targets
```bash
# Check target health
curl http://localhost:9090/api/v1/targets

# Check Router metrics endpoint
curl http://localhost:3100/metrics

# Check Ollama metrics endpoint
curl http://localhost:11434/api/metrics
```

### Alerts not firing
```bash
# Check alert rules loaded
curl http://localhost:9090/api/v1/rules | jq

# Check alert state
curl http://localhost:9090/api/v1/alerts
```

### Slack notifications not working
```bash
# Test webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test alert"}' \
  $SLACK_WEBHOOK_URL
```

### Grafana provisioning not loading
```bash
# Check logs
docker-compose logs grafana

# Manually reload provisioning
curl -X POST http://localhost:3000/api/admin/provisioning/dashboards/reload \
  -H "Authorization: Bearer $GRAFANA_TOKEN"
```

## Production Deployment

For production deployment:

1. **Use external Prometheus** (managed service or HA setup)
2. **Multi-replica Alertmanager** for high availability
3. **Persistent storage** on reliable filesystem or cloud storage
4. **TLS/SSL** for all communications
5. **Authentication** for Prometheus, Grafana, Alertmanager
6. **Backup strategy** for dashboards and alert rules

Example production docker-compose additions:
```yaml
prometheus:
  restart: always
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9090/-/healthy"]
    interval: 10s
    timeout: 5s
    retries: 3

alertmanager:
  deploy:
    replicas: 3  # High availability
```

## Next Steps

1. **Build custom dashboards** for device-specific metrics
2. **Integrate with PagerDuty** for on-call escalation
3. **Set up log aggregation** (ELK stack for app logs)
4. **Configure backup** of alert rules and dashboards
5. **Establish runbook** for each critical alert
6. **Plan capacity** based on 2-week production baseline

---

**Monitoring is not optional in production. Start with this stack, validate thresholds, and refine continuously based on real usage patterns.**
