# Production Readiness Checklist — Wise² Core

Use this checklist before **EVERY** production deployment to ensure quality and safety.

---

## Pre-Deployment Checklist (T-24 hours)

### Code Quality

- [ ] **All tests passing** (GitHub Actions CI green)
  - Unit tests: >80% pass rate
  - Integration tests: >70% pass rate
  - E2E tests: All critical paths pass
  - Command: `github.com/dwise03-bit/wise2-core/actions`

- [ ] **Code review approved**
  - At least 2 approvals
  - No outstanding requested changes
  - Approved by: ___________________
  - Date: ________________________

- [ ] **Security scan passed** (Trivy)
  - No critical vulnerabilities
  - No high vulnerabilities
  - All issues reviewed
  - Command: GitHub Actions output

- [ ] **Linting and formatting passed**
  - ESLint: 0 errors, 0 warnings
  - Prettier: All files formatted
  - TypeScript: No compilation errors

- [ ] **Code coverage adequate**
  - Lines covered: >80%
  - Branches covered: >75%
  - Review coverage report

### Commits & History

- [ ] **Commit messages clear and descriptive**
  - Follow conventional commits (feat:, fix:, docs:)
  - Describe the "why", not just the "what"
  - Example: "feat(api): add user authentication with JWT"

- [ ] **No merge conflicts or conflicts resolved**
  - Repository clean
  - No conflicting branches

- [ ] **Version tag created** (for production)
  - Format: v1.X.X (semantic versioning)
  - Tag message describes release
  - Command: `git tag -a v1.X.X -m "Release v1.X.X"`

### Documentation

- [ ] **CHANGELOG.md updated**
  - All changes documented
  - Version number matches tag
  - Migration notes included (if needed)

- [ ] **README.md current**
  - Setup instructions accurate
  - Quick start guide clear
  - Dependencies listed

- [ ] **API documentation updated** (if API changed)
  - Endpoints documented
  - Request/response examples
  - Error codes documented

- [ ] **Database migration documented** (if schema changed)
  - Migration script provided
  - Rollback procedure documented
  - Data migration steps clear

- [ ] **Breaking changes documented**
  - Clear upgrade path
  - Deprecation notices included
  - Migration guide provided (if needed)

### Configuration

- [ ] **.env.example updated**
  - All new variables added
  - Descriptions clear
  - No secrets included
  - Example values reasonable

- [ ] **docker-compose.yml updated** (if changed)
  - All services listed
  - Port mappings correct
  - Environment variables set
  - Volumes correct
  - Health checks defined

- [ ] **No hardcoded secrets in code**
  - Scan for API keys: 0 found
  - Scan for passwords: 0 found
  - Scan for tokens: 0 found
  - Tool: `grep -r "password\|token\|secret\|key" src/`

---

## Infrastructure Readiness (T-12 hours)

### Database

- [ ] **Database migrations prepared** (if needed)
  - Migration scripts in `/infrastructure/sql/migrations/`
  - Rollback scripts prepared
  - Migrations tested on staging
  - Estimated migration time: ________
  - Downtime required: ________

- [ ] **Database backups verified**
  - Pre-deployment backup scheduled
  - Backup location confirmed
  - Backup size acceptable
  - Restore procedure tested
  - Command: `./infrastructure/scripts/backup.sh`

- [ ] **Database connections optimized**
  - Connection pool settings reviewed
  - Query performance checked
  - Indexes verified
  - No N+1 queries

- [ ] **Database credentials secure**
  - Only referenced via environment variables
  - Credentials rotated (if needed)
  - Access restricted to production services only

### Monitoring & Alerting

- [ ] **Monitoring dashboards prepared**
  - Prometheus configured
  - Grafana dashboards created
  - Key metrics visible
  - Dashboard: http://monitoring.wise2.net

- [ ] **Alerts configured**
  - High error rate alert: >5% fails
  - Service down alert: instant
  - High latency alert: >1s p95
  - High memory alert: >85%
  - High CPU alert: >80%
  - Disk full alert: >90%

