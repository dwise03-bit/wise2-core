# Petals & Potions

## Your Ritual. Your Blend. Your Healing.

A luxury wellness brand digital experience powered by WISE². Petals & Potions is an AI-native business operating system providing personalized herbal tea rituals, custom blends, monthly subscriptions, and a complete e-commerce platform.

### Features

- **🌿 Premium Customer Website** — Luxury botanical aesthetic, mobile-first design
- **🧪 Custom Blend Experience** — Ritual quiz, personalized recommendations
- **📦 Product Catalog** — Full e-commerce with Stripe payments
- **💚 Subscription Management** — Monthly ritual boxes with customization
- **🎯 Owner Dashboard** — Inventory, orders, analytics, customer management
- **🤖 AI Concierge** — Wellness recommendations and customer support
- **👥 Customer CRM** — Profiles, preferences, subscription tracking
- **📊 Analytics & Reporting** — Sales, retention, wellness metrics

### Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: NestJS, PostgreSQL, Redis
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Admin**: Next.js dashboard
- **Infrastructure**: Docker, WISE² Core

### Project Structure

```
petals-potions/
├── web/                  # Customer-facing website & storefront
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   └── styles/      # Global CSS
│   ├── public/          # Static assets
│   └── package.json
│
├── admin/               # Owner dashboard
│   └── [similar structure]
│
├── db/                  # Database schemas & migrations
│   ├── schema.sql
│   └── migrations/
│
├── api/                 # Backend API (NestJS)
│   └── [backend structure]
│
└── config/             # Shared configuration
    ├── colors.ts       # Brand color system
    └── constants.ts    # Brand constants
```

### Brand Identity

**Colors**:
- Deep Purple: `#3B1E54`
- Royal Indigo: `#1D386F`
- Botanical Green: `#2E7D4E`
- Warm Gold: `#F4C542`
- Warm Cream: `#F7F2E9`

**Typography**:
- Headers: Cinzel Decorative (serif)
- Body: Playfair Display (serif)
- UI: Inter (sans-serif)

**Brand Pillars**:
- ❤️ HEART — Love & Passion
- 🧠 MIND — Clarity & Peace
- 💪 BODY — Nourish & Heal
- ✨ SOUL — Connect & Elevate

### Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev         # Runs web & admin in parallel

# Build
npm run build       # Builds all apps

# Type checking
npm run type-check  # TypeScript checks
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
```

### Deployment

- Production server: `173.208.147.165`
- Auto-deploy: GitHub Actions on push to main
- See `DEPLOYMENT_HANDOFF.md` for details

### Contributing

All work on this branch: `claude/petals-potions-build-guu0cb`

Push commits with clear messages describing changes.

---

**Powered by WISE² Genesis** — AI-Native Business Operating System
