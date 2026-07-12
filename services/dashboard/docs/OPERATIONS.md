# OPERATIONS GUIDE

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## ON-CALL PROCEDURES

### Incident Severity

**P1 (Critical)**: Service down, data loss risk
- Immediate page
- All hands on deck
- Update status page every 5 min

**P2 (High)**: Major feature broken, degraded performance
- Page team
- Status page update every 15 min

**P3 (Medium)**: Minor issues, workaround available
- Log ticket
- Address within 4 hours

**P4 (Low)**: Edge cases, improvements
- Log ticket
- No immediate action needed

---

## INCIDENT RESPONSE

### Detection
- Alerts triggered in Prometheus
- Error rate > 1% automatic page
- User reports via support

### Triage (5 minutes)
1. Acknowledge alert
2. Assess severity
3. Identify affected component
4. Communicate status

### Investigation
1. Check logs
2. Review metrics
3. Check recent deployments
4. Identify root cause

### Remediation
1. Apply fix or rollback
2. Monitor for stability
3. Verify user impact resolved

### Post-Incident (within 24h)
- Write incident report
- Document root cause
- List action items
- Schedule follow-up

---

## DAILY OPERATIONS

### Morning Checks (9 AM)
- [ ] All services healthy
- [ ] Error rate normal
- [ ] No pending alerts
- [ ] Database backups completed

### Regular Maintenance
- Database VACUUM & ANALYZE (weekly)
- Log rotation (daily)
- Certificate renewal (auto)
- Dependency updates (weekly)

### Week-End Checklist
- [ ] Backup verification
- [ ] Log analysis
- [ ] Performance review
- [ ] Security scanning

---

## MONITORING DASHBOARDS

### Real-Time Monitoring
- Prometheus: Metrics collection
- Grafana: Visualization
- Alertmanager: Alert routing
- Loki: Log aggregation

### Key Dashboards
- Service Health (uptime, availability)
- Performance (response time, throughput)
- Resources (CPU, memory, disk)
- Business Metrics (users, revenue, churn)

---

## SCALING PROCEDURES

### Scale Up (High Load)
```bash
# 1. Monitor metrics
# 2. Evaluate current capacity
# 3. Auto-scaling trigger > 70% CPU
# 4. Verify scaling completed
# 5. Monitor error rate
```

### Scale Down (Low Load)
```bash
# 1. Confirm sustained low usage
# 2. Reduce replicas
# 3. Monitor for issues
# 4. Update documentation
```

---

## BACKUP & RECOVERY

### Backup Schedule
- Database: Daily at 2 AM UTC
- S3 objects: Daily at 3 AM UTC
- Logs: Weekly archival
- Retention: 30 days

### Recovery Procedures
```bash
# Database restore
pg_restore -d wise2 /backups/wise2_2026-07-11.sql

# S3 restore
aws s3 sync s3://backup-bucket/2026-07-11 s3://live-bucket
```

### RTO/RPO Targets
- RTO: < 1 hour
- RPO: < 1 hour

### Testing Recovery
- Monthly backup restoration test
- Document any issues
- Update procedures

---

## PERFORMANCE OPTIMIZATION

### Monitoring Performance
- Query performance monitoring
- Cache hit rates
- API response times

### Optimization
- Query indexing
- Cache strategies
- Database replication
- CDN optimization

### Regular Reviews
- Weekly: Response times
- Monthly: Query performance
- Quarterly: Architecture review

---

## SECURITY OPERATIONS

### Regular Security Tasks
- Dependency updates (weekly)
- Vulnerability scans (continuous)
- Access reviews (monthly)
- Penetration testing (quarterly)

### Incident Response
- Suspicious activity detected
- Security alert triggered
- Isolate affected systems
- Investigate & remediate

---

## COMMUNICATION PLAN

### Status Page
- Public facing
- Auto-updated from alerts
- Incident timeline documented

### Stakeholder Updates
- During P1: Every 5 minutes
- During P2: Every 15 minutes
- During P3: Hourly
- After: Post-mortem shared

### Internal Communication
- #incidents Slack channel
- Real-time updates
- Automated alerts

---

## RUNBOOKS

Location: `docs/RUNBOOKS/`

### Available Runbooks
- Database Recovery
- Service Restart
- Cache Invalidation
- Deployment Rollback
- Emergency Scale-Up
- SSL Certificate Renewal

---

**Owner**: Wise Defense LLC  
**Last Updated**: 2026-07-11
