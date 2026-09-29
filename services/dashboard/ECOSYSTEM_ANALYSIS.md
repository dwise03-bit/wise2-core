# Wise² Ecosystem Analysis & Migration Plan

**Date**: 2026-07-07
**Status**: Initial Analysis (Awaiting Approval Before Migration)
**Scope**: Complete inventory of existing Wise² repositories and proposed consolidation into wise2-core

---

## Executive Summary

The Wise² ecosystem currently consists of multiple distributed repositories with overlapping functionality, duplicated code, and unclear boundaries. This analysis proposes consolidating all components into the centralized **wise2-core** repository as the single source of truth.

**Current State**: Fragmented
**Target State**: Unified, organized, maintainable ecosystem
**Timeline**: 2-4 weeks for full consolidation
**Risk Level**: Medium (requires careful migration)

---

## 1. Complete Repository Inventory

### Active Repositories (Identified)

#### 1.1 wise-defense-saas
**Location**: `/Users/danielwise/wise-defense-saas`
**Type**: Main application monorepo
**Size**: 36MB
**Git History**: Yes (active)
**Status**: Primary production system

**Contents**:
```
wise-defense-saas/
├── api/                    # REST API backend
├── bot/                    # Discord bot
├── dashboard/              # Web dashboard (v1)
├── dashboard-v2/           # Web dashboard (v2)
├── admin-dashboard/        # Admin interface
├── deploy/                 # Deployment scripts
├── deploy-engine/          # Deployment orchestration
├── deploy-v6/              # Deployment v6
├── ci-cd/                  # CI/CD configuration
├── docker-compose.yml      # Service orchestration
├── deploy.sh               # Deployment script
├── deploy-v4.sh, v5.sh     # Legacy deployment scripts
└── Documentation/Guides
```

**Key Issues Identified**:
- ✗ Multiple deployment versions (v4, v5, v6)
- ✗ Multiple dashboard versions (v1, v2)
- ✗ Mixed concerns (API, bot, deployment)
- ✗ No clear separation of services
- ✗ Configuration files scattered throughout
- ✗ Docker Compose configs duplicated (.blue/.green/.backup/.bak)

**Dependencies**:
- PostgreSQL (implied from API)
- Redis (implied from deployment)
- Node.js/Express
- React (dashboard)
- Discord.js (bot)

---

#### 1.2 wise-os
**Location**: `/Users/danielwise/Documents/wise-os`
**Type**: Desktop/system application
**Size**: <1MB (minimal code)
**Git History**: Yes (recent activity)
**Status**: In development

**Contents**:
```
wise-os/
├── install/                # Installation scripts
├── packages/
│   └── cli/                # CLI tools
├── public/
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript
│   └── pages/              # HTML pages
├── server.js               # Node server
├── package.json            # Dependencies
└── README.md               # Documentation
```

**Key Observations**:
- ✓ Relatively clean structure
- ✗ Very minimal documentation (empty CHANGELOG.md)
- ✗ Limited functionality in current state
- ✗ CLI tools not well documented
- ✗ No clear connection to wise-defense-saas

**Dependencies**:
- Node.js
- Custom CLI tools

---

#### 1.3 wise-recovery-from-ubuntu-vps
**Location**: `/Users/danielwise/wise-recovery-from-ubuntu-vps`
**Type**: Backup/recovery system
**Status**: Archive/reference

**Purpose**: Disaster recovery procedures for VPS-hosted system

---

#### 1.4 wise-recovery
**Location**: `/Users/danielwise/wise-recovery`
**Type**: Backup/recovery procedures
**Status**: Archive/reference

---

### Related Assets (Non-Repository)

#### Documentation Files
- `WiseDefense_Master_Operations_Roadmap.pdf` — Master roadmap
- `WiseDefense_GitHub_CheatSheet.pdf` — GitHub procedures
- `WiseDefense_v1.2_QuickStart_Guide.pdf` — Setup guide
- `Wise_Defense_LLC_Self_Hosted_Website_Claude_Prompt.txt` — Prompt/instructions

#### Hardware/3D Printing
- `/Users/danielwise/Desktop/3d\ print/wisedefensedock` — 3D printer files

---

## 2. Current Architecture Analysis

### Existing System Map

