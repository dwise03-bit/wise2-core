# Phase F Plan — Go-Live Cutover

**Status**: READY TO EXECUTE
**Date Started**: 2026-07-07
**Target Date**: 2026-07-21 (2 weeks from start of Phase E)
**Phase**: Final - Production Cutover

---

## Phase F Overview

Phase F is the production cutover — moving Wise² Core from development to live production.

**Objectives**:
1. Execute production deployment
2. Migrate users to new system
3. Monitor and stabilize
4. Document lessons learned
5. Achieve production operations

**Duration**: 1 week (3-5 days active work)

---

## Pre-Cutover Checklist (T-7 days)

### Documentation Review

- [ ] Read DEPLOYMENT_PROCEDURES.md completely
- [ ] Read PRODUCTION_READINESS_CHECKLIST.md completely
- [ ] Read INCIDENT_RESPONSE.md completely
- [ ] Understand SERVICE_DEPENDENCIES.md
- [ ] Know OPERATIONS_GUIDE.md procedures

### Infrastructure Validation

- [ ] Production infrastructure provisioned
- [ ] Disk space verified (>10GB available)
- [ ] Network configured
- [ ] SSL/TLS certificates ready
- [ ] DNS records configured (but not active)
- [ ] Monitoring dashboards configured
- [ ] Backup system tested
- [ ] Communication channels set up

### Team Preparation

- [ ] On-call schedule finalized
- [ ] Escalation contacts confirmed
- [ ] Team meeting: Cutover procedures
- [ ] Team meeting: Incident response
- [ ] Team meeting: Post-cutover operations
- [ ] Roles and responsibilities assigned

### Final Testing

- [ ] Staging environment tested (24+ hours)
- [ ] All features working
- [ ] Performance acceptable
- [ ] Rollback procedures tested (procedure only)
- [ ] Communication templates prepared

---

## Cutover Timeline (T-0 Day)

### T-24 Hours (Day Before)

**Activities**:
- [ ] Final staging validation (no new changes)
- [ ] Take production pre-cutover backup
- [ ] Verify backup completeness
- [ ] Final team briefing (1-hour meeting)
- [ ] Review runbooks
- [ ] Confirm on-call team availability
- [ ] Prepare communication templates

**Checks**:
```bash
# Staging system health
docker-compose ps
curl https://staging.wise2.net/api/health

# Backup verification
ls -lh /backups/production/pre-cutover/
tar -tzf /backups/production/pre-cutover/wise2_backup_*.tar.gz | head -10

# Monitoring dashboards ready
# Check Grafana access
```

### T-2 Hours (Pre-Cutover)

**Activities**:
- [ ] Team assembled and briefed
- [ ] All monitoring dashboards active
- [ ] Communication channels open
- [ ] Status page prepared
- [ ] Customer communication drafted

**Commands**:
```bash
# Final pre-cutover verification
docker-compose ps                          # Staging OK
curl https://staging.wise2.net/api/health  # API responding
docker-compose exec postgres pg_isready -U postgres  # DB ready
docker-compose exec redis redis-cli ping   # Redis ready

# Backup verification
./infrastructure/scripts/backup.sh /backups/production/pre-cutover
ls -lh /backups/production/pre-cutover/
```

### T-30 Minutes (Final Preparation)

**Activities**:
- [ ] Turn on maintenance mode (staging)
- [ ] Stop accepting new connections
- [ ] Announce maintenance window to users
- [ ] Final data validation

**Commands**:
```bash
# Query database for final stats
docker-compose exec postgres psql -U postgres -d wise2_core << EOF
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'deployments', COUNT(*) FROM deployments
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
EOF

# This provides baseline for post-cutover verification
```

### T-0 (Cutover Execution)

**Activities**:
- [ ] Start cutover procedures
- [ ] Follow DEPLOYMENT_PROCEDURES.md exactly
- [ ] Tag production release
- [ ] Deploy to production

**Key Steps**:
```bash
# 1. Tag release (assuming on main branch)
git tag -a v1.0.0 -m "Release v1.0.0 - Production Cutover"
git push origin v1.0.0

# 2. GitHub Actions automatically:
#    - Runs tests
#    - Builds Docker images
#    - Runs security scan
#    - Pushes to registry

# 3. Manually trigger production webhook (or automatic)
# Production deployment proceeds

# 4. Monitor progress
# Check GitHub Actions logs
# Monitor production dashboard
```

