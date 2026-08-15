# Phase C Execution Plan — Service Migration

**Status**: STARTING
**Date Started**: 2026-07-07
**Target Completion**: 2026-07-24 (2-3 weeks)
**Approach**: Sequential service migration with testing

---

## Migration Strategy

### Principle
- Preserve git history where possible
- Maintain code as-is (minimal changes)
- Update configurations for new paths
- Test each service independently
- Consolidate only what's necessary

### Order of Migration (Risk-Based)

1. **API Service** (Low risk, foundational)
   - Simple structure
   - No UI dependencies
   - Easiest to validate

2. **Dashboard v2** (Medium risk, complex)
   - Next.js build system
   - Many dependencies
   - High value

3. **Admin Dashboard** (Low risk)
   - Separate from main dashboard
   - Likely smaller codebase

4. **Discord Bot** (Medium risk)
   - External API dependencies
   - Test credentials needed

5. **Worker Service** (Low risk)
   - Background processing
   - Independent of others

6. **Wise OS** (Separate, lower priority)
   - Desktop/Pi platform
   - Can be migrated after core services

---

## Detailed Migration Steps

### For Each Service

1. **Analyze** (15 minutes)
   - Review current structure
   - Identify dependencies
   - Document current configuration

2. **Copy** (10 minutes)
   - Copy source files
   - Preserve directory structure
   - Copy configuration files

3. **Update** (30 minutes)
   - Update import paths
   - Update docker references
   - Update environment variables
   - Update build scripts

4. **Test** (45 minutes)
   - Local docker build
   - Container startup
   - Health checks
   - Basic functionality

5. **Document** (15 minutes)
   - Update service README
   - Note any changes made
   - Document testing results

---

## Migration Checklist

### API Service
- [ ] Analyze current API structure
- [ ] Copy api/ directory
- [ ] Update Dockerfile
- [ ] Update docker-compose references
- [ ] Test docker build
- [ ] Test container startup
- [ ] Test health endpoint
- [ ] Document migration
- [ ] Commit to git

### Dashboard v2
- [ ] Analyze current dashboard structure
- [ ] Archive dashboard v1 to legacy/
- [ ] Copy dashboard-v2/ → services/dashboard/
- [ ] Update Dockerfile
- [ ] Update docker-compose references
- [ ] Verify Next.js build
- [ ] Test container startup
- [ ] Test health endpoint
- [ ] Document migration
- [ ] Commit to git

### Admin Dashboard
- [ ] Analyze current structure
- [ ] Copy admin-dashboard/ directory
- [ ] Update Dockerfile
- [ ] Update docker-compose references
- [ ] Test docker build
- [ ] Test container startup
- [ ] Document migration
- [ ] Commit to git

### Discord Bot
- [ ] Analyze current bot structure
- [ ] Copy bot/ directory
- [ ] Update Dockerfile
- [ ] Update environment variables
- [ ] Update docker-compose references
- [ ] Test docker build
- [ ] Test container startup
- [ ] Document migration
- [ ] Commit to git

### Worker Service
- [ ] Analyze current worker structure
- [ ] Copy worker/ directory
- [ ] Update Dockerfile
- [ ] Update docker-compose references
- [ ] Test docker build
- [ ] Test container startup
- [ ] Document migration
- [ ] Commit to git

### Configuration Consolidation
- [ ] Merge all environment variables
- [ ] Consolidate deployment scripts
- [ ] Update docker-compose.yml
- [ ] Archive old docker-compose files
- [ ] Archive old deployment scripts (v4, v5)
- [ ] Update .env.example
- [ ] Test end-to-end deployment

### Wise OS Migration (Lower Priority)
- [ ] Copy wise-os/ → wise2-core/wise-os/
- [ ] Update references
- [ ] Document migration

---

## Testing Strategy

### Per-Service Testing

