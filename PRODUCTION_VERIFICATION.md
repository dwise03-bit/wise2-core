# WISE² Website Production Verification Checklist

## Build & Compilation
- [ ] Build passes with no errors
- [ ] Build passes with no warnings
- [ ] All TypeScript types are correct
- [ ] All imports are valid
- [ ] No console errors on page load

## Navigation & Routing
- [ ] Header renders correctly
- [ ] Navigation links work (Features, Studio, Pricing)
- [ ] Sign In link works
- [ ] Get Started button works
- [ ] Mobile menu toggle works
- [ ] All internal routes resolve
- [ ] External links open correctly

## Stripe Integration
- [ ] Stripe publishable key is configured
- [ ] Price IDs are set for all tiers
- [ ] Pricing cards display correctly
- [ ] Checkout buttons are clickable
- [ ] Stripe checkout flow works
- [ ] Stripe webhook is configured
- [ ] Success/cancel redirects work

## Discord Integration
- [ ] Discord invite link is in header
- [ ] Discord invite link is in footer
- [ ] Discord community channel exists
- [ ] Webhook URL is configured
- [ ] Form submissions send to Discord
- [ ] Discord embed works if used

## YouTube Integration
- [ ] YouTube embed component exists
- [ ] Demo video displays
- [ ] Video plays correctly
- [ ] Channel links work
- [ ] Playlist links work (if used)

## Homepage Sections
- [ ] Hero section renders
- [ ] "Build, Automate, Dominate" headline shows
- [ ] CTA buttons work
- [ ] Trust indicators display
- [ ] Features grid shows all 6 features
- [ ] Feature hover effects work
- [ ] Pricing section displays
- [ ] All pricing tiers show
- [ ] Footer renders
- [ ] All footer links work

## Authentication
- [ ] Sign In link goes to /auth/login
- [ ] Register link goes to /auth/signup
- [ ] Auth pages exist and render
- [ ] Auth flow works (if implemented)

## Performance & UX
- [ ] Page loads quickly
- [ ] Images load without errors
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Mobile responsive
- [ ] Touch targets are adequate (>48px)
- [ ] Text is readable on all devices

## Accessibility
- [ ] All images have alt text
- [ ] Color contrast is sufficient
- [ ] Focus states are visible
- [ ] Keyboard navigation works
- [ ] ARIA labels where needed

## Environment Variables
- [ ] NEXT_PUBLIC_SITE_URL is set
- [ ] NEXT_PUBLIC_API_URL is set
- [ ] NEXT_PUBLIC_ANALYTICS_ID is set
- [ ] STRIPE_PUBLISHABLE_KEY is set
- [ ] STRIPE_STARTER_PRICE_ID is set
- [ ] STRIPE_PROFESSIONAL_PRICE_ID is set
- [ ] STRIPE_ENTERPRISE_PRICE_ID is set
- [ ] DISCORD_WEBHOOK_URL is set
- [ ] DISCORD_COMMUNITY_LINK is set

## Browser Compatibility
- [ ] Works in Chrome/Edge (Chromium)
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Mobile Safari works
- [ ] Mobile Chrome works

## Security
- [ ] No hardcoded secrets
- [ ] API keys use environment variables
- [ ] HTTPS enforced in production
- [ ] CSP headers configured
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities

## SEO
- [ ] Meta tags are complete
- [ ] OpenGraph tags are set
- [ ] Twitter cards are set
- [ ] Canonical URL is set
- [ ] Robots.txt is configured
- [ ] Sitemap exists (if needed)

## Analytics & Tracking
- [ ] Google Analytics configured (if needed)
- [ ] Event tracking works
- [ ] Form submissions tracked
- [ ] CTA clicks tracked

## Deployment Ready
- [ ] Code committed to git
- [ ] No broken imports
- [ ] No console errors/warnings
- [ ] Production build passes
- [ ] Environment configured
- [ ] Integrations tested
- [ ] All sections verified
