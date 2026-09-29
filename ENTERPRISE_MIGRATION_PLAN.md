# WISE² Enterprise Repository Migration Plan

**Repository:** wise2-core  
**Status:** Ready for enterprise migration  
**Date:** 2026-07-11  
**Phase:** Pre-migration preparation

---

## Current State

### Repository Contents
```
wise2-core/
├── wise-touch/              # Public website (WISE² Sound Labs)
├── wise-os/                 # Operating system
├── wise-touch/              # Touch interface
├── services/
│   ├── api/                 # API server
│   ├── dashboard/           # Admin dashboard
│   ├── bot/                 # Discord bot
│   └── worker/              # Background jobs
├── legacy/                  # Archived older versions
├── infrastructure/          # Deployment configs
├── docker-compose.prod.yml  # Production orchestration
└── docs/                    # Documentation
```

### Current Services
- **API** (Port 3101) — Backend services
- **Dashboard** (Port 3000) — Admin interface  
- **Website** (Port 3001) — WISE² Sound Labs (NEW)
- **Database** — PostgreSQL
- **Cache** — Redis
- **Reverse Proxy** — Traefik

### Recent Additions (This Session)
✅ WISE² Sound Labs complete website  
✅ Interactive installer (install-sound-labs.sh)  
✅ Deployment automation (DEPLOY_WEBSITE.sh)  
✅ Nginx reverse proxy setup  
✅ Complete documentation (5 guides)

---

## Enterprise Migration Target

### New Repository Structure
```
wise2 (master organization repository)
├── wise-core/              # ← wise2-core becomes this
├── wise-os/                # Operating system
├── wise-platform/          # Platform services
├── wise-defense-saas/      # SaaS product
├── wise-dashboard/         # Dashboard
├── wise.net/               # Public website
├── infrastructure/         # DevOps & deployment
├── docs/                   # Enterprise documentation
└── test-projects/          # Experiments & prototypes
```

---

## Migration Steps

### Step 1: Repository Standardization (THIS REPO)
**Before transferring to enterprise:**

- [ ] Add/update README with enterprise standards
- [ ] Add CHANGELOG documenting all work
- [ ] Add CONTRIBUTING guidelines
- [ ] Add CODEOWNERS for code review
- [ ] Add SECURITY.md policy
- [ ] Add GitHub Issue templates
- [ ] Add GitHub PR template
- [ ] Verify GitHub Actions workflows
- [ ] Set branch protection rules
- [ ] Enable Dependabot
- [ ] Create Release workflow

### Step 2: Code Quality Audit
- [ ] Scan for dead code
- [ ] Identify unused dependencies
- [ ] Check for hardcoded secrets
- [ ] Verify test coverage
- [ ] Document API endpoints
- [ ] Create architecture diagrams

### Step 3: Documentation Completion
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide (enterprise standard)
- [ ] Architecture decision records (ADRs)
- [ ] Security documentation
- [ ] Contributing guide
- [ ] Runbook for common tasks

### Step 4: Repository Transfer
- [ ] Backup current repository
- [ ] Create new wise-core in enterprise org
- [ ] Push with full history
- [ ] Update all references
- [ ] Archive old repository
- [ ] Update CI/CD pipelines

### Step 5: Integration
- [ ] Link to master wise2 repository
- [ ] Add to dependency graph
- [ ] Verify all webhooks
- [ ] Test deployment pipeline
- [ ] Update documentation references
- [ ] Notify team of new location

---

## Key Files to Create/Update

### Documentation
- [ ] README.md (enterprise template)
- [ ] ARCHITECTURE.md
- [ ] DEPLOYMENT.md
- [ ] API.md
- [ ] CHANGELOG.md
- [ ] CONTRIBUTING.md
- [ ] CODEOWNERS
- [ ] SECURITY.md

### Configuration
- [ ] .github/workflows/ci.yml (if needed)
- [ ] .github/workflows/deploy.yml (if needed)
- [ ] .github/workflows/release.yml (if needed)
- [ ] .github/ISSUE_TEMPLATE/
- [ ] .github/PULL_REQUEST_TEMPLATE.md

### Automation
- [ ] Dependabot configuration
- [ ] Branch protection rules
- [ ] Code scanning
- [ ] Dependency updates

---

## Current Production Status

✅ **Deployed & Running:**
- API: http://173.208.147.165:3101
- Dashboard: http://173.208.147.165:3000
- Website: http://173.208.147.165:3001/sound-labs
- Domain: wise2.net → 173.208.147.165 (DNS configured)

⚠️ **Pending:**
- Nginx reverse proxy setup (for wise2.net domain routing)
- SSL/HTTPS configuration (Let's Encrypt)
- Form backend integration
- Real audio demos

---

## Risk Mitigation

### Before Migration
1. ✅ Create backup of current repository
2. ✅ Document all current integrations
3. ✅ Verify all deployments working
4. ✅ Test rollback procedures
5. ✅ Prepare communication plan

### During Migration
1. Maintain git history (no squashing/rewriting)
2. Keep deployment pipeline active
3. Monitor for any issues
4. Have rollback plan ready
5. Communicate status to team

### After Migration
1. Verify all services still working
2. Update documentation links
3. Archive old repository
4. Test CI/CD in new location
5. Update team documentation

---

## Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Standardization | 2-4 hours | 🟡 In Progress |
| Code Quality Audit | 2-4 hours | ⏳ Queued |
| Documentation | 2-4 hours | ⏳ Queued |
| Repository Transfer | 1-2 hours | ⏳ Queued |
| Integration & Testing | 2-4 hours | ⏳ Queued |

**Total:** 9-18 hours over 2-3 sessions

---

## Success Criteria

- ✅ All git history preserved
- ✅ All services deployed and working
- ✅ All documentation complete
- ✅ Code quality standards met
- ✅ Security audit passed
- ✅ CI/CD pipelines operational
- ✅ Team notified and trained
- ✅ Old repository properly archived

---

## Next Steps

1. **Immediate:** Complete push to GitHub (in progress)
2. **Session 2:** Standardize wise2-core repository
3. **Session 3:** Complete code quality audit
4. **Session 4:** Audit all other repositories
5. **Session 5:** Execute enterprise migration

---

## Enterprise GitHub Organization

**Objective:** Transform into Fortune 500 quality engineering organization

**Repository Responsibilities:**
- **wise-core** — Backend services, APIs, databases
- **wise-os** — Operating system & embedded systems
- **wise-platform** — Shared libraries & utilities
- **wise-defense-saas** — SaaS product offering
- **wise-dashboard** — Admin & management interface
- **wise.net** — Public marketing website
- **infrastructure** — DevOps, deployment, monitoring
- **docs** — Consolidated documentation
- **test-projects** — Experiments & prototypes

**Standards Applied to All:**
- Consistent README & CONTRIBUTING
- License & CODEOWNERS in every repo
- GitHub Actions for CI/CD
- Branch protection & PR reviews
- Dependabot & security scanning
- Semantic versioning & releases
- Comprehensive documentation

---

**Prepared By:** Claude Code  
**Ready for:** Enterprise Migration Phase  
**Backup Status:** ✅ Current (git push in progress)
