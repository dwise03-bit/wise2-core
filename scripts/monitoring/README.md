# WISE² Metrics System - Phase A

System metrics collection and monitoring infrastructure for the WISE² platform.

## Overview

The metrics system collects real-time data from four sources:

- **Git**: Repository state, commits, branches
- **Docker**: Container status, CPU/memory usage
- **Nginx**: HTTP request metrics, error rates
- **Database**: Connection pool, query performance, cache hit ratio

## Components

### Individual Monitors

- `git.js` - Git repository monitoring
- `docker.js` - Docker daemon monitoring
- `nginx.js` - Nginx web server monitoring
- `database.js` - PostgreSQL database monitoring

### Collectors & Daemons

- `collect-metrics.js` - Synchronous metrics collection orchestrator
- `metrics-daemon.js` - Long-running daemon (recommended for production)

### Configuration

- `ecosystem.config.js` - PM2 process manager configuration
- `../systemd/wise2-metrics.service` - Systemd service file

## Quick Start

### Option 1: Run Once (Testing)

```bash
cd /Users/danielwise/Projects/wise2-core
node scripts/monitoring/collect-metrics.js
```

### Option 2: Run with PM2 (Production)

```bash
# Install PM2 if needed
npm install -g pm2

# Start the daemon
pm2 start scripts/monitoring/ecosystem.config.js

# Monitor logs
pm2 logs wise2-metrics-daemon

# Stop the daemon
pm2 stop wise2-metrics-daemon
```

### Option 3: Run with Systemd (Linux)

```bash
# Copy service file
sudo cp infrastructure/systemd/wise2-metrics.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable wise2-metrics.service
sudo systemctl start wise2-metrics.service

# Monitor status
sudo systemctl status wise2-metrics.service
sudo journalctl -u wise2-metrics.service -f
```

## Environment Variables

```bash
# .env or .env.local
METRICS_API_URL=http://localhost:3001/api/v1/metrics/system
METRICS_API_KEY=optional-api-key
METRICS_INTERVAL=60  # Seconds between collections (default: 60)
```

## API Endpoints

All metrics are sent to and retrieved from these endpoints:

### Receive Metrics

**POST** `/api/v1/metrics/system`

```json
{
  "timestamp": "2026-07-20T15:30:00Z",
  "git": { ... },
  "docker": { ... },
  "nginx": { ... },
  "database": { ... }
}
```

### Retrieve System Metrics

**GET** `/api/v1/metrics/system?type=git&limit=10`

Returns the latest system metrics of specified type.

### Track User Events

**POST** `/api/v1/metrics/users/events`

```json
{
  "userId": "user-uuid",
  "eventType": "sound_lab:start",
  "eventCategory": "sound_lab",
  "action": "start",
  "status": "completed",
  "durationSeconds": 120,
  "metadata": { ... }
}
```

### Get User Metrics

**GET** `/api/v1/metrics/users?days=7`

### Get Production Metrics

**GET** `/api/v1/metrics/production?type=sound_lab&days=7`

### Get Dashboard Summary

**GET** `/api/v1/metrics/dashboard`

## Database Schema

The metrics system creates these tables:

- `system_metrics` - Stores git, docker, nginx, database metrics
- `user_events` - Tracks user activity and productions
- `production_metrics` - Aggregated production statistics
- `daily_active_users` - DAU aggregation
- `revenue_metrics` - Revenue tracking (Phase C)
- `error_metrics` - Error/exception tracking (Phase C)
- `performance_metrics` - Core Web Vitals (Phase C)

### Sample Queries

```sql
-- Latest git metrics
SELECT * FROM system_metrics
WHERE metric_type = 'git'
ORDER BY collected_at DESC
LIMIT 1;

-- Daily active users
SELECT date(created_at) as day, COUNT(DISTINCT user_id) as active_users
FROM user_events
GROUP BY date(created_at)
ORDER BY day DESC;

-- Production stats for the week
SELECT event_category, COUNT(*) as count, AVG(duration_seconds) as avg_duration
FROM user_events
WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY event_category;
```

## Monitoring the Daemon

### PM2 Commands

```bash
pm2 list                              # Show all processes
pm2 logs wise2-metrics-daemon        # View logs
pm2 monit                            # Real-time monitoring
pm2 info wise2-metrics-daemon        # Process details
pm2 restart wise2-metrics-daemon     # Restart process
pm2 delete wise2-metrics-daemon      # Remove from PM2
```

### Systemd Commands

```bash
sudo systemctl status wise2-metrics.service
sudo systemctl restart wise2-metrics.service
sudo systemctl stop wise2-metrics.service
sudo journalctl -u wise2-metrics.service -f --lines=50
```

## Troubleshooting

### Metrics not appearing in database

1. Check API is running: `curl http://localhost:3001/health`
2. Check database migrations applied: `psql -d wise2 -c "\dt system_metrics"`
3. Check daemon is running: `pm2 status` or `systemctl status wise2-metrics`
4. Check logs: `pm2 logs wise2-metrics-daemon` or `journalctl -u wise2-metrics`

### High memory/CPU usage

- Adjust `METRICS_INTERVAL` to collect less frequently
- Check for slow database queries: `SELECT * FROM slow_queries LIMIT 10`
- Monitor individual scripts: `node scripts/monitoring/database.js` (run once)

### Docker metrics not available

- Ensure Docker daemon is running
- Check permissions: user must be in `docker` group
- Test: `docker ps` should work without sudo

### Nginx metrics not available

- Check if nginx is running: `nginx -t`
- Verify log location in nginx.js logPaths array
- Enable `pg_stat_statements` in PostgreSQL config

## Performance Impact

Each metrics collection cycle:

- **Git**: ~50ms (executes 5 git commands)
- **Docker**: ~100-200ms (depends on container count)
- **Nginx**: ~10-50ms (reads log files)
- **Database**: ~200-500ms (depends on database size)

**Total**: ~400-800ms per 60-second cycle (0.67-1.33% CPU)

## Security Considerations

- Metrics are sent over HTTP by default (upgrade to HTTPS in production)
- Optional API key via `X-API-Key` header
- All database queries use parameterized statements
- Sensitive data in raw_data is stored but never logged to stdout

## Next Steps (Phase B & C)

- **Phase B**: User event tracking in Creative Studio components
- **Phase C**: Third-party integrations (Stripe, Sentry, Cloudflare)
- **Phase D**: Dashboard UI components with real data

## Support

For issues or questions:
- Check logs: `pm2 logs wise2-metrics-daemon`
- Review database: `psql -d wise2 -c "SELECT COUNT(*) FROM system_metrics"`
- Test manually: `node scripts/monitoring/collect-metrics.js`
