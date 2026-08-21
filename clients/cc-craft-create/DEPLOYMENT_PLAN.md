# CC Craft & Create Studio — WISE² Deployment Plan

**Client**: CC Craft & Create Studio  
**Status**: Phase 1 Website Launch (In Progress)  
**Start Date**: 2026-08-21  
**Target Launch**: 2026-08-28 (Week 1)  

---

## Executive Summary

CC Craft & Create is WISE²'s first paying client. We're providing:

1. **Website** — Custom Next.js e-commerce site with CC branding
2. **Dashboard** — Order management, analytics, customer portal
3. **Creative Studio** — Design tools for proof generation
4. **Automation** — Workflow from order → approval → production
5. **Analytics** — Sales tracking, product performance, seasonal trends

**Success metric**: Website live with 5+ products, Stripe integrated, first order processed by 2026-08-28.

---

## Phase 1: Website Launch (Week 1 - CURRENT)

### 1.1 Project Setup

```
clients/cc-craft-create/
├── website/              # Next.js app (port 3011)
│   ├── public/
│   │   ├── images/       # CC brand images
│   │   └── logo.png
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── next.config.js
│
├── assets/               # Brand files (LOCKED)
│   ├── CC_Brand_Guide.pdf
│   ├── Craft & Create Studio branding guide.png
│   └── [9 more showcase images]
│
├── docs/
│   ├── DEPLOYMENT_PLAN.md (this file)
│   ├── BRAND_SPEC.md
│   ├── PRODUCT_CATALOG.md
│   ├── API_SPEC.md
│   └── DEPLOYMENT_CHECKLIST.md
│
└── config/
    ├── db-schema.sql     # Orders, products, customers
    └── stripe-keys.env   # Stripe API keys (git-ignored)
```

### 1.2 Website Pages

| Page | URL | Status | Purpose |
|------|-----|--------|---------|
| Home | / | TODO | Hero, value prop, CTA |
| Shop | /shop | TODO | Product catalog (grid) |
| Occasions | /occasions | TODO | Browse by occasion |
| Business | /business | TODO | B2B packages |
| Gallery | /gallery | TODO | Customer showcase |
| About | /about | TODO | CC's story |
| Contact | /contact | TODO | Contact form |
| Order | /order | TODO | Custom order form |
| Cart | /cart | TODO | Checkout |
| Order Tracking | /orders/:id | TODO | Status tracking |
| Admin | /admin | TODO | Dashboard (password) |

### 1.3 Brand Implementation

**Color Tokens** (CSS variables):
```css
--cc-purple: #6D2DBD;
--cc-lavender: #B785D3;
--cc-lilac: #F3E8FF;
--cc-gold: #D4AF37;
--cc-dark: #29233D;
--cc-white: #FFFFFF;
```

**Typography**:
- **Headers** (H1-H3): Lora Bold
- **Body**: Poppins
- **Accents/Script**: Great Vibes

**Hero Section**:
- Headline: "Crafted for the Moment. Created for the Memory."
- Subhead: "Custom products for every occasion, every person, every purpose."
- CTA: "ORDER YOURS TODAY" (gold button)

### 1.4 Database Schema

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),           -- party, memorial, business, etc.
  occasion VARCHAR(100),           -- birthday, graduation, etc.
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  in_stock BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  customer_id INTEGER,
  status ENUM('dream', 'design', 'approval', 'production', 'ready', 'delivered'),
  products JSON,                   -- [{product_id, qty, customization}]
  custom_design_url VARCHAR(500),
  notes TEXT,
  total DECIMAL(10,2),
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP,
  delivered_at TIMESTAMP
);
```

#### Customers Table
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(10),
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP
);
```

### 1.5 Stripe Integration

**Products to Create in Stripe**:
1. Personalized Drink Labels (qty-based pricing)
2. Chip Bags & Candy Wrappers (qty-based)
3. Water Bottle Labels (qty-based)
4. Custom Party Packages (flat rate)
5. Keepsakes & Memorials (custom pricing)

**Stripe Dashboard Setup**:
- [ ] Create Stripe account for CC (or use WISE² account + revenue split)
- [ ] Configure payment methods (card, Apple Pay, Google Pay)
- [ ] Set up webhook for order status updates
- [ ] Test checkout flow (test card: 4242 4242 4242 4242)

### 1.6 Deployment Checklist (Week 1)

- [ ] Create Next.js project (`npx create-next-app@latest cc-website`)
- [ ] Install dependencies (Tailwind, React, shadcn/ui, Stripe)
- [ ] Configure Tailwind with CC color tokens
- [ ] Set up font loading (Lora, Poppins, Great Vibes)
- [ ] Build Home page (hero + value props + CTA)
- [ ] Build Shop page (product grid + filters)
- [ ] Build Order page (custom order form)
- [ ] Integrate Stripe checkout
- [ ] Test order flow end-to-end
- [ ] Deploy to production (wise2.net/cc or cc.wise2.net)
- [ ] Set up domain (DNS records)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Verify HTTPS + SEO meta tags
- [ ] Create CC admin account
- [ ] **LAUNCH** ✅

---

## Phase 2: Dashboard + Order Management (Week 2)

### 2.1 Dashboard Features

