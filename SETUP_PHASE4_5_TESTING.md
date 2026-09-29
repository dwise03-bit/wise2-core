# Phase 4–5 Testing & Backend Setup Guide

## Quick Start (5 minutes)

### 1. Fix Linux File Watchers Limit (If Running on Linux)
```bash
# Increase inotify limit (permanent)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Start the Full Development Environment
```bash
cd /Users/danielwise/Projects/wise2-core
pnpm install  # If first time or dependencies changed
pnpm dev      # Starts all services in parallel
```

**What starts:**
- API Server: http://localhost:3011
- Command Center Frontend: http://localhost:3002
- Website: http://localhost:3001
- Dashboard: http://localhost:3005
- Admin: http://localhost:3003

### 3. Access the Command Center Dashboard
```
Frontend: http://localhost:3002/dashboard
(Will redirect to login if not authenticated)
```

---

## Authentication & Database Setup

### Option A: Use Existing Test User
If database is already seeded:
```
Email: admin@wise2.net
Password: password123

Or:

Email: demo@wise2.net
Password: password123
```

### Option B: Add Your Account to Database
Edit the seed script or use SQL directly:

```sql
-- Connect to your database and insert a user
INSERT INTO users (email, name, password_hash, role, permissions)
VALUES (
  'dwise03@gmail.com',
  'Daniel Wise',
  'hashed_password_from_auth_service',  -- Use hashPassword() from auth.service.ts
  'admin',
  ARRAY['read', 'write', 'delete']
);
```

### Option C: Seed Database (Recommended)
```bash
# Run the TypeORM migration to set up tables
npm --prefix packages/api run migration:run:dev

# Then run the seed script
npx tsx scripts/seed-database.ts
```

---

## What to Test After Login

### Phase 4 Features (Visible on Dashboard)
1. **Priority Actions** — Top panel with 4 buttons
   - ✓ Green hover state
   - ✓ Responsive grid (1 col mobile → 4 cols desktop)
   - ✓ Displays real metric counts

2. **WISE Intelligence** — AI insights card
   - ✓ Green glow border
   - ✓ Animated pulse dot (green, 2s)
   - ✓ Real-time system status message
   - ✓ Action buttons (View Insights, Dismiss)

3. **Digital Workforce** — Agent status panel
   - ✓ Hermes AI Agent (RUNNING, green pulse)
   - ✓ Second Brain (READY, green static)
   - ✓ Status descriptions
   - ✓ Responsive 2-column grid

4. **Performance Chart** — 7-day trend
   - ✓ Green gradient bars with glow
   - ✓ Responsive height (32 mobile, 40 tablet)
   - ✓ Time axis labels (Mon, Wed, Fri)

5. **Recent Automations** — Workflow status list
   - ✓ Status badges (RUNNING=green pulse, COMPLETED=green static)
   - ✓ Time stamps ("2 hours ago", "In progress")
   - ✓ Hover state (background darkens)

### Phase 5 Features (Mobile Responsiveness)

**Test on different screen sizes:**

```
Desktop (1440px):
- 3-column layout (Operations 2-cols, Sidebar 1-col)
- All cards visible
- Quick Actions and Workspace panels shown

Laptop (1024px):
- 3-column grid still visible
- Proper spacing

Tablet (768px):
- 2-column grid (starts to wrap)
- Quick Actions hidden
- Workspace hidden

Mobile (375px):
- 1-column stacked layout
- Bottom navigation visible (5 items)
- Cards full-width
- 44px+ touch targets

Small Mobile (320px):
- Proper text wrapping
- No horizontal overflow
- Touch targets still 44px+
```

**Device Testing Method:**
```javascript
// In Chrome DevTools:
1. Press F12 (Developer Tools)
2. Press Ctrl+Shift+M (Toggle Device Toolbar)
3. Select preset (iPhone SE, iPad, etc.)
4. Or set custom: 320x812, 375x812, 768x1024, 1440x900
```

### Accessibility Testing

```bash
# Install axe DevTools Chrome extension
# Right-click → Inspect → Axe DevTools

# Check:
- Color contrast (4.5:1 minimum)
- Focus visible on keyboard nav (green outline)
- All buttons have labels (no icon-only)
- Form fields have associated labels
```

---

## Visual Design Verification

### Color System
Verify these colors are used correctly:

```css
/* Foundation */
Black #050505        — Page background
Steel #1A1A1A        — Card backgrounds
Dark-Steel #0F1419   — Special panels (WISE Intelligence)
Chrome #9CA3AF       — Inactive elements

