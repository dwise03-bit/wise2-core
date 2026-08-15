# WISE² Raspberry Pi Monitoring Setup Guide

## Overview

Complete lightweight monitoring stack for Raspberry Pi running WISE² infrastructure:

- **Prometheus**: Metrics collection engine with 15-day retention
- **Node Exporter**: System metrics (CPU, memory, disk, network, temperature)
- **cAdvisor**: Container resource monitoring (Docker)
- **Grafana**: Optional visualization dashboard
- **Alert System**: Slack, email, and HTTP webhook alerts
- **CSV Archival**: Daily metrics export for long-term storage (30-day retention)

## Quick Start

### Minimal Installation (Prometheus + Node Exporter only)

```bash
cd /Users/danielwise/Projects/wise2-core
sudo bash scripts/monitoring-setup.sh
```

### With Grafana Dashboard

```bash
sudo bash scripts/monitoring-setup.sh --with-grafana
```

### With Slack Alerts

```bash
sudo bash scripts/monitoring-setup.sh \
  --slack-webhook "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### With Email Alerts

```bash
sudo bash scripts/monitoring-setup.sh --email your-email@example.com
```

### Full Setup (All Features)

```bash
sudo bash scripts/monitoring-setup.sh \
  --with-grafana \
  --slack-webhook "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
  --email your-email@example.com
```

## Access URLs

After installation, access monitoring at:

- **Prometheus UI**: `http://<pi-ip>:9090`
- **Node Exporter Metrics**: `http://<pi-ip>:9100/metrics`
- **cAdvisor**: `http://<pi-ip>:8080`
- **Grafana** (if enabled): `http://<pi-ip>:3000`

Find your Pi's IP:
```bash
hostname -I
```

## Service Management

### Start/Stop Services

```bash
# Start all services
sudo systemctl start prometheus node-exporter

# Stop all services
sudo systemctl stop prometheus node-exporter

# Restart Prometheus (e.g., after config changes)
sudo systemctl restart prometheus
```

### Enable/Disable Auto-Start

```bash
# Enable auto-start on boot
sudo systemctl enable prometheus node-exporter

# Disable auto-start
sudo systemctl disable prometheus node-exporter
```

### Check Service Status

```bash
# Prometheus status
sudo systemctl status prometheus

# View logs
sudo journalctl -u prometheus -f

# View Node Exporter logs
sudo journalctl -u node-exporter -f
```

## Configuration

### Prometheus Configuration

Location: `/etc/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['localhost:8080']
```

Edit and reload:
```bash
sudo nano /etc/prometheus/prometheus.yml
sudo systemctl restart prometheus
```

### Alert Rules

Location: `/etc/prometheus/alert_rules.yml`

Default alerts:

| Alert | Condition | Duration |
|-------|-----------|----------|
| **HighCPUUsage** | CPU > 80% | 5 minutes |
| **HighMemoryUsage** | Memory > 85% | 5 minutes |
| **HighDiskUsage** | Disk > 90% | 5 minutes |
| **HighTemperature** | System temp > 80°C | 5 minutes |
| **FilesystemReadonly** | FS read-only | 1 minute |
| **ContainerRestarting** | Container restart rate | 1 minute |

To adjust thresholds:
```bash
sudo nano /etc/prometheus/alert_rules.yml
sudo systemctl restart prometheus
```

### Alert Destinations

Location: `/etc/prometheus/alert_config.json`

```json
{
  "slack_webhook": "https://hooks.slack.com/services/...",
  "alert_email": "your-email@example.com",
  "alert_destinations": {
    "slack": true,
    "email": true
  }
}
```

Update alerts:
```bash
sudo nano /etc/prometheus/alert_config.json
```

## Metrics Collected

### System Metrics (Node Exporter)

- **CPU**: Usage, load average, frequency
- **Memory**: Total, available, used, cached, buffers
- **Disk**: I/O reads/writes, utilization, free space
- **Network**: Bytes sent/received, packets, errors
- **Processes**: Open file descriptors, context switches
- **Filesystem**: Size, available, usage by mount
- **Temperature**: System thermal sensors (if available)

### Container Metrics (cAdvisor)

- **CPU**: Container CPU usage, throttling
- **Memory**: Container memory usage, limits
- **I/O**: Container disk reads/writes
- **Network**: Container network I/O (if available)

