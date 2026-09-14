# ⚠️ PORT CONFIGURATION LOCKED

**Status**: LOCKED & ENFORCED ✅  
**Effective**: 2026-09-14  
**Lock Mechanism**: Automated validation required before ANY deployment

---

## 🔒 IMMUTABLE LOCK

### Website Service MUST Use Port 3001

```
┌────────────────────────────────────────────────────────────┐
│                   LOCKED PORT: 3001                        │
│                                                            │
│  This value CANNOT be changed without breaking production  │
│  All systems depend on this single source of truth        │
└────────────────────────────────────────────────────────────┘
```

**Files that declare this port:**
- ✅ `docker-compose.prod.yml` (line 137): `- "0.0.0.0:3001:3000"`
- ✅ `docker-compose.production.yml`: `- "0.0.0.0:3001:3000"`
- ✅ `infrastructure/nginx/blakkhail.com.conf`: upstream → 127.0.0.1:3001
- ✅ `infrastructure/nginx/wise2.net.conf`: upstream → 127.0.0.1:3001

**Forbidden values:**
- ❌ 3011 (old stale port — causes 502 errors)
- ❌ 3000 (reserved for internal Docker container port only)
- ❌ Any other value

---

## 🛡️ ENFORCEMENT MECHANISM

### Automatic Validation (RUNS BEFORE EVERY DEPLOYMENT)

```bash
# This script blocks deployment if validation fails
bash scripts/verify-port-consistency.sh
```

**Integrated into:**
- ✅ `deploy.sh` — runs at start
- ✅ `scripts/deploy-to-wise2-net.sh` — runs at start
- ✅ All future deployment scripts MUST call this

**If validation fails:**
- Deployment is **BLOCKED**
- No Docker commands run
- No nginx configs change
- Operator must fix config before retry

---

## 📋 Verification Checklist

**Before any deployment:**

- [ ] Run: `bash scripts/verify-port-consistency.sh`
- [ ] Output should say: `✓ ALL CHECKS PASSED - SAFE TO DEPLOY`
- [ ] If validation fails: DO NOT DEPLOY. Fix configuration first.

**After deployment:**

- [ ] Test: `curl -I https://blakkhail.com` → HTTP/2 200
- [ ] Test: `curl -I https://wise2.net` → HTTP/2 200
- [ ] Verify: `ssh dwise@173.208.147.165 "docker ps" | grep website` → Running

---

## 🚨 What Happened (History)

| Date | Event | Resolution |
|------|-------|-----------|
| 2026-09-12 | First 502 error: port 3011 vs 3001 mismatch | Manual fix |
| 2026-09-13 | Recurred after deployment | Manual fix again |
| 2026-09-14 | **Third occurrence** — automated lock implemented | ✅ DONE |

**Root Cause**: Configuration drift between docker-compose files and nginx configs. Manual fixes kept failing because the source files had inconsistent values.

**Solution**: Automated validation that PREVENTS deployment when ports don't match.

---

## 🔧 How This Works

### 1. Port Consistency Validator
File: `scripts/verify-port-consistency.sh`

Checks:
- ✓ Both compose files have 3001 for website
- ✓ All nginx configs have 3001 for website
- ✓ No stale port 3011 anywhere
- ✓ SSL certificates exist and are correctly referenced
- ✓ Cross-file port consistency

Runs: 5-10 seconds  
Exits with code: 0 (success) or 1 (failure)

### 2. Deployment Script Integration
Files: `deploy.sh`, `scripts/deploy-to-wise2-net.sh`

Before ANY deployment step:
1. Call `bash scripts/verify-port-consistency.sh`
2. If exit code = 1: STOP and display error message
3. If exit code = 0: Continue with deployment

### 3. Pre-Flight Checklist
File: `DEPLOYMENT_PREFLIGHT.md`

Manual verification steps for operators:
- Run validator
- Check git status for port-related changes
- Test nginx config
- Verify service health
- Test endpoints

---

## 📖 Documentation References

- `docs/PORT_MAPPING_FIX.md` — Full incident analysis and root cause
- `DEPLOYMENT_PREFLIGHT.md` — Step-by-step deployment checklist
- `scripts/verify-port-consistency.sh` — Automated validator source code

---

## ⚡ Emergency Procedures

### If Port Validator Fails

**Do NOT deploy.** Instead:

1. Check what changed:
   ```bash
   git diff docker-compose.*.yml infrastructure/nginx/
   ```

2. Revert to known-good state:
   ```bash
   git checkout docker-compose.prod.yml docker-compose.production.yml
   git checkout infrastructure/nginx/blakkhail.com.conf infrastructure/nginx/wise2.net.conf
   ```

3. Re-run validator:
   ```bash
   bash scripts/verify-port-consistency.sh
   ```

4. Deploy once it passes

### If Production Service Goes Down

1. Verify current state:
   ```bash
   curl -I https://blakkhail.com   # Should show HTTP response
   ssh dwise@173.208.147.165 "docker ps" | grep website
   ```

2. Check nginx config:
   ```bash
   ssh dwise@173.208.147.165 "grep -A 2 'upstream blakkhail_website' /etc/nginx/sites-enabled/blakkhail.com.conf"
   ```

3. Expected output:
   ```
   upstream blakkhail_website {
       server 127.0.0.1:3001;
   }
   ```

If you see `3011` or any other port: **IMMEDIATELY FIX IT**

```bash
ssh dwise@173.208.147.165 "sudo sed -i 's/:3011/:3001/' /etc/nginx/sites-enabled/blakkhail.com.conf && sudo nginx -t && sudo systemctl reload nginx"
```

---

## 👁️ Monitoring

### What to Watch

**Every deployment should:**
- ✅ See validator run at the start
- ✅ See `✓ ALL CHECKS PASSED - SAFE TO DEPLOY`
- ✅ Continue with deployment steps

**If you ever see:**
- ❌ Validator failed message → STOP
- ❌ 502 error from production → Check nginx config immediately

### Automated Checks

The deployment scripts now verify this automatically. You don't need to manually check. But manual verification is available anytime:

```bash
bash scripts/verify-port-consistency.sh
```

---

## ✅ Verification (2026-09-14)

All systems locked and tested:

```
🐳 docker-compose.prod.yml:        ✓ port 3001
🐳 docker-compose.production.yml:  ✓ port 3001
🌐 blakkhail.com.conf:             ✓ upstream 3001
🌐 wise2.net.conf:                 ✓ upstream 3001
🔒 SSL certificates:               ✓ correct paths
🚀 Deployment scripts:             ✓ validator integrated
✅ Live endpoints:                 ✓ HTTP 200
```

---

## Questions?

See the full incident details in `docs/PORT_MAPPING_FIX.md`

**One rule to remember:**

```
WEBSITE USES PORT 3001
NO EXCEPTIONS
NO OTHER VALUES
NEVER CHANGES
```