- [ ] **Notification channels working**
  - Email notifications: ✓
  - Slack notifications: ✓
  - PagerDuty integration: ✓ (if used)
  - SMS notifications: ✓ (if used)

- [ ] **On-call team configured**
  - Escalation chain defined
  - Contact information current
  - Team trained on alerts
  - Responders available 24/7

### Infrastructure

- [ ] **Raspberry Pi/Server healthy**
  - Disk space: >5GB available
  - Memory: >1GB available
  - CPU: Normal utilization
  - Network: Stable connectivity
  - Command: `docker system df`

- [ ] **Docker infrastructure ready**
  - Docker version: 20.10+
  - Docker Compose version: 1.29+
  - All images built
  - Image sizes reasonable
  - Image security scanned

- [ ] **Networking verified**
  - All ports accessible
  - Firewall rules correct
  - SSL/TLS certificates valid (if HTTPS)
  - DNS records correct

- [ ] **Storage verified**
  - Backup storage accessible
  - Backup quota: ________
  - Database storage: ________
  - Application storage: ________

### Security

- [ ] **SSL/TLS certificates valid**
  - Certificate expiration: ________
  - Certificate renewal scheduled
  - HTTPS enforced
  - TLS 1.2+

- [ ] **Security scan results reviewed**
  - Trivy image scan: No critical issues
  - SAST (static analysis): No issues
  - Dependency check: No issues
  - Manual security review: ✓

- [ ] **Access control verified**
  - Only necessary services exposed
  - API authentication required
  - Database access restricted
  - SSH keys rotated (if needed)

- [ ] **Encryption verified**
  - Passwords hashed (bcryptjs)
  - Connections encrypted
  - Backups encrypted
  - Data at rest encrypted (if required)

### Capacity

- [ ] **Capacity adequate for launch**
  - CPU: ________%
  - Memory: ________MB
  - Disk: ________GB free
  - Network: ________Mbps available

- [ ] **Scaling plan documented**
  - Scaling triggers defined
  - Scaling procedure documented
  - Load testing results reviewed
  - Scaling approval obtained

---

## Pre-Deployment Day (T-2 hours)

### Final Verification

- [ ] **Staging deployment successful**
  - All tests pass
  - No errors in logs
  - Health checks green
  - Performance acceptable
  - Tested for >24 hours

- [ ] **Production environment stable**
  - Current version running normally
  - No degradation
  - Error rate normal
  - Response times normal

- [ ] **Rollback plan reviewed and approved**
  - Rollback procedure clear
  - Rollback tested (procedure only)
  - Rollback approval obtained
  - Estimated rollback time: ________

- [ ] **Deployment plan approved**
  - Deployment procedure clear
  - Timing approved
  - Team briefed
  - Escalation plan understood

### Team & Communication

- [ ] **Team prepared and briefed**
  - Operations team briefed on changes
  - On-call team assigned and available
  - Support team briefed on new features
  - Customer success team briefed
  - Executives briefed (if needed)

- [ ] **Communication prepared**
  - Status page message drafted
  - Stakeholder email drafted
  - Incident response template ready
  - Team Slack channel configured

- [ ] **Support documentation ready**
  - Runbooks updated
  - FAQ updated
  - Support team trained
  - Help desk notified

- [ ] **Maintenance window scheduled** (if needed)
  - Duration: ________
  - Window: ________
  - Notification sent to customers
  - Support team briefed

### Final Checks

- [ ] **Backup completed**
  - Pre-deployment backup verified
  - Backup location confirmed
  - Restore tested (if using new backup)
  - Backup size: ________

- [ ] **Monitoring dashboard verified**
  - All metrics displaying
  - Alerts configured and active
  - Previous incidents reviewed
  - Team knows how to read dashboard

- [ ] **Deployment credentials ready**
  - GitHub token available
  - Deploy webhook secret available
  - SSH keys available
  - All credentials secure

- [ ] **Go/No-Go Decision**
  - All checklist items complete
  - No blockers identified
  - Team confident proceeding
  - **DECISION: ☐ GO  ☐ NO-GO**
  - Decided by: ___________________
  - Date/Time: ____________________

