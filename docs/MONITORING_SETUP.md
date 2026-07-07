# Monitoring Setup — Wise² Core

Comprehensive monitoring and alerting configuration.

---

## Monitoring Stack Overview

**Components**:
- **Prometheus**: Metrics collection and time-series database
- **Grafana**: Visualization and dashboards
- **AlertManager**: Alert routing and notification

**Ports**:
- Prometheus: 9090
- Grafana: 3001
- AlertManager: 9093

---

## Prometheus Configuration

Location: `infrastructure/config/prometheus.yml`

**Key Features**:
- Scrapes metrics every 15 seconds
- 30-day retention
- Service discovery for Docker
- Alert rule evaluation

**Configured Scrape Targets**:
- API service (port 3000)
- Dashboard service (port 3000)
- PostgreSQL exporter (port 9187)
- Redis exporter (port 9121)
- Docker metrics (port 8080)
- Node exporter (port 9100)

---

## Alert Rules

Location: `infrastructure/config/alerts.yml`

### Service Availability Alerts

**ServiceDown** (P1)
- Triggers when: Service health check fails for 2 minutes
- Severity: Critical
- Action: Page on-call immediately

**ServiceUnhealthy** (P2)
- Triggers when: Service health check fails for 5 minutes
- Severity: Warning
- Action: Alert team

### Performance Alerts

**HighErrorRate** (P2)
- Triggers when: >5% of requests error for 5 minutes
- Severity: Warning
- Action: Alert to Slack

**HighLatency** (P2)
- Triggers when: p95 latency > 1s for 5 minutes
- Severity: Warning
- Action: Alert to Slack

**HighCPUUsage** (P3)
- Triggers when: CPU >80% for 5 minutes
- Severity: Warning
- Action: Alert to Slack

### Resource Alerts

**HighMemoryUsage** (P3)
- Triggers when: Memory >85% for 5 minutes
- Severity: Warning

**LowDiskSpace** (P2)
- Triggers when: <10% disk free for 5 minutes
- Severity: Warning

**CriticalDiskSpace** (P1)
- Triggers when: <5% disk free for 2 minutes
- Severity: Critical

### Database Alerts

**PostgreSQLDown** (P1)
- Triggers when: Database connection fails for 1 minute
- Severity: Critical

**PostgreSQLHighConnections** (P2)
- Triggers when: >80 connections for 5 minutes
- Severity: Warning

**PostgreSQLSlowQueries** (P2)
- Triggers when: Mean query time >1s for 5 minutes
- Severity: Warning

### Certificate Alerts

**CertificateExpiringSoon** (P2)
- Triggers when: SSL cert expires in <30 days
- Severity: Warning
- Action: Renew certificate

**CertificateExpired** (P1)
- Triggers when: SSL cert is expired
- Severity: Critical

---

## Grafana Dashboards

### 1. System Overview Dashboard

**Key Metrics**:
- Service health status (green/red)
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O
- Uptime (hours)

**Graphs**:
- Service availability (24h)
- Resource usage trends (24h)
- Error rate (1h rolling)
- Request rate (1h rolling)

### 2. Service Health Dashboard

**Per-Service Metrics**:
- API Service
  - Uptime
  - Request rate
  - Error rate
  - Response time (p50, p95, p99)
  - Connected clients

- Dashboard
  - Uptime
  - Load time (p95)
  - Error rate
  - Active sessions

- Database (PostgreSQL)
  - Connection count
  - Transaction rate
  - Query performance
  - Cache hit ratio
  - Index usage

- Redis
  - Commands/sec
  - Memory usage
  - Hit rate
  - Evictions

### 3. Performance Dashboard

**Metrics**:
- API response time distribution
- Database query latency
- Cache hit rates
- Throughput (requests/sec)
- Queue depth
- Worker processing time

**Alerts**:
- Response time SLA breach
- Queue depth too high
- Cache hit rate too low

### 4. Error & Availability Dashboard

**Metrics**:
- Error rate by service
- Error rate by endpoint
- Error types distribution
- Service availability
- Incident history
- Mean time to recovery (MTTR)

**Trends**:
- Error rate over time
- Availability over time
- Incident frequency
- Incident severity

### 5. Business Metrics Dashboard

**Metrics**:
- User registrations (daily)
- Deployments (daily)
- Feature usage
- Customer health score
- Support tickets
- Revenue impact

---

## Notification Channels

### Email Notifications

**Configuration**:
```yaml
email:
  to: ops-team@wise2.net
  from: alerts@wise2.net
  server: smtp.gmail.com:587
```