/* Green Accent */
Chaos Green #00FF66  — Active states, hover, status indicators
Green-dim rgba(...)  — Hover backgrounds
Green-glow rgba(...) — Glow effects on cards
Border-green rgba(.) — Border accent on hover
```

### Typography
- Headings: **bold** Inter font, 24–32px desktop / 18–20px mobile
- Body: 14–16px Inter, line-height 1.5
- Labels: 12px, uppercase, tracking-wide
- Mono: JetBrains Mono for code/tech values

### Spacing
- Cards: 16px padding (p-4) → 20px (p-5) on desktop
- Gaps: 8px base (gap-2) → 12px (gap-3) on desktop
- Sections: 16px vertical gap → 24px (space-y-6) on desktop

---

## Troubleshooting

### Issue: "Invalid email or password"
**Solution**: Database doesn't have the user yet
```bash
# Run seed script to create test users
npx tsx scripts/seed-database.ts

# Then login with:
# Email: admin@wise2.net
# Password: password123
```

### Issue: API returning 401 on /v1/prospects
**Solution**: Backend API not running or token invalid
```bash
# Make sure API is running on :3011
pnpm dev  # Starts all services

# Check if token is in cookies:
# DevTools → Application → Cookies → authToken should exist
```

### Issue: Bottom navigation not showing on mobile
**Solution**: Viewport not set to mobile
```javascript
// In DevTools (F12):
1. Toggle Device Toolbar (Ctrl+Shift+M)
2. Set width < 768px
3. Refresh page
```

### Issue: ENOSPC file watchers error (Linux)
**Solution**: Increase inotify limit
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue: Styles look wrong or colors off
**Solution**: Clear cache and rebuild
```bash
# Clear Next.js cache
rm -rf apps/command-center/.next

# Restart dev server
pnpm dev
```

---

## Performance Profiling

### Lighthouse Audit
```javascript
// Chrome DevTools → Lighthouse
1. Select "Mobile" or "Desktop"
2. Click "Analyze page load"
3. Target: >90 Performance, >90 Accessibility
```

### Runtime Performance
```javascript
// Chrome DevTools → Performance tab
1. Click record (red circle)
2. Interact with dashboard (scroll, hover, click)
3. Click stop
4. Look for:
   - No layout thrashing
   - GPU-accelerated animations (green, compositing)
   - No excessive repaints
```

---

## Code Review Checklist

- [ ] All Phase 4 sections render without errors
- [ ] All Phase 5 responsive breakpoints work correctly
- [ ] Touch targets are 44px+ on mobile
- [ ] Color system matches (green #00FF66 on black)
- [ ] TypeScript compilation passes (`pnpm type-check`)
- [ ] No console errors in DevTools
- [ ] Accessibility keyboard nav works (Tab, Enter)
- [ ] Animation performance smooth (no jank)
- [ ] Real API data loads correctly
- [ ] Bottom nav visible on mobile only

---

## Next Steps After Testing

### If all features work:
1. Create a pull request from `ui/unified-command-center` → `main`
2. Request code review
3. Merge to main
4. Deploy to staging environment
5. Get stakeholder approval

### If issues found:
1. Document issue with screenshot/video
2. Create branch: `bugfix/issue-name`
3. Fix and verify locally
4. Update test results
5. Retry testing

---

## Useful Commands

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build all apps
pnpm type-check       # TypeScript verification
pnpm lint             # Code linting
pnpm test             # Run all tests

# API specific
npm --prefix packages/api run migration:run:dev   # Run migrations
npm --prefix packages/api run start               # Start API only

# Frontend specific
npm --prefix apps/command-center run dev  # Start frontend only
npm --prefix apps/command-center run build # Build frontend

# Database
npm --prefix packages/api run migration:generate # Create new migration
```

---

## Support

For issues or questions:
1. Check `PHASE4_5_STATUS_REPORT.md` for implementation details
2. Review [CLAUDE.md](CLAUDE.md) for project guidelines
3. Check commit history: `git log --oneline -20`
4. Create an issue on GitHub

---

**Ready to test? Run:**
```bash
pnpm dev
# Then open http://localhost:3002/dashboard
```
