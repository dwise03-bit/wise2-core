# WISE² Website Testing & QA Checklist

## Automated Testing

### Build Verification
```bash
npm run build
```
- ✅ No TypeScript errors
- ✅ No ESLint warnings (critical)
- ✅ Clean webpack compilation
- ✅ Static page generation successful

### Code Quality
```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint checks
```

## Responsive Design Testing

### Breakpoints to Test
- **Mobile (375px):** iPhone SE, iPhone 12, iPhone 14
- **Tablet (768px):** iPad, iPad Pro
- **Desktop (1280px+):** Desktop, wide screens

### Test Scenarios
- [ ] Header navigation responsive
- [ ] Hero section scales correctly
- [ ] Feature grid: 4 col (desktop) → 2 col (tablet) → 1 col (mobile)
- [ ] Product grid: 4 col (desktop) → 2 col (tablet) → 1 col (mobile)
- [ ] Pricing: 3 col (desktop) → stacked (mobile)
- [ ] Footer responsive layout
- [ ] All text readable, no overflow
- [ ] Touch targets ≥ 44x44px on mobile

## Animation Testing

### Animation Verification
- [ ] Features fade-in on scroll (staggered)
- [ ] Testimonials slide-in on scroll
- [ ] Products entrance smooth, no jank
- [ ] Stats numbers reveal smoothly
- [ ] Pricing cards scale up on view
- [ ] CTA section text slides left + scales
- [ ] 60 FPS performance (no drops)
- [ ] Animations work on slow 3G
- [ ] Prefers-reduced-motion respected

## Accessibility Testing (WCAG AA)

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab key
- [ ] Tab order logical and intuitive
- [ ] Escape key closes modals (future)
- [ ] Focus visible and clear

### Color Contrast
- [ ] Text vs background: 4.5:1 minimum (AA standard)
- [ ] UI components: 3:1 minimum
- [ ] Test with: https://webaim.org/resources/contrastchecker/

### Screen Reader (VoiceOver/NVDA)
- [ ] Semantic HTML used (headings, nav, main, etc.)
- [ ] Images have descriptive alt text (or decorative marked)
- [ ] Buttons and links have clear labels
- [ ] Form labels associated with inputs (future)
- [ ] Landmarks properly announced

### Heading Structure
- [ ] Single H1 per page
- [ ] Headings nested logically (H1 → H2 → H3)
- [ ] No skipped levels

### Motion & Animation
- [ ] prefers-reduced-motion CSS media query respected
- [ ] Critical animations can be disabled
- [ ] No flashing/strobing (>3 Hz)

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet

### Test Scenarios
- [ ] Page loads without errors
- [ ] Styling renders correctly
- [ ] Animations smooth on all browsers
- [ ] No console errors or warnings
- [ ] Framer Motion works consistently

## Performance Testing

### Lighthouse Audit
```bash
# Build and serve
npm run build
npm start

# Then run in Chrome DevTools
# Audit → Generate Lighthouse report
```

**Targets:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Bundle Analysis
```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Create next.config with analyzer
# Build and analyze output
npm run build
```

### Core Web Vitals
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

Test at: https://web.dev/measure/

## SEO Testing

- [ ] Meta title present and unique
- [ ] Meta description present and accurate
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] robots.txt allows crawling
- [ ] Sitemap generated
- [ ] Canonical tags (if needed)

Test with: https://search.google.com/test/rich-results

## Security Testing

- [ ] No console security warnings
- [ ] CSP headers present
- [ ] HTTPS enforced (production)
- [ ] No mixed content warnings
- [ ] XSS vulnerabilities checked
- [ ] SQL injection N/A (static site)
- [ ] CSRF token N/A (no forms)

## User Testing Checklist

- [ ] First-time visitor understands the platform
- [ ] CTA buttons prominent and clear
- [ ] Navigation intuitive
- [ ] Load times acceptable
- [ ] Mobile experience smooth
- [ ] Animations enhance rather than distract

## Sign-Off Checklist

- [ ] All automated tests passing
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Animations working smoothly
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Performance metrics meet targets
- [ ] Cross-browser testing complete
- [ ] Security headers verified
- [ ] Production build optimized
- [ ] Deployment configuration ready
- [ ] Documentation up to date

## Known Issues / To-Do

- [ ] Add form validation (contact form in future)
- [ ] Add error boundary for better error handling
- [ ] Implement analytics tracking
- [ ] Set up monitoring/alerting
- [ ] Add PWA support (manifest, service worker)

## Testing Tools

- Chrome DevTools (F12)
- Firefox Developer Tools (F12)
- WebAIM Contrast Checker
- WAVE Accessibility Tool
- Lighthouse (built into Chrome)
- axe DevTools browser extension
- Responsively App (responsive tester)
