# 🚨 DEPLOYMENT SAFETY AUDIT - CRITICAL ISSUES FOUND

**Date**: 2026-09-20  
**Status**: UNSAFE - DO NOT DEPLOY AS DOCUMENTED  
**Severity**: HIGH (Production Impact)

---

## Critical Issues Found

### 1. ❌ docker-compose.prod.yml Labels Itself LEGACY

**File**: `docker-compose.prod.yml` (Line 1)
```yaml
# WISE² Customer Journey Compose (LEGACY — referenced by deploy.sh, deploy-prod, deploy-to-server)
```

**Problem**: 
- We're documenting a LEGACY file as the production deployment method
- If it's legacy, there should be a non-legacy replacement
- Unknown what's current vs. what's deprecated

**Impact**: Deploying from legacy config risks using outdated services/settings

**Action Required**: 
- [ ] Identify the CURRENT production docker-compose file
- [ ] Document which file should be used
- [ ] Remove references to deprecated files

---

### 2. ❌ Port Mismatch: Scripts vs. Compose

**Script**: `scripts/deploy-to-wise2-net.sh` (Line ~50)
```bash
API_PORT="3014"        # Non-standard to avoid conflicts
WEB_PORT="3015"        # Non-standard to avoid conflicts
```

**Compose**: `docker-compose.prod.yml` (Line 137)
```yaml
website:
  ports:
    - "0.0.0.0:3001:3000"  # ← Website on 3001, not 3015
```

**Problem**:
- Script expects website on 3015, but compose runs it on 3001
- Port governance rule says 3001 is locked for website
- Deploying from script would create port conflict

**Impact**: Deployment fails with "port already in use" error

**Action Required**:
- [ ] Audit all deploy scripts for port consistency
- [ ] Ensure all scripts reference correct ports (3001 for website, 3010 for API)
- [ ] Document port mappings centrally

---

### 3. ❌ Dangerous Cleanup Command

**In DEPLOYMENT_GUIDE_FOR_DARRIN.md** (Step 3):
```bash
sudo docker system prune -af
```

**Problem**:
- `-a` flag removes ALL images, including rollback images
- If deployment fails, Darrin can't rollback because images are deleted
- No safety prompt or confirmation

**Impact**: 
- Failed deployment → can't rollback → must rebuild from scratch
- 5-minute deployment becomes 30-minute emergency

**Action Required**:
- [ ] Remove `-a` flag (keep only orphaned containers/networks)
- [ ] Or replace with targeted cleanup:
  ```bash
  sudo docker container prune -f
  sudo docker network prune -f
  ```

---

### 4. ❌ Node Version Mismatch

**Dockerfile.api**: Uses Node 18
```dockerfile
FROM node:18-alpine
```

**package.json**: Requires Node 20+
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Problem**:
- Docker builds with Node 18, but app requires 20+
- App may fail at runtime with cryptic errors
- Tests might pass (in CI with Node 20) but fail in production (Node 18)

**Impact**: 
- Runtime errors in production that weren't caught in testing
- Inconsistent behavior between CI and production

**Action Required**:
- [ ] Update all Dockerfiles to use Node 20
- [ ] Update base images consistently across all services
- [ ] Test build in Node 20 environment

---

### 5. ❌ PR #100 Not Merged (Missing Living Core)

**Current**: `main` branch is behind `PR #100`

**Problem**:
- Deployment guide assumes main = production-ready
- But Living Core work (PR #100) is unmerged
- Production would deploy old code
- Darrin wouldn't have latest features/fixes

**Impact**:
- Production version lags behind development
- Features deployed to test but not production
- Increased bug risk

**Action Required**:
- [ ] Merge PR #100 to main (if approved)
- [ ] Or explicitly document that production runs without PR #100
- [ ] Add pre-deployment check to verify PR status

---

## Deployment Paths

### Current State (UNSAFE)
```
Deployment Guide (DEPLOYMENT_GUIDE_FOR_DARRIN.md)
  ↓
docker-compose.prod.yml (LEGACY label)
  ↓
Dangerously deletes rollback images
  ↓
Node 18 vs 20 mismatch
  ↓
PR #100 not merged
  ↓
PRODUCTION RISK 🚨
```

### Recommended Safe Path

**Option A: Fix everything first (Recommended)**
1. Create safety PR that fixes all issues
2. Merge PR #100 to include Living Core
3. Update Dockerfiles to Node 20
4. Remove `-a` flag from cleanup
5. Document current production compose file
6. Then deploy

**Option B: Minimal safe deployment (Temporary)**
1. Don't delete rollback images: `docker container prune -f` only
2. Manually verify Node version before deployment
3. Document known issues
4. Fix properly next week

---

## Recommended Actions (Priority Order)

### BLOCKING (Must fix before Darrin deploys)
- [ ] **Fix 1**: Change cleanup to not delete images
- [ ] **Fix 2**: Verify which compose file is actually used in production
- [ ] **Fix 3**: Test deployment locally with correct Node version
- [ ] **Fix 4**: Merge PR #100 if it's production-ready

### URGENT (Fix this week)
- [ ] **Fix 5**: Create production compose file that's not labeled LEGACY
- [ ] **Fix 6**: Update all Dockerfiles to Node 20
- [ ] **Fix 7**: Audit all deploy scripts for port consistency
- [ ] **Fix 8**: Add pre-deployment validation step

### IMPORTANT (Next sprint)
- [ ] Document production vs. staging vs. development deployment paths
- [ ] Add CI check that enforces Node version consistency
- [ ] Add automated port consistency validation to pre-push hook

---

## What Darrin Should Do NOW

**Do NOT deploy** until these are fixed. Instead:

1. **Verify current production state**:
   ```bash
   ssh dwise@173.208.147.165
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml ps | grep website
   ```
   Check what port website is actually running on.

2. **Wait for safety PR**:
   - We'll create a PR that fixes all these issues
   - It will include a corrected deployment guide
   - Darrin can deploy confidently once merged

3. **Verify PR #100 status**:
   - Is it approved?
   - Is it ready for production?
   - If yes, merge before deploying

---

## Summary

| Issue | Severity | Risk | Fix Time |
|-------|----------|------|----------|
| Cleanup deletes rollback images | 🔴 HIGH | Can't recover from failed deploy | 5 min |
| LEGACY label on compose file | 🔴 HIGH | Using deprecated config | 30 min |
| Node 18 vs 20 mismatch | 🔴 HIGH | Runtime failures in prod | 20 min |
| Port mismatch in scripts | 🟠 MEDIUM | Deployment fails to start | 45 min |
| PR #100 not merged | 🟠 MEDIUM | Old code in production | 10 min (merge only) |

**Total fix time**: ~2 hours for a complete, safe deployment path.

---

## Next Steps

**Recommend**: Create safety PR that:
1. ✅ Fixes dangerous cleanup command
2. ✅ Documents current production compose file
3. ✅ Updates all Dockerfiles to Node 20
4. ✅ Audits all deploy scripts for consistency
5. ✅ Merges PR #100 if approved
6. ✅ Updates deployment guide with verified safe path

Then Darrin can deploy with confidence.
