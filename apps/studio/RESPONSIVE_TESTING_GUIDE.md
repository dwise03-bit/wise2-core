# WISE² Responsive Testing & Validation Guide

Complete testing protocol for validating responsive design and UI polish across all breakpoints.

---

## Breakpoint Testing Matrix

### Mobile (375px) - iPhone SE/Small

**Viewport Size**: 375x667

Testing:
```
□ Navigation stacks vertically
□ All text is readable without horizontal scroll
□ Touch targets > 44px tall
□ Buttons stack to single column
□ Sidebar collapses to drawer
□ Form inputs are full width (minus padding)
□ Cards are single column
□ No horizontal overflow
□ Padding reduced (12px instead of 16px)
□ Font sizes remain readable (min 12px)
```

**Key Components to Test**:
- Sound Lab: Recording controls, track list
- Live Studio: Chat overlay, stream controls
- Creative Studio: Navigation, command palette

### Mobile Large (425px) - iPhone 12/13

**Viewport Size**: 425x844

Testing:
```
□ Same as mobile
□ Sidebar may remain compact
□ 2 touch targets per row acceptable
□ Slightly larger touch targets
□ Improved readability
```

### Tablet (768px) - iPad

**Viewport Size**: 768x1024

Testing:
```
□ Two-column layouts activate
□ Sidebar may appear or be drawer
□ Cards in 2-column grid
□ Form fields 50% width (2 per row)
□ Improved spacing (16px)
□ Table columns visible
□ Better use of horizontal space
□ Touch targets still readable
```

**Key Components to Test**:
- Dashboard: Metrics in 2-column layout
- Recording Library: 2-column grid
- Settings: 2-column form

### Desktop (1024px) - Standard

**Viewport Size**: 1024x768

Testing:
```
□ Three-column layouts activate
□ Sidebar always visible
□ Full navigation shows
□ Command palette works
□ Hover states active
□ Mouse cursor appropriate
□ Full spacing (16-24px)
□ All features available
```

### Desktop Large (1440px) - Widescreen

**Viewport Size**: 1440x900

Testing:
```
□ Four-column layouts available
□ Maximum spacing applied (24-32px)
□ No excessive whitespace
□ Content width limits respected (max-w-*)
□ All sections properly spaced
□ Hover effects smooth
```

---

## Responsive Testing Procedure

### Setup

1. **Chrome DevTools**
   ```
   F12 → Device Toolbar (Ctrl+Shift+M)
   ```

2. **Or use Firefox Responsive Design Mode**
   ```
   Ctrl+Shift+M
   ```

3. **Or physically test on devices**
   ```
   iPhone, iPad, Android device
   ```

### Test at Each Breakpoint

For each breakpoint (375px, 425px, 768px, 1024px, 1440px):

#### Layout & Spacing

```
□ No horizontal scrolling
□ All content visible without scrolling
□ Padding is consistent (4px multiples)
□ Margins between sections are equal
□ Sidebar/navigation positioned correctly
□ Content width is readable (not too wide)
□ Grid columns adjust smoothly
□ Gaps scale appropriately
```

#### Typography

```
□ Headings clearly distinguished
□ Body text is 14px minimum
□ Line length < 80 characters
□ All text is readable
□ No text overlap
□ Font size scales appropriately
□ Bold/semibold used for hierarchy
```

#### Interactive Elements

```
□ All buttons visible and clickable
□ Focus ring appears on Tab
□ Hover states work (on desktop)
□ Active states clear
□ Disabled states visible
□ Dropdown menus position correctly
□ Modals centered and readable
□ Tooltips don't overflow
```

#### Color & Contrast

```
□ Text contrast ratio > 4.5:1 (WCAG AA)
□ Background colors consistent
□ Accent colors visible on background
□ Error/success colors distinct
□ No color used as only indicator
```

#### Images & Media

```
□ Images scale responsively
□ No distortion or stretching
□ Aspect ratios maintained
□ Load times acceptable
□ Low bandwidth test (throttle to 3G)
```

#### Touch Targets (Mobile/Tablet)

```
□ Buttons minimum 44x44px
□ Input fields minimum 44px tall
□ Spacing between targets > 8px
□ Scrollable areas work smoothly
□ No accidental clicks triggering wrong button
□ Zoom works if needed (rarely)
```

---

## Component-Specific Testing

### Sound Lab - Track Recording Interface

**Mobile (375px)**:
```
□ Recording control button centered
□ Track list stacks vertically
□ Mixer channels can be scrolled horizontally
□ Play/Stop buttons large enough for touch
□ Duration/BPM display readable
□ Waveform scrolls smoothly
```

**Tablet (768px)**:
```
□ Recording controls on top
□ Track list and mixer side-by-side
□ Timeline zoom works
□ Two-track view possible
```

