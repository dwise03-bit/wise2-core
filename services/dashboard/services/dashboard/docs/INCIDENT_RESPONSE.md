# Incident Response — Wise² Core

Crisis management and response procedures for production incidents.

---

## Incident Classification

### P1 — Critical (Immediate Response Required)
- Service completely down
- All users affected
- Data integrity at risk
- Security breach
- Response time: < 15 minutes

### P2 — Severe (Urgent Response Required)
- Significant degradation (>30% slower)
- Majority of users affected
- Major feature unavailable
- Data loss risk
- Response time: < 1 hour

### P3 — Moderate (Prompt Response Required)
- Minor degradation (<30%)
- Some users affected
- Non-critical feature unavailable
- Workaround available
- Response time: < 4 hours

### P4 — Low (Standard Response)
- Cosmetic issues
- Single user affected
- No workaround needed
- Can wait for next release
- Response time: < 24 hours

---

## On-Call Procedures

### On-Call Schedule
**Primary On-Call**: [Name] ([Contact])
**Secondary On-Call**: [Name] ([Contact])
**Escalation (Manager)**: [Name] ([Contact])
**Executive**: [Name] ([Contact])

### On-Call Responsibilities
1. Monitor alerts 24/7
2. Respond within SLA
3. Investigate root cause
4. Implement fix or workaround
5. Communicate status to team
6. Document incident
7. Participate in post-mortem

### Escalation Path
- **Level 1**: On-call engineer (0-30 min)
- **Level 2**: Tech lead + secondary on-call (30-60 min)
- **Level 3**: Manager + CTO (60+ min, or on request)
- **Level 4**: VP Engineering + Executive (critical only)

---

## Incident Detection

### Automated Alerting
Alert sent automatically when:
- Service down (health check fails)
- Error rate > 5%
- Response time > 1s (p95)
- Database connection lost
- Redis connection lost
- Disk usage > 90%
- Memory usage > 95%
- CPU usage > 95%

### Manual Detection
Users report:
- Service not working
- Unusual behavior
- Slow performance
- Data issues
- Login problems

### Detection Channels
- Prometheus alerts → Slack
- Grafana alerts → Email
- PagerDuty → Phone
- Customer support → Ticket
- Internal Slack → #incidents channel

---

## Initial Response (First 15 Minutes)

### Acknowledge Alert
- [ ] Confirm incident on dashboard
- [ ] Check status page
- [ ] Review recent deployments
- [ ] Notify team in #incidents channel

### Assess Severity
- [ ] Determine P-level (P1-P4)
- [ ] Estimate user impact
- [ ] Identify affected services
- [ ] Time since incident started

### Initiate Communication
- [ ] Alert on-call team
- [ ] Update status page
- [ ] Notify customers (if P1)
- [ ] Brief management (if P1)

### Collect Information
```bash
# Current status
docker-compose ps

# Recent logs
docker-compose logs --tail=100

# Recent errors
docker-compose logs | grep -i error

# Database health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping

# Metrics
curl http://localhost:9090/api/v1/query?query=up

# Disk space
df -h
```

### Initial Hypothesis
- Review recent changes/deployments
- Check error messages
- Correlate with alert time
- Form initial hypothesis

---

## Incident Response Procedures

### Service Down (P1)

**Symptoms**:
- Health check failing
- Service not responding
- Alerts: "Service Down"

**Investigation** (Parallel):
```bash
# 1. Verify service is actually down
curl http://localhost:3000/health

# 2. Check if container is running
docker-compose ps api

# 3. View logs for crash reason
docker-compose logs api | tail -50

# 4. Check system resources
docker stats

# 5. Check database
docker-compose exec postgres pg_isready -U postgres

# 6. Check recent changes
git log --oneline -5
```

**Resolution** (Priority Order):
1. **Restart service** (if crashed)
   ```bash
   docker-compose restart SERVICE_NAME
   sleep 5
   curl http://localhost:3000/health
   ```

2. **Restart all services** (if multiple down)
   ```bash
   docker-compose down
   docker-compose up -d
   sleep 30
   curl http://localhost:3000/health
   ```

3. **Check database** (if database issue)
   ```bash
   docker-compose restart postgres
   docker-compose logs postgres
   ```

4. **Rollback** (if started after deployment)
   ```bash
   git log --oneline -3
   git checkout PREVIOUS_VERSION
   docker-compose build
   docker-compose up -d
   ```

5. **Call for help** (if unable to fix)
   - Escalate to Level 2
   - Consider emergency database restore
   - Activate incident management

**Communication**:
- Every 15 minutes: Status update
- When resolved: Root cause + fix
- Post-incident: Schedule post-mortem

**Post-Incident**:
- [ ] Document incident
- [ ] Identify root cause
- [ ] Plan preventive measures
- [ ] Schedule post-mortem

---

### High Error Rate (P1/P2)

**Symptoms**:
- Error rate suddenly high (>5%)
- Alert: "High Error Rate"
- Support tickets increasing

**Investigation**:
```bash
# 1. Confirm error rate
curl http://localhost:9090/api/v1/query?query=rate(errors_total[5m])

# 2. Identify which endpoint
curl http://localhost:9090/api/v1/query?query=rate(errors_by_endpoint[5m])

# 3. Check error types
docker-compose logs api | grep ERROR | tail -20

# 4. Check recent deployments
git log --oneline -10

# 5. Check database
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"

# 6. Check external dependencies
curl http://external-api.example.com/health
```

**Resolution**:
1. Identify common error pattern
2. If database error: Restart database + check migrations
3. If API error: Check logs for stack trace
4. If external API down: Implement fallback/cache
5. If recent deployment: Consider rollback

---

### Database Issues (P1)