### T+5 Minutes (Immediate Verification)

**Activities**:
- [ ] All services started
- [ ] Health checks passing
- [ ] No critical alerts
- [ ] Monitor error rates

**Commands**:
```bash
# Verify deployment
docker-compose ps
# Expected: 9+ services Up

# Health checks
curl https://wise2.net/api/health      # Should respond
curl https://wise2.net/                # Should load
curl https://wise2.net/admin           # Should load

# Database check
docker-compose exec postgres psql -U postgres -d wise2_core << EOF
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'deployments', COUNT(*) FROM deployments
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
EOF

# Should match T-30 stats
```

### T+30 Minutes (Extended Verification)

**Activities**:
- [ ] Monitor error rates (should be <1%)
- [ ] Monitor response times (should be <500ms)
- [ ] Check monitoring dashboards
- [ ] Review logs for warnings
- [ ] First users accessing system

**Commands**:
```bash
# Error rate
curl http://localhost:9090/api/v1/query?query=rate(errors_total[5m])

# Response time
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(request_duration_seconds_bucket[5m]))

# Check logs
docker-compose logs --tail=100 | grep -i error
docker-compose logs --tail=100 | grep -i warn
```

### T+1 Hour (System Stable)

**Activities**:
- [ ] All metrics normal
- [ ] No alerts fired
- [ ] Users reporting success
- [ ] Team confident in system
- [ ] Announce successful cutover

**Message**:
```
✅ Production Cutover SUCCESSFUL

Wise² Core is now live in production.
All services operational.
No incidents detected.
Monitoring active.

Deployment: v1.0.0
Duration: 1 hour
Status: ✅ GREEN
```

---

## Cutover Activities (Detailed)

### Cutover Day Pre-Requisites

**Must be complete before T-0**:
- [ ] Infrastructure deployed and tested
- [ ] Monitoring configured and tested
- [ ] Backups working and tested
- [ ] All team members trained
- [ ] Communication channels ready
- [ ] Customer communication prepared
- [ ] Rollback plan reviewed with team

### What Happens During Cutover

**Automated** (GitHub Actions handles):
- Tests run
- Docker images built
- Security scanning
- Images pushed to registry
- Deployment webhook triggered

**Manual** (Operations team):
- Monitor dashboards
- Verify health checks
- Monitor error rates
- Respond to any issues
- Communicate status

### Success Criteria for Cutover

| Criteria | Target | Status |
|----------|--------|--------|
| All services start | 100% | ☐ |
| Health checks pass | 100% | ☐ |
| Error rate | <1% | ☐ |
| Response time (p95) | <500ms | ☐ |
| Database connections | <80 | ☐ |
| No critical alerts | 0 | ☐ |
| Users accessing system | Yes | ☐ |
| Logs show no errors | Yes | ☐ |

---

## Post-Cutover Activities (T+1 to T+7 Days)

### T+1 Day (Day 1 Post-Cutover)

**Morning (9 AM)**:
- [ ] Review overnight logs
- [ ] Check monitoring for trends
- [ ] Review error logs
- [ ] Verify backups completed
- [ ] Check user feedback

**Afternoon (2 PM)**:
- [ ] Hold debrief meeting
  - What went well
  - What needs improvement
  - Any issues encountered
  - Action items

**Evening (5 PM)**:
- [ ] Final check before shift ends
- [ ] Alert on-call team
- [ ] Prepare status for management

### T+3 Days (Day 3 Post-Cutover)

**Full Review Meeting**:
- [ ] Performance review
- [ ] Error patterns review
- [ ] User feedback summary
- [ ] Infrastructure check
- [ ] Identify any issues

**Checks**:
```bash
# Performance baseline
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Error rate trend
curl http://localhost:9090/api/v1/query_range?query=rate(errors_total[1h])&start=T-72h&end=T

# User growth
docker-compose exec postgres psql -U postgres -d wise2_core -c \
  "SELECT COUNT(*) FROM users;"
```

### T+7 Days (Week 1 Post-Cutover)

**Week 1 Retrospective**:
- [ ] Full system performance review
- [ ] Incident summary (if any)
- [ ] Lessons learned meeting
- [ ] Documentation updates
- [ ] Team feedback collection

**Topics**:
- What went smoothly
- What was challenging
- Improvements for future deployments
- Customer feedback
- Infrastructure stability
- Monitoring effectiveness

---

## Rollback Procedures

**If cutover fails**, execute rollback:

