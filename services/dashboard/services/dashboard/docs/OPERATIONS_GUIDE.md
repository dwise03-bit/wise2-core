# Operations Guide — Wise² Core

Day-to-day operations manual for running Wise² Core in production.

---

## Daily Operations

### Morning Checklist (Start of Day)

```bash
# 1. Check system health
docker-compose ps
# Expected: All services "Up"

# 2. Review overnight monitoring
# Check Grafana dashboards for any alerts
http://monitoring.wise2.net

# 3. Check error logs
docker-compose logs --since 24h | grep -i error | head -20

# 4. Verify backups completed
ls -lh /backups/production/ | head -5

# 5. Database health
docker-compose exec postgres pg_stat_activity

# 6. Redis health
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info stats
```

### Service Startup

**Start all services**:
```bash
docker-compose up -d
```

**Start individual service**:
```bash
docker-compose up -d SERVICE_NAME
```

**Expected startup time**: ~30 seconds

### Service Shutdown

**Graceful shutdown** (stop all):
```bash
docker-compose down
```

**Restart service** (if hung):
```bash
docker-compose restart SERVICE_NAME
```

### Status Checks

**All services**:
```bash
docker-compose ps

# Expected output:
# CONTAINER ID   IMAGE              STATUS          PORTS
# xxx            wise-api:latest    Up 2 hours      3000
# xxx            wise-dashboard     Up 2 hours      3001
# ...
```

**Individual service**:
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"api",...}
```

### Log Management

**View logs** (last 50 lines):
```bash
docker-compose logs --tail=50
```

**Follow logs** (live streaming):
```bash
docker-compose logs -f
```

**Service logs only**:
```bash
docker-compose logs api
docker-compose logs dashboard
docker-compose logs postgres
```

**Search logs**:
```bash
docker-compose logs | grep "error"
docker-compose logs | grep "ERROR\|WARN"
```

**Save logs to file**:
```bash
docker-compose logs > logs-$(date +%Y%m%d).txt
```

---

## Performance Monitoring

### CPU Usage

```bash
docker stats

# Check if any service consistently >80%
# If so, investigate or scale resources
```

### Memory Usage

```bash
docker stats

# Warning if >85%
# Critical if >95%
```

### Disk Usage

```bash
df -h

# Ensure >10% free space
# If <5%, start cleanup
```

### Database Performance

```bash
# Query performance
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Table sizes
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

### Redis Performance

```bash
# Memory usage
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info memory

# Key count
docker-compose exec redis redis-cli -a $REDIS_PASSWORD dbsize

# Commands/sec
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info stats
```

---

## Maintenance Tasks

### Daily Maintenance

- [ ] Review monitoring dashboards (5 min)
- [ ] Check error logs (5 min)
- [ ] Verify backups completed (5 min)
- [ ] Spot check health endpoints (5 min)

**Total**: ~20 minutes/day

### Weekly Maintenance

- [ ] Review performance trends (Grafana)
- [ ] Analyze slow queries
- [ ] Check disk space trends
- [ ] Review error patterns
- [ ] Verify backup rotation

**Frequency**: Every Monday morning

### Monthly Maintenance

- [ ] Capacity planning review
- [ ] Security updates check
- [ ] Performance tuning review
- [ ] Backup verification (restore test)
- [ ] Certificate expiration check

**Frequency**: First Monday of month

### Quarterly Maintenance

- [ ] Disaster recovery drill
- [ ] Security audit
- [ ] Performance baseline review
- [ ] Infrastructure upgrade planning
- [ ] Documentation review and update

**Frequency**: Quarterly

---

## Backup Management

### Automatic Backups

Backups run automatically every day at 2 AM UTC.

```bash
# Verify backup script is running
crontab -l | grep backup

# Expected output:
# 0 2 * * * /home/wise2-core/infrastructure/scripts/backup.sh
```

### Manual Backup

```bash
./infrastructure/scripts/backup.sh /backups/production/manual

# Verify
ls -lh /backups/production/manual/
```

### Backup Locations

```bash
# Production backups
/backups/production/

# Backup structure
/backups/production/
├── wise2_backup_2026-07-07.tar.gz
├── wise2_backup_2026-07-06.tar.gz
└── wise2_backup_2026-07-05.tar.gz

# Keep: Latest 30 days
# Delete: Older than 30 days
```

### Restore from Backup

```bash
# List available backups
ls -lh /backups/production/

# Restore specific backup
./infrastructure/scripts/restore.sh /backups/production/wise2_backup_2026-07-07.tar.gz

# Verify restoration
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"
```

---

## Common Tasks

### Update Environment Variables

```bash
# Edit .env
nano .env

# Reload services
docker-compose restart

# Verify
docker-compose logs | grep -i "error\|warn" | head -10
```

### Clear Cache

```bash
# Clear Redis cache (careful!)
docker-compose exec redis redis-cli -a $REDIS_PASSWORD flushall

# Restart services to rebuild cache
docker-compose restart api
```

### Rotate Logs

```bash
# Archive old logs
docker-compose logs > logs-archive-$(date +%Y%m%d).txt

# Prune old Docker logs (>7 days)
find /var/lib/docker/containers -type f -name "*.log" -mtime +7 -delete
```

### Scale Services (if needed)

```bash
# Current: Single instance per service
# To scale, modify docker-compose.yml:

# Example: Scale API to 2 instances
docker-compose up -d --scale api=2

# Note: Requires load balancer setup (not in scope)
```

---

## Troubleshooting Common Issues

### Service Stuck/Not Responding

```bash
# Check status
docker-compose ps SERVICE_NAME

# View logs
docker-compose logs SERVICE_NAME | tail -50

# Restart
docker-compose restart SERVICE_NAME

# Wait and verify
sleep 5
curl http://localhost:3000/health
```

### High Memory Usage

```bash
# Identify service
docker stats | grep wise2

# Restart service
docker-compose restart SERVICE_NAME

# Monitor
docker stats --no-stream wise2-SERVICE_NAME

# If persists, check for memory leak in logs
```

### Database Slow Queries

```bash
# Identify slow queries
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"

# Kill specific slow query (if needed)
# First, identify query ID from above

# Reset stats
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT pg_stat_statements_reset();"

# Re-run slow query to see improved time
```

### Redis Connection Issues

```bash
# Test connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# If fails, restart
docker-compose restart redis

# Check memory
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info memory

# If too full, evict old keys
# (Automatic LRU eviction, but can force cleanup)
```

### Disk Full

```bash
# Check space
df -h

# Find large items
du -sh /home/wise2-core/*

# Clean old backups
rm -rf /backups/production/wise2_backup_old/

# Vacuum database
docker-compose exec postgres psql -U postgres -d wise2_core -c "VACUUM ANALYZE;"

# Clean Docker
docker system prune -f
```

---

## Contact Information

### Support Escalation

- **Operations Team**: ops@wise2.net
- **On-Call Engineer**: [Contact from on-call schedule]
- **Tech Lead**: tech-lead@wise2.net
- **CTO**: cto@wise2.net
- **VP Engineering**: vp-eng@wise2.net

### Important Resources

- **Status Page**: https://status.wise2.net
- **Monitoring**: http://monitoring.wise2.net
- **GitHub**: https://github.com/dwise03-bit/wise2-core
- **Documentation**: /docs/ directory

---

**Operations Guide Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Operations Team
