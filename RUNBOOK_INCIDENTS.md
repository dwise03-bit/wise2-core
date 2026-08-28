# WISE² Command Center - Incident Response Runbook

**Last Updated**: 2026-08-20  
**Owner**: DevOps Team  
**Escalation**: @team-lead, @cto

---

## Quick Reference

| Alert | Severity | Response Time | Owner |
|-------|----------|---|-------|
| HighErrorRate | CRITICAL | 5 min | DevOps |
| DatabasePoolExhausted | CRITICAL | 5 min | DBA |
| HighLatency | WARNING | 15 min | DevOps |
| WorkflowExecutionFailure | WARNING | 30 min | Engineering |
| ApprovalServiceDown | CRITICAL | 5 min | DevOps |

---

## Critical Alerts

### 🔴 HighErrorRate (>5% errors for 5 minutes)

**Threshold**: `rate(http_requests_total{status=~"5.."}[5m]) > 0.05`

#### Investigation Steps

1. **Check recent deployments**
   ```bash
   git log --oneline -5
   # Review what changed in last 30 minutes
   ```

2. **Review error logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f api | grep -E "ERROR|Exception"
   # Look for stack traces or error patterns
   ```

3. **Check database status**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres pg_isready
   # Check connection pool
   SELECT count(*) FROM pg_stat_activity;
   ```

4. **Check external services**
   - Stripe: https://status.stripe.com
   - Twilio: https://status.twilio.com
   - SendGrid: https://status.sendgrid.com

5. **Check system resources**
   ```bash
   docker stats
   # CPU, memory, network usage
   ```

#### Resolution Paths

**Path A: Recent Bad Deployment**
```bash
# View the problematic commit
git show HEAD

# Rollback to last known-good commit
git revert HEAD
git push origin main

# Monitor deployment via GitHub Actions
# Wait ~5 minutes for redeployment to complete
curl https://api.wise2.io/health
```

**Path B: Database Connection Pool Exhausted**
```bash
# Check for idle connections
SELECT pid, usename, state, query_start 
FROM pg_stat_activity 
WHERE state != 'active' AND query_start < now() - interval '30 minutes';

# Kill idle connections older than 30 minutes
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE query_start < now() - interval '30 minutes';

# Monitor API restart
docker compose -f docker-compose.prod.yml restart api
sleep 30
curl https://api.wise2.io/health
```

**Path C: External Service Outage**
```bash
# Switch to demo providers temporarily
export USE_DEMO_PROVIDERS=true
docker compose -f docker-compose.prod.yml restart api

# Monitor status pages
# Wait for external service recovery
# Restart API to resume normal operation
unset USE_DEMO_PROVIDERS
docker compose -f docker-compose.prod.yml restart api
```

#### Escalation

If not resolved in 10 minutes:
- Notify #devops-critical on Slack
- Page on-call engineer if after hours
- Consider full rollback to previous release tag

---

### 🔴 DatabasePoolExhausted (>90% usage for 5 minutes)

**Threshold**: `database_pool_connections_used / database_pool_connections_max > 0.9`

#### Investigation Steps

1. **Check active connections**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
     "SELECT count(*) as total_connections FROM pg_stat_activity;"
   ```

2. **Find connection leaks**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
     "SELECT usename, application_name, state, count(*) 
      FROM pg_stat_activity 
      GROUP BY usename, application_name, state 
      ORDER BY count(*) DESC;"
   ```

3. **Identify long-running queries**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
     "SELECT pid, usename, query_start, query 
      FROM pg_stat_activity 
      WHERE query_start < now() - interval '5 minutes' 
      ORDER BY query_start;"
   ```

4. **Check API logs for database errors**
   ```bash
   docker compose -f docker-compose.prod.yml logs api | grep -E "connection|pool|timeout"
   ```

#### Resolution Steps

1. **Kill idle connections**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
     "SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE state = 'idle' 
      AND query_start < now() - interval '10 minutes';"
   ```

2. **Kill specific long-running query**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c \
     "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <pid>;"
   ```

3. **Scale API instances**
   ```bash
   # Increase load distribution
   docker compose -f docker-compose.prod.yml up -d --scale api=5

   # Monitor pool recovery
   watch 'docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "SELECT count(*) FROM pg_stat_activity;"'
   ```

4. **Increase pool size if persistent**
   ```bash
   # Edit connection pool config
   # DATABASE_MAX_POOL_SIZE=20  (increase from default 10)
   # Restart API
   docker compose -f docker-compose.prod.yml restart api
   ```

#### Escalation

If not resolved in 5 minutes:
- Notify DBA on-call
- Consider failover to read replica
- Be prepared for emergency restart

---

### 🔴 ApprovalServiceDown (Health check failing)

**Threshold**: HTTP GET `/health` returns non-200 for 2 consecutive checks

#### Investigation Steps

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps api

# Test health endpoint
curl -v http://localhost:3000/health

# Check recent logs
docker compose -f docker-compose.prod.yml logs --tail 50 api

# Check dependencies
docker compose -f docker-compose.prod.yml ps postgres redis
```

