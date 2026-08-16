# Team Training — Wise² Core

Training materials and onboarding guide for new team members.

---

## System Overview

### What is Wise² Core?

Wise² Core is a unified platform consolidating:
- **API** (Express.js backend)
- **Dashboard** (Next.js web UI)
- **Admin Dashboard** (Management interface)
- **Discord Bot** (Integration)
- **Worker** (Background jobs)
- **Wise OS** (Desktop/Pi platform)

**Purpose**: Consolidated production system for wise2.net

**Status**: Production-ready, ready for cutover

---

## Architecture Overview

### High-Level Architecture

```
Users
  │
  ├→ Web Browser
  │    │
  │    └→ Dashboard (port 3001)
  │         │
  │         └→ API (port 3000)
  │
  └→ Discord
       │
       └→ Discord Bot
            │
            └→ API (port 3000)

API Dependencies:
  ├→ PostgreSQL Database (port 5432)
  ├→ Redis Cache (port 6379)
  └→ External APIs (Claude, GitHub, etc.)

Infrastructure:
  ├→ Prometheus (monitoring)
  ├→ Grafana (dashboards)
  └→ Backup system
```

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| API | Express.js | 5.2.1 |
| Dashboard | Next.js | 16.2.7 |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Monitoring | Prometheus + Grafana | Latest |
| Container | Docker | 20.10+ |

---

## Essential Documentation

### For Developers

1. **DEPLOYMENT_PROCEDURES.md** — How to deploy code
2. **TESTING_GUIDE.md** — How to test services
3. **API.md** — API reference documentation
4. **DATABASE.md** — Database schema

### For Operations

1. **OPERATIONS_GUIDE.md** — Day-to-day tasks
2. **INCIDENT_RESPONSE.md** — Crisis procedures
3. **MONITORING_SETUP.md** — Monitoring guide
4. **SERVICE_DEPENDENCIES.md** — System architecture

### For New Team Members

1. **This document** — Training guide
2. **MASTER.md** — Complete system architecture
3. **PHASE_*.md** — Implementation history

---

## Getting Started (Day 1)

### Prerequisites

- [ ] GitHub access to dwise03-bit/wise2-core
- [ ] Docker installed (20.10+)
- [ ] Docker Compose installed (1.29+)
- [ ] Terminal/SSH access (if doing ops)
- [ ] Slack account (@wise2.net)

### Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/dwise03-bit/wise2-core.git
   cd wise2-core
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your values (ask team for secrets)
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify**
   ```bash
   curl http://localhost:3000/health
   docker-compose ps
   ```

### First Day Tasks

- [ ] Read MASTER.md (system architecture)
- [ ] Read PHASE_*.md files (understand history)
- [ ] Access monitoring dashboards
- [ ] Review DEPLOYMENT_PROCEDURES.md
- [ ] Ask questions in #engineering Slack

---

## Understanding the Services

### API Service (Port 3000)

**Role**: Core backend, all business logic

**Key Endpoints**:
- `GET /health` — Health check
- `POST /auth/login` — User authentication
- `GET /users/me` — Current user profile
- `POST /deploy` — Trigger deployment

**Logs**:
```bash
docker-compose logs api
```

**Restart**:
```bash
docker-compose restart api
```

### Dashboard Service (Port 3001)

**Role**: User-facing web interface

**Key Files**:
- `services/dashboard/` — React components
- `public/` — Static assets

**Logs**:
```bash
docker-compose logs dashboard
```

### Database (PostgreSQL, Port 5432)

**Role**: Primary data store

**Key Tables**:
- `users` — User accounts
- `deployments` — Deployment history
- `audit_logs` — Audit trail

**Access**:
```bash
docker-compose exec postgres psql -U postgres -d wise2_core
```

### Cache (Redis, Port 6379)

**Role**: Caching, sessions, message queue

**Common Operations**:
```bash
# Connect
docker-compose exec redis redis-cli -a $REDIS_PASSWORD

# View keys
KEYS *

# View specific key
GET key-name

# Clear cache
FLUSHALL
```

---

## Common Development Tasks

### Running Tests

```bash
# All tests
docker-compose exec api npm test

# Specific test file
docker-compose exec api npm test -- path/to/test.js

# Watch mode
docker-compose exec api npm test -- --watch
```

### Linting

```bash
# Check linting
docker-compose exec api npm run lint

# Fix issues
docker-compose exec api npm run lint -- --fix
```

### Database Migrations

```bash
# Run migrations
docker-compose exec api npm run migrate

# Rollback
docker-compose exec api npm run migrate:rollback
```

### Viewing Logs

```bash
# Real-time logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Search for errors
docker-compose logs api | grep ERROR
```

---

## Common Operations Tasks

### Daily Check

```bash
# 1. Service status
docker-compose ps

# 2. Recent errors
docker-compose logs --tail=50 | grep -i error

# 3. Resource usage
docker stats --no-stream

# 4. Monitoring dashboard
# Check http://monitoring.wise2.net
```

### Handling Issues

**Service Down**:
```bash
# 1. Check status
docker-compose ps SERVICE_NAME

# 2. View logs
docker-compose logs SERVICE_NAME | tail -50

# 3. Restart
docker-compose restart SERVICE_NAME

# 4. Verify
curl http://localhost:3000/health
```

**Database Issues**:
```bash
# 1. Test connection
docker-compose exec postgres pg_isready -U postgres

# 2. Restart
docker-compose restart postgres

# 3. Check logs
docker-compose logs postgres
```

