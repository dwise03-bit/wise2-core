# CC Craft & Create — Turnkey Demo

Full client-ready demo with web app + iOS companion. No database or Stripe required.

## Quick start

```bash
cd clients/cc-craft-create/website
npm install
npm run dev
```

Open **http://localhost:3011**

## What's included

### Web experience
- Brand-aligned homepage with slogan, 5-step process, testimonials, and value props
- Shop with API-backed catalog (12 products), filters, search, and mobile filter drawer
- Unified cart across all pages (localStorage + React context)
- Checkout with customer details and demo payment flow
- Occasions, Business, Gallery, About CC, and Contact pages
- Contact form API (`POST /api/contact`)

### iOS companion
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run ios:icon
npm run ios:sync
npm run ios:open
```

Bundle ID: `com.wise2.cccraftcreate`

## Demo flow to show CC

1. Homepage — brand story, featured products, process
2. Shop — filter by occasion, add to cart
3. Cart — adjust quantities
4. Checkout — enter details, complete demo purchase
5. Order confirmation — proof approval workflow messaging
6. Contact — submit custom order inquiry

## Production switch

Set in `.env.local`:

```
NEXT_PUBLIC_DEMO_MODE=false
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

See `docs/IOS.md`, `DATABASE_SETUP.md`, and `STRIPE_SETUP.md`.