For each service after migration:
```bash
# 1. Build test
docker-compose build service_name

# 2. Health check
docker-compose up -d service_name
sleep 10
curl http://localhost:3000/health  # (adjust port)

# 3. Container logs
docker-compose logs service_name

# 4. Stop test
docker-compose down service_name
```

### Integration Testing

After all services migrated:
```bash
# Full stack test
docker-compose up -d

# Health checks all
curl http://localhost:3000/health     # API
curl http://localhost:3001/           # Dashboard
curl http://localhost:3002/health     # Admin (if different port)

# Database connectivity
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1"

# Redis connectivity
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Logs check
docker-compose logs | grep -i error || echo "✅ No errors"
```

---

## Files to Archive

After migration, archive to `legacy/`:

```
legacy/
├── dashboard-v1/              # Old dashboard (archive v1)
├── deploy-v4.sh               # Old deployment script
├── deploy-v5.sh               # Old deployment script
├── docker-compose.yml.backup
├── docker-compose.yml.bak
├── docker-compose.yml.bad
└── README.md                  # Explain legacy files
```

---

## Files to Delete

Remove completely (after confirmation):

```
- docker-compose.yml.bad       # Failed attempt, safe to delete
- .env.save                    # Temporary file
- .env.lock                    # Temporary file
```

---

## Configuration Consolidation

### Environment Variables to Merge

All from `wise-defense-saas/.env.example` into `wise2-core/.env.example`

Current status: Already mostly complete in wise2-core/.env.example

### Deployment Scripts

Current status:
- ✅ deploy.sh exists in wise2-core/infrastructure/scripts/
- Archive: deploy-v4.sh, deploy-v5.sh, old deploy-engine/

### Docker Compose

Current status:
- ✅ docker-compose.yml exists in wise2-core
- Action: Update service paths, verify all services reference correct directories

---

## Success Criteria

Each service migration is successful when:

1. ✅ Code copied to correct directory
2. ✅ Dockerfile builds without errors
3. ✅ Container starts without errors
4. ✅ Health check responds (HTTP 200)
5. ✅ Logs show no critical errors
6. ✅ README updated with migration notes
7. ✅ Changes committed to git

---

## Risk Mitigation

### For Each Migration

- **Backup**: Commit current state before starting
- **Test**: Verify locally before moving to staging
- **Rollback**: Easy rollback via git (not used)
- **Documentation**: Update as we go
- **Communication**: Clear commit messages

### If Something Goes Wrong

1. Stop container: `docker-compose down service_name`
2. Investigate logs: `docker-compose logs service_name`
3. Fix issue locally
4. Rebuild: `docker-compose build --no-cache service_name`
5. Retry startup

---

## Timeline

### Day 1-2: API Service
- Copy and test
- Verify database connectivity
- Document integration points

### Day 3-4: Dashboard v2
- Copy and verify Next.js build
- Test web interface
- Archive dashboard v1

### Day 5-6: Other Services
- Admin Dashboard
- Discord Bot
- Worker

### Day 7-8: Configuration & Testing
- Consolidate configurations
- Full integration testing
- Performance validation

### Day 9-10: Documentation & Cutover
- Update all documentation
- Create migration summary
- Prepare for Phase D

---

## Current Status

Starting Phase C migration:

- [ ] **API**: Ready to migrate
- [ ] **Dashboard v2**: Ready to migrate
- [ ] **Admin Dashboard**: Ready to migrate
- [ ] **Discord Bot**: Ready to migrate
- [ ] **Worker**: Ready to migrate
- [ ] **Wise OS**: Ready to migrate (lower priority)
- [ ] **Configuration**: Ready to consolidate
- [ ] **Legacy**: Ready to archive

---

## Next Action

**Begin API Service migration**

→ Copy `wise-defense-saas/api/` to `wise2-core/services/api/`

---

**Plan Version**: 1.0
**Date Created**: 2026-07-07
**Owner**: CTO / Lead Systems Engineer
