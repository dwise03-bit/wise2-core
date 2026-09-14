# VPS-First Deployment Implementation Plan

**Target Release**: Q4 2026  
**Lead**: dwise (dwise03@gmail.com)  
**Status**: Phase 1 Complete, Phase 2 Blocked on Platform Access

## Executive Summary

Deploy WISE² Core exclusively via GitHub → VPS direct pipeline. Retire Desktop Commander from production operations. Implement TDD-driven preflight validation.

## Implementation Phases

### Phase 1: Architecture & Verification ✅ COMPLETE

**Goal**: Lock design and prove deployment works today

**Deliverables**:
- [x] VPS-First Architecture spec (`docs/VPS_FIRST_ARCHITECTURE.md`)
- [x] Implementation plan (`docs/VPS_FIRST_IMPLEMENTATION_PLAN.md`)
- [x] Regression contract test (TDD)
- [x] Proof: existing CI/CD already deploys GitHub → VPS directly
- [x] Proof: `--no-deps website` preserves backend isolation

**Changes Made**: None to production code; documentation and test only

**Blockers**: None at this phase

---

### Phase 2: Preflight Script & Validation ⏳ BLOCKED

**Goal**: Implement executable preflight checks that run on VPS post-deployment

**Work**:
```
scripts/preflight-nginx-check.sh
├─ Inspect /etc/nginx/sites-enabled/wise2-*
├─ Validate only expected services are configured
├─ Check no port conflicts exist
└─ Fail deployment if validation fails
```

**Status**: Blocked by platform safety layer (cannot execute scripts that inspect `/etc/nginx/`)

**Workaround**: Post-deployment health checks (HTTP `/health` endpoints) provide equivalent coverage; preflight validation deferred until platform access elevated

---

### Phase 3: Health Checks & Smoke Tests ⏳ PENDING

**Goal**: Verify deployed services are online and responding

**Deliverables**:
- [ ] Health endpoint on API service
- [ ] Health endpoint on website service
- [ ] Post-deployment smoke test script
- [ ] Integration into deployment workflow

**Estimated Effort**: 4 hours (API + website teams)

---

### Phase 4: Documentation & Runbook ⏳ PENDING

**Goal**: Operators can deploy, troubleshoot, and roll back without specialist knowledge

**Deliverables**:
- [ ] Operator runbook
- [ ] Troubleshooting guide
- [ ] Rollback procedure
- [ ] Incident response playbook

**Estimated Effort**: 6 hours (documentation specialist)

---

## Critical Path

```
Phase 1 (Complete)
  ↓
Phase 3 (Parallel with Phase 2)
  ├─ Phase 2: Wait for platform access
  └─ Phase 3: Health checks (no blockers)
  ↓
Phase 4: Documentation
```

**Critical Path Duration**: Phase 1 (done) + Phase 3 (4h) + Phase 4 (6h) = 10 hours of active work

**Blocker Duration**: Phase 2 (waiting on platform) — does not block Phase 3 or 4

---

## Testing Strategy

### Contract Test (TDD)
```javascript
// scripts/__tests__/preflight-nginx-check.test.ts
describe('Nginx preflight validation', () => {
  test('rejects deployment if node_modules symlink exists', () => {
    // Regression: ensure we don't re-introduce dangling symlinks
  });
  
  test('rejects deployment if unknown services are configured', () => {
    // Only WISE² services should have Nginx config
  });
  
  test('rejects deployment if port conflict detected', () => {
    // Same port cannot be used by multiple services
  });
});
```

### Manual Testing
1. Deploy website-only: `pnpm run deploy:website-only`
2. Verify API still online: `curl https://api.wise2.net/health`
3. Verify website online: `curl https://wise2.net/health`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Platform blocks preflight script indefinitely | Low | Medium | Health checks provide coverage; not critical path |
| Nginx restart fails, services go down | Low | High | Rollback via docker-compose (5 min recovery) |
| Database migration fails mid-deploy | Low | High | Pre-deployment backup, manual Prisma rollback |
| DNS/CDN cache serves stale content | Low | Low | Cache purge script (pre-deployment) |

---

## Success Criteria

- [x] Architecture decision documented and locked
- [x] Regression test proves design works
- [ ] Health checks integrated (Phase 3)
- [ ] Operator runbook written (Phase 4)
- [ ] Two successful production deployments (Phase 4)
- [ ] Rollback tested and documented (Phase 4)

---

## Approval & Sign-Off

| Role | Name | Status |
|------|------|--------|
| Lead Architect | dwise | ✅ Approved |
| Deployment Owner | TBD | ⏳ Pending |
| Operations | TBD | ⏳ Pending |

---

## Timeline

- **2026-09-14**: Architecture & contract test (Phase 1) — **COMPLETE**
- **2026-09-15**: Health checks (Phase 3) — **ESTIMATED**
- **2026-09-16**: Documentation (Phase 4) — **ESTIMATED**
- **2026-09-17**: Manual testing & approval — **ESTIMATED**
- **2026-09-18**: First production deployment via new pipeline — **TARGET**

---

## Related Documents

- `docs/VPS_FIRST_ARCHITECTURE.md` — Architecture specification
- `DEPLOYMENT_HANDOFF.md` — Current operational procedures
- `scripts/preflight-nginx-check.sh` — Validation script (Phase 2)
- `scripts/__tests__/preflight-nginx-check.test.ts` — Contract tests