---

## Deployment Day (T-0)

### Deployment Start

- [ ] **All team members present and ready**
  - Operations: Present
  - On-call: On standby
  - Tech lead: Available
  - CTO/Manager: Aware

- [ ] **Communication channels open**
  - Slack channel active
  - Status page accessible
  - Customer communication ready
  - Internal notification ready

- [ ] **Monitoring active**
  - All dashboards open
  - Alerts enabled
  - Team monitoring
  - Log streaming active

- [ ] **Deployment initiated**
  - Code pushed (or tagged)
  - GitHub Actions running
  - Deployment webhook triggered
  - Status: In Progress

### During Deployment

- [ ] **Monitor key metrics**
  - Error rate: ________%
  - Response time: ________ms
  - Services starting: ________
  - Health checks passing: ________

- [ ] **Check logs for errors**
  - API logs: ✓ (no errors)
  - Database logs: ✓ (no errors)
  - Services logs: ✓ (no errors)
  - System logs: ✓ (no errors)

- [ ] **Verify database integrity** (if schema changed)
  - Migration completed: ✓
  - Data integrity verified: ✓
  - Rollback point ready: ✓

- [ ] **Watch for alerts**
  - No critical alerts: ✓
  - No service down alerts: ✓
  - No error rate alerts: ✓

### Deployment Complete

- [ ] **All services healthy**
  - API responding: ✓
  - Dashboard accessible: ✓
  - Database healthy: ✓
  - Redis healthy: ✓
  - All checks: Green

- [ ] **Feature functionality verified** (spot check)
  - Core feature working: ✓
  - No obvious errors: ✓
  - Performance acceptable: ✓

- [ ] **Notifications sent**
  - Team notification: ✓
  - Stakeholder notification: ✓
  - Status page updated: ✓
  - Customer communication (if needed): ✓

---

## Post-Deployment (T+24 hours)

### Day 1 Verification

- [ ] **No critical issues reported**
  - Support tickets: Normal volume
  - Error logs: Normal levels
  - User complaints: None
  - Performance: Normal

- [ ] **Monitoring stable**
  - Error rate: <2%
  - Response time: Normal
  - CPU usage: Normal
  - Memory usage: Normal

- [ ] **Database healthy**
  - Backups running normally
  - Query performance normal
  - Connections normal
  - No errors in logs

- [ ] **Team feedback collected**
  - Operations team: No issues reported
  - On-call team: No incidents
  - Support team: No concerns
  - Developers: Features working as expected

### Week 1 Verification

- [ ] **No recurring issues**
  - Issue trend: Improving
  - Performance trend: Stable
  - Error trend: Decreasing

- [ ] **Feature adoption good** (if new features)
  - Feature usage: ________
  - User feedback: ________
  - Support requests: Normal

- [ ] **Post-mortem scheduled** (if any issues)
  - Date: ________
  - Participants: ________
  - Issue categorized: ________

- [ ] **Deployment marked successful**
  - Date/Time: ________
  - Version: ________
  - Duration: ________
  - Issues: 0
  - Status: ✓ SUCCESS

---

## Sign-Off

I certify that this checklist has been completed and that Wise² Core version __________ is ready for production.

**Deployment Lead**: _____________________  Date: _________

**Tech Lead**: ___________________________  Date: _________

**Operations Manager**: __________________  Date: _________

**CTO/Engineering Manager**: ____________  Date: _________

---

## Appendix: Quick Reference

### Critical Health Checks
```bash
curl https://wise2.net/api/health
docker-compose ps
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

### Emergency Escalation
- On-call: [Contact info]
- Database: [Contact info]
- Infrastructure: [Contact info]
- Executive: [Contact info]

### Important Contacts
- Tech Lead: ____________________
- On-Call: ______________________
- CTO: _________________________
- VP Engineering: _______________

---

**Checklist Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: DevOps / Operations Team
**Review Frequency**: Before every production deployment
