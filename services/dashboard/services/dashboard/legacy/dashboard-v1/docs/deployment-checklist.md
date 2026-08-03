# Deployment Checklist & Launch Guide

Complete pre-launch verification and production deployment procedures.

## Pre-Launch Checklist (1 week before)

### Code Quality ✅
- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] No console.error in build output
- [ ] No security vulnerabilities (`npm audit`)
- [ ] All environment variables documented
- [ ] Error handling in all critical paths
- [ ] No hardcoded credentials anywhere

### Performance ✅
- [ ] Homepage loads < 500ms
- [ ] API responses < 100ms (p95)
- [ ] Database queries optimized (no N+1)
- [ ] Images optimized and lazy-loaded
- [ ] JavaScript bundle < 500KB (gzipped)
- [ ] Caching strategy implemented
- [ ] Load test results: 1000 users concurrent

### Security ✅
- [ ] HTTPS enabled on all pages
- [ ] CSRF protection on all forms
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (DOMPurify or equivalent)
- [ ] Rate limiting on APIs
- [ ] Authentication required for sensitive data
- [ ] API keys stored in environment variables
- [ ] Database backups automated

### Documentation ✅
- [ ] API documentation complete
- [ ] Error codes documented
- [ ] Monitoring setup documented
- [ ] Incident response plan created
- [ ] Runbook for common issues
- [ ] Architecture diagram updated
- [ ] Database schema documented

### Infrastructure ✅
- [ ] Database backups working
- [ ] SSL certificate valid
- [ ] Domain DNS configured
- [ ] Email delivery tested
- [ ] Monitoring alerts configured
- [ ] Log aggregation setup
- [ ] Disaster recovery plan

### Testing ✅
- [ ] Manual testing on staging
- [ ] User acceptance testing (UAT)
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] API integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Rollback plan documented

## 48 Hours Before Launch

### Final Validation
```bash
# Run complete test suite
npm run test

# Build for production
npm run build

# Check bundle size
npm run analyze

# Run security audit
npm audit

# Verify environment variables
env | grep WISE

# Database health check
npm run db:health-check

# Performance test
npm run lighthouse
```

### Monitoring Setup
```bash
# Verify PM2 processes
pm2 status

# Check log rotation
pm2 logs --lines 10

# Verify alerts
npm run test:alerts

# Database replication verified
psql $DATABASE_URL -c "SELECT pg_current_wal_lsn();"
```

### Communication
- [ ] Notify stakeholders of launch time
- [ ] Prepare status page message
- [ ] Brief support team on features
- [ ] Set up war room (Slack channel)
- [ ] Assign on-call engineer for 24 hours

## Launch Day (T-0)

### 2 Hours Before

```bash
# Final database backup
pg_dump $DATABASE_URL > pre-launch-backup.sql

# Verify backup
pg_restore --list pre-launch-backup.sql | head -20

# Clear cache
npm run cache:clear

# Stop any scheduled jobs
pm2 stop news-scraper content-reviewer social-media-agent

# Verify no uncommitted changes
git status  # Should show clean working tree
```

### 1 Hour Before

```bash
# Start all services
pm2 start ecosystem.config.js

# Verify services online
pm2 status

# Smoke tests
npm run test:smoke

# Health check
curl -I http://localhost:3001

# Database connection test
psql $DATABASE_URL -c "SELECT count(*) FROM users;"
```

### T-0 Launch

```bash
# Push to GitHub (triggers auto-deploy)
git push origin main

# Monitor deployment
git log --oneline -n 5  # Verify commit deployed

# Health check on VPS
curl -I http://51.81.80.252:3001

# Monitor logs
pm2 logs --lines 50
```

### T+5 Minutes

- [ ] Verify home page loads
- [ ] Test user login
- [ ] Check leaderboard page
- [ ] Verify Discord alerts sending
- [ ] Check Telegram bot responding
- [ ] Monitor error rates (should be ~0%)
- [ ] Check database connection pool
- [ ] Verify payment processing (if applicable)

### T+15 Minutes

- [ ] Test all major features
- [ ] Verify mobile responsiveness
- [ ] Check email notifications
- [ ] Monitor server load (CPU, Memory, Disk)
- [ ] Check database performance
- [ ] Review application logs
- [ ] Verify monitoring/alerting
- [ ] Check third-party integrations

### T+1 Hour

- [ ] Run full smoke test suite
- [ ] Verify analytics tracking
- [ ] Check social media posting
- [ ] Validate news scraper running
- [ ] Verify content reviewer processing
- [ ] Monitor error logs (should have <1 error/min)
- [ ] Spot check user data integrity
- [ ] Verify backup jobs running

## Post-Launch

### Day 1

