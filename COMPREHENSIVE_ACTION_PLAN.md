# WISE² Comprehensive Action Plan
## Complete Redesign + Feature Integration Strategy
**Prepared**: 2026-07-19 | **Status**: Ready for Execution

---

## OVERVIEW

You now have three critical deliverables from parallel agent analysis:

1. ✅ **Design Audit** - Current state vs. spec (40% → 100% compliance target)
2. ✅ **Design Implementation Plan** - 52-hour phased strategy
3. ✅ **Feature Audit** - 10 features, priority ranking, quick-fix guides
4. ⏳ **Feature Executor** - Implementation code (pending completion)

This document synthesizes everything into one actionable strategy.

---

## QUICK START (NEXT 24 HOURS)

### For Design Work
**Start**: Phase 1 Foundation (4 hours)
```bash
cd /Users/danielwise/Projects/wise2-core

# 1. Update colors
# Edit: packages/design-system/tailwind.config.ts
# Change: #0055FF → #0094FF
# Change: Surface colors #0D1117 → #101010, #131922 → #181818

# 2. Create unified Header component
# New file: packages/design-system/components/Header.tsx

# 3. Update Button component
# Edit: packages/design-system/components/Button.tsx
# Change primary color, add focus rings

# 4. Update Card component  
# Edit: packages/design-system/components/Card.tsx
# Improve borders, add hover effects

# 5. Test across all apps
npm run dev
# Visit: localhost:3001 (website), 3002 (dashboard), 3003 (studio), 3004 (admin)
```

### For Feature Work
**Start**: Revenue Blockers (3 highest-impact fixes)
```bash
# 1. Stripe Webhooks (3-4 days)
#    - Complete payment_intent handlers
#    - Add webhook secret to .env
#    - Test with Stripe test card

# 2. SoundLabs Persistence (4-5 days)
#    - Re-enable database save/load
#    - Add localStorage fallback
#    - Test project reload

# 3. Billing Enforcement (3-4 days)
#    - Add usage middleware
#    - Cap FREE tier at limits
#    - Add upgrade CTA when limit reached
```

### Interactive Form Deployment
**Timeline**: Today (1 hour)
```bash
# 1. Replace old IntakeForm with InteractiveIntakeForm
cd /Users/danielwise/Projects/wise2-core
# Find: apps/website/pages or components using IntakeForm
# Replace with: InteractiveIntakeForm

# 2. Test the form
# Visit: http://localhost:3001/intake
# Try: All 4 steps, validation, submission

# 3. Verify WISE² design (dark theme, green accents)
# ✓ Step indicators
# ✓ Progress bar
# ✓ Color changes on validation
# ✓ Success message
```

---

## FULL EXECUTION ROADMAP

### PHASE 1: FOUNDATION (Week 1, Mon-Wed) ⚡
**Effort**: 4 hours  
**Owner**: @dev  
**Goal**: Establish design tokens & core components

#### Tasks
- [ ] Update Tailwind config colors (30 min)
  - Primary: #0055FF → #0094FF
  - Surfaces: #101010, #181818
  - Update glow shadows

- [ ] Create unified Header component (2 hours)
  - Desktop & mobile variants
  - Sticky positioning
  - User menu
  - Test in all 5 apps

- [ ] Update Button component (1 hour)
  - New primary color
  - Focus ring consistency
  - All 6 variants (primary, secondary, danger, success, ghost, outline)

- [ ] Update Card component (30 min)
  - Border improvements
  - Hover scale + shadow
  - Clickable variant

