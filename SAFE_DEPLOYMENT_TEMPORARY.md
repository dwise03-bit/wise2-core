# ✅ SAFE DEPLOYMENT PATH (Temporary - Until Safety PR Merged)

**Valid until**: Safety PR is merged  
**Status**: Verified safe for production use  
**Created**: 2026-09-20

---

## ⚠️ CRITICAL: Read This First

The main deployment guide has safety issues. **Use this instead until the safety PR is merged.**

This path is safe because it:
- ✅ Preserves rollback images (doesn't use `-a` flag)
- ✅ Uses verified production compose file
- ✅ Includes safety checks before deployment
- ✅ Has recovery procedures

---

## Pre-Deployment Safety Checks (5 min)

**MUST complete before deploying:**

```bash
# 1. Verify you're on main branch
cd /home/dwise/wise2-core
git status
# Expected: "On branch main" and "nothing to commit"

# 2. Verify production compose file exists and is not labeled LEGACY
grep -n "LEGACY\|CURRENT\|PRODUCTION" docker-compose.prod.yml | head -5
# Expected: Shows the file type/status

# 3. Verify current services are running
sudo docker-compose -f docker-compose.prod.yml ps
# Expected: All containers show "Up" or "Up (healthy)"

# 4. Check disk space (need at least 5GB free)
df -h / | grep -v Filesystem
# Expected: "Use%" column < 80%

# 5. Verify no uncommitted changes in repo
git diff --stat
# Expected: (empty - no output)
```

**If any check fails**: Stop and fix it before proceeding.

---

## Safe Deployment Steps

### Step 1: Pull Latest Code (1 min)

```bash
cd /home/dwise/wise2-core
git pull origin main

# Verify the pull worked
git log -1 --oneline
# Should show recent commit from dwise
```

### Step 2: Stop Services Safely (1 min)

```bash
# Stop all services (keeps data and volumes)
sudo docker-compose -f docker-compose.prod.yml down

# Verify all stopped
sudo docker ps
# Expected: No WISE² containers listed
```

**Important**: This does NOT delete:
- Database data (in volumes)
- Redis cache (in volumes)
- Configuration files
- Environment variables

All are preserved and will be reused on restart.

### Step 3: Build & Start (3 min)

```bash
# Build and start services
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Watch the build (optional, press Ctrl+C to stop)
sudo docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Wait for Health Checks (2 min)

```bash
# Wait 60 seconds for services to stabilize
sleep 60

# Verify all services are healthy
sudo docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                  STATUS
# wise2-db              Up (healthy)
# wise2-api             Up (healthy)
# wise2-website         Up (healthy)
# wise2-nginx           Up (healthy)
# [other services]      Up or Up (healthy)
```

**STOP if any service shows**:
- `Exited` — Service crashed (check logs)
- `Unhealthy` — Health check failing (check logs)
- `Up (health: starting)` — Still starting (wait 30 more seconds)

### Step 5: Test Endpoints (1 min)

```bash
# Test API health
curl -s https://api.wise2.net/api/health | head -20
# Expected: 200 OK, JSON response

# Test website
curl -s https://wise2.net/ | head -20
# Expected: 200 OK, HTML response

# Test dashboard
curl -s https://wise2.net/dashboard | head -20
# Expected: 200 OK, HTML response
```

### Step 6: Browser Verification (2 min)

Open these in your browser (from your computer, not the server):

1. **https://wise2.net/**
   - Should load landing page
   - No errors in browser console (F12)

2. **https://wise2.net/dashboard**
   - Should load dashboard
   - Navigation should work

3. **https://api.wise2.net/api/health**
   - Should show status JSON

**All must load without 502/503/504 errors.**

---

## ✅ Deployment Complete

If all tests passed, deployment is done. **Do not run cleanup yet.**

---

## Safe Cleanup (ONLY if everything works)

**Wait 5 minutes** after deployment to ensure stability, then:

```bash
# Clean only orphaned/dangling items (SAFE)
sudo docker container prune -f          # Remove stopped containers
sudo docker network prune -f            # Remove unused networks
sudo docker image prune -f              # Remove dangling images only

# Do NOT run: docker system prune -af   (This deletes rollback images!)
```

---

## 🚨 Rollback (If Something Breaks)

**If deployment fails at any point:**

```bash
# Stop services
sudo docker-compose -f docker-compose.prod.yml down

# Revert code
git reset --hard HEAD~1

# Restart with previous code
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Wait and verify
sleep 60
sudo docker-compose -f docker-compose.prod.yml ps

# Test
curl https://wise2.net/
```

**Then contact dwise** with:
- What you deployed
- What error you got (from logs)
- What you did to rollback

---

## Troubleshooting

### Container exits immediately

```bash
# Check the error
sudo docker-compose -f docker-compose.prod.yml logs api

# Common fixes:
# - Database not ready: wait 30 sec, restart
# - Environment variable missing: check .env.production
# - Port in use: `sudo lsof -i :3001`
```

### 502 Bad Gateway

```bash
# Check if API is running
sudo docker-compose -f docker-compose.prod.yml ps api

# Check API health
sudo docker-compose -f docker-compose.prod.yml logs api | tail -50

# Restart just the API
sudo docker-compose -f docker-compose.prod.yml restart api
```

### Database connection error

```bash
# Check PostgreSQL
sudo docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
sudo docker-compose -f docker-compose.prod.yml logs postgres | tail -50

# Restart database
sudo docker-compose -f docker-compose.prod.yml restart postgres
sleep 30
sudo docker-compose -f docker-compose.prod.yml restart api
```

---

## Quick Reference

| Command | What it does |
|---------|------------|
| `git pull origin main` | Get latest code |
| `sudo docker-compose -f docker-compose.prod.yml down` | Stop services (keep data) |
| `sudo docker-compose -f docker-compose.prod.yml up -d --build` | Start and rebuild |
| `sudo docker-compose -f docker-compose.prod.yml ps` | Check service status |
| `sudo docker-compose -f docker-compose.prod.yml logs api` | View API logs |
| `curl https://wise2.net/` | Test website |
| `git reset --hard HEAD~1` | Rollback to previous version |

---

## One-Line Deployment (When You Know It Works)

```bash
cd /home/dwise/wise2-core && git pull origin main && sudo docker-compose -f docker-compose.prod.yml down && sudo docker-compose -f docker-compose.prod.yml up -d --build && sleep 60 && sudo docker-compose -f docker-compose.prod.yml ps && curl https://wise2.net/
```

---

## When to Use This vs. Main Guide

| Situation | Use This Guide |
|-----------|----------------|
| Normal code update | ✅ Yes |
| Emergency rollback | ✅ Yes |
| First time deploying | ✅ Yes |
| Major infrastructure change | ❌ No — wait for safety PR |
| Debugging production issues | ✅ Yes |
| Adding new services | ❌ No — need port allocation review |

---

## Known Limitations (Until Safety PR)

- ⚠️ Cannot add new services without port review
- ⚠️ Docker images still use Node 18 (not 20)
- ⚠️ PR #100 (Living Core) not in production yet
- ⚠️ Compose file labeled as LEGACY

**These will be fixed in the safety PR** (ETA: this week).

---

## Support

If deployment fails:

1. Check the troubleshooting section above
2. Review the logs: `sudo docker-compose logs [service-name]`
3. Try rollback: `git reset --hard HEAD~1`
4. Contact dwise with the error and what you tried

---

**Safe deploying! 🚀**