**Desktop (1024px+)**:
```
□ Full DAW layout visible
□ Effects panels visible
□ Meters visible
□ Sidebar with controls
□ No overlap of elements
```

### Live Studio - Streaming Interface

**Mobile (375px)**:
```
□ Preview video fills screen width
□ Chat overlay overlays preview
□ Controls below preview (stack)
□ Stream info visible but compact
□ Scene list in drawer/modal
□ Source list in drawer/modal
```

**Tablet (768px)**:
```
□ Preview 2/3 width
□ Chat 1/3 width (right side)
□ Controls below or right side
□ Scene list visible or drawer
```

**Desktop (1024px+)**:
```
□ Preview takes 70% width
□ Chat 30% width on right
□ Full control panel below
□ Scene/source panels visible
□ Multi-monitor aware (no fixed sizing)
```

### Dashboard - Analytics & Metrics

**Mobile (375px)**:
```
□ Metrics stack 1-column
□ Charts readable at mobile size
□ No legend outside chart area
□ Numbers large enough to read
□ Refresh button accessible
```

**Tablet (768px)**:
```
□ Metrics in 2-column grid
□ Charts readable
□ Legends fit properly
```

**Desktop (1024px+)**:
```
□ Metrics in 4-column grid
□ Charts large and detailed
□ All legend items visible
□ Hover tooltips work
□ Drill-down available
```

---

## Responsive Animation Testing

For all breakpoints:

```
□ Slide-in animations work
□ Scale animations smooth
□ Fade animations correct duration
□ No animation jumps or glitches
□ Animation performance good (60fps)
□ No jank on lower-end devices
□ Animations disabled if prefers-reduced-motion
```

---

## Keyboard Navigation Testing

Test on all breakpoints:

```
□ Tab order is logical
□ Focus ring visible after Tab
□ All interactive elements focusable
□ Enter activates buttons
□ Escape closes modals
□ Arrow keys work in lists/tabs
□ Ctrl+G generates
□ Space plays/pauses
□ Ctrl+S saves
□ No keyboard traps
```

---

## Performance Testing

### Mobile Network (3G Throttle)

```
□ Page loads in < 5 seconds
□ Images load progressively
□ Fonts load without blocking render
□ Interactions responsive (not frozen)
□ Animations smooth
```

### Bundle Size

```
□ Total JS < 500KB (gzipped)
□ CSS < 100KB (gzipped)
□ Images optimized
□ No unused CSS in viewport
```

### Lighthouse Score

```
□ Performance > 90
□ Accessibility > 90
□ Best Practices > 90
□ SEO > 90
```

---

## Accessibility (a11y) Testing

### WCAG 2.1 Level AA

```
□ Color contrast > 4.5:1
□ Text size minimum 12px
□ Touch targets minimum 44px
□ All form inputs labeled
□ Error messages associated with inputs
□ Focus ring visible
□ Tab order logical
□ No keyboard traps
□ Captions on videos
□ Alternative text on images
□ ARIA labels where needed
□ Semantic HTML used
□ Form validation accessible
```

### Screen Reader Testing (NVDA/JAWS/VoiceOver)

```
□ Page structure announced correctly
□ Headings properly nested
□ Lists announced as lists
□ Form labels read with inputs
□ Buttons clearly labeled
□ Icons have alt text or aria-labels
□ Dynamic content announced
□ Loading states announced
□ Errors announced to user
```

---

## Browser & Device Testing Matrix

### Desktop Browsers

```
Chrome/Chromium (Latest)
  □ Responsive
  □ Focus ring visible
  □ Animations smooth
  □ DevTools working

Firefox (Latest)
  □ Responsive
  □ Focus ring visible
  □ Animations smooth
  □ Console clean

Safari (Latest)
  □ Responsive
  □ Font rendering
  □ Animations smooth
  □ iOS viewport

Edge (Latest)
  □ Same as Chrome
  □ Windows-specific rendering
```

### Mobile Devices

```
iPhone 12+ (iOS)
  □ Touch interactions
  □ Notch/Dynamic Island awareness
  □ Safe area respected
  □ Scroll performance

iPhone SE (small screen)
  □ All content fits
  □ No overlap
  □ Touch targets 44px+

Android (Chrome)
  □ Touch interactions
  □ System UI integration
  □ Back button behavior
  □ Scroll performance
```

### Tablets

```
iPad (768px)
  □ Landscape/portrait
  □ Touch gestures
  □ Keyboard attachment (if available)

Android Tablet
  □ Similar to iPad
  □ Pixel density differences
```

---

## Test Automation Script

