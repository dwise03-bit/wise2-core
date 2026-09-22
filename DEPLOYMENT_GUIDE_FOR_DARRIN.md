# WISE² Deployment Guide for Darrin

**Last Updated**: 2026-09-20  
**Status**: Deployment Runbook — validate the target Compose stack before use  
**Target**: VPS at 173.208.147.165 (dwise user)

---

> [!WARNING]
> Do not use `docker system prune`, `git reset --hard`, `kill -9`, or a full `docker-compose down` as routine deployment steps. These actions can remove rollback artifacts, destroy uncommitted server changes, or interrupt unrelated services. Build and restart only the services that the approved change requires.

## ⚡ Quick Start (5 minutes)

If everything is already working and you just need to deploy a code update:

```bash
# 1. SSH to server
ssh dwise@173.208.147.165

# 2. Pull latest code
cd /home/dwise/wise2-core
git pull origin main

# 3. Build and restart only the approved service
# Example for a website-only change:
sudo docker-compose -f docker-compose.prod.yml up -d --build --no-deps website

# 4. Verify the targeted service (wait for its health check)
sleep 60
sudo docker-compose -f docker-compose.prod.yml ps website

# 5. Test
curl https://wise2.net/
```

Expected: All containers `Up` with green status.

---

## 🔍 Pre-Deployment Checklist

**Before touching the server, verify locally:**

- [ ] Latest code pulled: `git pull origin main`
- [ ] No uncommitted changes: `git status` (should be clean)
- [ ] Builds pass locally: `npm run build` (all packages)
- [ ] Tests pass: `npm test` (if you changed code)
- [ ] No broken imports: `npm run type-check`

**Before deployment:**

- [ ] No one else is actively working (check with dwise)
- [ ] You have SSH access to 173.208.147.165
- [ ] You have sudo password for the `dwise` user
- [ ] You have 10 minutes free (deployment takes 3–5 minutes + verification)

---

## 📋 Full Deployment Process

### Step 1: Pre-Flight Health Check (1 min)

```bash
# SSH to production server
ssh dwise@173.208.147.165

# Check current services
sudo docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml ps

# Expected output: All services "Up"
# If any say "Exited" or "Unhealthy", see Troubleshooting below
```

**If services are down**, stop here and troubleshoot (see section below).

### Step 2: Validate Code (1 min)

```bash
# Navigate to repo
cd /home/dwise/wise2-core

# Check for uncommitted changes (should be clean)
git status

# Pull latest main branch
git pull origin main

# Verify the pull worked
git log -1 --oneline  # Should show the latest commit from dwise
```

### Step 3: Identify the deployment scope (30 sec)

For a website-only change, do not restart the API, database, cache, or unrelated applications. Confirm the exact service and current running revision before proceeding.

```bash
git rev-parse --short HEAD
sudo docker-compose -f docker-compose.prod.yml ps website
```

### Step 4: Build & Start the approved service (3 min)

```bash
# Website-only deployment; preserves dependent production services.
sudo docker-compose -f docker-compose.prod.yml up -d --build --no-deps website

# Monitor only the service being deployed (press Ctrl+C to stop watching)
sudo docker-compose -f docker-compose.prod.yml logs -f website
```

### Step 5: Wait & Verify (2 min)

```bash
# Wait for services to stabilize
sleep 60

# Check all services are healthy
sudo docker-compose -f docker-compose.prod.yml ps

# Expected: All services show "Up" or "Up (healthy)"
```

**All containers must show "Up"** — if any show "Exited" or "Unhealthy", see Troubleshooting.

### Step 6: Health Endpoint Verification (1 min)

```bash
# Test API health
curl https://api.wise2.net/api/health

# Should return: {"status":"ok"} or similar

# Test website
curl https://wise2.net/

# Should return: 200 OK (HTML content)

# Test dashboard
curl https://wise2.net/dashboard

# Should return: 200 OK (HTML content)
```

### Step 7: Production Verification (2 min)

1. **Visit in browser** (from your computer):
   - https://wise2.net — Should load landing page
   - https://wise2.net/dashboard — Should load dashboard
   - https://api.wise2.net/api/health — Should show health status

2. **Check for errors**:
   - Open browser console (F12 → Console tab)
   - No red errors should appear
   - No 502/503/504 errors

3. **Test key flows**:
   - Click "Sign Up" — Should navigate to auth page
   - Try to log in — Should attempt authentication
   - Navigate between pages — Should load without errors

---

## ✅ Deployment Complete!

If all verifications passed, **deployment is done**. No further steps needed.

**Log the deployment:**

```bash
# Update daily log (on your local machine)
echo "$(date): Deployed WISE² with [describe changes]" >> data/daily-logs/$(date +%Y-%m-%d).md
git add data/daily-logs/
git commit -m "log: deployment complete"
git push origin main
```

---

## 🚨 Troubleshooting

### Problem: Container exits with error

```bash
# View full error logs
sudo docker-compose -f docker-compose.prod.yml logs api

# Common errors:
# - "connection refused" → Database isn't running yet (wait 30 sec)
# - "port already in use" → See "Port conflict" below
# - "out of memory" → Server is overloaded (wait 5 min, try again)
```

**Solution**: 
1. Read the error carefully
2. Check the section below that matches your error
3. Run the fix
4. Restart: `sudo docker-compose -f docker-compose.prod.yml up -d`

---

### Problem: Port conflict (Port 3001 in use)

