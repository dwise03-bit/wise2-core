# Landing Page Testing Checklist

**Date:** July 7, 2026  
**Goal:** Validate landing page design, email capture, and brand alignment

---

## Setup

```bash
cd services/dashboard
npm install
npm run dev
```

**URL:** http://localhost:3000

---

## Visual Design Test

### Hero Section
- [ ] Navy background (#1A1F36) displays correctly
- [ ] Logo shows "WISE² CORE" with orange accent
- [ ] Headline is readable at 5xl font size
- [ ] Orange text accent (#FF6B35) is visible
- [ ] Email input has proper styling (white/10 background, white text)
- [ ] Orange button has proper styling
- [ ] Responsive on mobile (test with DevTools)

### Value Prop Section
- [ ] 3 columns display correctly (desktop)
- [ ] Stacks to 1 column on mobile
- [ ] Orange left border on each card
- [ ] "Built by founders who ship" headline visible
- [ ] Copy is readable and clear

### Proof Points Section
- [ ] Gray background (#F9FAFB) displays
- [ ] 6 checklist items display
- [ ] Orange checkmarks (✓) visible
- [ ] 2 columns on desktop, 1 on mobile
- [ ] All 6 features readable:
  - [ ] 5 core services pre-configured
  - [ ] 30+ production-ready alerts
  - [ ] Comprehensive monitoring
  - [ ] Daily automated backups
  - [ ] 5,300+ lines of documentation
  - [ ] 99.9% uptime track record

### Final CTA Section
- [ ] Navy background (#1A1F36)
- [ ] Headline + description visible
- [ ] Email input + button display
- [ ] Button text changes on interaction

### Footer
- [ ] Navy/gray background
- [ ] Brand statement visible
- [ ] "Launching soon" message displayed

---

## Email Capture Test

### Form Submission
- [ ] Enter: `test1@example.com`
- [ ] Click "Get Started"
- [ ] See loading state (button shows "...")
- [ ] Success message appears: "Welcome! Check your email."
- [ ] Button shows checkmark (✓)
- [ ] Email field clears after 3 seconds
- [ ] Form returns to normal state

### Error Handling
- [ ] Try empty email → Validation error
- [ ] Try invalid email (no @) → Browser validation
- [ ] Check browser console → No errors
- [ ] Check terminal → Should log: `[WAITLIST] Email captured: test1@example.com`

### Multiple Submissions
- [ ] Submit email 1: `founder1@startup.com`
- [ ] Submit email 2: `founder2@startup.com`
- [ ] Check terminal for both logged
- [ ] Both show success messages

---

## Brand Alignment Test

### Colors
- [ ] Navy (#1A1F36) used for:
  - [ ] Hero background
  - [ ] Section headers
  - [ ] Final CTA background
- [ ] Orange (#FF6B35) used for:
  - [ ] Logo accent
  - [ ] Text highlight in headline
  - [ ] Button background
  - [ ] Checkmarks in proof section
  - [ ] Left borders in value prop

### Typography
- [ ] Headings are bold and large
- [ ] Body copy is readable (16px+)
- [ ] Font is consistent (Inter or fallback)
- [ ] Line heights are comfortable (1.6+)

### Voice/Messaging
- [ ] Copy uses brand language:
  - [ ] "Deploy in 10 minutes"
  - [ ] "Affordable at every scale"
  - [ ] "You own it"
  - [ ] "Built by founders who ship"
  - [ ] "Stop overpaying for infrastructure"

### Proof Points
- [ ] All 6 proof points are accurate
- [ ] Numbers match brand docs:
  - [ ] "$5–20/month"
  - [ ] "50–80% cheaper"
  - [ ] "30+ production-ready alerts"
  - [ ] "99.9% uptime"
  - [ ] "500+ early-stage deployments"

---

## Performance Test

- [ ] Page loads in <2 seconds
- [ ] No console errors
- [ ] Buttons are responsive (click instantly)
- [ ] Form submission completes <1 second
- [ ] Mobile: Scrolling is smooth
- [ ] Mobile: Form inputs work correctly
- [ ] Mobile: Button is easily tappable (44px+ height)

---

## Responsive Design Test

### Desktop (1920px+)
- [ ] 3 columns in value prop
- [ ] 2 columns in proof section
- [ ] Full-width form in hero

### Tablet (768px)
- [ ] 2 columns value prop
- [ ] 2 columns proof section
- [ ] Form fits screen

### Mobile (375px)
- [ ] 1 column everything
- [ ] Email input is full width
- [ ] Button is full width or adjacent
- [ ] Text is readable
- [ ] No horizontal scroll

---

## Sign-Off

**Tester:** ________________________  
**Date:** ________________________  
**Status:** ☐ Pass | ☐ Needs fixes

**Issues Found:**
```
1. 
2. 
3. 
```

**Notes:**
```

```