**Alerts Sent**:
- P1 (Critical): Immediately
- P2 (Warning): Immediately
- P3 (Info): Daily digest

### Slack Notifications

**Channel**: #alerts
**Configuration**: Webhook to Slack

**Message Format**:
```
🚨 [P1] API Service Down
Service: api
Alert: ServiceDown
Time: 2026-07-07T14:30:00Z
Duration: 5 minutes
Action: Page on-call
```

### PagerDuty Integration (Optional)

**Configuration**:
- P1 → Page on-call immediately (phone call)
- P2 → Create incident (Slack + email)
- P3 → Slack notification only

### SMS Alerts (Optional, P1 Only)

**Configuration**:
- Recipients: On-call engineer
- Message: Brief alert summary + escalation URL

---

## Setting Up Monitoring

### Step 1: Deploy Prometheus

```bash
# Already configured in docker-compose.yml
docker-compose up -d prometheus

# Verify
curl http://localhost:9090/-/healthy
```

### Step 2: Deploy Grafana

```bash
# Already configured in docker-compose.yml
docker-compose up -d grafana

# Login: http://localhost:3001
# Username: admin
# Password: (from .env GRAFANA_PASSWORD)
```

### Step 3: Add Data Source in Grafana

1. Go to Settings → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. URL: http://prometheus:9090
5. Click "Save & Test"

### Step 4: Import Dashboards

```bash
# Dashboards are JSON files
# Import from: infrastructure/config/grafana/dashboards/

# Via UI:
# 1. Click "+" → Import
# 2. Select JSON file
# 3. Select Prometheus data source
# 4. Click Import
```

### Step 5: Configure Alerts

```bash
# Alerts configured in: infrastructure/config/alerts.yml
# Reload: curl -X POST http://localhost:9090/-/reload
```

### Step 6: Test Alerts

```bash
# Create test alert
curl -X POST http://localhost:9090/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alerts": [{
      "labels": {"alertname": "TestAlert"},
      "annotations": {"summary": "Test alert"}
    }]
  }'

# Verify notification sent
```

---

## Monitoring Best Practices

### Golden Signals

Monitor these 4 signals:

1. **Latency**
   - Measure: Response time (p50, p95, p99)
   - Alert if: p95 > 1s
   - Track: Trend over time

2. **Traffic**
   - Measure: Requests per second
   - Alert if: Unusual spike
   - Track: Baseline and trend

3. **Errors**
   - Measure: Error rate (%)
   - Alert if: > 5%
   - Track: Error types

4. **Saturation**
   - Measure: Resource usage (CPU, memory, disk)
   - Alert if: > 80%
   - Track: Capacity trends

### SLA Targets

| Service | Availability | Latency (p95) | Error Rate |
|---------|--------------|---------------|-----------|
| API | 99.9% | <500ms | <1% |
| Dashboard | 99.5% | <1s | <2% |
| Database | 99.95% | <100ms | 0% |

### Dashboard Review Frequency

- **Daily**: Performance dashboard (check for trends)
- **Weekly**: All dashboards (check for issues)
- **Monthly**: Capacity planning dashboard (plan upgrades)

---

## Custom Metrics

### Application Metrics to Instrument

Add to application code:

```javascript
// Response time histogram
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.histogram('request_duration_ms', duration);
  });
  next();
});

// Error counter
app.use((err, req, res, next) => {
  metrics.counter('errors_total', {
    status: err.status || 500,
    endpoint: req.path
  });
  res.status(err.status).json({error: err.message});
});

// Business metrics
app.post('/user/register', (req, res) => {
  // ... registration logic
  metrics.counter('user_registrations_total');
  res.json({success: true});
});
```

---

## Troubleshooting Monitoring

### Prometheus not scraping

```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Check health
curl http://localhost:9090/-/healthy

# Check logs
docker-compose logs prometheus
```

### Grafana dashboard blank

```bash
# Verify data source
curl http://prometheus:9090/api/v1/query?query=up

# Check Grafana logs
docker-compose logs grafana

# Restart
docker-compose restart grafana
```

### Alerts not firing

```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check alert status
curl http://localhost:9090/api/v1/alerts

# Reload rules
curl -X POST http://localhost:9090/-/reload
```

---

## Monitoring Checklist

Before production deployment:

- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Notification channels working
- [ ] On-call team trained
- [ ] Escalation procedures documented
- [ ] SLA targets defined
- [ ] Baseline metrics established

---

**Monitoring Setup Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Operations / Platform Team
