# WISE² Creative Studio Deployment Guide

**Status**: Ready for Production  
**Date**: 2026-07-20  
**Route**: `wise2.net/creative-studio`  
**Build**: Interactive HTML bundled app (437KB)

---

## What's Deployed

### Files Added

```
apps/studio/
├── app/creative-studio/
│   └── page.tsx                    (React client page, fetches & renders HTML)
├── public/
│   └── wise2-creative-studio.html  (Bundled app - all 6 modules)
└── next.config.js                  (Updated with cache headers)
```

### Changes Made

**1. New Route: `/creative-studio/page.tsx`**
- Loads `wise2-creative-studio.html` via fetch API
- Renders in iframe using `srcDoc` (avoids public file serving issues)
- Loading screen + error handling
- Sandbox: `allow-scripts`, `allow-forms`, `allow-popups`, `allow-modals`

**2. Public File: `wise2-creative-studio.html`**
- Self-contained bundled app (437KB)
- Includes: Command Center, Sound Lab, Live Studio, Jingle Lab, Content Factory, Client Showcase
- All assets embedded (fonts, icons, animations)
- Canvas-based waveform editor, mixer controls, VU meters
- ⌘K command palette

**3. Config: `next.config.js`**
- Added cache-control header: `no-store, max-age=0, must-revalidate`
- Ensures fresh loads on every request

---

## Deploy Steps

### Option 1: Manual Git Push (Recommended)

```bash
cd /Users/danielwise/Projects/wise2-core

# Clear git lock if stuck
rm -f .git/index.lock

# Stage & commit
git add apps/studio/app/creative-studio/
git add apps/studio/public/wise2-creative-studio.html
git add apps/studio/next.config.js
git commit -m "feat: Wire WISE² Creative Studio to /creative-studio route - HTML bundled app with all 6 modules"

# Push to main (auto-deploys via GitHub Actions)
git push origin main
```

### Option 2: Direct Server Deploy (If SSH available)

```bash
# On production server (173.208.147.165):
cd /home/dwise/wise2-core

# Pull latest
git pull origin main

# Rebuild studio app
npm run build --workspace=@wise2/studio

# Restart service
pm2 restart wise2-studio
# Or: systemctl restart wise2-studio
# Or: docker-compose -f docker-compose.prod.yml restart studio
```

---

## Verification Checklist

After deployment, verify these points:

- [ ] Route loads: `https://wise2.net/creative-studio`
- [ ] Page shows "Loading Creative Studio..." briefly
- [ ] Interactive app renders (should see WISE2 logo, 6 modules in sidebar)
- [ ] Sound Lab loads (waveform, mixer faders, VU meters)
- [ ] Live Studio loads (preview/program multiview, TAKE button, transitions)
- [ ] Jingle Lab loads (generation UI)
- [ ] Content Factory loads (images, videos, shorts, ads, voiceovers, emails, blogs, landing pages)
- [ ] Client Showcase loads (cinematic gallery of completed projects)
- [ ] Command Center loads (KPIs, activity feed, quick actions)
- [ ] Mobile responsive: works on tablet/phone (iframe scales)
- [ ] Performance: loads in <3 seconds
- [ ] No console errors: DevTools → Console (should be clean)

---

## Rollback (If Issues)

```bash
# If deployment causes problems:
git revert HEAD
git push origin main
# This removes the Creative Studio route and reverts to previous state
```

---

## Next Steps (Post-Deploy)

1. **Performance Monitoring**: Watch wise2.net/creative-studio load times in analytics
2. **User Feedback**: Collect feedback on all 6 modules
3. **Phase 2 Features** (if wanted):
   - Mobile companion app (React Native)
   - Deeper EQ panel in Sound Lab
   - AI music generation in Jingle Lab
   - Collaboration/multi-user in Live Studio
   - API integrations for external services

---

## Files

**Deployment Package**: `creative-studio-deploy.tar.gz`
- Ready to extract and deploy
- Contains: app/creative-studio/, public/wise2-creative-studio.html, next.config.js

**Changes Summary**:
```
+   apps/studio/app/creative-studio/page.tsx        (55 lines)
+   apps/studio/public/wise2-creative-studio.html   (437 KB)
M   apps/studio/next.config.js                      (+6 lines cache header)
```

---

## Support

If 404 errors reappear:
1. Check `/public/wise2-creative-studio.html` exists on server
2. Verify Next.js rebuilt (check `.next/` folder timestamp)
3. Check browser DevTools Network tab → see if HTML file loads
4. Check server logs: `docker logs wise2-studio` or `pm2 logs`

---

**Deploy Status**: Ready ✅  
**Estimated Deploy Time**: 2-3 minutes (build + restart)  
**Expected Uptime**: Full (zero-downtime during deploy via GitHub Actions)
