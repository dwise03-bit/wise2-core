# WISE² Deployment Pre-Flight Checklist

**🚨 CRITICAL: This must pass before ANY deployment to production.**

## Port Configuration Lock (NON-NEGOTIABLE)

```
WEBSITE MUST ALWAYS BIND TO PORT 3001
NEVER CHANGE THIS VALUE
```

| Component | File | Port | Status |
|-----------|------|------|--------|
| Website | docker-compose.prod.yml | 3001 | 🔒 LOCKED |
| Website | docker-compose.production.yml | 3001 | 🔒 LOCKED |
| Website nginx upstream | infrastructure/nginx/blakkhail.com.conf | 3001 | 🔒 LOCKED |
| Website nginx upstream | infrastructure/nginx/wise2.net.conf | 3001 | 🔒 LOCKED |

**If you see port 3011 anywhere: STOP. Do not deploy. Fix it first.**

---

## Pre-Deployment Validation

### Step 1: Run Port Consistency Validator
```bash
bash scripts/verify-port-consistency.sh
```

**Expected Output**: `✓ ALL CHECKS PASSED - SAFE TO DEPLOY`

**If it fails**: Do NOT proceed. Fix the issue and run again until it passes.

### Step 2: Verify No Uncommitted Port Changes
```bash
git status
git diff --name-only
```

**Look for**: `docker-compose.*.yml` or `infrastructure/nginx/*.conf`

If these files were modified and the validator doesn't pass, revert:
```bash
git checkout docker-compose.prod.yml docker-compose.production.yml
git checkout infrastructure/nginx/blakkhail.com.conf infrastructure/nginx/wise2.net.conf
```

### Step 3: Nginx Config Test (VPS)
```bash
ssh dwise@173.208.147.165 "sudo nginx -t"
```

**Expected Output**: `configuration file /etc/nginx/nginx.conf syntax is ok`

### Step 4: Service Health Check (VPS)
```bash
ssh dwise@173.208.147.165 "docker ps | grep -E 'website|admin|command'"
```

**All three should show**: `Up` status

### Step 5: Live Endpoint Verification
```bash
curl -I https://blakkhail.com    # Should return HTTP/2 200
curl -I https://wise2.net         # Should return HTTP/2 200
```

---

## Common Mistakes (DO NOT DO)

❌ **Changing website port** to 3011 or any other value  
❌ **Let's Encrypt paths** in nginx (/etc/letsencrypt/live) — use /etc/nginx/ssl/  
❌ **Assuming** port 3011 is still in use somewhere  
❌ **Skipping** the validator because "it's just a small change"  
❌ **Restarting nginx** without running validator first  

---

## Quick Commands

**Check current state**:
```bash
bash scripts/verify-port-consistency.sh
```

**Emergency revert** (if deployment fails):
```bash
git checkout docker-compose.prod.yml docker-compose.production.yml infrastructure/nginx/
ssh dwise@173.208.147.165 "sudo systemctl reload nginx"
```

**View locked values**:
```bash
cat docs/PORT_MAPPING_FIX.md
cat scripts/verify-port-consistency.sh | grep -A 10 "LOCKED VALUES"
```

---

## What Changed (2026-09-14)

This checklist was created after the 3rd occurrence of a 502 error caused by port mismatches.

- Commit e7a46b06: Fixed all port mismatches (3011 → 3001)
- Commit 9ec1fa6e: Added documentation
- Created: scripts/verify-port-consistency.sh (validates before deploy)
- Created: This file (DEPLOYMENT_PREFLIGHT.md)

All future deployments must validate using this checklist.

---

## Questions?

See: `docs/PORT_MAPPING_FIX.md` for full incident details and root cause analysis.