```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill it (if it's not WISE² or essential)
sudo kill -9 <PID>

# Try deployment again
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

---

### Problem: Database connection error

```bash
# Check if PostgreSQL is running
sudo docker-compose -f docker-compose.prod.yml ps postgres

# If it says "Exited":
sudo docker-compose -f docker-compose.prod.yml restart postgres

# Wait 30 seconds, then restart API
sleep 30
sudo docker-compose -f docker-compose.prod.yml restart api
```

---

### Problem: Website shows 502 Bad Gateway

**This means nginx can't reach the backend.**

```bash
# Check if API is running
sudo docker-compose -f docker-compose.prod.yml ps api

# Check API logs
sudo docker-compose -f docker-compose.prod.yml logs api

# Restart the full stack
sudo docker-compose -f docker-compose.prod.yml restart

# Wait 60 seconds and test again
sleep 60
curl https://wise2.net/
```

---

### Problem: "Git pull" shows merge conflicts

**Stop immediately — do NOT continue.**

```bash
# Abort the merge
git merge --abort

# Contact dwise to resolve conflicts
# (Don't force-push or rebase unless instructed)
```

---

## 🔙 Rollback (Emergency Only)

If deployment breaks production, **roll back to the last known working version:**

```bash
# First identify the last known-good, recorded commit or release tag.
git log --oneline -5

# Check out that exact known-good revision only after approval.
git checkout <known-good-commit-or-tag>

# Rebuild only the affected service.
sudo docker-compose -f docker-compose.prod.yml up -d --build --no-deps website

# Verify
sleep 60
sudo docker-compose -f docker-compose.prod.yml ps
curl https://wise2.net/
```

**Then notify dwise immediately** about what went wrong.

---

## 📊 Production Services & Ports

| Service | Internal Port | External Access | Status |
|---------|---------------|-----------------|--------|
| Website | 3001 | https://wise2.net | Public |
| API | 3010 | https://api.wise2.net | Public |
| PostgreSQL | 5432 | Private (Docker network) | Database |
| Redis | 6379 | Private (Docker network) | Cache |
| Nginx | 80/443 | Public (reverse proxy) | Proxy |

**Important**: Do NOT change these ports. They are locked by port governance policy.

---

## 🔑 Environment Variables

If you need to add new environment variables, edit on the server:

```bash
# SSH to server
ssh dwise@173.208.147.165

# Edit the production env file
sudo nano /home/dwise/wise2-core/.env.production

# Add your variable (format: KEY=VALUE)
# Save: Ctrl+O, Enter, Ctrl+X

# Restart services to pick up new variables
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

**Never commit secrets to git.** Environment variables should only be set on the server.

---

## 📝 Deployment Checklist (Fill This In)

Copy this before each deployment, fill it out, and save to `data/daily-logs/`:

```markdown
## Deployment on [DATE]

- [ ] Pre-flight health check passed
- [ ] Code pull successful (no merge conflicts)
- [ ] Services stopped cleanly
- [ ] Build completed without errors
- [ ] All containers running and healthy
- [ ] Health endpoint responds
- [ ] Website loads (https://wise2.net)
- [ ] Dashboard loads (https://wise2.net/dashboard)
- [ ] No browser console errors
- [ ] No 502/503 errors
- [ ] Key flows tested (sign up, auth, navigation)

**Deployment time**: [Start time] → [End time]  
**Changes deployed**: [List what changed]  
**Any issues**: [Yes/No, describe if yes]  
**Rollback needed**: [Yes/No]
```

---

## 🆘 Need Help?

If something breaks and you can't fix it:

1. **Check the logs** — they usually tell you what's wrong:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs api  # Last 50 lines
   sudo docker-compose -f docker-compose.prod.yml logs --tail 100 api  # Last 100
   ```

2. **Rollback** — revert to the previous working state:
   ```bash
   git reset --hard HEAD~1
   sudo docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Notify dwise** — share:
   - What you were trying to deploy
   - The exact error message (from logs or console)
   - What you've already tried
   - Current state (is it still broken, did you rollback, etc.)

---

## 🎯 Key Takeaways

1. **Always pull latest code** before deploying
2. **Always verify locally first** (build, tests, type-check)
3. **Always wait 60 seconds** before checking if services are healthy
4. **Always test in browser** (not just curl)
5. **Always have a rollback plan** (know how to revert)
6. **Never change ports** — they are locked by policy
7. **Never commit secrets** to git
8. **If you're stuck, rollback and ask for help** — don't guess

---

## 📞 Quick Reference Commands

```bash
# Connect to server
ssh dwise@173.208.147.165

# View all services
sudo docker-compose -f docker-compose.prod.yml ps

# View logs for a specific service
sudo docker-compose -f docker-compose.prod.yml logs api
sudo docker-compose -f docker-compose.prod.yml logs website
sudo docker-compose -f docker-compose.prod.yml logs postgres

# Restart a service
sudo docker-compose -f docker-compose.prod.yml restart api

# Stop all services (keeps data)
sudo docker-compose -f docker-compose.prod.yml down

# Website-only deployment
cd /home/dwise/wise2-core && git pull --ff-only origin main && sudo docker-compose -f docker-compose.prod.yml up -d --build --no-deps website

# Check specific port
sudo lsof -i :3001

# View docker disk usage
sudo docker system df

# Review disk usage; request an approved maintenance window before cleanup
sudo docker system df
```

---

## ✨ You're Ready!

You now have everything you need to deploy WISE² confidently. Follow the checklist, verify each step, and you'll deploy like a pro.

**Happy deploying! 🚀**
