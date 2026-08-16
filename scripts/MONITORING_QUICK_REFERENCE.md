# WISE² Monitoring Quick Reference

## Installation

```bash
# Basic
sudo bash scripts/monitoring-setup.sh

# With Grafana
sudo bash scripts/monitoring-setup.sh --with-grafana

# With Alerts
sudo bash scripts/monitoring-setup.sh \
  --slack-webhook "https://hooks.slack.com/..." \
  --email you@example.com
```

## Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Prometheus | `http://<pi-ip>:9090` | Metrics UI & queries |
| Node Exporter | `http://<pi-ip>:9100/metrics` | System metrics (JSON) |
| cAdvisor | `http://<pi-ip>:8080` | Container stats |
| Grafana | `http://<pi-ip>:3000` | Dashboards (optional) |

## Service Commands

```bash
# Status
sudo systemctl status prometheus
sudo systemctl status node-exporter

# Start/Stop
sudo systemctl start prometheus
sudo systemctl stop prometheus
sudo systemctl restart prometheus

# Logs
sudo journalctl -u prometheus -f          # Live logs
sudo journalctl -u prometheus -n 100      # Last 100 lines
sudo journalctl -u prometheus --since "1 hour ago"

# Enable on boot
sudo systemctl enable prometheus node-exporter
```

## Common Queries (PromQL)

Copy/paste into Prometheus UI graph tab:

```promql
# CPU Usage %
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage %
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk Free GB
node_filesystem_avail_bytes{fstype!~"tmpfs|fuse"} / 1e9

# Memory Available GB
node_memory_MemAvailable_bytes / 1e9

# Disk Used %
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# Network RX Bytes/sec
rate(node_network_receive_bytes_total[1m])

# Network TX Bytes/sec
rate(node_network_transmit_bytes_total[1m])

# System Load Average
node_load1

# Container Memory MB
container_memory_usage_bytes / 1e6

# Uptime Days
node_time_seconds / 86400
```

## Configuration Files

| File | Purpose | Edit |
|------|---------|------|
| `/etc/prometheus/prometheus.yml` | Scrape targets | `sudo nano ...` |
| `/etc/prometheus/alert_rules.yml` | Alert thresholds | `sudo nano ...` |
| `/etc/prometheus/alert_config.json` | Alert destinations | `sudo nano ...` |
| `/opt/prometheus/prometheus` | Binary | Don't modify |
| `/var/lib/prometheus/` | Data directory | Backup only |

## Common Tasks

### Reload Configuration (no downtime)

```bash
curl -X POST http://localhost:9090/-/reload
# or
sudo systemctl reload prometheus
```

### Verify Configuration

```bash
/opt/prometheus/promtool check config /etc/prometheus/prometheus.yml
/opt/prometheus/promtool check rules /etc/prometheus/alert_rules.yml
```

### Export Metrics

```bash
# Query range (last 1 hour)
curl 'http://localhost:9090/api/v1/query_range?query=up&start=1234567890&end=1234571490&step=60'

# Get current value
curl 'http://localhost:9090/api/v1/query?query=node_memory_MemAvailable_bytes'
```

### Manual Alert

```bash
/usr/local/bin/wise2-alert-handler "AlertName" "warning" "Test message"
# Severity: resolved, warning, critical
```

### Archive Metrics

```bash
# Run manually
/usr/local/bin/wise2-metrics-archive

# Check archives
ls -lh /var/lib/prometheus/archive/

# Extract
zcat /var/lib/prometheus/archive/metrics_*.csv.gz | head -20
```

### Check Disk Usage

```bash
df -h /var/lib/prometheus
du -sh /var/lib/prometheus/*

# If over 1GB, archive and clean:
/usr/local/bin/wise2-metrics-archive
find /var/lib/prometheus/archive -mtime +30 -delete
```

## Troubleshooting

### Service Won't Start

```bash
# Check errors
sudo journalctl -u prometheus -n 50

# Validate config
/opt/prometheus/promtool check config /etc/prometheus/prometheus.yml

# Check permissions
sudo ls -l /var/lib/prometheus/
sudo chown -R prometheus:prometheus /var/lib/prometheus/
```

### No Data in Prometheus

1. Check targets: `http://<pi-ip>:9090/targets`
2. Verify exporters: `curl http://localhost:9100/metrics`
3. Check config: `sudo cat /etc/prometheus/prometheus.yml`

### High Memory/CPU

```bash
# Reduce scrape interval (in prometheus.yml)
global:
  scrape_interval: 30s    # Default 15s

# Restart
sudo systemctl restart prometheus

# Reduce retention (in systemd service)
sudo systemctl edit prometheus
# Add: --storage.tsdb.retention.time=7d (instead of 15d)
```

### Grafana Won't Connect to Prometheus

1. Default datasource: `http://localhost:9090`
2. If using remote Prometheus: Update datasource to IP
3. Check firewall: `curl http://<prometheus-ip>:9090`

## Alert Thresholds (Current)

| Alert | Threshold | Duration |
|-------|-----------|----------|
| CPU High | > 80% | 5 min |
| Memory High | > 85% | 5 min |
| Disk High | > 90% | 5 min |
| Temp High | > 80°C | 5 min |
| FS Read-only | Any | 1 min |
| Container Restart | Rising rate | 1 min |

Adjust in: `/etc/prometheus/alert_rules.yml`

## Performance Notes

### Raspberry Pi Resource Usage

- **CPU**: ~2-5% idle, 10-20% active scraping
- **Memory**: ~100MB baseline, +50MB per 100k time series
- **Disk**: ~200MB per week at 15s interval

### Optimize for Limited Resources

```bash
# Edit systemd service
sudo systemctl edit prometheus

[Service]
MemoryLimit=256M
CPUQuota=50%    # 50% of one core

# Reduce scrape interval
global:
  scrape_interval: 30s
  
# Reduce retention
--storage.tsdb.retention.time=7d
```

## Monitoring the Monitor

```bash
# Prometheus self-health
curl http://localhost:9090/-/healthy

# Check DB size
du -sh /var/lib/prometheus/

# Check memory
ps aux | grep prometheus

# Check uptime
curl 'http://localhost:9090/api/v1/query?query=prometheus_build_info'
```

## Useful Links

- **Prometheus Docs**: https://prometheus.io/docs/
- **Node Exporter Metrics**: https://github.com/prometheus/node_exporter/blob/master/README.md
- **PromQL Guide**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/?search=prometheus

## Quick Health Check

Run this to verify everything is working:

```bash
#!/bin/bash
echo "=== WISE² Monitoring Health Check ==="
echo ""
echo "Prometheus Status:"
curl -s http://localhost:9090/-/healthy >/dev/null && echo "✓ Running" || echo "✗ Not running"

echo ""
echo "Node Exporter Status:"
curl -s http://localhost:9100/metrics >/dev/null && echo "✓ Running" || echo "✗ Not running"

echo ""
echo "Targets Health:"
curl -s http://localhost:9090/api/v1/query?query=up | jq '.data.result[] | {job: .labels.job, up: .value[1]}'

echo ""
echo "Disk Usage:"
df -h /var/lib/prometheus | tail -1 | awk '{print "  " $5 " used (" $4 " free)"}'

echo ""
echo "Check complete."
```

Save as `health-check.sh` and run: `bash health-check.sh`

---

**Print this page for quick reference on your Raspberry Pi!**
