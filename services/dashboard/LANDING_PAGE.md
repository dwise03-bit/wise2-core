# Wise² Core Landing Page

**Product-Market Fit Validation Page**

---

## What's Here

A brand-aligned landing page built to validate product-market fit by capturing founder emails.

**Located:** `/` (root route)

---

## Page Sections

1. **Hero** — Brand headline + email capture CTA
2. **How It Works** — 3-column value prop ("Deploy in 10 minutes", "Affordable at scale", "You own it")
3. **Proof Points** — What's included (6 key features with checkmarks)
4. **CTA** — Final conversion section with email signup
5. **Footer** — Brand statement + launch status

---

## Email Capture Flow

**Endpoint:** `POST /api/waitlist`

**Request:**
```json
{
  "email": "founder@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email added to waitlist",
  "email": "founder@example.com"
}
```

**Storage:** Currently logs to console. Ready to extend to database.

---

## Design System

**Colors:**
- Navy (#1A1F36) — Primary, background, text
- Orange (#FF6B35) — Accent, CTAs, highlights
- Grays — Supporting text, backgrounds

**Typography:**
- Headings: Bold, large (3xl–6xl)
- Body: Regular, readable (lg–xl)
- Utility: Tailwind CSS

**Responsive:**
- Mobile-first
- Optimized for all screen sizes
- Touch-friendly inputs and buttons

---

## Brand Alignment

✅ Uses brand messaging (all copy from brand guidelines)
✅ Uses brand colors (navy + orange)
✅ Uses brand voice (direct, honest, grounded)
✅ Uses brand proof points (30+ alerts, 99.9% uptime, etc.)
✅ Uses brand tagline ("Build like you have a DevOps team. Pay like you don't.")

---

## Run Locally

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:3000
```

---

## Test Email Capture

1. Visit http://localhost:3000
2. Enter any email address in the hero form
3. Click "Get Started"
4. See success message + email logged to console

Check terminal output for:
```
[WAITLIST] Email captured: founder@example.com at 2026-07-07T...
```

---

## Next Steps

1. **Database Integration** — Save emails to PostgreSQL
2. **Email Notifications** — Send confirmation emails (Resend)
3. **Analytics** — Track signups, conversion rate
4. **A/B Testing** — Test different headlines/CTAs
5. **Product Hunt** — Launch with this landing page
6. **Social** — Share testimonials from early signups

---

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to DigitalOcean, Vercel, AWS, etc.
```

---

**Status:** ✅ Ready to validate. Start collecting founder emails.