```bash
#!/bin/bash
# Quick responsive testing script

echo "Testing responsive design..."
echo ""

BREAKPOINTS=(375 425 768 1024 1440)

for breakpoint in "${BREAKPOINTS[@]}"; do
  echo "Testing at ${breakpoint}px width..."
  
  # Using Puppeteer or Playwright for automated screenshots
  npx playwright test --project=chromium --config=e2e.config.ts \
    -c "VIEWPORT_WIDTH=${breakpoint}"
done

echo ""
echo "Running lighthouse audit..."
npx lighthouse http://localhost:3000 --view

echo ""
echo "Checking accessibility..."
npx axe http://localhost:3000

echo ""
echo "All tests complete!"
```

---

## Manual Testing Checklist - Before Deployment

Print this and check off before each release:

```
RESPONSIVE DESIGN
□ Tested at 375px (mobile)
□ Tested at 425px (mobile lg)
□ Tested at 768px (tablet)
□ Tested at 1024px (desktop)
□ Tested at 1440px (desktop lg)
□ No horizontal scrolling at any breakpoint
□ Touch targets > 44px on mobile
□ Spacing consistent (4px multiples)

COMPONENT STATES
□ Hover states visible (desktop)
□ Focus rings visible (keyboard nav)
□ Active states clear
□ Disabled states visible
□ Loading states show skeleton
□ Error states red with message
□ Success states green with message
□ Empty states show placeholder

ACCESSIBILITY
□ Tab navigation works
□ Focus ring visible
□ Screen reader friendly
□ Color contrast > 4.5:1
□ All form inputs labeled
□ Error messages associated

PERFORMANCE
□ Lighthouse score > 90
□ Page load < 3s (desktop)
□ Page load < 5s (3G)
□ No console errors
□ No console warnings
□ Animations smooth (60fps)

BROWSERS
□ Chrome latest
□ Firefox latest
□ Safari latest
□ Edge latest

DEVICES
□ iPhone 12/13
□ iPhone SE
□ Android device
□ iPad
□ Desktop (1440px)

PRODUCTION
□ All assets optimized
□ CSS minified
□ JS minified
□ Images responsive
□ Fonts loaded correctly
□ No API keys exposed
□ Analytics tracking
□ Error monitoring enabled
```

---

## Common Issues & Fixes

### Horizontal Overflow on Mobile

**Issue**: Content extends beyond 375px viewport

**Fix**:
```tsx
// Remove fixed widths
width: 100%; // Bad: Causes overflow
width: 100%; max-width: 100%; // Good: Respects padding

// Use padding instead of margins
// Ensure parent has overflow: hidden or viewport meta tag
```

### Touch Targets Too Small

**Issue**: Buttons/inputs < 44px on mobile

**Fix**:
```tsx
// Ensure minimum height
const touchTarget = `
  min-h-[44px] min-w-[44px]
  px-3 py-2.5 // Adequate padding
  gap-2 // Space around icon
`;
```

### Text Too Small

**Issue**: Text unreadable on mobile (< 12px)

**Fix**:
```tsx
// Use responsive font sizes
className="text-xs md:text-sm lg:text-base"
// Or minimum 12px
className="text-12px" // Ensure base is 12px+
```

### Images Distorted

**Issue**: Images stretched/squished

**Fix**:
```tsx
// Maintain aspect ratio
className="aspect-video w-full h-auto"
// Or explicit ratio
className="w-full h-auto max-w-full"
```

### Modal Overflow

**Issue**: Modal too wide on mobile

**Fix**:
```tsx
className="
  w-full max-w-sm mx-4
  max-h-[90vh] overflow-y-auto
"
```

---

## Performance Optimization Checklist

```
□ Images: Compressed and responsive (<100KB each)
□ Fonts: Loaded async, fallback stack provided
□ CSS: Critical CSS inline, defer non-critical
□ JS: Code split, lazy load routes
□ Animations: Use transform/opacity (GPU-accelerated)
□ Scrolling: Debounced event handlers
□ Lists: Virtual scroll for 100+ items
□ Forms: Lazy validation
□ API: Request deduplication, caching
□ Bundle: Tree-shaken, terser minified
```

---

## Sign-Off Template

```markdown
## UI Polish Sign-Off

**Component(s)**: [List components tested]

**Date**: [Date tested]

**Tested By**: [Name]

### Responsive
- [ ] 375px (mobile)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1440px+ (wide)

### States
- [ ] Hover/Focus/Active
- [ ] Loading/Error/Success
- [ ] Disabled states
- [ ] Empty states

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader
- [ ] Color contrast
- [ ] Focus rings

### Performance
- [ ] Lighthouse > 90
- [ ] < 3s load time
- [ ] Smooth animations

**Sign-Off**: ✅ Ready for production

**Notes**: [Any issues found/fixed]
```

---

**Version**: 1.0  
**Last Updated**: July 24, 2026  
**Required for Production Release**: ✅
