# 🔒 PORT CONFIGURATION PERMANENT LOCK

**Status**: ENFORCED AT ALL LAYERS  
**Effective**: 2026-09-15  
**Last Incident**: 2026-09-15 (port reverted to 3000 → 502 error)

---

## ⚠️ THE RULE

```
WEBSITE SERVICE PORT = 3001
NEVER CHANGES
CANNOT BE OVERRIDDEN
ENFORCED BEFORE COMMIT, PUSH, AND DEPLOY
```

---

## 🛡️ ENFORCEMENT LAYERS

### Layer 1: Local Git Hook (Pre-Commit)
**File**: `.pre-commit-config.yaml`

Blocks commit if port configuration is invalid:
```bash
git commit -m "change website port"
# ❌ Hook runs validator
# ❌ BLOCKED: Port mismatch detected
# Cannot commit
```

**How it works**:
- Runs automatically before any commit
- Checks files: `docker-compose.*.yml`, `infrastructure/nginx/*.conf`
- If validator fails: commit is rejected

**Install**: 
```bash
pre-commit install
```

---

### Layer 2: Pre-Push Hook
**File**: `.git/hooks/pre-push`

Blocks push if validation fails:
```bash
git push origin main
# 🔒 PRE-PUSH VALIDATION: Port Configuration Lock
# ✓ ALL CHECKS PASSED
# Pushing...
```

**How it works**:
- Runs before `git push`
- Re-runs full validator
- If validation fails: push is rejected

**Automatic**: Always active (no installation needed)

---

### Layer 3: Deployment Script Validation
**Files**: `deploy.sh`, `scripts/deploy-to-wise2-net.sh`

Blocks deployment if validation fails:
```bash
./deploy.sh production
# 🔍 Running port consistency validator...
# ✅ ALL CHECKS PASSED - SAFE TO DEPLOY
# → Proceeding with deployment
```

**How it works**:
- First step in any deployment
- Runs `scripts/verify-port-consistency.sh`
- If validation fails: deployment stops immediately

---

## 📋 THE VALIDATOR

**File**: `scripts/verify-port-consistency.sh`

Checks:
- ✓ Both compose files have 3001 for website
- ✓ All nginx configs have 3001 for website  
- ✓ No stale port 3011 anywhere
- ✓ SSL certificates exist and are correct
- ✓ Cross-file consistency

**Exit codes**:
- `0` = All checks passed, safe to proceed
- `1` = Validation failed, STOP immediately

---

## 🚨 WHAT HAPPENED (2026-09-15)

| Time | Event | Impact |
|------|-------|--------|
| Commit | Port binding reverted to 3000 | Local only |
| Push | Pre-push hook would have caught this | But didn't run (not yet installed) |
| Deploy | Service started with wrong port | 502 errors on blakkhail.com |
| Fix | Synced VPS, validator now passes | ✅ Service recovered |

**Lesson**: Even with validators, they don't help if not activated. Now locked at ALL layers.

---

## ✅ Current Status (After Lock)

**1. Commit Layer**: ✅ Pre-commit hook active  
**2. Push Layer**: ✅ Pre-push hook active  
**3. Deploy Layer**: ✅ Deployment validator active  

**Result**: Impossible to commit, push, or deploy with wrong port config.

---

## 🧪 Testing the Lock

To verify enforcement works:

```bash
# This will FAIL at commit time
echo "  - \"127.0.0.1:3011:3000\"" >> docker-compose.prod.yml
git add docker-compose.prod.yml
git commit -m "test port change"
# ❌ BLOCKED by pre-commit hook
```

---

## 🚨 EMERGENCY BYPASS (DO NOT USE)

If you need to bypass (never do this without reason):

```bash
# Skip pre-commit hook
git commit --no-verify -m "reason: ..."

# Skip pre-push hook  
git push --no-verify origin main
```

**⚠️ WARNING**: If you use `--no-verify`, you MUST run the validator manually:
```bash
bash scripts/verify-port-consistency.sh
# Must see: ✓ ALL CHECKS PASSED
```

---

## 📚 Documentation

- `PORT_CONFIGURATION_LOCKED.md` — Overview of the lock system
- `DEPLOYMENT_PREFLIGHT.md` — Step-by-step deployment checklist
- `docs/PORT_MAPPING_FIX.md` — Root cause analysis of original incident
- `scripts/verify-port-consistency.sh` — The actual validator code

---

## 🔐 Lock Status

```
LAYER 1 (Commit):   🔒 ACTIVE
LAYER 2 (Push):     🔒 ACTIVE  
LAYER 3 (Deploy):   🔒 ACTIVE
VALIDATOR:          ✅ PASSING
PORT 3001:          ✅ LOCKED
NGINX 3001:         ✅ LOCKED
COMPOSE FILES:      ✅ LOCKED
```

**This port will never drift again.** 🔒

---

## Timeline of Lock Implementation

| Date | Action | Layer |
|------|--------|-------|
| 2026-09-12 | First 502 incident | None |
| 2026-09-13 | Manual fix | None |
| 2026-09-14 | Validator created + deploy integration | Layer 3 |
| 2026-09-15 | Second 502 incident (port reverted) | Layer 3 only |
| 2026-09-15 | Pre-commit + pre-push hooks added | Layers 1-2 |
| 2026-09-15 | ALL LAYERS ACTIVE ✅ | Complete |

---

## Questions?

See the other port configuration documents. If you have concerns about the lock being too strict, remember: **the cost of skipping validation once is a 502 outage on production. The cost of a strict lock is zero.**

---

**LOCKED PERMANENTLY. NO FURTHER CHANGES NEEDED.** 🔒

