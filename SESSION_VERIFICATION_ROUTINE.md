# Session Verification Routine

**MANDATORY:** This routine must run at the start of EVERY session before any work is claimed complete.

## ✅ Pre-Work Verification Checklist

### 1. **Git Status Check**
```bash
git status
git log --oneline -5
git branch -vv
```
**Verify:**
- [ ] Working directory is clean (no uncommitted changes)
- [ ] Branch is correct (`claude/petals-potions-build-guu0cb`)
- [ ] Branch is tracking origin
- [ ] Latest commit is visible

### 2. **Code Existence Verification**
```bash
ls -la apps/petals-potions/web/
cat apps/petals-potions/web/package.json | head -10
cat apps/petals-potions/web/src/app/page.tsx | head -5
```
**Verify:**
- [ ] Web app directory exists
- [ ] package.json exists and is valid
- [ ] Key source files exist (page.tsx, layout.tsx, etc.)
- [ ] Components directory is populated

### 3. **Port Conflict Check** (Before deploying)
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3003
```
**Verify:**
- [ ] Port 3000: Expected service running (or free)
- [ ] Port 3001: Identify what's using it (nginx expected)
- [ ] Port 3003: MUST be free for Petals & Potions

### 4. **Environment Configuration**
```bash
cat apps/petals-potions/web/.env.local 2>/dev/null || echo "No .env.local found"
cat apps/petals-potions/web/.env.production 2>/dev/null || echo "No .env.production found"
```
**Verify:**
- [ ] Environment files are set up (or understand why they're missing)
- [ ] API_URL is correctly configured
- [ ] Stripe keys are available (for production)

### 5. **Deployment Configuration Verification**
```bash
cat apps/petals-potions/docker-compose.prod.yml
cat apps/petals-potions/Dockerfile.prod
cat infrastructure/nginx/conf.d/petals-potions.conf
```
**Verify:**
- [ ] docker-compose.prod.yml defines port 3003
- [ ] Dockerfile.prod exposes correct port
- [ ] Nginx config routes to port 3003
- [ ] No hardcoded localhost - uses variables

### 6. **Dependency Check**
```bash
cd apps/petals-potions/web
npm list --depth=0 | head -20
```
**Verify:**
- [ ] Dependencies are installed (or npm install has been run)
- [ ] No major version conflicts
- [ ] Required packages present (next, react, tailwindcss)

### 7. **Build Verification** (If making code changes)
```bash
cd apps/petals-potions/web
npm run build 2>&1 | tail -20
```
**Verify:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Output includes `.next` build directory

### 8. **Deployment Script Check**
```bash
ls -la apps/petals-potions/*.sh
head -20 apps/petals-potions/deploy.sh
head -20 apps/petals-potions/DEPLOYMENT_VERIFIED.sh
```
**Verify:**
- [ ] Deployment scripts exist
- [ ] Scripts are executable (chmod +x)
- [ ] Scripts don't have hardcoded paths that won't work on VPS

---

## 🚀 Post-Work Verification Checklist

### 9. **Commit Verification**
```bash
git status  # Should be clean
git log --oneline -1
git log --name-status -1 | head -20
```
**Verify:**
- [ ] All changes are committed
- [ ] Commit message is descriptive
- [ ] Related files are included in commit

### 10. **Push Verification**
```bash
git push -u origin claude/petals-potions-build-guu0cb
git branch -vv  # Should show [origin/...] with no divergence
```
**Verify:**
- [ ] Branch is pushed to origin
- [ ] No merge conflicts
- [ ] GitHub PR #40 reflects latest commit

### 11. **Remote Deployment Check** (On VPS)
```bash
# SSH to VPS
ssh dwise@173.208.147.165

# On VPS:
cd /home/dwise/wise2-core
git fetch origin
git checkout claude/petals-potions-build-guu0cb
ls -la apps/petals-potions/web/
```
**Verify:**
- [ ] Code can be pulled on VPS
- [ ] Files exist after checkout
- [ ] No path issues

### 12. **Port Conflict Verification** (On VPS)
```bash
# On VPS:
sudo lsof -i :3000 :3001 :3003
docker ps | grep -i petals
```
**Verify:**
- [ ] No conflicts with 3003
- [ ] No old petals-potions containers running
- [ ] Ports are as expected

### 13. **Deployment Execution** (On VPS)
```bash
# On VPS:
bash /home/dwise/wise2-core/apps/petals-potions/DEPLOYMENT_VERIFIED.sh
```
**Verify output:**
- [ ] ✓ Deploy path exists
- [ ] ✓ Port 3003 is free
- [ ] ✓ Branch checks pass
- [ ] ✓ Code exists
- [ ] ✓ Dependencies install
- [ ] ✓ Build succeeds
- [ ] ✓ Server starts
- [ ] ✓ Health check passes
- [ ] ✓ Nginx configured

### 14. **Live Verification** (On VPS)
```bash
# On VPS:
curl -I http://localhost:3003/
curl -I http://petals-potions.wise2.io/
```
**Verify:**
- [ ] HTTP 200 response
- [ ] Page loads through nginx
- [ ] No 502 Bad Gateway errors

### 15. **Performance Check** (On VPS)
```bash
# On VPS:
ps aux | grep "next"
top -p $(pgrep -f "next start" | head -1)
lsof -p $(pgrep -f "next start" | head -1) | wc -l
```
**Verify:**
- [ ] Process is running
- [ ] CPU/Memory usage is reasonable
- [ ] No zombie processes

### 16. **Log Review** (On VPS)
```bash
# On VPS:
tail -50 /tmp/petals-potions.log
docker logs petals-potions-web 2>/dev/null | tail -20 || echo "No container logs"
```
**Verify:**
- [ ] No error messages
- [ ] No permission issues
- [ ] Startup was clean

---

## ❌ Common Failures to Check

### "Port 3003 already in use"
```bash
# On VPS:
lsof -i :3003
kill -9 <PID>
# Then retry deployment
```

### "Branch not found"
```bash
git fetch origin claude/petals-potions-build-guu0cb
# Ensure branch is pushed
```

### "npm install fails"
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "Next.js build fails"
```bash
npm run build 2>&1 | grep "error TS"
# Fix TypeScript errors in source
```

### "Server won't start"
```bash
tail -100 /tmp/petals-potions.log
# Check for PORT already in use, missing env vars, etc.
```

### "nginx 502 Bad Gateway"
```bash
# Check if server is actually running
curl http://localhost:3003/

# Check nginx config
sudo nginx -t

# Check nginx logs
sudo tail -50 /var/log/nginx/petals-potions-error.log
```

---

## 📋 Session Completion Checklist

Before claiming work is done:

- [ ] All 16 verifications above have passed
- [ ] No uncommitted changes exist
- [ ] Branch is pushed to GitHub
- [ ] PR shows latest commits
- [ ] Deployment script has been tested on VPS
- [ ] Live demo is accessible
- [ ] Logs show no errors
- [ ] Documentation is updated
- [ ] README reflects current status

---

## 🔄 Automated Verification Script

Instead of manual checks, run:

```bash
# Local verification
bash apps/petals-potions/verify-local.sh

# Remote verification (on VPS)
ssh dwise@173.208.147.165 'bash /home/dwise/wise2-core/apps/petals-potions/verify-remote.sh'

# Full deployment with verification
bash apps/petals-potions/DEPLOYMENT_VERIFIED.sh
```

---

**Last Updated:** 2026-08-20  
**Status:** MANDATORY ROUTINE  
**Never Skip:** Port checks, deployment verification, live testing

If ANY check fails, STOP and debug before claiming work is done.
