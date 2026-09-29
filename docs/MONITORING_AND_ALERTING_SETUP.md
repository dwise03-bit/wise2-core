# WISE² Core: Monitoring & Alerting Infrastructure Setup Guide

**Version**: 1.0  
**Last Updated**: 2026-07-23  
**Owner**: dwise (dwise03@gmail.com)  
**Status**: Production Ready  
**Environment**: Docker Compose (Local) + Cloud (AWS EC2)

---

## Executive Summary

This guide establishes production monitoring, logging, and incident response infrastructure for WISE² Core. The recommended stack is:

- **Metrics**: Prometheus (time-series database)
- **Visualization**: Grafana (dashboards & alerts)
- **Logging**: ELK Stack or Datadog (centralized logs)
- **Alerting**: Prometheus AlertManager → Slack/PagerDuty
- **Incident Response**: Runbooks + on-call rotation

**Timeline**: Phase 1 (MVP) = 2-3 days; Phase 2 (Production) = 1 week

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: MVP Monitoring (Prometheus + Grafana)](#phase-1-mvp-monitoring)
3. [Phase 2: Production Logging (ELK/Datadog)](#phase-2-production-logging)
4. [Alerting Configuration](#alerting-configuration)
5. [Incident Response](#incident-response)
6. [Backups & Disaster Recovery](#backups--disaster-recovery)
7. [Runbooks](#runbooks)
8. [Cost Estimation](#cost-estimation)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WISE² Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API Node   │  │   Website    │  │   Dashboard  │      │
│  │ (NestJS)     │  │ (Next.js)    │  │ (Next.js)    │      │
│  │ :3001        │  │ :3000        │  │ :3005        │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         │ /metrics        │ /metrics        │ /metrics       │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│  ┌──────────────┐  ┌──────▼───────────────────────┐        │
│  │  PostgreSQL  │  │    Prometheus Scraper        │        │
│  │  + pg_stat   │  │    (Scrapes /metrics every   │        │
│  │  exporter    │  │     15 seconds)              │        │
│  └──────────────┘  └──────┬───────────────────────┘        │
│         │                  │                                 │
│         │ JDBC exporter    │                                 │
│         └──────────────────┘                                │
│                           │                                 │
│  ┌──────────────────┐     │                                 │
│  │     Redis        │     │                                 │
│  │ redis_exporter   │─────┘                                 │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌──────────┐
   │Prometheus│       │ Grafana │       │AlertMgr  │
   │(9090)    │       │(3030)   │       │(9093)    │
   └─────┬────┘       └─────────┘       └────┬─────┘
         │                                    │
         └────────────────┬───────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐    ┌─────────────┐
   │   Slack │      │PagerDuty │    │CloudWatch   │
   │ Webhook │      │   API    │    │  (optional) │
   └─────────┘      └──────────┘    └─────────────┘
```

---

## Phase 1: MVP Monitoring (Prometheus + Grafana)

**Scope**: Health checks, service metrics, basic dashboards  
**Time**: 2-3 days  
**Cost**: ~$0 (self-hosted)

### 1.1 Install Prometheus & Grafana via Docker Compose

Add to `docker-compose.prod.yml`:

```yaml
# Monitoring Stack
prometheus:
  image: prom/prometheus:latest
  container_name: wise2_prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - "--config.file=/etc/prometheus/prometheus.yml"
    - "--storage.tsdb.path=/prometheus"
    - "--storage.tsdb.retention.time=30d"
  networks:
    - wise2_network
  restart: unless-stopped

grafana:
  image: grafana/grafana:latest
  container_name: wise2_grafana
  ports:
    - "3030:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
    - GF_USERS_ALLOW_SIGN_UP=false
    - GF_SERVER_ROOT_URL=http://localhost:3030
  volumes:
    - grafana_data:/var/lib/grafana
    - ./config/grafana/dashboards:/etc/grafana/provisioning/dashboards
    - ./config/grafana/datasources:/etc/grafana/provisioning/datasources
  networks:
    - wise2_network
  depends_on:
    - prometheus
  restart: unless-stopped

alertmanager:
  image: prom/alertmanager:latest
  container_name: wise2_alertmanager
  ports:
    - "9093:9093"
  volumes:
    - ./config/alertmanager.yml:/etc/alertmanager/config.yml
    - alertmanager_data:/alertmanager
  command:
    - "--config.file=/etc/alertmanager/config.yml"
    - "--storage.path=/alertmanager"
  networks:
    - wise2_network
  restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

### 1.2 Prometheus Configuration

Create `config/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'wise2-core'
    environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # API Service (NestJS + prom-client)
  - job_name: 'api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s

  # Website (Next.js + custom metrics)
  - job_name: 'website'
    static_configs:
      - targets: ['website:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s

  # Dashboard (Next.js + custom metrics)
  - job_name: 'dashboard'
    static_configs:
      - targets: ['dashboard:3005']
    metrics_path: '/api/metrics'
    scrape_interval: 15s

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Prometheus Self-Monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

### 1.3 Add Prometheus Metrics to NestJS API

Install `@willsoto/nestjs-prometheus`:

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

Add to `packages/api/src/main.ts`:

```typescript
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Prometheus metrics
  app.use(PrometheusModule.init());

  await app.listen(3001);
}

bootstrap();
```

Add to `packages/api/src/app.module.ts`:

```typescript
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      defaultLabels: {
        app: 'wise2-api',
        version: '1.0.0',
      },
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

Metrics endpoint: `http://localhost:3001/metrics`

### 1.4 Add Prometheus Metrics to Next.js Apps

Install `prom-client`:

```bash
npm install prom-client
```

Create `apps/website/app/api/metrics/route.ts`:

```typescript
import { register } from 'prom-client';

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    return new Response('Error collecting metrics', { status: 500 });
  }
}
```

Create `packages/api/src/metrics/metrics.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  register,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;
  private dbConnectionPoolSize: Gauge;
  private redisMemoryUsage: Gauge;

  constructor() {
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request latency in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Database connection pool size',
      labelNames: ['pool'],
    });

    this.redisMemoryUsage = new Gauge({
      name: 'redis_memory_bytes',
      help: 'Redis memory usage in bytes',
      labelNames: ['instance'],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  setDbPoolSize(poolName: string, size: number) {
    this.dbConnectionPoolSize.labels(poolName).set(size);
  }

  setRedisMemory(instance: string, bytes: number) {
    this.redisMemoryUsage.labels(instance).set(bytes);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

### 1.5 PostgreSQL Monitoring

Add PostgreSQL exporter to `docker-compose.prod.yml`:

```yaml
postgres-exporter:
  image: prometheuscommunity/postgres-exporter:latest
  container_name: wise2_postgres_exporter
  ports:
    - "9187:9187"
  environment:
    DATA_SOURCE_NAME: "postgresql://wise2_user:${DB_PASSWORD}@postgres:5432/wise2_core?sslmode=disable"
  networks:
    - wise2_network
  depends_on:
    - postgres
  restart: unless-stopped
```

### 1.6 Redis Monitoring

Add Redis exporter to `docker-compose.prod.yml`:

```yaml
redis-exporter:
  image: oliver006/redis_exporter:latest
  container_name: wise2_redis_exporter
  ports:
    - "9121:9121"
  environment:
    REDIS_ADDR: "redis:6379"
  networks:
    - wise2_network
  depends_on:
    - redis
  restart: unless-stopped
```

### 1.7 Create Grafana Dashboards

Create `config/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

Create `config/grafana/provisioning/dashboards/wise2-overview.json`:

```json
{
  "dashboard": {
    "title": "WISE² Core Overview",
    "tags": ["production", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Service Health Status",
        "targets": [
          {
            "expr": "up{job=~\"api|website|dashboard\"}",
            "legendFormat": "{{ job }}"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Request Rate (req/s)",
        "targets": [
          {
            "expr": "rate(http_requests_total[1m])",
            "legendFormat": "{{ method }} {{ route }}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "HTTP Response Times (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)",
            "legendFormat": "{{ route }}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate (%)",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100",
            "legendFormat": "Error Rate"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Database Connection Pool",
        "targets": [
          {
            "expr": "db_connection_pool_size",
            "legendFormat": "{{ pool }}"
          }
        ],
        "type": "gauge"
      },
      {
        "title": "Redis Memory Usage",
        "targets": [
          {
            "expr": "redis_memory_bytes / 1024 / 1024",
            "legendFormat": "{{ instance }} MB"
          }
        ],
        "type": "gauge"
      }
    ]
  }
}
```

---

## Phase 2: Production Logging (ELK/Datadog)

**Scope**: Centralized logging, log searching, trace analysis  
**Time**: 1 week  
**Cost**: ~$100-500/month (Datadog) or $0 (self-hosted ELK)

### 2.1 ELK Stack Setup (Self-Hosted Option)

Add to `docker-compose.prod.yml`:

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  container_name: wise2_elasticsearch
  environment:
    - discovery.type=single-node
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    - xpack.security.enabled=false
  ports:
    - "9200:9200"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
  networks:
    - wise2_network
  restart: unless-stopped

logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  container_name: wise2_logstash
  volumes:
    - ./config/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  ports:
    - "5000:5000"
  environment:
    - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
  networks:
    - wise2_network
  depends_on:
    - elasticsearch
  restart: unless-stopped

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
  container_name: wise2_kibana
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
  networks:
    - wise2_network
  depends_on:
    - elasticsearch
  restart: unless-stopped

volumes:
  elasticsearch_data:
```

### 2.2 Logstash Configuration

Create `config/logstash.conf`:

```conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "docker" {
    mutate {
      add_field => { "[@metadata][index_name]" => "logs-%{[container_name]}-%{+YYYY.MM.dd}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index_name]}"
  }
}
```

### 2.3 Application Logging Configuration

Update `packages/api/src/main.ts` to send logs to Logstash:

```typescript
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Winston logger for ELK
  const logger = new Logger('WISE2-API');

  app.useLogger(logger);

  // Send structured logs to Logstash
  if (process.env.NODE_ENV === 'production') {
    // Configure winston-logstash or similar
  }

  await app.listen(3001);
}
```

### 2.4 Datadog Integration (Cloud Option)

```bash
npm install @datadog/browser-rum @datadog/browser-logs
```

Add to `apps/website/app/layout.tsx`:

```typescript
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

// Initialize Datadog RUM
datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'wise2-website',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
});

datadogRum.startSessionReplayRecording();

// Initialize Datadog Logs
datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
});

datadogLogs.logger.setHandler('error', 'remote');
```

---

## Alerting Configuration

### 3.1 Alert Rules

Create `config/alert_rules.yml`:

```yaml
groups:
  - name: wise2_alerts
    interval: 30s
    rules:
      # Service Down
      - alert: ServiceDown
        expr: up{job=~"api|website|dashboard"} == 0
        for: 2m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "{{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been unreachable for 2 minutes"

      # High Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
          / 
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"

      # High Response Time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s (threshold: 2s)"

      # Database Connection Pool Exhausted
      - alert: DbPoolExhausted
        expr: db_connection_pool_size >= 95
        for: 2m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "Database connection pool exhausted"
          description: "Connection pool is at {{ $value }}% capacity"

      # Redis Memory High
      - alert: RedisMemoryHigh
        expr: redis_memory_bytes / 1024 / 1024 / 1024 > 3
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Redis memory usage high"
          description: "Redis is using {{ $value }}GB (threshold: 3GB)"

      # Disk Space Low
      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 10m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "Disk space running low"
          description: "{{ $labels.device }} has only {{ $value | humanizePercentage }} free"
```

### 3.2 AlertManager Configuration

Create `config/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: ${SLACK_WEBHOOK_URL}

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 4h

  routes:
    # Critical alerts to PagerDuty + Slack
    - match:
        severity: critical
      receiver: 'critical'
      repeat_interval: 1m

    # Warnings to Slack only
    - match:
        severity: warning
      receiver: 'warning'
      repeat_interval: 1h

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#monitoring'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - channel: '#oncall'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - routing_key: ${PAGERDUTY_ROUTING_KEY}
        severity: 'critical'

  - name: 'warning'
    slack_configs:
      - channel: '#monitoring'
        title: 'WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### 3.3 Slack Webhook Setup

1. Create Slack workspace channel: `#oncall` and `#monitoring`
2. Create Slack app at https://api.slack.com/apps
3. Enable "Incoming Webhooks"
4. Create webhooks for each channel
5. Add to `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_ROUTING_KEY=your-pagerduty-key
```

---

## Incident Response

### 4.1 On-Call Rotation

File: `docs/ON_CALL_ROTATION.md`

```markdown
# WISE² Core On-Call Rotation

## Team
- **dwise** (Primary) - Monday-Sunday
- **[Future team member]** (Secondary) - On-demand

## Escalation Path
1. **Slack #oncall alert** (automated)
2. **Call/SMS** if no response in 5 minutes
3. **Executive escalation** if no response in 15 minutes

## On-Call Responsibilities
- Respond to critical alerts within 5 minutes
- Acknowledge alert in Slack
- Begin investigation
- Update status channel every 15 minutes
- Create incident ticket in Jira
- Conduct post-incident review within 24 hours

## Handoff
- Rotation handoff each Monday 9:00 AM
- 30-minute overlap for context transfer
- Document any ongoing issues
```

### 4.2 Alert Response Workflow

```
Alert Fires
    ↓
AlertManager → Slack #oncall
    ↓
On-Call Engineer (5 min SLA)
    ↓
✓ Check metrics in Grafana
✓ Check logs in ELK/Datadog
✓ Review runbook (below)
✓ Attempt automatic recovery
    ↓
  Success? → Document & Monitor
    ↓
  Failure? → Escalate & Execute Manual Runbook
    ↓
Post-Incident Review (24 hours)
```

---

## Incident Response Runbooks

### 5.1 Service Down Runbook

**Alert**: `ServiceDown` (API/Website/Dashboard unreachable)

**Impact**: Users cannot access service

**Steps**:

1. **Confirm the issue** (1 min)
   ```bash
   curl http://api:3001/health
   curl http://website:3000/
   curl http://dashboard:3005/
   ```

2. **Check service logs** (2 min)
   ```bash
   docker logs wise2_api | tail -100
   docker logs wise2_website | tail -100
   docker logs wise2_dashboard | tail -100
   ```

3. **Check resource usage** (2 min)
   ```bash
   docker stats
   # Look for: CPU > 90%, Memory > 80%
   ```

4. **Restart service** (1 min)
   ```bash
   docker-compose restart api
   docker-compose restart website
   docker-compose restart dashboard
   ```

5. **Verify recovery** (1 min)
   ```bash
   curl http://api:3001/health
   # Expected: { "status": "ok" }
   ```

6. **Monitor** (5 min)
   - Watch Grafana dashboard
   - Watch Slack alerts
   - Set timer for 10-minute check-in

**Escalation**: If service still down after restart, check:
- Database connectivity: `docker logs wise2_postgres`
- Redis connectivity: `docker logs wise2_redis`
- Network: `docker network inspect wise2_network`

---

### 5.2 High Error Rate Runbook

**Alert**: `HighErrorRate` (>5% of requests failing)

**Impact**: Service degradation

**Steps**:

1. **Confirm in logs** (2 min)
   ```bash
   # ELK/Datadog
   # Query: status:500 OR status:502 OR status:503
   # Look for: Which endpoints? Which services?
   ```

2. **Check database** (3 min)
   ```bash
   # Check PostgreSQL status
   docker exec wise2_postgres psql -U wise2_user -d wise2_core -c "\l"
   
   # Check connection count
   docker exec wise2_postgres psql -U wise2_user -d wise2_core -c \
     "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
   ```

3. **Check Redis** (2 min)
   ```bash
   docker exec wise2_redis redis-cli INFO stats
   # Look for: connected_clients, used_memory
   ```

4. **Scale up (if needed)** (2 min)
   ```bash
   # Increase replicas in docker-compose.yml
   # Then: docker-compose up -d api
   ```

5. **Monitor recovery** (5 min)
   - Watch error rate in Grafana
   - Watch logs in ELK
   - Expected: Error rate drops to <1% within 5 min

**Root Causes**:
- Database locked by long query → Kill long query
- Memory leak → Restart service
- Cascading failure → Check downstream services

---

### 5.3 Database Replication Lag Runbook

**Alert**: `DatabaseReplicationLag` (>10 seconds)

**Impact**: Stale data reads from replicas

**Steps**:

1. **Check replication status** (2 min)
   ```bash
   docker exec wise2_postgres psql -U wise2_user -d wise2_core -c \
     "SELECT slot_name, restart_lsn FROM pg_replication_slots;"
   ```

2. **Check network latency** (1 min)
   ```bash
   docker exec wise2_postgres pg_stat_replication
   # Look for: write_lag, flush_lag, replay_lag
   ```

3. **Increase WAL keep size** (1 min)
   ```bash
   # Edit postgresql.conf
   wal_keep_size = 2GB
   # Restart: docker-compose restart postgres
   ```

4. **Monitor** (5 min)
   - Watch replication lag in Prometheus
   - Expected: Should drop to <1 second

---

### 5.4 Out of Disk Space Runbook

**Alert**: `DiskSpaceLow` (<10% free)

**Impact**: Database writes fail, services crash

**Immediate Actions**:

1. **Check disk usage** (1 min)
   ```bash
   df -h
   docker system df
   ```

2. **Clean up immediately** (5 min)
   ```bash
   # Clear old Prometheus data
   docker exec wise2_prometheus rm -rf /prometheus/wal
   
   # Clear old logs
   docker exec wise2_api sh -c "rm -f /var/log/app.log.*"
   
   # Clear unused images/volumes
   docker system prune -a --volumes
   ```

3. **Scale down** (2 min)
   ```bash
   # Reduce Prometheus retention
   # Edit: prometheus.yml
   --storage.tsdb.retention.time=7d
   
   # Restart
   docker-compose restart prometheus
   ```

4. **Long-term fix**: Provision additional storage
   ```bash
   # Add new volume to server
   # Migrate data
   # Update docker-compose.yml
   ```

---

### 5.5 Memory Leak Detection Runbook

**Alert**: `ContainerMemoryHigh` (>85% usage growing)

**Impact**: Service slowdown, eventual OOM kill

**Steps**:

1. **Identify leaking service** (2 min)
   ```bash
   docker stats
   # Look for: Memory increasing over time
   ```

2. **Get heap dump (Node.js)** (3 min)
   ```bash
   docker exec wise2_api node --inspect=0.0.0.0:9229 --heap-prof app.js
   # Connect with Chrome DevTools
   ```

3. **Restart service** (1 min)
   ```bash
   docker-compose restart api  # (for example)
   ```

4. **Monitor** (10 min)
   ```bash
   docker stats
   # Should stabilize at lower memory level
   ```

5. **Investigate root cause**
   - Check for: Event listeners not removed
   - Check for: Circular references
   - Check for: Unclosed database connections
   - Review recent code changes

---

## Backups & Disaster Recovery

### 6.1 Backup Strategy

**RPO (Recovery Point Objective)**: 24 hours  
**RTO (Recovery Time Objective)**: 4 hours

#### Database Backups

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/database"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/wise2_core_$DATE.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Dump database
docker exec wise2_postgres pg_dump \
  -U wise2_user \
  -d wise2_core \
  | gzip > "$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_FILE" s3://wise2-backups/database/

# Keep only last 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

#### Redis Backups

Create `scripts/backup-redis.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/redis"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"

# Trigger Redis save
docker exec wise2_redis redis-cli BGSAVE

# Copy RDB file
docker cp wise2_redis:/data/dump.rdb \
  "$BACKUP_DIR/redis_$DATE.rdb"

# Upload to S3
aws s3 cp "$BACKUP_DIR/redis_$DATE.rdb" \
  s3://wise2-backups/redis/

echo "Redis backup completed"
```

### 6.2 Backup Scheduling

Add to `.env.local` or systemd timer:

```bash
# Daily backup at 2:00 AM UTC
0 2 * * * /scripts/backup-database.sh >> /var/log/backup-db.log 2>&1
0 3 * * * /scripts/backup-redis.sh >> /var/log/backup-redis.log 2>&1
```

Or use systemd:

Create `/etc/systemd/system/wise2-backup-db.timer`:

```ini
[Unit]
Description=WISE² Database Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:00:00
Unit=wise2-backup-db.service

[Install]
WantedBy=timers.target
```

### 6.3 Restore Procedures

#### Restore Database

```bash
# List available backups
aws s3 ls s3://wise2-backups/database/

# Download backup
aws s3 cp s3://wise2-backups/database/wise2_core_2026-07-23.sql.gz .

# Restore
gunzip < wise2_core_2026-07-23.sql.gz | \
  docker exec -i wise2_postgres psql -U wise2_user -d wise2_core

# Verify
docker exec wise2_postgres psql -U wise2_user -d wise2_core -c "SELECT COUNT(*) FROM users;"
```

#### Restore Redis

```bash
# Download backup
aws s3 cp s3://wise2-backups/redis/redis_2026-07-23.rdb .

# Restore
docker cp redis_2026-07-23.rdb wise2_redis:/data/dump.rdb

# Restart Redis to load RDB
docker-compose restart redis

# Verify
docker exec wise2_redis redis-cli DBSIZE
```

### 6.4 Disaster Recovery Runbook

**Scenario**: Complete data loss on server

**RTO**: 4 hours | **RPO**: 24 hours (acceptable data loss)

**Steps**:

1. **Provision new server** (20 min)
   ```bash
   # Spin up new AWS EC2 instance
   # SSH into new server
   ```

2. **Clone code** (10 min)
   ```bash
   cd /opt
   git clone https://github.com/dwise03/wise2-core.git
   cd wise2-core
   ```

3. **Restore database** (30 min)
   ```bash
   # Start PostgreSQL container
   docker-compose up -d postgres
   
   # Wait for startup
   sleep 30
   
   # Restore from S3
   aws s3 cp s3://wise2-backups/database/wise2_core_LATEST.sql.gz - | \
     gunzip | docker exec -i wise2_postgres psql -U wise2_user -d wise2_core
   ```

4. **Restore Redis** (10 min)
   ```bash
   # Start Redis container
   docker-compose up -d redis
   
   # Download and restore backup
   aws s3 cp s3://wise2-backups/redis/redis_LATEST.rdb - > /tmp/dump.rdb
   docker cp /tmp/dump.rdb wise2_redis:/data/dump.rdb
   docker-compose restart redis
   ```

5. **Start services** (10 min)
   ```bash
   docker-compose up -d
   ```

6. **Verify services** (5 min)
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3000/
   curl http://localhost:3005/
   ```

7. **DNS failover** (5 min)
   ```bash
   # Update Route53 to point to new server IP
   ```

8. **Monitor** (ongoing)
   ```bash
   # Watch Grafana for 30 minutes
   # Check logs for any errors
   ```

**Total Time**: ~1.5 hours (well within 4-hour RTO)

---

## Cost Estimation

| Component | Option | Cost/Month | Notes |
|-----------|--------|-----------|-------|
| Prometheus | Self-hosted | $0 | CPU: 0.5 core, RAM: 2GB |
| Grafana | Self-hosted | $0 | CPU: 0.2 core, RAM: 512MB |
| ELK Stack | Self-hosted | $0 | CPU: 2 cores, RAM: 4GB+ |
| | Datadog | $200+ | Recommended for production |
| Backup Storage | AWS S3 | $1-5 | ~10GB/month |
| **Total (Self-Hosted)** | | $1-5 | Initial setup only |
| **Total (Cloud)** | | $200-300+ | Recommended for SLA |

---

## Deployment Checklist

- [ ] Deploy Prometheus + Grafana via docker-compose
- [ ] Add Prometheus metrics to all services
- [ ] Create Grafana dashboards
- [ ] Configure AlertManager
- [ ] Set up Slack webhooks
- [ ] Document runbooks
- [ ] Test alert firing
- [ ] Set up backup scripts
- [ ] Test backup restoration
- [ ] Configure on-call rotation
- [ ] Train team on incident response
- [ ] Schedule runbook reviews (quarterly)

---

## Monitoring KPIs

Monitor these metrics for system health:

| KPI | Target | Alert Threshold | Review Interval |
|-----|--------|-----------------|-----------------|
| Service Uptime | 99.9% | <99% | Weekly |
| Median Response Time | <200ms | >500ms | Daily |
| 95th Percentile Response Time | <500ms | >2s | Daily |
| Error Rate | <0.5% | >5% | Daily |
| Database Connection Pool Usage | <70% | >90% | Daily |
| Disk Usage | <70% | >90% | Daily |
| Backup Success Rate | 100% | <95% | Daily |

---

## References & Tools

- **Prometheus**: https://prometheus.io/
- **Grafana**: https://grafana.com/
- **ELK Stack**: https://www.elastic.co/what-is/elk-stack
- **Datadog**: https://www.datadoghq.com/
- **AlertManager**: https://prometheus.io/docs/alerting/latest/alertmanager/
- **PagerDuty**: https://www.pagerduty.com/
- **AWS CloudWatch**: https://aws.amazon.com/cloudwatch/

---

## Next Steps

1. **This Week**: Deploy Phase 1 (Prometheus + Grafana)
2. **Next Week**: Deploy Phase 2 (Logging with ELK or Datadog)
3. **Week 3**: Test incident response runbooks
4. **Week 4**: Production launch with on-call rotation

---

**Owner**: dwise (dwise03@gmail.com)  
**Last Updated**: 2026-07-23  
**Version**: 1.0