**High Resource Usage**:
```bash
# Check what's using resources
docker stats

# Restart high-usage service
docker-compose restart SERVICE_NAME

# Check logs for memory leaks
docker-compose logs SERVICE_NAME | grep -i memory
```

---

## Monitoring & Observability

### Monitoring Dashboards

- **System Overview**: http://monitoring.wise2.net/d/system
- **Service Health**: http://monitoring.wise2.net/d/services
- **Performance**: http://monitoring.wise2.net/d/performance
- **Errors**: http://monitoring.wise2.net/d/errors

### Key Metrics to Watch

1. **Error Rate**: Should be <2%
2. **Response Time**: Should be <500ms (p95)
3. **Database Connections**: Should be <80
4. **Memory Usage**: Should be <85%
5. **Disk Space**: Should be >10% free

### Alert Severity Levels

- **P1** (Critical) — Service down, user-facing
- **P2** (Severe) — Degradation, majority affected
- **P3** (Moderate) — Minor issues, some users
- **P4** (Low) — Cosmetic issues

---

## Deployment Workflow

### For Developers

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: description of change"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request**
   - GitHub web UI
   - Request review (2+ approvals)
   - Wait for CI/CD to pass

5. **Merge to main**
   - After approvals
   - GitHub Actions deploy automatically

### For Operations

1. **Monitor deployment**
   - Check GitHub Actions
   - Review logs

2. **Verify production**
   - Check health endpoints
   - Monitor error rates
   - Review monitoring dashboards

3. **Post-deployment**
   - Update status
   - Monitor for 24+ hours
   - Report any issues

---

## Security Best Practices

### Secrets Management

- **Never commit secrets** to Git
- Use `.env` file (not in Git)
- Use GitHub Secrets for CI/CD
- Rotate secrets regularly

### Database Access

- Only needed roles have access
- No root access to prod database
- Connections encrypted (SSL/TLS)
- Audit all database changes

### API Security

- All endpoints use JWT authentication
- Rate limiting enabled
- Input validation on all requests
- No hardcoded credentials

### Backup Security

- Backups encrypted
- Stored in secure location
- Separate from application
- Tested regularly

---

## Communication Channels

### Slack Channels

- **#engineering** — Technical discussions
- **#deployments** — Deployment notifications
- **#incidents** — Production incidents
- **#monitoring** — Alert notifications
- **#general** — General announcements

### Escalation

**Technical Issues**:
1. Ask in #engineering
2. Escalate to tech lead
3. Escalate to CTO

**Production Incidents**:
1. Report in #incidents
2. Page on-call engineer
3. Follow INCIDENT_RESPONSE.md

### Regular Meetings

- **Standup** — Daily 10am (15 min)
- **Deployment Review** — Every Friday (30 min)
- **Incident Post-Mortem** — After P1/P2 incidents
- **Monthly Retrospective** — Last Friday

---

## Useful Commands Quick Reference

### Docker Compose

```bash
# View all services
docker-compose ps

# View service logs
docker-compose logs SERVICE_NAME

# Restart service
docker-compose restart SERVICE_NAME

# Shell into service
docker-compose exec SERVICE_NAME /bin/sh

# View resource usage
docker stats
```

### Database

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d wise2_core

# Run query
psql -c "SELECT * FROM users LIMIT 10;"

# Database statistics
psql -c "SELECT * FROM pg_stat_statements LIMIT 10;"
```

### Monitoring

```bash
# View Prometheus metrics
curl http://localhost:9090/api/v1/query?query=up

# Check alerts
curl http://localhost:9090/api/v1/alerts
```

### Git

```bash
# View commit history
git log --oneline | head -10

# Check current branch
git branch

# Switch branch
git checkout branch-name

# Create new branch
git checkout -b new-branch-name
```

---

## Learning Resources

### Documentation

- **MASTER.md** — Complete architecture
- **docs/** directory — All procedures
- **Code comments** — Implementation details

### External Resources

- **Express.js**: https://expressjs.com
- **Next.js**: https://nextjs.org
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/

### Getting Help

1. **Check documentation** — MASTER.md, docs/
2. **Search GitHub issues**
3. **Ask in #engineering** Slack
4. **Ask tech lead** (if urgent)

---

## Certification/Competencies

### Level 1 — Basics (1-2 weeks)

- [ ] Understand architecture
- [ ] Can start/stop services
- [ ] Can view logs
- [ ] Can access databases
- [ ] Know how to escalate

### Level 2 — Intermediate (1-2 months)

- [ ] Can deploy code
- [ ] Can handle basic incidents
- [ ] Can read monitoring dashboards
- [ ] Can troubleshoot services
- [ ] Know backup procedures

### Level 3 — Advanced (3-6 months)

- [ ] Can optimize performance
- [ ] Can handle complex incidents
- [ ] Can mentor others
- [ ] Can design new features
- [ ] Can review code

---

## Training Checklist

New team members should complete:

- [ ] Read this document
- [ ] Read MASTER.md
- [ ] Review DEPLOYMENT_PROCEDURES.md
- [ ] Review INCIDENT_RESPONSE.md
- [ ] Set up local environment
- [ ] Verify docker-compose works
- [ ] Access monitoring dashboards
- [ ] Know escalation path
- [ ] Know Slack channels
- [ ] Ask questions

**Estimated time**: 4-8 hours

---

**Team Training Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Engineering Team Lead
**Review Frequency**: Quarterly