#### Resolution

```bash
# Restart API
docker compose -f docker-compose.prod.yml restart api

# Wait for health checks
sleep 10

# Verify
curl http://localhost:3000/health

# If still down, check database
docker compose -f docker-compose.prod.yml ps postgres

# If database is down, restart it
docker compose -f docker-compose.prod.yml restart postgres
sleep 30

# Restart API again
docker compose -f docker-compose.prod.yml restart api
```

---

## Warning Alerts

### 🟡 HighLatency (p95 > 1 second for 10 minutes)

**Threshold**: `histogram_quantile(0.95, http_request_duration_ms) > 1000`

#### Investigation

```bash
# Check slow query logs
tail -f logs/slow-queries.log

# Check resource usage
docker stats

# Check for concurrent deployments
ps aux | grep docker
```

#### Resolution

- Identify slow endpoints and optimize queries
- Consider caching strategies
- Scale horizontally if CPU/memory constrained

### 🟡 WorkflowExecutionFailure (Failures > 0 in 5 minutes for 10 minutes)

**Threshold**: `rate(workflow_execution_failures[5m]) > 0`

#### Investigation

```bash
# Check recent workflow executions
SELECT * FROM workflow_executions 
WHERE status = 'FAILED' 
ORDER BY created_at DESC 
LIMIT 10;

# Check error details
SELECT workflow_id, error_message, created_at 
FROM workflow_errors 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Resolution

- Identify failing workflow patterns
- Check external provider status (SMS, Email, Stripe)
- Update workflow definitions if needed
- Retry failed executions if appropriate

---

## Escalation Procedures

### Escalation Path

1. **Alert triggered** → On-call engineer investigates (5-10 min)
2. **Unable to resolve** → Notify team lead + engineering lead (10 min)
3. **Critical business impact** → Page CTO (immediately)
4. **Extended outage** → Communications team notifies status page (30 min)

### Communication

- **Slack**: #devops-critical (automated + manual updates)
- **Status Page**: https://status.wise2.io (public updates every 15 min)
- **Customers**: Email notification if >30 min downtime

---

## Post-Incident Review

For any CRITICAL alert that escalated:

1. Create GitHub issue with tag `incident-postmortem`
2. Root cause analysis within 24 hours
3. Preventive measures within 1 week
4. Team debrief within 48 hours

**Template**:
```markdown
# Incident Post-Mortem: [Alert Name]

## Timeline
- HH:MM - Alert triggered
- HH:MM - Acknowledged
- HH:MM - Root cause identified
- HH:MM - Resolution deployed

## Root Cause
[What actually went wrong]

## Impact
- Duration: X minutes
- Users affected: X%
- Revenue impact: $X

## Prevention
[How to prevent this in the future]

## Action Items
- [ ] Implement monitoring enhancement
- [ ] Update runbook
- [ ] Deploy fix
```

---

## Useful Commands

### Docker Management
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f api --tail 100

# Check service status
docker compose -f docker-compose.prod.yml ps

# Restart service
docker compose -f docker-compose.prod.yml restart api

# Full status check
docker compose -f docker-compose.prod.yml exec api curl http://localhost:3000/health
```

### Database Queries
```bash
# Connect to database
docker compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod

# Check replication status
SELECT slot_name, restart_lsn FROM pg_replication_slots;

# View active queries
SELECT pid, usename, application_name, state, query FROM pg_stat_activity;

# Check index usage
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

### Metrics Queries
```bash
# Check error rate (Prometheus)
rate(http_requests_total{status=~"5.."}[5m])

# Check request latency
histogram_quantile(0.95, http_request_duration_ms)

# Check database connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Contact Information

| Role | Name | Slack | On-Call |
|------|------|-------|---------|
| DevOps Lead | [Name] | @devops-lead | M-F 9-5 UTC |
| DBA | [Name] | @dba-oncall | 24/7 |
| CTO | [Name] | @cto | Escalation only |

---

**Last Review**: 2026-08-20  
**Next Review**: 2026-09-20