### Immediate Rollback (T-0 to T+1 Hour)

**Decision**: Rollback if:
- Services not starting
- Health checks failing
- Database connectivity issues
- Error rate >5%

**Procedure**:
```bash
# 1. Stop new deployment
docker-compose down

# 2. Rollback to previous version
git checkout v0.9.9  # Previous version

# 3. Redeploy
docker-compose build
docker-compose up -d

# 4. Verify
curl https://wise2.net/api/health
docker-compose ps

# 5. If database issue, restore backup
./infrastructure/scripts/restore.sh /backups/production/pre-cutover/wise2_backup_*.tar.gz
```

### Communication on Rollback

```
⚠️ ROLLBACK EXECUTED

Production deployment rolled back.
Previous version (v0.9.9) now running.
Investigation underway.

Apologize for disruption.
Will re-attempt deployment after fixes.
```

---

## Post-Cutover Support

### Week 1 Operations

**Daily**:
- [ ] Morning health check
- [ ] Evening performance review
- [ ] Monitor error logs
- [ ] Respond to user issues

**On-Call**:
- [ ] 24/7 monitoring active
- [ ] Incident response ready
- [ ] Escalation procedures active
- [ ] All alerts configured

### Issue Response

**If issues occur**:
1. Assess severity (P1-P4)
2. Follow INCIDENT_RESPONSE.md
3. Update status page
4. Communicate with users
5. Resolve according to P-level
6. Document incident
7. Schedule post-mortem if P1/P2

---

## Success Metrics

### System Metrics

- Uptime: 99.9%+
- Error rate: <2%
- Response time (p95): <500ms
- Database connections: <80
- Memory usage: <85%

### User Metrics

- Users able to log in
- Features working correctly
- No data loss
- Acceptable performance

### Operational Metrics

- All monitoring working
- All alerts firing correctly
- Backups completing daily
- Logs being collected

---

## Documentation Handoff

After cutover, team should have:
- [ ] OPERATIONS_GUIDE.md (day-to-day)
- [ ] INCIDENT_RESPONSE.md (emergencies)
- [ ] DEPLOYMENT_PROCEDURES.md (future deploys)
- [ ] MONITORING_SETUP.md (dashboards)
- [ ] TEAM_TRAINING.md (onboarding)
- [ ] All other Phase E documentation

---

## Celebration & Acknowledgment

**When cutover successful**:
- [ ] Announce to company
- [ ] Thank the team
- [ ] Document lessons learned
- [ ] Plan next phase improvements
- [ ] Celebrate milestone

---

## Timeline Summary

```
Phase A (Audit)              ✅ 2026-06-07
Phase B (Foundation)         ✅ 2026-06-21
Phase C (Migration)          ✅ 2026-06-28
Phase D (Configuration)      🟡 2026-07-07 (40%)
Phase E (Documentation)      ✅ 2026-07-07 (100%)
Phase F (Go-Live)            🟠 2026-07-21 (STARTING)

Total Project: ~6 weeks
Total Effort: ~500+ hours
Status: ON TRACK FOR PRODUCTION
```

---

## Final Checklist Before Go-Live

**Mandatory items (ALL must be checked)**:

- [ ] All Phase A-E work complete
- [ ] All documentation reviewed
- [ ] Infrastructure tested
- [ ] Backups tested
- [ ] Monitoring working
- [ ] Team trained
- [ ] Runbooks reviewed
- [ ] Incident procedures tested
- [ ] Rollback plan reviewed
- [ ] Communication templates ready
- [ ] Go/No-Go decision made
- [ ] Executive approval obtained
- [ ] Customer communication prepared
- [ ] Support team briefed
- [ ] On-call team confirmed available

**Sign-Off Required**:
- CTO: _________________
- Operations Manager: _________________
- Tech Lead: _________________
- VP Engineering: _________________

---

**Phase F Plan Version**: 1.0
**Created**: 2026-07-07
**Target Go-Live**: 2026-07-21
**Owner**: CTO / Project Lead

---

## Next Steps After Phase F

**Immediate** (Week 1):
- Stabilize production
- Handle user issues
- Gather feedback
- Make adjustments

**Short-term** (Month 1):
- Complete incident post-mortems
- Document lessons learned
- Implement improvements
- Train additional team members

**Medium-term** (Quarter 1):
- Performance optimization
- Feature improvements
- Capacity planning
- Long-term roadmap

---

🚀 **Ready for Production Go-Live!**