### Application Metrics (Prometheus self)

- **Targets**: Scrape success/failures
- **DB**: Time series data, query latency
- **Configuration**: Reload count and timestamp

## Querying Metrics

### Via Prometheus UI

1. Navigate to `http://<pi-ip>:9090`
2. Click "Graph" tab
3. Enter PromQL query

Example queries:

```promql
# CPU usage percentage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage percentage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk usage percentage
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# Network bytes received (last 5m)
rate(node_network_receive_bytes_total[5m])

# Container memory usage
container_memory_usage_bytes
```

### Via Query API

```bash
# Get current value
curl 'http://localhost:9090/api/v1/query?query=node_cpu_seconds_total'

# Query range (last 1 hour)
curl 'http://localhost:9090/api/v1/query_range?query=node_memory_MemAvailable_bytes&start=1234567890&end=1234571490&step=60'
```

## Data Archival

### CSV Export

Metrics are exported to CSV daily at 2 AM UTC:

Location: `/var/lib/prometheus/archive/`

Files: `metrics_YYYYMMDD_HHMMSS.csv.gz`

Format:
```
timestamp,metric,value,instance,job
20260723_020000,node_cpu_seconds_total,12345.67,pi-system,node
20260723_020000,node_memory_MemTotal_bytes,1073741824,pi-system,node
```

### Retrieve Archived Metrics

```bash
# List archives
ls -lh /var/lib/prometheus/archive/

# Extract and view
zcat /var/lib/prometheus/archive/metrics_20260723_020000.csv.gz | head -20

# Load into Python/Excel
gunzip -c /var/lib/prometheus/archive/metrics_*.csv.gz > all_metrics.csv
```

### Adjust Retention

To change retention policy (currently 15 days):

```bash
# Edit Prometheus systemd service
sudo systemctl edit prometheus

# Under [Service], modify ExecStart:
# --storage.tsdb.retention.time=30d

# Restart
sudo systemctl restart prometheus
```

## Alerting

### Slack Integration

1. Create Slack webhook:
   - Go to https://api.slack.com/apps
   - Create app → From scratch
   - Enable Incoming Webhooks
   - Add new webhook → Select channel
   - Copy webhook URL

2. Configure:
```bash
sudo bash scripts/monitoring-setup.sh --slack-webhook "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

3. Test:
```bash
/usr/local/bin/wise2-alert-handler "TestAlert" "warning" "Testing alert system"
```

### Email Integration

1. Setup mail:
```bash
# Debian/Ubuntu
sudo apt-get install mailutils

# Test email
echo "Test message" | mail -s "Test" your-email@example.com
```

2. Configure:
```bash
sudo bash scripts/monitoring-setup.sh --email your-email@example.com
```

3. Update alert handler if using custom SMTP:
```bash
sudo nano /usr/local/bin/wise2-alert-handler
```

### Alert Handling

Alerts are sent automatically when thresholds are exceeded. To manually trigger:

```bash
/usr/local/bin/wise2-alert-handler "AlertName" "critical" "Alert message"
```

Severity levels: `resolved`, `warning`, `critical`

## Grafana Setup (Optional)

Default credentials:
- **URL**: `http://<pi-ip>:3000`
- **Username**: `admin`
- **Password**: `admin`

### First Login

1. Access Grafana at `http://<pi-ip>:3000`
2. Login with `admin` / `admin`
3. Change password
4. Datasource already configured (Prometheus on localhost:9090)

### Create Dashboard

1. Click "+" → "Dashboard" → "Add panel"
2. Select "Prometheus" datasource
3. Enter PromQL query (see examples above)
4. Set visualization type (Graph, Gauge, Stat)
5. Save dashboard

Example dashboard panels:

**CPU Usage**
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**Memory Usage**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**Disk Free**
```promql
node_filesystem_avail_bytes{fstype!~"tmpfs|fuse"} / 1024 / 1024 / 1024
```

## Troubleshooting

### Prometheus Won't Start

```bash
# Check errors
sudo journalctl -u prometheus -n 50

# Validate config
/opt/prometheus/promtool check config /etc/prometheus/prometheus.yml

# Check permissions
sudo ls -l /var/lib/prometheus/
sudo ls -l /opt/prometheus/
```

