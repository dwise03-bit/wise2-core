# Deployment Guide - WISE² Landing Page

**Status:** ✅ Build complete, ready to deploy  
**Build Time:** 2.4 seconds  
**Build Output:** `.next/` directory (optimized production build)

---

## Quick Deploy (5 minutes)

### Prerequisites
- SSH access to production server (51.81.80.252)
- Docker installed on server
- Git access to repository

### Option A: Pull & Rebuild on Server

```bash
# SSH into server
ssh ubuntu@51.81.80.252

# Navigate to dashboard directory
cd /opt/wise2-core/services/dashboard

# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm ci

# Rebuild Next.js
npm run build

# Restart dashboard container
docker-compose -f docker-compose.prod.yml restart dashboard
```

### Option B: Copy Built Files

```bash
# On your local machine, from dashboard directory
scp -r .next ubuntu@51.81.80.252:/opt/wise2-core/services/dashboard/

# On server
ssh ubuntu@51.81.80.252
cd /opt/wise2-core/services/dashboard
docker-compose -f docker-compose.prod.yml restart dashboard
```

### Option C: Full Docker Rebuild

```bash
# On server
cd /opt/wise2-core
docker-compose -f docker-compose.prod.yml build dashboard
docker-compose -f docker-compose.prod.yml up -d dashboard
```

---

## Verification

### Check Dashboard is Running

```bash
# Local or from server
curl http://localhost:3000

# Should return HTML with:
# - "ONE SEES THE POSSIBILITIES"
# - "ONE BUILDS THE REALITY"
# - Email capture form
# - "Six core pillars" section
```

### Verify on wise2.net

```bash
# From your browser
https://wise2.net

# Visual checklist:
✓ Hero section with founder images
✓ Neon blue text with glow effects
✓ Email form with input field
✓ 6 feature boxes (alternating blue/red)
✓ "Ready to build?" CTA section
✓ Footer with WISE² branding
```

### Check Logs

```bash
# On server
docker-compose -f docker-compose.prod.yml logs -f dashboard

# Should show:
# ▲ Next.js server listening on http://localhost:3000
# No errors
```

---

## What Changed

### Files Modified
- `app/page.tsx` — Complete landing page redesign
- `components/design-system-components.tsx` — New component library

### Files Added
- `components/hud-elements.tsx` — HUD tech animations
- `design-system.md` — Design system documentation
- `public/old-graphics/*` — 10 brand asset images
- `REVIEW.md` — Review guide
- `DEPLOY.md` — This file

### No Breaking Changes
- ✅ Database schema unchanged
- ✅ API endpoints unchanged
- ✅ Environment variables unchanged
- ✅ No dependency version bumps

---

## Rollback Plan

If issues occur, rollback is easy:

```bash
# On server
cd /opt/wise2-core/services/dashboard

# Check previous commits
git log --oneline | head -5

# Revert to previous version
git reset --hard 716d3e5  # Previous landing page commit

# Rebuild
npm run build

# Restart
docker-compose -f docker-compose.prod.yml restart dashboard
```

---

## Performance Checklist

After deployment, verify:

- [ ] Page loads in < 2 seconds
- [ ] Images display correctly
- [ ] Email form works (test with a test email)
- [ ] Animations are smooth (no jank)
- [ ] Responsive on mobile (test viewport width 375px)
- [ ] Responsive on tablet (test viewport width 768px)
- [ ] Responsive on desktop (test viewport width 1200px)
- [ ] No console errors
- [ ] Lighthouse score > 90

### Run Lighthouse

```bash
# From your browser DevTools
# Or use: npm install -g @lhci/cli@latest
lhci autorun --config lighthouserc.json
```

---

## Monitoring

### Real-time Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f dashboard
```

### Check Container Status

```bash
docker ps | grep dashboard
```

### CPU/Memory Usage

```bash
docker stats dashboard-v2
```

---

## DNS & SSL

### Verify DNS Points to Server

```bash
dig wise2.net
# Should resolve to 51.81.80.252
```

### Check SSL Certificate

```bash
curl -I https://wise2.net
# Should show: HTTP/2 200 OK
# Should have valid SSL cert
```

---

## Post-Deployment Tasks

- [ ] Test landing page functionality
- [ ] Verify email capture works
- [ ] Monitor server logs for errors
- [ ] Check Google Search Console (update sitemap if needed)
- [ ] Test Google Analytics tracking
- [ ] Share deployment confirmation with team
- [ ] Schedule follow-up review in 1 week

---

## Support & Troubleshooting

### Landing page shows old content

**Solution:** Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
docker-compose restart dashboard
```

### Email form not working

**Solution:** Check /api/waitlist endpoint
```bash
curl -X POST http://localhost:3001/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Images not loading

**Solution:** Check public/old-graphics/ directory exists on server
```bash
ls -la services/dashboard/public/old-graphics/
```

### Performance slow

**Solution:** Check server resources and Next.js cache
```bash
docker stats
docker-compose logs dashboard | grep -i "error\|warn"
```

---

## Deployment Checklist

- [ ] Build complete (`.next/` generated)
- [ ] Git commits pushed
- [ ] Tested locally at http://localhost:3000
- [ ] Visual design verified
- [ ] Form validation tested
- [ ] TypeScript build clean
- [ ] No console errors locally
- [ ] SSH access confirmed
- [ ] Server resources sufficient
- [ ] Backup of old page created
- [ ] Deployment method chosen (A, B, or C)
- [ ] Post-deployment verification plan
- [ ] Rollback procedure documented
- [ ] Team notified

---

## Questions?

1. **Can I deploy without stopping other services?** Yes, only `dashboard` container restarts
2. **Will this affect the API server?** No, API is separate container
3. **Do I need to update environment variables?** No, no new vars required
4. **How long is deployment?** ~2-5 minutes depending on method
5. **Can I deploy during business hours?** Yes, deployment is quick (5 min or less downtime)

---

## Deployment Complete ✅

Once verified, the new WISE² landing page will be live on wise2.net with:
- Iron Man/Tron aesthetic
- Apple.com minimalism  
- Dual-founder narrative
- Ecosystem showcase
- Email waitlist capture
- Full accessibility compliance

**Expected impact:** Better brand presentation, improved user engagement, higher conversion on email capture.
