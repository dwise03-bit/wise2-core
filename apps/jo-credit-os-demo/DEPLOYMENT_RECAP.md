# WISE² Website Deployment Recap

**Date:** July 19, 2026  
**Status:** ✅ Live at https://wise2.net  
**Deploy Method:** Manual SSH via `scripts/deploy.sh`

---

## What Was Deployed

### New Website Features

**Glassmorphism Design System**
- Modern glass-effect UI components with backdrop blur and transparency
- Deep black background (#000000) with neon green accent borders (#8CFF00)
- Premium, luxury aesthetic matching Apple design language
- Smooth hover animations and micro-interactions throughout

**Interactive Project Gallery**
- Displays 6 completed WISE² portfolio projects
- 3-column responsive grid (mobile/tablet/desktop)
- Category filtering system for project browsing
- High-quality project previews with descriptions

**Refreshed Brand Identity**
- Updated color palette: neon green (#8CFF00) on deep black
- Modern typography system with display and body fonts
- Responsive component library with 15+ components
- Consistent visual language across all sections

**Complete Component Library**
- Navigation (fixed header with mobile hamburger menu)
- Hero section with animated background blobs
- Service cards with hover glow effects
- World cards for business unit previews
- Intake form with complete project brief collection
- Footer with company info and links
- Section headings, buttons, and containers

**Responsive Design**
- Mobile-first architecture
- Optimized for mobile (375px), tablet (768px), desktop (1280px)
- Touch-friendly interactive elements
- Performance-optimized images and code splitting

---

## Why the Deployment Method Changed

### Previous Approach: GitHub Actions (Deprecated)

The old deployment workflow used **GitHub Actions** to automatically build and deploy on every push to `main`:

```yaml
# Old workflow (no longer used)
- Trigger: Push to main
- Action: Build Docker image
- Result: Silent failure / no deployment
```

**Problem:** GitHub Actions would silently fail to build, leaving the production website unchanged without any notification. This made it impossible to reliably ship updates.

### New Approach: Manual SSH Deployment (Current)

We've switched to **manual SSH deployment** with explicit control and feedback:

```bash
./scripts/deploy.sh [server-user@server-host]
```

**Advantages:**
- Explicit control over deployment timing
- Real-time build and deployment feedback
- Clear success/failure messages
- Easy rollback if needed
- No silent failures
- Server: `173.208.147.165` (GPU-NMLS)
- SSH Key: `~/.ssh/id_ed25519` (required)

**Why:** For MVP launch, manual deployment provides reliability and visibility that GitHub Actions automation cannot guarantee in this environment.

---

## How to Deploy

### Prerequisites

1. **SSH Access**
   - Need SSH key at `~/.ssh/id_ed25519`
   - Need login access to `dwise@173.208.147.165`

2. **Git Status**
   - Working directory must be clean (no uncommitted changes)
   - Must be on `main` branch
   - All changes must be committed and pushed

3. **Docker**
   - Docker must be running on production server
   - `docker-compose` must be available

### Deployment Steps

```bash
# From project root
./scripts/deploy.sh

# Or specify custom server
./scripts/deploy.sh custom-user@custom-host
```

### What Happens During Deployment

1. **Pre-flight checks:**
   - Verify SSH key exists
   - Verify working directory is clean
   - Verify on main branch

2. **Push to GitHub:**
   - `git push origin main`

3. **On Production Server:**
   - Pull latest code from main
   - Stop website container
   - Remove old Docker image
   - Build new image (no cache, full rebuild)
   - Start website container
   - Wait for health check (30 attempts, 2-second intervals)
   - Display final logs

### Example Output

```
🚀 WISE² Production Deployment
================================
Server: dwise@173.208.147.165
SSH Key: /Users/danielwise/.ssh/id_ed25519

✓ Working directory is clean
✓ On main branch

📤 Pushing to GitHub...
✓ Push complete

🔧 Deploying to server...
📥 Updating code...
✓ Code updated

🛑 Stopping website service...
✓ Website stopped

🗑️  Removing old image...
✓ Old image removed

🔨 Building website (no cache)...
✓ Build complete

🚀 Starting website...
✓ Website started

🏥 Waiting for website to be healthy...
✓ Website is healthy

✓ Deployment complete!
Website is live at: https://wise2.net

✅ Deployment successful!
```

### Deployment Timeline

| Step | Duration |
|------|----------|
| Verify preconditions | <5s |
| Git push to GitHub | 5-10s |
| Update code on server | 5-10s |
| Stop container | <5s |
| Remove old image | 5-10s |
| Build Docker image | 60-120s |
| Start container | 5-10s |
| Health checks | 10-60s |
| **Total** | **2-4 minutes** |

---

## Known Issues & Workarounds

### Browser Cache Issue (Most Common)

**Problem:** Users see the old website design even after deployment

**Cause:** Browser caches static assets (CSS, JavaScript, images)

**Solution for Users:**
- **Chrome/Edge:** `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- **Firefox:** `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- **Safari:** Developer menu → Develop → Empty Caches
- **Any browser:** Hard refresh with `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- **Nuclear option:** Use incognito/private mode to bypass all caches

**For development:**
- Service workers can also cache old code
- Chrome DevTools → Application → Clear Storage → Unregister Service Workers

### Deployment Script Issues

**Issue: "SSH key not found"**
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
```

**Issue: "Working directory is dirty"**
```bash
# Commit or stash changes
git status  # See what's uncommitted
git add .   # Stage changes
git commit -m "Your message"  # Commit
# Or stash if not ready
git stash
```

**Issue: "Not on main branch"**
```bash
# Switch to main
git checkout main
git pull origin main
```

**Issue: Docker build timeout**
- Build can take 60-120 seconds for full image rebuild
- If timeout at 600 seconds, check server disk space and memory
- SSH into server and check: `df -h` and `docker system df`

### Service Dependencies

The website service depends on the API service being healthy:

```yaml
depends_on:
  - api
```

If API is unhealthy, website container may restart repeatedly.

**Check API health:**
```bash
ssh dwise@173.208.147.165 "docker-compose -f docker-compose.prod.yml ps"
```

---

## Post-Deployment Verification

### Quick Checks

1. **Website loads:**
   ```bash
   curl -I https://wise2.net
   # Should return 200 OK
   ```

2. **View recent logs:**
   ```bash
   ./scripts/deploy.sh  # Shows last 5 logs at end
   ```

3. **Manual health check:**
   ```bash
   ssh dwise@173.208.147.165
   docker-compose -f docker-compose.prod.yml logs website --tail 20
   ```

### Browser Verification

- [ ] Homepage loads at https://wise2.net
- [ ] Glassmorphism design is visible (glass cards with green borders)
- [ ] Project gallery displays 6 projects
- [ ] Hero section with animated blobs loads
- [ ] Navigation menu works on mobile and desktop
- [ ] Interactive elements respond to hover
- [ ] Intake form renders correctly
- [ ] Footer displays company info

---

## Rollback Procedure

If deployment goes wrong:

1. **Check what's broken:**
   ```bash
   ssh dwise@173.208.147.165
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs website
   ```

2. **Rollback to previous commit:**
   ```bash
   git revert HEAD  # Creates new commit undoing changes
   # OR
   git reset --hard HEAD~1  # Hard reset to previous commit
   ```

3. **Re-deploy:**
   ```bash
   ./scripts/deploy.sh
   ```

---

## Future Improvements

- [ ] Add automated health monitoring alerts
- [ ] Implement zero-downtime deployments (blue-green)
- [ ] Add automated backups pre-deployment
- [ ] Create deployment approval workflow
- [ ] Set up performance testing in deployment pipeline
- [ ] Add database migration safety checks
- [ ] Implement staged rollout (canary deployment)

---

## Support & Questions

**Deployment script:** `/scripts/deploy.sh`  
**Production compose file:** `/docker-compose.prod.yml`  
**Website code:** `/apps/website/`  
**Server:** `173.208.147.165` as user `dwise`

For issues, check:
1. Server logs via SSH
2. Docker container status
3. Disk space and memory on server
4. Network connectivity (firewall rules)
5. Environment variables in `docker-compose.prod.yml`