- **Orders View**: List all orders, status, timeline
- **Customer List**: All customers, order history, contact info
- **Analytics**: Monthly revenue, top products, seasonal trends
- **Notifications**: New order → email/SMS to CC
- **Approval Workflow**: Customer proof → CC review → approve/request changes

### 2.2 Approval Workflow

```
1. Customer submits custom order + uploads design/reference
   ↓
2. CC receives email notification
   ↓
3. CC logs into dashboard → Review → Create proof
   ↓
4. CC uploads proof to customer portal
   ↓
5. Customer approves or requests changes
   ↓
6. Approved → Mark as "production" → CC executes
   ↓
7. Mark as "ready" → Send pickup/delivery notification
```

### 2.3 Deployment Checklist (Week 2)

- [ ] Build dashboard home (KPI tiles, recent orders)
- [ ] Build orders management view
- [ ] Build customer list + search
- [ ] Build analytics dashboard (charts, trends)
- [ ] Set up email notifications (Resend or Sendgrid)
- [ ] SMS notifications (Twilio optional)
- [ ] Deploy to production
- [ ] Test full workflow with CC

---

## Phase 3: Creative Studio Access (Week 3)

### 3.1 Provide CC With

- Access to WISE² Creative Studio (/studio)
- Custom design templates for her products
- Proof export tools (PDF, PNG)
- Client-facing design portal (customers upload files)

### 3.2 Deployment Checklist (Week 3)

- [ ] Grant CC admin access to Creative Studio
- [ ] Create custom design templates (party labels, water bottles, etc.)
- [ ] Build customer design upload portal
- [ ] Test proof generation + export
- [ ] Train CC on Creative Studio

---

## Phase 4: Growth + Automation (Week 4+)

### 4.1 Features

- **Instagram Integration**: Auto-post new orders to @cc.craftandcreate
- **Email Sequences**: Welcome, order confirmation, delivery, follow-up
- **Analytics**: Seasonal trends, product performance, customer lifetime value
- **Referral Program**: Discount code for referrals
- **Bulk Order Discounts**: Automatic tiering

### 4.2 Deployment Checklist (Week 4)

- [ ] Set up Instagram API integration
- [ ] Create email templates (Resend)
- [ ] Build referral tracking
- [ ] Deploy automation
- [ ] Test full platform with CC

---

## Success Criteria

### Week 1 (Website Launch)
- ✅ Website live on production domain
- ✅ 5+ products in catalog
- ✅ Stripe integrated and tested
- ✅ First test order completed
- ✅ HTTPS active, SEO tags in place

### Week 2 (Dashboard Launch)
- ✅ CC can manage orders from dashboard
- ✅ Email notifications working
- ✅ Approval workflow tested
- ✅ CC trained on dashboard

### Week 3 (Creative Tools)
- ✅ CC using Creative Studio for proofs
- ✅ Customers can upload design files
- ✅ PDF exports working

### Week 4 (Growth)
- ✅ 5+ orders completed through platform
- ✅ Analytics showing trends
- ✅ CC collecting payment via Stripe
- ✅ System stable and reliable

---

## Technical Stack

| Layer | Technology | Port |
|-------|-----------|------|
| **Frontend** | Next.js 14 + React 18 | 3011 |
| **Database** | PostgreSQL | 5432 |
| **API** | Next.js API Routes | 3011 |
| **Auth** | NextAuth.js | - |
| **Payment** | Stripe | - |
| **Email** | Resend | - |
| **Hosting** | Docker + Nginx | 173.208.147.165 |
| **CDN** | Vercel (optional) | - |

---

## Important Notes

### Brand Guidelines (LOCKED)
- **Do NOT** deviate from CC color palette without approval
- **Do NOT** use different fonts (Lora/Poppins/Great Vibes only)
- **Do NOT** modify logo or brand identity
- **All copywriting** must align with "Crafted for the Moment" message

### Placeholders to Replace
- **Phone**: Replace placeholder with CC's real phone
- **Email**: Replace placeholder with CC's real email
- **Address**: Replace placeholder with pickup location
- **Contact form**: Route to CC's verified email

### First Payment
- Set CC's Stripe payment schedule (weekly/monthly payout)
- Set WISE² commission (% or flat fee — TBD)
- Document in contract

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Payment processing fails | Test Stripe integration with real card |
| Database goes down | Automated daily backups + recovery plan |
| Site traffic spike | Monitor performance, scale on-demand |
| CC gets unsupported orders | Create FAQ + help documentation |
| Design approval takes too long | Set SLA (e.g., CC approves within 24hrs) |

---

## Communication Plan

**Weekly Sync** (Thursdays 2pm UTC):
- Review orders processed
- Address blockers
- Plan next phase

**Slack Channel**: #cc-craft-create-support

**Escalation**: dwise03@gmail.com

---

## Next Actions (Immediate)

1. **TODAY**: Set up Next.js project structure
2. **TODAY**: Extract logo + brand colors
3. **TOMORROW**: Build home page mockup
4. **TOMORROW**: Create product database
5. **DAY 3**: Integrate Stripe
6. **DAY 4-5**: Full website build
7. **DAY 6**: Testing + QA
8. **DAY 7**: LAUNCH

---

**Updated**: 2026-08-21  
**Owner**: dwise (WISE² Founder)  
**Status**: ⏳ Phase 1 In Progress