```
┌─────────────────────────────────────────────────────────┐
│           Wise² Ecosystem (Current - Fragmented)        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  wise-defense-saas (Primary)                             │
│  ├── API (Backend)                                       │
│  ├── Dashboard v1 & v2 (Frontend)                        │
│  ├── Admin Dashboard                                     │
│  ├── Discord Bot                                         │
│  ├── Deploy Engines (v4, v5, v6)                         │
│  └── Docker Compose (configs)                            │
│                                                          │
│  wise-os (Separate)                                      │
│  ├── CLI Tools                                           │
│  ├── Desktop Server                                      │
│  └── Public Assets                                       │
│                                                          │
│  wise-recovery (Archive)                                 │
│  └── Disaster Recovery Scripts                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Problems with Current Structure

1. **Fragmentation**: Components are in separate repositories with unclear relationships
2. **Duplicated Code**: Configuration, utilities, and shared code are duplicated
3. **Unclear Ownership**: No clear responsibility boundaries
4. **Inconsistent Patterns**: Different approaches to similar problems
5. **Documentation Gaps**: Each repo has minimal documentation
6. **Version Chaos**: Multiple versions of the same components (deploy v4/v5/v6, dashboard v1/v2)
7. **Difficult Deployment**: Complex deployment with multiple scripts and configurations
8. **Poor Monitorability**: No unified monitoring or logging strategy
9. **Scaling Challenges**: Unclear how to scale individual components
10. **Onboarding Difficulty**: New team members must understand multiple repos

---

## 3. Proposed Consolidated Structure

### New wise2-core Organization

```
wise2-core/ (Single Source of Truth)
│
├── docs/                          # All documentation
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── runbooks/
│   │   ├── deployment.md
│   │   ├── disaster-recovery.md
│   │   └── ...
│   └── guides/
│
├── infrastructure/                # Infrastructure-as-Code
│   ├── docker-compose.yml         # SINGLE version
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── dashboard.Dockerfile
│   │   ├── bot.Dockerfile
│   │   └── ...
│   ├── config/                    # All configurations
│   │   ├── postgres.conf
│   │   ├── nginx.conf
│   │   └── ...
│   └── scripts/                   # Deployment/operational scripts
│       ├── deploy.sh              # SINGLE version
│       ├── backup.sh
│       └── ...
│
├── services/                      # All services in one place
│   ├── api/                       # FROM: wise-defense-saas/api
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── dashboard/                 # FROM: wise-defense-saas/dashboard v2
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── admin-dashboard/           # FROM: wise-defense-saas/admin-dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── bot/                       # FROM: wise-defense-saas/bot
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── worker/                    # NEW: Background jobs service
│       ├── src/
│       ├── package.json
│       └── Dockerfile
│
├── wise-os/                       # FROM: /Users/danielwise/Documents/wise-os
│   ├── src/
│   ├── install/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── automation/                    # Workflows, scheduling, etc.
│   ├── workflows/
│   ├── scripts/
│   └── templates/
│
├── hardware/                      # Hardware integration
│   ├── 3d-printing/
│   │   └── wisedefensedock/       # FROM: Desktop/3d print/wisedefensedock
│   ├── iot/
│   └── sensors/
│
├── ai/                           # AI integrations
│   ├── agents/
│   ├── prompts/
│   └── models/
│
├── raspberry-pi/                 # Raspberry Pi setup
│   ├── setup.sh
│   ├── configuration/
│   └── README.md
│
├── legacy/                       # Archive of old versions (optional)
│   ├── dashboard-v1/             # Old dashboard
│   ├── deploy-v4/                # Old deployment scripts
│   ├── deploy-v5/
│   └── README.md                 # Explanation of what's here & why
│
├── MASTER.md                     # Architecture (CREATED)
├── ROADMAP.md                    # Delivery timeline (CREATED)
├── DECISIONS.md                  # Architectural decisions (CREATED)
├── PROJECT_INDEX.md              # Component catalog (CREATED)
├── CURRENT_STATE.md              # Current status (CREATED)
├── NEXT_TASK.md                  # Immediate priorities (CREATED)
├── CHANGELOG.md                  # Version history (CREATED)
├── ECOSYSTEM_ANALYSIS.md         # This file
├── docker-compose.yml            # SINGLE version
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Consolidation Mapping