**Monitoring Intensity: HIGH**

```bash
# Every 15 minutes
curl -I http://51.81.80.252:3001
pm2 logs --lines 100 | grep -E "ERROR|WARN"
psql $DATABASE_URL -c "SELECT count(*) FROM users;"

# Every hour
npm run test:health-check
pm2 show <process-name>  # CPU, Memory, Uptime
```

**Escalation Triggers:**
- Error rate > 1%
- Response time > 500ms (p95)
- Database connections > 40
- Memory usage > 80%
- Disk usage > 85%
- Any ERROR in logs

### Week 1

**Monitoring Intensity: MEDIUM**

- [ ] Monitor error trends
- [ ] Track performance metrics
- [ ] Check user adoption
- [ ] Verify all features working
- [ ] Review support tickets
- [ ] Monitor third-party services
- [ ] Check backup status
- [ ] Review database growth

**Weekly Report Template:**

```
## Week 1 Launch Report

### Uptime
- Availability: 99.9%
- Error rate: 0.05%
- Avg response time: 85ms (p95: 250ms)

### Users
- Active users: 1,234
- Sign-ups: 567
- Engagement rate: 78%

### Performance
- Database: Healthy
- APIs: All green
- Infrastructure: Normal load

### Issues Resolved
1. Minor: Typo on leaderboard page
2. Minor: Mobile layout issue on profile

### Next Week
- Monitor weekly trends
- Plan performance optimization
- Gather user feedback
```

### Month 1

**Monitoring Intensity: NORMAL**

- [ ] Monthly review of metrics
- [ ] User feedback compilation
- [ ] Performance trend analysis
- [ ] Database optimization pass
- [ ] Security audit
- [ ] Capacity planning (growth rate)
- [ ] Cost analysis (actual vs. budget)
- [ ] Next feature planning

## Rollback Plan

**If Critical Issues Occur:**

```bash
# Option 1: Revert to previous commit
git revert <commit-hash>
git push origin main

# Option 2: Deploy backup image
docker pull wise-defense:backup-v1
docker tag wise-defense:backup-v1 wise-defense:latest
docker-compose up -d

# Option 3: Restore from database backup
pg_restore -d wisedefense pre-launch-backup.sql

# Option 4: Manual rollback (last resort)
git checkout <previous-release-tag>
npm run build
docker build -t wise-defense:rollback .
docker-compose up -d
```

**Rollback Triggers:**
- Error rate > 5%
- Response time > 2 seconds (p95)
- Database corruption detected
- Data loss reported
- Security breach discovered
- Critical feature broken

## Success Criteria

### Day 1
- ✅ Zero critical errors
- ✅ <99% uptime (allow 1 restart)
- ✅ All users can access site
- ✅ All features functional
- ✅ Monitoring alerts working

### Week 1
- ✅ 98% or better uptime
- ✅ <1% error rate
- ✅ <500ms response time (p95)
- ✅ 100 or more active users
- ✅ Zero critical bugs

### Month 1
- ✅ 99% or better uptime
- ✅ <0.5% error rate
- ✅ Performance optimized
- ✅ 1,000+ active users
- ✅ User retention > 60%

## Post-Launch Tasks

### Immediate (Week 1)
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Optimize based on real usage
- [ ] Monitor infrastructure costs
- [ ] Plan next features

### Short-term (Month 1)
- [ ] Implement user feedback
- [ ] Add feature enhancements
- [ ] Optimize database queries
- [ ] Set up automated scaling
- [ ] Create marketing content

### Medium-term (Q2)
- [ ] Plan next major feature
- [ ] Scale infrastructure if needed
- [ ] Add advanced analytics
- [ ] Implement A/B testing
- [ ] Expand to new platforms

## War Room Setup

### Slack Channel: #wise-launch
- Notifications enabled
- Pinned: Checklist, Runbook, Escalation contacts
- Post updates every 15 min for first hour

### Team Roster
- **Launch Lead:** dwise03
- **Backend Engineer:** On standby
- **DevOps:** Monitor infrastructure
- **Support:** Ready for user issues

### Escalation Path
1. **Level 1:** Try to fix immediately
2. **Level 2:** Escalate to launch lead
3. **Level 3:** Initiate rollback if needed
4. **Level 4:** Wake up CTO (only for critical)

## Documentation

### For Operators
- Runbooks for common issues ✅
- PM2 monitoring guide ✅
- Database maintenance ✅
- Backup/restore procedures ✅

### For Developers
- API documentation ✅
- Code structure guide ✅
- How to add new features ✅
- Debugging guide ✅

### For Support
- Feature overview ✅
- Common issues & solutions ✅
- User troubleshooting ✅
- Escalation procedures ✅