### No Metrics Appearing

1. Check targets in Prometheus UI: `http://<pi-ip>:9090/targets`
2. Verify Node Exporter is running:
   ```bash
   curl http://localhost:9100/metrics
   ```
3. Check scrape config in `/etc/prometheus/prometheus.yml`

### High Memory Usage

Prometheus memory grows over time. To reduce:

1. Lower `scrape_interval` in config (default 15s)
2. Reduce `retention.time` (default 15d)
3. Limit number of metrics scraped

### Disk Space Issues

```bash
# Check disk usage
df -h /var/lib/prometheus

# Check Prometheus DB size
du -sh /var/lib/prometheus/

# Archive old data
/usr/local/bin/wise2-metrics-archive

# Clean old archives (older than 30 days)
find /var/lib/prometheus/archive -mtime +30 -delete
```

## Performance Tuning

### Raspberry Pi Optimization

For limited resources, adjust resource limits:

```bash
sudo systemctl edit prometheus

# Add under [Service]:
MemoryLimit=256M
CPUQuota=50%
```

### Scrape Interval Tuning

Trade-off between accuracy and load:

```yaml
global:
  scrape_interval: 30s        # Longer = less CPU/disk
  evaluation_interval: 30s
```

### Sample Limits

Prevent runaway metrics collection:

```yaml
scrape_configs:
  - job_name: 'node'
    sample_limit: 5000         # Max samples per scrape
```

## Monitoring the Monitor

### Prometheus Health

```bash
# Check version
/opt/prometheus/prometheus --version

# Check startup
sudo systemctl status prometheus

# Query self-metrics
curl 'http://localhost:9090/api/v1/query?query=prometheus_tsdb_symbol_table_size_bytes'
```

### Disk Growth

Monitor archive growth:

```bash
# Monitor daily
watch -n 60 'du -sh /var/lib/prometheus/*'

# Alert if over 1GB
du -s /var/lib/prometheus | awk '{if ($1 > 1000000) print "ALERT: Over 1GB"}'
```

## Advanced: Custom Metrics

### Add Custom Exporter

1. Create exporter listening on port 9999:
   ```bash
   # Example: Python exporter
   pip3 install prometheus-client
   ```

2. Add to Prometheus config:
   ```yaml
   scrape_configs:
     - job_name: 'custom'
       static_configs:
         - targets: ['localhost:9999']
   ```

3. Reload:
   ```bash
   sudo systemctl restart prometheus
   ```

### Textfile Collector

Add custom metrics via files:

```bash
# Create metric file
echo 'custom_metric 42' > /var/lib/node_exporter/textfile_collector/custom.prom

# Query in Prometheus
curl 'http://localhost:9090/api/v1/query?query=custom_metric'
```

## Maintenance

### Weekly Tasks

- [ ] Review alert logs: `sudo journalctl -u prometheus`
- [ ] Check disk usage: `df -h /var/lib/prometheus`
- [ ] Verify all targets healthy: `http://<pi-ip>:9090/targets`

### Monthly Tasks

- [ ] Review alert thresholds in `/etc/prometheus/alert_rules.yml`
- [ ] Archive and analyze metrics: `/var/lib/prometheus/archive/`
- [ ] Update Prometheus if new version available

### Annual Tasks

- [ ] Review retention policy
- [ ] Archive all old metrics (30+ days)
- [ ] Plan capacity for next year

## Documentation

- **Prometheus**: https://prometheus.io/docs/
- **Node Exporter**: https://github.com/prometheus/node_exporter
- **cAdvisor**: https://github.com/google/cadvisor
- **Grafana**: https://grafana.com/docs/
- **PromQL**: https://prometheus.io/docs/prometheus/latest/querying/basics/

## Support

For WISE² monitoring issues:

1. Check logs: `sudo journalctl -u prometheus -f`
2. Verify config: `/opt/prometheus/promtool check config /etc/prometheus/prometheus.yml`
3. Test connectivity: `curl http://localhost:9090/api/v1/query`
4. Review this guide

---

**Last Updated**: 2026-07-23  
**Script Version**: 1.0  
**Pi-Friendly**: Optimized for ARM v7/v8 architecture with resource constraints