### What Moves Where

| Component | Source | Destination | Notes |
|-----------|--------|-------------|-------|
| API Backend | wise-defense-saas/api | wise2-core/services/api | Keep as-is, update docker |
| Dashboard v2 | wise-defense-saas/dashboard-v2 | wise2-core/services/dashboard | Remove v1 (obsolete) |
| Admin Dashboard | wise-defense-saas/admin-dashboard | wise2-core/services/admin-dashboard | Keep as-is |
| Discord Bot | wise-defense-saas/bot | wise2-core/services/bot | Keep as-is |
| Deploy Scripts | wise-defense-saas/deploy* | wise2-core/infrastructure/scripts | Keep latest (v6) only |
| Docker Config | wise-defense-saas/docker-compose* | wise2-core/docker-compose.yml | Consolidate versions |
| Docker Images | wise-defense-saas/deploy-engine/* | wise2-core/infrastructure/docker/ | Extract & standardize |
| Wise OS | Documents/wise-os | wise2-core/wise-os | Move with history |
| 3D Print Files | Desktop/3d print/wisedefensedock | wise2-core/hardware/3d-printing | Keep as-is |
| Recovery Docs | wise-recovery* | wise2-core/docs/runbooks/disaster-recovery | Archive & reference |

---

## 5. Duplicate Files & Technical Debt Identified

### Critical Duplicates

| File | Locations | Status | Action |
|------|-----------|--------|--------|
| docker-compose.yml | `.yml`, `.blue`, `.green`, `.backup`, `.bak` | **CRITICAL** | Keep one, delete others |
| deploy script | `deploy.sh`, `deploy-v4.sh`, `deploy-v5.sh`, `deploy-v6` | **CRITICAL** | Keep latest, archive others in `/legacy` |
| Configuration | Spread across dirs | **CRITICAL** | Centralize in `/infrastructure/config` |
| Environment setup | In multiple deploy scripts | **HIGH** | Consolidate in `/infrastructure/scripts` |

### Code Duplication Indicators

- API client code (likely in dashboard & admin-dashboard)
- Authentication logic (likely in multiple services)
- Utility functions (validation, formatting, etc.)
- Environment variable handling (across all services)
- Error handling patterns
- Logging setup

### Configuration Spread

- Docker-specific configs in multiple places
- Environment variables scattered
- Deployment parameters in scripts
- Service configurations mixed with code

---

## 6. Dependency Map

### Service Dependencies

```
┌─────────────────────────────────────────────────┐
│         External Services                       │
│  GitHub | Claude API | Discord | Backup Store  │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│      Shared Infrastructure                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐ │
│  │ PostgreSQL   │  │  Redis   │  │  Ollama  │ │
│  └──────────────┘  └──────────┘  └──────────┘ │
└────────────┬──────────────────────────────────┘
             │
    ┌────────┼────────┬──────────┬──────────┐
    │        │        │          │          │
┌───▼──┐ ┌──▼──┐ ┌───▼───┐ ┌───▼──┐ ┌────▼─┐
│ API  │ │Bot  │ │Dash   │ │Admin │ │Worker│
└──────┘ └─────┘ └───────┘ └──────┘ └──────┘
    │        │        │          │
    └────────┼────────┼──────────┘
             │
         ┌───▼───┐
         │Wise OS│
         └───────┘
```

### Current Interdependencies

**API** depends on:
- PostgreSQL (data)
- Redis (caching/sessions)
- Environment variables
- Authentication service (TBD)

**Dashboard** depends on:
- API endpoints
- Authentication
- Redis (sessions)

**Admin Dashboard** depends on:
- API endpoints
- Authentication
- Special permissions

**Discord Bot** depends on:
- API endpoints
- Discord API
- Configuration/secrets

**Wise OS** depends on:
- (Unclear - needs investigation)

---

## 7. Missing Documentation Inventory

### Critical Documentation Gaps

| Topic | Status | Priority | Owner |
|-------|--------|----------|-------|
| API Specification | ✗ Missing | **CRITICAL** | API owner |
| Database Schema | ✗ Missing | **CRITICAL** | DB owner |
| Authentication Flow | ✗ Missing | **CRITICAL** | Auth owner |
| Deployment Procedures | ✗ Scattered | **CRITICAL** | DevOps |
| Environment Setup | ✗ Scattered | **CRITICAL** | DevOps |
| Service Architecture | ✗ Missing | **HIGH** | CTO |
| Monitoring Setup | ✗ Missing | **HIGH** | Ops |
| Disaster Recovery | ⚠ Partial | **HIGH** | Ops |
| Discord Bot Setup | ⚠ Partial | **MEDIUM** | Bot owner |
| Dashboard Architecture | ✗ Missing | **MEDIUM** | Frontend |
| Wise OS Design | ✗ Missing | **MEDIUM** | OS owner |
| Configuration Reference | ✗ Missing | **MEDIUM** | DevOps |

---

## 8. Prioritized Migration Roadmap

### Phase A: Preparation (Week 1)

**Goal**: Understand current system before migration

- [ ] Audit wise-defense-saas completely
- [ ] Audit wise-os completely
- [ ] Document current deployment process
- [ ] Document current configuration
- [ ] Identify and catalog all dependencies
- [ ] Create detailed dependency diagrams
- [ ] Get stakeholder approval on consolidation plan
- [ ] Backup all repositories

**Deliverable**: Complete system understanding, no code changes yet

### Phase B: Foundation Setup (Week 1-2)

**Goal**: Prepare wise2-core to receive code

- [ ] Complete wise2-core documentation (DONE)
- [ ] Finalize folder structure
- [ ] Set up GitHub workflows
- [ ] Create CI/CD pipeline
- [ ] Set up testing infrastructure
- [ ] Configure monitoring

**Deliverable**: wise2-core ready to receive code

### Phase C: Service Migration (Week 2-3)

**Goal**: Move code from old repos to wise2-core

1. **API Service** (Week 2)
   - [ ] Copy code to `services/api`
   - [ ] Update docker configuration
   - [ ] Test with new docker-compose
   - [ ] Update documentation

2. **Dashboard** (Week 2)
   - [ ] Copy dashboard-v2 to `services/dashboard`
   - [ ] Remove dashboard-v1 (document in /legacy)
   - [ ] Archive admin-dashboard (if merging with main dashboard)
   - [ ] Update docker configuration

3. **Discord Bot** (Week 2)
   - [ ] Copy bot to `services/bot`
   - [ ] Update docker configuration
   - [ ] Update documentation

4. **Wise OS** (Week 3)
   - [ ] Copy wise-os to `wise2-core/wise-os`
   - [ ] Update documentation
   - [ ] Remove old repository link

**Deliverable**: All services in wise2-core, fully functional

### Phase D: Configuration Consolidation (Week 3)

**Goal**: Consolidate all configuration

- [ ] Extract all docker configuration to `infrastructure/docker`
- [ ] Consolidate environment variables in `.env.example`
- [ ] Create single `docker-compose.yml`
- [ ] Create single deployment script
- [ ] Test end-to-end deployment
- [ ] Archive all old deployment scripts in `/legacy`

**Deliverable**: Single source of truth for configuration

### Phase E: Documentation & Cleanup (Week 4)

**Goal**: Complete documentation and cleanup

- [ ] Create comprehensive deployment guide
- [ ] Document all services and their dependencies
- [ ] Create troubleshooting guide
- [ ] Document database schema
- [ ] Document API endpoints
- [ ] Create operational runbooks
- [ ] Archive legacy files properly
- [ ] Update all repository links/references

**Deliverable**: Complete documentation, ready for production

### Phase F: Cutover (Ongoing)

**Goal**: Switch primary development to wise2-core

- [ ] Set GitHub wise2-core as primary repository
- [ ] Archive old repositories (or set to read-only)
- [ ] Update team workflows
- [ ] Decommission old repository access
- [ ] Monitor for any issues

---

## 9. Risk Assessment & Mitigation

### High Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Service downtime during migration | Medium | Critical | Staging environment, test thoroughly |
| Data loss from consolidation | Low | Critical | Backup all repos before starting |
| Configuration incompatibilities | High | High | Test each service thoroughly |
| Lost deployment knowledge | Medium | High | Document all procedures thoroughly |
| GitHub merge conflicts | High | Medium | Careful sequential migration |

### Medium Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Team confusion during transition | Medium | Medium | Clear communication, documentation |
| Incomplete code migration | Low | Medium | Checklist and verification |
| Git history loss | Low | Medium | Keep old repos as archives |
| CI/CD pipeline breaks | Medium | Medium | Test pipeline thoroughly |

---

## 10. Resource Requirements

### Team Roles Needed

- **CTO/Lead Systems Engineer**: Overall coordination and architecture
- **Backend Developer**: API and service migration
- **Frontend Developer**: Dashboard migration
- **DevOps/Infrastructure**: Docker, CI/CD, deployment
- **QA/Testing**: Service testing and validation
- **Documentation**: Documentation and runbooks

### Time Estimate

- **Phase A (Preparation)**: 3-5 days
- **Phase B (Foundation)**: 3-5 days
- **Phase C (Service Migration)**: 5-7 days
- **Phase D (Configuration)**: 3-5 days
- **Phase E (Documentation)**: 5-7 days
- **Phase F (Cutover)**: Ongoing

**Total**: 4-6 weeks full-time equivalent

### Infrastructure

- Docker development environment
- GitHub repository access
- Testing environment (staging)
- Backup storage for archives

---

## 11. Approval Checklist

**Before proceeding with migration, the following must be approved**:

- [ ] Consolidation plan reviewed and approved
- [ ] Folder structure agreed upon
- [ ] Timeline acceptable
- [ ] Team resources allocated
- [ ] Backup strategy confirmed
- [ ] Cutover plan reviewed
- [ ] Stakeholder sign-off

**⚠️ DO NOT DELETE OR MOVE FILES UNTIL APPROVAL RECEIVED**

---

## 12. Next Steps

### Immediate (This Week)

1. **Review this analysis** — Ensure accuracy and completeness
2. **Identify stakeholders** — Who needs to approve?
3. **Get approval** — Confirm consolidation plan
4. **Allocate resources** — Assign team members
5. **Backup everything** — Full repository backups

### Upon Approval

1. **Start Phase A** — Complete system audit
2. **Refine timeline** — Get precise dates
3. **Create task list** — Break down work items
4. **Begin Phase B** — Prepare wise2-core

---

## Appendix A: Current wise-defense-saas Structure Detail

(Full directory tree - for reference)

```
wise-defense-saas/
├── .env.example
├── .env.lock, .env.save
├── .github/workflows/
├── admin-dashboard/                    # Admin UI
├── api/                                # REST API
│   ├── src/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── Dockerfile
├── bot/                                # Discord Bot
│   ├── src/
│   └── Dockerfile
├── ci-cd/                              # CI/CD config
├── dashboard/                          # Old UI (v1)
├── dashboard-v2/                       # Current UI (v2)
├── deploy/                             # Deployment tools
├── deploy-engine/                      # Deploy orchestration
├── deploy-v6/                          # Latest deployment version
├── docker-compose.yml                  # Production config
├── docker-compose.blue.yml             # Blue-green v1
├── docker-compose.green.yml            # Blue-green v2
├── docker-compose.yml.backup           # Backup copy
├── docker-compose.yml.bak              # Another backup
├── docker-compose.yml.bad              # Failed attempt
├── deploy.sh                           # Main deploy script
├── deploy-v4.sh                        # Old deploy (v4)
├── deploy-v5.sh                        # Old deploy (v5)
├── DEPLOYMENT.md
├── DISCORD_BOT_SETUP.md
├── DISCORD-CHAT-ALERTS.md
└── .gitignore
```

---

## Appendix B: Recommended Repository Archival

After successful migration to wise2-core:

1. **wise-defense-saas**
   - Set to read-only
   - Add notice: "This repository has been consolidated into wise2-core"
   - Keep for historical reference
   - Link to wise2-core/legacy

2. **wise-os** (original location)
   - Set to read-only
   - Point to wise2-core/wise-os
   - Archive as historical reference

3. **wise-recovery**
   - Archive as reference
   - Move content to wise2-core/docs/runbooks/disaster-recovery
   - Link from wise2-core

---

**Document Version**: 1.0
**Status**: AWAITING APPROVAL
**Last Updated**: 2026-07-07
**Author**: CTO / Lead Systems Engineer

⚠️ **IMPORTANT**: Do not proceed with any file deletions or moves until this analysis is reviewed and explicitly approved.
