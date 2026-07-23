# WISE² Customer Journey — Deployment Guide

Complete guide to deploy the full customer journey system.

## Prerequisites
- ✅ Stripe account
- ✅ Email service (SendGrid/Mailgun/AWS SES)  
- ✅ PostgreSQL 15+ database
- ✅ Node.js 18+
- ✅ NestJS API running

## Step 1: Stripe Configuration

### Create Products & Prices
```bash
# Starter: $29/month
STARTER_PRICE=price_1234567890
# Pro: $99/month  
PRO_PRICE=price_0987654321
```

### Environment Variables
```bash
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

APP_URL=https://wise2.io
API_BASE_URL=https://api.wise2.io

SENDGRID_API_KEY=SG.xxxxxx
SENDGRID_FROM_EMAIL=billing@wise2.io

DATABASE_URL=postgresql://user:pass@localhost:5432/wise2_prod
```

### Webhook Configuration
Register webhook at: `https://api.wise2.io/v1/billing/webhook`

Subscribe to events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- charge.refunded

## Step 2: Database Setup

```bash
# Run migrations
psql $DATABASE_URL < packages/db/schema.sql

# Verify tables
\dt subscriptions, workspaces, invoices, analytics_events
```

## Step 3: API Deployment

```bash
cd packages/api
npm install stripe @sendgrid/mail

# Build
npm run build

# Start
npm run start:prod

# Or with PM2
pm2 start dist/main.js --name api
```

## Step 4: Frontend Deployment

Pages created and ready:
- ✅ `/pricing` - Pricing tiers
- ✅ `/checkout` - Payment form
- ✅ `/onboarding` - 5-step wizard
- ✅ `/dashboard/subscription` - Account management

```bash
cd apps/website
npm run build
npm run start
```

## Step 5: Complete Flow Test

1. Visit `/pricing` page
2. Select plan and click "Start Trial"
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify:
   - [ ] Subscription created in database
   - [ ] Workspace provisioned
   - [ ] Welcome email sent
5. Complete onboarding (5 steps)
6. Visit `/dashboard/subscription` to manage plan

## Step 6: Stripe Test Events

```bash
# Trigger test webhook events
stripe listen --forward-to localhost:3000/v1/billing/webhook

stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## Monitoring

```bash
# Dashboard metrics
curl https://api.wise2.io/v1/analytics/dashboard-metrics

# Check failed payments daily
curl https://api.wise2.io/v1/billing/failed-payments

# Monitor churn risk
curl https://api.wise2.io/v1/analytics/churn-report
```

## Success Metrics

Track these KPIs:
- Pricing page → Checkout conversion
- Checkout → Payment success rate
- Trial → Paid conversion
- Monthly recurring revenue (MRR)
- Customer churn rate
- Invoice payment success rate

---

Status: ✅ All code implemented | 🔧 Ready to configure and deploy
