# WISE² Customer Journey — Complete Implementation

## Overview
Complete customer journey from visitor to paying subscriber to retained customer, spanning 3 phases with frontend pages, backend APIs, and automation.

---

## Phase 1: Discovery Flow (Visitor → Call)

### ✅ Frontend Pages
- **`/pricing`** — Interactive pricing page with:
  - 3 pricing tiers (Starter $29, Pro $99, Enterprise custom)
  - Monthly/Annual billing toggle (20% annual discount)
  - Feature comparison matrix
  - FAQ section
  - CTA buttons to checkout or schedule demo

### 📋 Backend APIs (To Implement)
- `GET /v1/analytics/events` — Track page views, tier selections
- `POST /v1/leads/create` — Capture interest from pricing page
- Calendly webhook integration (receive scheduled calls)

### 🚀 Status
- **Frontend**: ✅ Complete
- **Backend**: 🔲 Pending

---

## Phase 2: Purchase & Onboarding (Call → Workspace)

### ✅ Frontend Pages
- **`/checkout`** (Enhanced)
  - Order summary with selected plan
  - User email + name capture
  - Stripe payment form integration
  - Success/cancel page redirects

- **`/onboarding`** — 5-step guided wizard
  1. Workspace setup (name, URL)
  2. Team setup (size, member emails)
  3. Integrations (optional: Stripe, Discord)
  4. Preferences (timezone, notifications)
  5. Completion (success screen)

### 📋 Backend APIs (To Implement)
- `POST /v1/billing/checkout` — Create Stripe session
  - Input: planId, email, fullName, redirects
  - Output: Stripe checkout URL
  - Trial days: 14 days all plans

- `POST /v1/billing/success` — Fulfill after payment
  - Input: sessionId
  - Actions:
    - Retrieve Stripe subscription
    - Create user account
    - Provision workspace
    - Send welcome email

- `POST /v1/workspaces` — Create workspace
  - Input: name, url, owner_id
  - Output: workspace object with invite link

- `POST /v1/auth/invite` — Send team member invites
  - Input: workspace_id, email list
  - Actions: Send invite emails

- `POST /v1/onboarding/complete` — Complete onboarding flow
  - Input: workspace setup data
  - Output: ready-to-use workspace

- `POST /v1/email/send` — Email service
  - Templates: welcome, team_invite, onboarding_tips

### ✅ Email Automation
- Welcome email (immediately after payment)
- Onboarding tips (Day 1, 3, 7)
- Workspace invite emails (sent during onboarding)
- First usage tracking milestone

### 🚀 Status
- **Frontend**: ✅ Complete
- **Backend**: 🔲 Pending
- **Email**: 🔲 Pending

---

## Phase 3: Lifecycle Management (Dashboard → Retention)

### ✅ Frontend Pages
- **`/dashboard/subscription`** — Account management hub
  - Current plan display (name, price, status)
  - Usage metrics (workspaces, users, days remaining)
  - Billing information (payment method, address)
  - Invoice history with PDF download
  - Upgrade/downgrade modal
  - Cancellation flow with retention offer

### 📋 Backend APIs (To Implement)
- `GET /v1/subscriptions/:id` — Subscription details
  - Returns: plan, status, trial/billing dates, usage
  - Used by: subscription dashboard

- `PUT /v1/subscriptions/:id/plan` — Upgrade/downgrade
  - Input: newPlanId
  - Actions:
    - Update Stripe subscription
    - Adjust billing immediately or at renewal
    - Send upgrade/downgrade confirmation email

- `POST /v1/subscriptions/:id/cancel` — Initiate cancellation
  - Input: reason (optional)
  - Actions:
    - Set `cancelAtPeriodEnd` flag
    - Send retention offer email
    - Schedule exit survey

- `GET /v1/subscriptions/:id/invoices` — Invoice history
  - Returns: list of invoices with status, amount, PDF URL
  - Pagination support

- `GET /v1/subscriptions/:id/usage` — Usage metrics
  - Returns: workspaces created, active users, API calls
  - Used for: upsell triggers, feature enablement

- Stripe Webhook Handler (`POST /api/webhooks/stripe`)
  - Events: subscription.created, updated, deleted
  - Invoice payment_succeeded, payment_failed
  - Actions: update DB, send emails, trigger flows