#### Validation
- [ ] All components render without errors
- [ ] Primary blue (#0094FF) consistent everywhere
- [ ] Focus rings visible and standardized
- [ ] Mobile responsive (test at 375px, 768px, 1440px)

#### Deploy
- Merge to `main` when all validation passes

---

### PHASE 2: WEBSITE APP (Week 1-2, Wed-Fri) 🌐
**Effort**: 16 hours  
**Owner**: @dev  
**Goal**: Landing page pixel-perfect vs. Studio reference

#### Tasks
- [ ] Home page redesign (2 hours)
  - Fix headline colors (cyan → #0094FF)
  - Fix CTA button (red → #0094FF)
  - Add "ORGANIZED CHAOS COMMAND CENTER" branding
  - Add navigation header
  - Add 3-4 content sections (features, testimonials, pricing, dashboard preview)
  - Add footer
  - Add AI Assistant chat widget

- [ ] Feature pages (4 hours × 4 pages = 4 hours)
  - /soundlab, /live-studio, /studio, /community
  - Standard layout, color updates

- [ ] Auth pages (2 hours)
  - Login, signup, forgot password, email verification
  - Unified card component
  - Real-time validation feedback

- [ ] Replace intake form (1 hour)
  - Swap old IntakeForm for InteractiveIntakeForm
  - Test 4-step flow
  - Verify WISE² design

- [ ] Spacing standardization (3 hours)
  - Audit all container widths (max-w-7xl)
  - Standardize section padding (py-12/16/20)
  - Responsive grid (4-col mobile, 12-col desktop)

#### Validation
- [ ] All pages match Studio reference
- [ ] Color palette consistent
- [ ] Mobile layouts work (320px, 768px, 1440px)
- [ ] Form validation working
- [ ] Lighthouse score ≥80
- [ ] <5% visual regression vs. spec

#### Deploy
- Feature branch `feature/website-redesign`
- Create PR for design review
- Merge when approved

---

### PHASE 3: DASHBOARD APP (Week 2-3) 📊
**Effort**: 14 hours  
**Owner**: @dev  
**Goal**: Dashboard fully styled with sidebar & metrics

#### Tasks
- [ ] Create Sidebar component (2 hours)
  - Collapsible (280px → 80px)
  - Icon + label for each item
  - Active state highlights
  - Smooth transitions

- [ ] Dashboard layout (2 hours)
  - Add unified Header
  - Add Sidebar
  - Adjust content area for sidebar

- [ ] Metrics/Stats components (2 hours)
  - Create MetricCard component
  - Update Table styling
  - Create Chart wrapper

- [ ] Dashboard pages (4 hours × 4 pages)
  - Main dashboard, /live, /podcast, /dashboard
  - Layout + spacing updates
  - Color consistency

- [ ] Auth pages (2 hours)
  - Reuse unified auth components
  - Test login/signup flow

#### Validation
- [ ] All dashboard pages load
- [ ] Sidebar works on mobile
- [ ] Metrics display correctly
- [ ] Tables and charts styled
- [ ] Responsive at all breakpoints
- [ ] No 502 errors

#### Deploy
- Feature branch `feature/dashboard-redesign`
- PR for review
- Merge when approved

---

### PHASE 4: REMAINING APPS (Week 3) 🔧
**Effort**: 8 hours  
**Owner**: @dev  
**Goal**: Admin, Podcast, Studio consistency

#### Tasks
- [ ] Admin app (3 hours)
  - Add Header + Sidebar
  - Page styling
  - Auth flow

- [ ] Podcast-music app (3 hours)
  - Add Header + Sidebar
  - Page styling
  - Feature consistency

- [ ] Studio app (2 hours)
  - Verify against reference
  - Fix any deviations
  - Final polish

#### Validation
- [ ] All 5 apps consistent
- [ ] No visual regressions
- [ ] Mobile responsive
- [ ] Accessibility WCAG AA

#### Deploy
- Feature branch `feature/app-consistency`
- Final PR
- Merge and deploy

---

### PHASE 5: TESTING & QA (Week 4) ✅
**Effort**: 10 hours  
**Owner**: @qa + @dev  
**Goal**: Pixel-perfect, zero regressions

#### Tasks
- [ ] Visual regression testing (4 hours)
  - Screenshot all pages (mobile, tablet, desktop)
  - Compare pixel-by-pixel vs. Studio reference
  - Document any deviations
  - Fix discrepancies

- [ ] Functionality testing (2 hours)
  - Navigate all pages
  - Test forms, buttons, links
  - Mobile interaction
  - Keyboard navigation

- [ ] Accessibility audit (2 hours)
  - WCAG 2.1 AA compliance
  - Color contrast ratios
  - Focus indicators
  - Screen reader testing

- [ ] Performance audit (2 hours)
  - Lighthouse all pages (≥80)
  - Image optimization
  - CSS/JS bundle size
  - Load time < 3s

#### Validation Gates
- [ ] <5% visual regression
- [ ] All pages accessible
- [ ] Lighthouse ≥80 all pages
- [ ] Zero critical bugs
- [ ] Mobile UX flawless

#### Deploy
- Tag release: v2.0.0-design-unification
- Deploy to production
- Monitor for 24 hours

---

## FEATURE RE-ENABLEMENT STRATEGY

### TIMELINE: Parallel with Design Work
**Start**: Immediately (don't wait for design completion)

### REVENUE BLOCKERS (10-13 days, Weeks 1-2)
1. **Stripe Webhooks Fix** (3-4 days)
   - Complete payment_intent handlers
   - Add subscription state management
   - Add webhook secret to .env.production
   - Test end-to-end subscription flow
   - **Impact**: Enable recurring revenue

2. **SoundLabs Persistence** (4-5 days)
   - Re-enable database save/load methods
   - Add localStorage fallback
   - Test project reload
   - Test after browser close/reopen
   - **Impact**: Core product usability

3. **Billing Tier Enforcement** (3-4 days)
   - Add usage tracking middleware
   - Cap FREE tier at limits (hours, projects, etc.)
   - Add upgrade prompt at limit
   - Add hard block when exceeded
   - **Impact**: Revenue protection

**Result After Week 2**: Launch-ready for paid subscriptions

---

### PLATFORM CRITICAL (5-8 days, Weeks 2-3)
4. **Email Notifications** (2-3 days)
   - Configure SendGrid API key
   - Add .env.production variables
   - Test email delivery
   - Setup email templates
   - **Impact**: User engagement, onboarding flow

5. **Brain-Auth Re-enable** (3-5 days)
   - Fix MongoDB Docker issues
   - Re-enable MongoDB service
   - Fix brain-auth schema
   - Add to docker-compose.production.yml
   - Test knowledge graph features
   - **Impact**: Advanced automation, workflows

---

### INFRASTRUCTURE (Week 3)
6. **S3 Storage Upload** (2 days)
   - Configure AWS S3 credentials
   - Enable cloud file uploads
   - Test recording export to S3
   - Setup CDN for downloads
   - **Impact**: Scalability, cloud reliability

7. **Dashboard CI/CD Re-enable** (1 day)
   - Add dashboard to docker-compose
   - Update GitHub Actions pipeline
   - Verify build passes
   - Test deployment
   - **Impact**: User workspace available

8. **Admin CI/CD Re-enable** (1 day)
   - Same as dashboard
   - **Impact**: Operations center available

---

## TESTING & VERIFICATION

### Design System Validation Checklist
```
Color Palette
- [ ] All primary blue references changed #0055FF → #0094FF
- [ ] All glow shadows updated
- [ ] Surface colors #101010 and #181818
- [ ] Verified against Studio reference

Navigation
- [ ] Header sticky on all pages
- [ ] Mobile hamburger menu works
- [ ] Sidebar collapses on mobile (dashboard)
- [ ] Navigation items highlight

Components
- [ ] Button: All 6 variants correct
- [ ] Focus rings visible and consistent
- [ ] Card: Hover effects working
- [ ] Input: Glow on focus
- [ ] Modal: Animation smooth

Responsive
- [ ] Mobile (320px) stacks properly
- [ ] Tablet (768px) 2-column layouts
- [ ] Desktop (1440px) full layout
- [ ] No horizontal scroll

Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] 4.5:1 color contrast minimum
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
```

### Feature Validation Checklist
```
Stripe Webhooks
- [ ] Test card 4242 4242 4242 4242 works
- [ ] Payment intent captured
- [ ] Subscription created
- [ ] Webhook received and processed
- [ ] User upgraded to paid tier

SoundLabs Persistence
- [ ] Create project
- [ ] Make recording
- [ ] Reload page
- [ ] Project still there
- [ ] Recording still there
- [ ] Close browser
- [ ] Reopen
- [ ] Data persists

Billing Enforcement
- [ ] FREE tier user hits limit
- [ ] Upgrade prompt appears
- [ ] Can't create more after limit
- [ ] Paid users unlimited
- [ ] Limit reset monthly
```

---

## DEPLOYMENT STRATEGY

### Deployment Sequence
1. **Design Foundation** (Phase 1)
   - Deploy color/component updates
   - Wait 24 hours for monitor

2. **Revenue Blockers** (Parallel)
   - Deploy Stripe webhooks
   - Deploy SoundLabs persistence
   - Deploy billing enforcement
   - Monitor for payment issues

3. **Website Redesign** (Phase 2)
   - Deploy new landing page
   - Monitor traffic/conversions

4. **Dashboard Redesign** (Phase 3)
   - Deploy with new design
   - A/B test if desired

5. **Final Apps** (Phase 4)
   - Remaining apps
   - Minor deployment

6. **Production Release** (Phase 5)
   - Tag release v2.0.0
   - Deploy to production
   - Monitor 24 hours

### Rollback Plan
- Keep old color values as CSS variables (fallback)
- Git tags at each phase (easy revert)
- Monitor error tracking for regressions
- Sentry alerts for new errors

---

## RESOURCE REQUIREMENTS

### People
- 1 Developer (you for design/features)
- 1 QA/Tester (recommended for visual regression)
- 1 DevOps (monitor infrastructure)

### Time
- **Design**: 52 hours (2 weeks, 1 dev)
- **Features**: 10-13 days for revenue blockers, then 1-2 weeks for platform
- **Testing**: 10 hours (parallel with features)
- **Total**: 4 weeks to full production launch

### Tools
- Tailwind CSS (colors/tokens)
- Next.js (frontend)
- NestJS (API)
- Docker (containers)
- Stripe (payments)
- SendGrid (email)
- AWS S3 (storage)
- Grafana (monitoring)

---

## SUCCESS METRICS

### Design
- [x] 100% design compliance vs. Studio reference
- [x] <5% visual regression
- [x] Lighthouse ≥80 all pages
- [x] WCAG 2.1 AA accessibility
- [x] Mobile UX flawless

### Features
- [x] Stripe payments processing
- [x] SoundLabs projects persist
- [x] Billing tiers enforced
- [x] Email notifications sent
- [x] Dashboard & Admin deployed
- [x] <1% error rate
- [x] Sub-1s API response time

### Business
- [x] Revenue-ready platform
- [x] User engagement improved
- [x] Churn rate < 5%
- [x] NPS score > 50

---

## RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Design regression | User confidence | <5% visual regression gate |
| Payment failures | Lost revenue | End-to-end Stripe tests |
| Data loss on reload | User frustration | Multiple persistence layers |
| Infrastructure down | Service outage | Health checks + alerts |
| Color mismatch | Brand inconsistency | Verify vs. Studio reference |

---

## TIMELINE AT A GLANCE

```
Week 1: Design Foundation + Revenue Blockers
  Mon-Tue:  Phase 1 (colors, components)
  Wed-Fri:  Phase 2 (website redesign) + Stripe fix
  Parallel: SoundLabs persistence, Billing enforcement

Week 2: Dashboard Redesign + Platform Features
  Mon-Wed:  Phase 3 (dashboard)
  Thu-Fri:  Email notifications, S3 storage
  Parallel: Feature testing & validation

Week 3: Remaining Apps + Advanced Features
  Mon-Tue:  Phase 4 (admin, podcast, studio)
  Wed-Fri:  Brain-Auth re-enable, Dashboard/Admin CI/CD
  Parallel: Continued feature validation

Week 4: Testing & Production Release
  Mon-Wed:  Phase 5 (regression, accessibility, performance)
  Thu-Fri:  Final deployment to production
  Parallel: Production monitoring setup

**Launch**: End of Week 4 (v2.0.0)
```

---

## NEXT IMMEDIATE ACTIONS

### Today (Remaining 1-2 hours)
1. [ ] Review this action plan
2. [ ] Confirm design color (#0094FF)
3. [ ] Deploy interactive intake form
4. [ ] Start Phase 1 foundation work

### Tomorrow (Day 1)
1. [ ] Complete Phase 1 (4 hours)
2. [ ] Start Stripe webhook fixes (2-3 hours)
3. [ ] Setup testing environment

### This Week (Days 2-5)
1. [ ] Complete Phase 2 website redesign
2. [ ] Fix SoundLabs persistence
3. [ ] Implement billing enforcement

### Next Week
1. [ ] Complete Phase 3 dashboard
2. [ ] Deploy revenue features
3. [ ] Begin Phase 4 remaining apps

---

## QUESTIONS TO CONFIRM

Before starting:
1. **Color Palette**: Confirm #0094FF vs #0055FF? → Use #0094FF
2. **Launch Timeline**: Target end of Week 4? → Proceed with 4-week plan
3. **Resource Allocation**: Need QA for design testing? → Recommend yes
4. **Payment Processing**: Stripe or alternative? → Proceed with Stripe
5. **Email Provider**: SendGrid or Resend? → Recommend SendGrid

---

## SUMMARY

You have a **complete, actionable strategy** to:

✅ Make all 5 WISE² apps pixel-perfect (52 hours)  
✅ Re-enable revenue features (10-13 days)  
✅ Deploy production-ready platform (4 weeks)  
✅ Enable recurring revenue (Stripe subscriptions)  
✅ Scale to 1000s of users (infrastructure ready)  

**Start now. You're 4 weeks from launch.** 🚀