**Symptoms**:
- "Connection refused" errors
- Queries timing out
- Data inconsistency

**Investigation**:
```bash
# 1. Check if database is running
docker-compose ps postgres

# 2. Try to connect
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# 3. Check database health
docker-compose exec postgres pg_stat_activity

# 4. Check disk space
docker exec wise2-postgres df -h /var/lib/postgresql/data

# 5. Check query performance
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 6. Check connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

**Resolution**:
1. **If not running**: `docker-compose restart postgres`
2. **If disk full**: Clean old backups, then restart
3. **If too many connections**: `docker-compose restart postgres`
4. **If corrupted**: Restore from backup
5. **If migration failed**: Fix migration + rerun

**Restore from Backup**:
```bash
# Stop services
docker-compose down

# Restore backup
./infrastructure/scripts/restore.sh /backups/production/wise2_backup_*.tar.gz

# Start services
docker-compose up -d

# Verify
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"
```

---

### High Memory/CPU/Disk (P2)

**Investigation**:
```bash
# Current usage
docker stats

# Identify high-usage service
docker ps -q | xargs docker stats --no-stream

# Check application logs
docker-compose logs SERVICE_NAME | tail -50

# Check system
free -h
df -h
top -b -n 1 | head -20
```

**Resolution**:
- **Memory leak**: Restart service, monitor
- **Slow queries**: Kill long-running queries
- **Disk full**: Delete old backups, clean Docker
- **High CPU**: Scale down traffic or restart service

---

### Security Incident (P1)

**Symptoms**:
- Unauthorized access detected
- Data breach suspected
- Malicious activity identified

**Immediate Actions**:
1. **Isolate** (disconnect from internet if critical)
2. **Preserve** (don't delete logs, collect forensics)
3. **Notify** (security team, legal, executives)
4. **Investigate** (but don't disturb evidence)
5. **Document** (everything for post-mortem)

**Investigation**:
- Collect access logs
- Review recent deployments
- Check for malware/backdoors
- Analyze network traffic logs
- Review user access patterns

**Escalation**:
- Security team (immediate)
- Legal team (immediate)
- PR/Communications (ASAP)
- Customers (if data exposed)

---

## Post-Incident Procedures

### During Incident (Continuous)
- [ ] Monitor dashboards every 5 minutes
- [ ] Update status page every 30 minutes
- [ ] Keep team informed in Slack
- [ ] Document all actions taken
- [ ] Track time and severity

### When Resolved
- [ ] Verify fix is stable (monitor for 30 min)
- [ ] Announce resolution
- [ ] Collect incident details
- [ ] Thank responders

### Within 24 Hours
- [ ] Schedule post-mortem (if P1/P2)
- [ ] Gather participants
- [ ] Collect logs and data
- [ ] Preliminary root cause analysis

### Post-Mortem Review
**Participants**: On-call engineer, tech lead, relevant team members

**Agenda**:
1. Timeline of events (5 min)
2. What happened (10 min)
3. Why it happened (15 min)
4. How we detected it (5 min)
5. How we fixed it (5 min)
6. What we'll do differently (15 min)
7. Action items (5 min)

**Output**:
- Root cause documented
- 3-5 action items to prevent recurrence
- Owner assigned to each action
- Timeline for completion
- Lessons learned shared

### Action Items
Each action item should have:
- [ ] Description (what to fix)
- [ ] Owner (who will do it)
- [ ] Timeline (when to complete)
- [ ] Success criteria (how we know it's done)

---

## Incident Communication

### Outbound Messages

**To Team** (Slack #incidents):
```
🚨 P1 INCIDENT: API Service Down
Time: 2026-07-07 14:30 UTC
Status: Investigating
Impact: All users unable to access API
ETA: 30 minutes
```

**Status Update** (Every 30 min):
```
⏳ UPDATE: Still investigating database connection issue
Current action: Checking database logs
ETA: 20 minutes
```

**Resolution**:
```
✅ RESOLVED: Database restarted, all services healthy
Duration: 45 minutes
Root cause: Connection pool exhaustion
Fix: Increased pool size from 20 to 50
Post-mortem: Scheduled for tomorrow 10am
```

### Customer Communication

**Status Page Update**:
```
🚨 Service Degradation
Some customers may experience slow response times.
We're investigating and will provide an update within 15 minutes.
```

**Customer Email** (if P1, 15 min after discovery):
```
We're currently experiencing a service outage affecting all users.
Our team is working to resolve this. We apologize for the inconvenience.
We'll provide an update within 30 minutes.
```

---

## Incident Severity Matrix

| Severity | Symptoms | Response | Update Freq |
|----------|----------|----------|-------------|
| P1 | Service down, all users affected | <15 min | Every 30 min |
| P2 | Degraded, majority affected | <1 hour | Every 60 min |
| P3 | Minor issue, some users | <4 hours | Every 2 hours |
| P4 | Cosmetic, single user | <24 hours | Daily |

---

## Runbook Quick Reference

### Critical Commands
```bash
# Status check
docker-compose ps

# View logs
docker-compose logs -f --tail=50

# Restart service
docker-compose restart SERVICE_NAME

# Database check
docker-compose exec postgres pg_isready -U postgres

# Rollback to previous version
git checkout PREVIOUS_VERSION
docker-compose build && docker-compose up -d

# Restore from backup
./infrastructure/scripts/restore.sh /backups/production/wise2_backup_*.tar.gz
```

### Emergency Contacts
- On-call: [Contact]
- Manager: [Contact]
- CTO: [Contact]
- VP Engineering: [Contact]

### Status Pages
- Internal: http://status.internal.wise2.net
- Public: https://status.wise2.net
- Monitoring: http://monitoring.wise2.net

---

**Incident Response Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Operations / On-Call Team