### 📋 Email Automation
- Upgrade confirmation email
- Downgrade confirmation email
- Invoice email (monthly)
- Payment failed warning (3x with increasing urgency)
- Cancellation confirmation with pause/resume offer
- Win-back campaign (after 30 days of cancellation)
- Usage milestone emails (50% user limit, 90% workspace limit)

### 📊 Analytics & Churn Prevention
- Track: plan changes, cancellation reasons, usage patterns
- Triggers for intervention:
  - Low usage (no activity > 7 days) → "Getting Started" email
  - Approaching limits (90% quota) → Upsell email
  - Cancellation received → 48-hour retention offer
  - Canceled for 30+ days → Win-back campaign

### 🚀 Status
- **Frontend**: ✅ Complete
- **Backend**: 🔲 Pending
- **Email**: 🔲 Pending
- **Analytics**: 🔲 Pending

---

## Database Schema Updates

### Users Table
```sql
ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE users ADD COLUMN workspace_id UUID REFERENCES workspaces(id);
```

### Subscriptions Table (New)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  plan_id VARCHAR NOT NULL (STARTER|PRO|ENTERPRISE),
  status VARCHAR (trialing|active|past_due|canceled),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  cancellation_reason VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Workspaces Table (New)
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR NOT NULL,
  url_slug VARCHAR UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Invoices Table (New)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR,
  amount DECIMAL(10,2),
  status VARCHAR (draft|open|paid|uncollectible|void),
  issued_at TIMESTAMP,
  due_at TIMESTAMP,
  paid_at TIMESTAMP,
  pdf_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Analytics Events Table (New)
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  event_type VARCHAR NOT NULL,
  journey_step VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Checklist

### Phase 1: Discovery
- [x] Pricing page (frontend)
- [ ] Analytics tracking service
- [ ] Lead capture API
- [ ] Calendly integration

### Phase 2: Purchase & Onboarding
- [x] Checkout page (frontend)
- [x] Onboarding wizard (frontend)
- [ ] Stripe checkout API
- [ ] User provisioning API
- [ ] Workspace creation API
- [ ] Email service (welcome, invites, tips)
- [ ] Database schema updates

### Phase 3: Lifecycle
- [x] Subscription dashboard (frontend)
- [ ] Subscription management APIs
- [ ] Invoice management
- [ ] Usage tracking
- [ ] Stripe webhook handler
- [ ] Email automation (upgrades, downgrades, invoices, churn prevention)
- [ ] Analytics & reporting

---

## Key Integrations

### Stripe
- Checkout sessions
- Subscription management
- Invoice generation
- Webhook handling

### Email Service
- SendGrid or similar for transactional emails
- Email templates for all customer journey phases
- Scheduled delivery for onboarding series

### Analytics
- Event tracking (journey steps, conversions)
- Usage metrics (workspace/user counts)
- Churn prediction

---

## Revenue Model

| Plan | Monthly | Annual | Users | Workspaces | Support |
|------|---------|--------|-------|------------|---------|
| Starter | $29 | $278 (save 20%) | 5 | 1 | Email |
| Professional | $99 | $950 (save 20%) | Unlimited | 5 | Priority |
| Enterprise | Custom | Custom | Unlimited | Unlimited | 24/7 |

**Trial**: 14 days free on all plans (no credit card required)

---

## Deployment Notes

1. Update environment variables:
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`
   - `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`
   - `SENDGRID_API_KEY` (or email service)
   - `APP_URL` (for Stripe redirect URLs)

2. Run database migrations for new tables

3. Deploy backend APIs in this order:
   - Billing service
   - Workspace service
   - Email service
   - Stripe webhook handler

4. Wire up Stripe webhooks to production endpoint

5. Test complete flow: pricing → checkout → onboarding → dashboard → invoice

---

## Success Metrics

- **Conversion**: Pricing page → Checkout (target: 5%+)
- **Trial Completion**: Users who complete onboarding (target: 70%+)
- **Upgrade Rate**: Trial → Paid conversion (target: 15%+)
- **Retention**: 30-day active users / new signups (target: 60%+)
- **Churn Rate**: Monthly cancel rate (target: <5%)
- **LTV**: Lifetime value per customer (target: $3000+)

---

**Status**: 🚧 Phase 1 & 2 Frontend Complete | Backend Pending
**Next**: Build backend APIs and wire everything together
