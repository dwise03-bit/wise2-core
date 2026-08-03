# Stripe Payment Integration - Implementation Checklist

## Project Overview
Stripe payment integration for WISE² Podcast Music subscription system ($49/month).
- Free tier: 5 generations/month
- Paid tier: Unlimited generations
- Full upgrade/downgrade support with proration

---

## Phase 1: Environment Setup

### 1.1 Stripe Account Configuration
- [ ] Create/access Stripe account (https://dashboard.stripe.com)
- [ ] Enable test mode
- [ ] Copy test API keys:
  - [ ] **Publishable Key** (starts with `pk_test_`)
  - [ ] **Secret Key** (starts with `sk_test_`)
  - [ ] **Webhook Signing Secret** (from Webhooks section)

### 1.2 Environment Variables
Update `.env.local` and `.env.production`:
```bash
# Stripe Test Keys
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXX
STRIPE_WEBHOOK_SECRET=whsec_test_XXXXXX

# Stripe Price IDs (created in Stripe dashboard)
STRIPE_PRICE_ID_STARTER=price_XXXXXX  # $49/month
STRIPE_PRICE_ID_PRO=price_XXXXXX      # $99/month
STRIPE_PRICE_ID_ENTERPRISE=price_XXXXXX
```

### 1.3 Database Migrations
- [ ] Run Prisma migration to apply schema changes:
  ```bash
  npx prisma migrate dev --name add_subscription_billing
  npx prisma generate
  ```
- [ ] Verify new tables created:
  - [ ] `Subscription` (updated with new fields)
  - [ ] `UsageLog` (new)

---

## Phase 2: Backend Setup

### 2.1 Stripe Service
- [ ] Verify `packages/api/src/billing/stripe.service.ts` includes:
  - [ ] `createCustomer()` - Creates Stripe customer
  - [ ] `createCheckoutSession()` - **NEW** - Creates checkout session
  - [ ] `createPaymentIntent()` - **NEW** - For manual payments
  - [ ] `createSubscription()` - Creates subscription
  - [ ] `updateSubscription()` - Changes plan (with proration)
  - [ ] `cancelSubscription()` - Cancels subscription
  - [ ] `verifyWebhookSignature()` - Validates webhook signatures
  - [ ] `handleWebhookEvent()` - Routes webhook events
  - [ ] Logging for all operations

### 2.2 Billing Service
- [ ] Verify `packages/api/src/billing/billing.service.ts` includes:
  - [ ] `getPricingTiers()` - Returns available plans
  - [ ] `getSubscription()` - Fetches user subscription with usage
  - [ ] `createCheckoutSession()` - **NEW** - Handles checkout flow
  - [ ] `handleSubscriptionCreated()` - **NEW** - Updates DB on webhook
  - [ ] `handleSubscriptionDeleted()` - **NEW** - Updates DB on cancellation
  - [ ] `canGenerateMusic()` - **NEW** - Feature gating check
  - [ ] `recordGeneration()` - **NEW** - Tracks usage per user
  - [ ] `updatePlan()` - **NEW** - Upgrade/downgrade logic
  - [ ] Monthly reset logic for generation counter

### 2.3 Webhook Controller
- [ ] Verify `packages/api/src/billing/stripe-webhook.controller.ts` includes:
  - [ ] Endpoint: `POST /api/v1/billing/webhook/stripe`
  - [ ] Signature verification (prevents replay attacks)
  - [ ] Handlers for:
    - [ ] `payment_intent.succeeded`
    - [ ] `customer.subscription.created`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
  - [ ] Proper error handling and logging
  - [ ] Calls to `BillingService` for DB updates

### 2.4 Billing Controller
- [ ] Verify `packages/api/src/billing/billing.controller.ts` includes endpoints:
  - [ ] `GET /api/v1/billing/pricing` - List pricing tiers
  - [ ] `GET /api/v1/billing/subscription` - Current user's subscription
  - [ ] `POST /api/v1/billing/checkout` - Create checkout session
  - [ ] `PUT /api/v1/billing/subscription/plan` - Change plan
  - [ ] `GET /api/v1/billing/can-generate` - Check generation limits
  - [ ] `POST /api/v1/billing/record-generation` - Track usage
  - [ ] Proper authentication (extract userId from JWT)
  - [ ] Request validation and error responses

### 2.5 Module Configuration
- [ ] Verify `packages/api/src/billing/billing.module.ts` exports `StripeService`
- [ ] Verify `BillingModule` is imported in `AppModule`
- [ ] Check that `PrismaService` is available to `BillingService`

---

## Phase 3: Frontend Setup

### 3.1 Stripe Checkout Component
- [ ] Verify `packages/ui-components/src/billing/StripeCheckout.tsx` includes:
  - [ ] Component props (planId, monthlyPrice, callbacks)
  - [ ] API call to `/api/v1/billing/checkout`
  - [ ] Redirect to Stripe checkout URL
  - [ ] Error handling and loading states
  - [ ] Success/cancel callbacks
  - [ ] Security: Pass full URLs to avoid XSS

### 3.2 Feature Gating Component
- [ ] Verify `packages/ui-components/src/billing/FeatureGate.tsx` includes:
  - [ ] `<FeatureGate>` component wrapper
  - [ ] `useGenerationLimit()` hook
  - [ ] Blocks UI when limit reached
  - [ ] Shows upgrade prompt modal
  - [ ] Warning when approaching limit (80% usage)
  - [ ] Display remaining generations and reset date
  - [ ] Automatic refresh every minute

### 3.3 Subscription Hook
- [ ] Verify `packages/ui-components/src/billing/useSubscription.ts` includes:
  - [ ] `fetchSubscription()` - Get current subscription
  - [ ] `upgrade()` - Start checkout flow
  - [ ] `downgrade()` - Change to lower plan
  - [ ] `canGenerate()` - Check if can proceed
  - [ ] `recordGeneration()` - Log usage
  - [ ] Proper error handling
  - [ ] Loading/error states

### 3.4 Integrate into Apps
For each app (studio, website, dashboard):
- [ ] Import billing components from `@wise2/ui-components`
- [ ] Add `/upgrade` page or modal
- [ ] Add `/billing` dashboard page
- [ ] Integrate `<FeatureGate>` around generation features
- [ ] Add `useSubscription` to relevant components
- [ ] Handle success/cancel redirects

---

## Phase 4: Stripe Dashboard Configuration

### 4.1 Create Products
In Stripe Dashboard → Products:
- [ ] **Product: Podcast Music - Starter**
  - [ ] Price: $49/month (recurring)
  - [ ] Billing period: Monthly
  - [ ] Save Price ID → Update `.env` as `STRIPE_PRICE_ID_STARTER`

- [ ] **Product: Podcast Music - Pro**
  - [ ] Price: $99/month (recurring)
  - [ ] Billing period: Monthly
  - [ ] Save Price ID → Update `.env` as `STRIPE_PRICE_ID_PRO`

- [ ] **Product: Podcast Music - Enterprise** (optional)
  - [ ] Price: $299/month (recurring)
  - [ ] Custom setup

### 4.2 Configure Webhooks
In Stripe Dashboard → Webhooks:
- [ ] Add endpoint: `https://api.wise2.net/api/v1/billing/webhook/stripe`
  - [ ] For development: Use Stripe CLI forwarding
  - [ ] For production: Use actual domain
- [ ] Enable events:
  - [ ] `payment_intent.succeeded`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copy Webhook Signing Secret
- [ ] Update `.env` as `STRIPE_WEBHOOK_SECRET`

### 4.3 Test Mode Verification
- [ ] Verify all settings are in Test Mode (not Live)
- [ ] Use test card: `4242 4242 4242 4242` (expires 12/25)
- [ ] Verify test customers appear in dashboard

---

## Phase 5: Local Testing

### 5.1 Test Infrastructure Setup
- [ ] Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
- [ ] Authenticate: `stripe login`
- [ ] Forward webhooks locally:
  ```bash
  stripe listen --forward-to localhost:3000/api/v1/billing/webhook/stripe
  ```
- [ ] Note the webhook signing secret from CLI output

### 5.2 Unit Tests
File: `packages/api/src/billing/stripe.service.spec.ts`

- [ ] Test `createCustomer()`
  - [ ] Valid input creates customer
  - [ ] Missing API key throws error
  - [ ] Network error is handled

- [ ] Test `createCheckoutSession()`
  - [ ] Returns valid session URL
  - [ ] Redirects to Stripe checkout
  - [ ] Invalid price ID rejected

- [ ] Test `verifyWebhookSignature()`
  - [ ] Valid signature passes verification
  - [ ] Invalid signature fails
  - [ ] Missing secret returns false

Create integration tests:
```bash
npm test --testPathPattern="stripe" -- --verbose
```

### 5.3 Manual Testing - Happy Path

#### 5.3.1 User Creation & Free Tier
- [ ] Register new user
- [ ] Verify subscription defaults to FREE
- [ ] Check `/api/v1/billing/subscription` returns:
  ```json
  {
    "plan": "FREE",
    "status": "INACTIVE",
    "generationsPerMonth": 5,
    "generationsUsed": 0
  }
  ```
- [ ] Can generate 5 times, 6th blocked

#### 5.3.2 Generation Limit Tracking
- [ ] Use `POST /api/v1/billing/record-generation` 5 times
- [ ] Verify `generationsThisMonth` increments
- [ ] Call 6th time → `canGenerateMusic()` returns `allowed: false`
- [ ] Check error message: "Monthly generation limit reached"

#### 5.3.3 Checkout Flow
- [ ] Click "Upgrade to Starter"
- [ ] Calls `POST /api/v1/billing/checkout`
- [ ] Redirects to Stripe checkout
- [ ] **Stripe Dashboard**: Verify checkout session created

#### 5.3.4 Payment Success
- [ ] Enter test card: `4242 4242 4242 4242`, any future date
- [ ] Submit payment
- [ ] Webhook fires: `payment_intent.succeeded`
- [ ] Webhook fires: `customer.subscription.created`
- [ ] **Database**: `Subscription.status` = `ACTIVE`
- [ ] **Database**: `Subscription.plan` = `STARTER`
- [ ] Can now generate unlimited (within $49/month tier)

#### 5.3.5 Usage Tracking After Upgrade
- [ ] Generate 150 times
- [ ] All succeed (no 100-generation limit for Starter)
- [ ] Verify DB shows `generationsThisMonth: 150`

#### 5.3.6 Upgrade Pro & Proration
- [ ] Customer currently on Starter ($49)
- [ ] Click "Upgrade to Pro" ($99)
- [ ] **Stripe**: Shows proration credit for remaining period
- [ ] Webhook fires: `customer.subscription.updated`
- [ ] **Database**: `Subscription.plan` = `PRO`
- [ ] **Database**: `stripePriceId` updated to Pro price

#### 5.3.7 Downgrade to Free
- [ ] Click "Downgrade to Free"
- [ ] Calls `PUT /api/v1/billing/subscription/plan` with `planId: FREE`
- [ ] **Stripe**: Subscription cancelled
- [ ] Webhook fires: `customer.subscription.deleted`
- [ ] **Database**: `Subscription.status` = `CANCELED`
- [ ] **Database**: `Subscription.plan` = `FREE`
- [ ] Back to 5 generations/month limit

#### 5.3.8 Monthly Reset
- [ ] Create test subscription with `generationsThisMonth: 5`
- [ ] Set `lastResetDate` to 2 months ago (database)
- [ ] Call `canGenerateMusic()`
- [ ] Should reset counter to 0 and return full limit
- [ ] Verify `lastResetDate` updated to now

### 5.4 Manual Testing - Error Cases

#### 5.4.1 Payment Failure
- [ ] Use declined test card: `4000 0000 0000 0002`
- [ ] Attempt checkout
- [ ] Webhook fires: `invoice.payment_failed`
- [ ] **Database**: `Subscription.status` = `PAST_DUE`
- [ ] Generation blocked with "Subscription past_due"

#### 5.4.2 Invalid Webhook Signature
- [ ] POST to `/api/v1/billing/webhook/stripe` with wrong secret
- [ ] Response: `400 Bad Request` "Invalid signature"
- [ ] No database changes

#### 5.4.3 Stripe Service Down
- [ ] Disconnect from internet
- [ ] Attempt checkout
- [ ] Error logged and returned to user
- [ ] Graceful error message (not 500)

#### 5.4.4 Duplicate Webhook Processing
- [ ] Send same webhook event twice
- [ ] First updates database
- [ ] Second is idempotent (no duplicate changes)

### 5.5 Frontend Testing

- [ ] `<StripeCheckout>` component loads
- [ ] Clicking button redirects to Stripe checkout
- [ ] `<FeatureGate>` blocks content when limit reached
- [ ] Shows "Upgrade" button when at limit
- [ ] `useSubscription()` hook fetches data
- [ ] Warning shows at 80% usage

---

## Phase 6: Staging Deployment

### 6.1 Environment Setup
- [ ] Create staging Stripe API keys
- [ ] Update `.env.production` with staging keys
- [ ] Update webhook endpoint to staging domain
- [ ] Deploy API to staging server

### 6.2 Staging Webhook Testing
- [ ] Update Stripe webhook endpoint to staging
- [ ] Run through full flow:
  - [ ] Create account
  - [ ] Attempt generation (should be limited to 5)
  - [ ] Upgrade to Starter
  - [ ] Verify payment success webhook received
  - [ ] Verify database updated
  - [ ] Verify generation limit increased

### 6.3 Data Validation
- [ ] Check database for correct records:
  ```sql
  SELECT * FROM "Subscription" WHERE "stripeSubscriptionId" IS NOT NULL;
  SELECT * FROM "UsageLog" ORDER BY "createdAt" DESC LIMIT 10;
  ```

---

## Phase 7: Production Deployment

### 7.1 Pre-Production Checklist
- [ ] Switch Stripe account to Live Mode
- [ ] Replace API keys with live keys in `.env.production`
- [ ] Update webhook signing secret with live secret
- [ ] Update webhook endpoint URL to production
- [ ] Enable email notifications for failed payments
- [ ] Set up Stripe fraud prevention (if applicable)
- [ ] Configure dunning management for failed charges
- [ ] Test with real payment methods (small amount)

### 7.2 Production Webhook Configuration
- [ ] Stripe Dashboard → Webhooks → Add Endpoint
- [ ] URL: `https://api.wise2.net/api/v1/billing/webhook/stripe`
- [ ] Events: Same as staging
- [ ] Save signing secret

### 7.3 Monitoring Setup
- [ ] Set up alerts for failed webhooks:
  - [ ] Stripe Dashboard → Webhooks → Failed Deliveries
  - [ ] Configure email/Slack notification
- [ ] Monitor API logs for billing errors:
  ```bash
  tail -f /var/log/wise2-api/billing.log
  ```
- [ ] Track key metrics:
  - [ ] Checkout completion rate
  - [ ] Payment success rate
  - [ ] Generation limit violations

### 7.4 Production Verification
- [ ] Test full checkout flow with real payment
- [ ] Use real test card (or card from dev account)
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Verify database records created correctly
- [ ] Verify user can generate after payment
- [ ] Test downgrade/cancellation flow

---

## Phase 8: Post-Deployment

### 8.1 User Communication
- [ ] Create FAQ for subscription tiers
- [ ] Add billing documentation to help center
- [ ] Send announcement email to users
- [ ] Update marketing site with pricing page

### 8.2 Monitoring & Maintenance
- [ ] Weekly check of failed webhooks
- [ ] Monitor Stripe dashboard for disputes/chargebacks
- [ ] Review failed payment attempts
- [ ] Check for stranded customers (failed payment, no retry)
- [ ] Database backups include billing data

### 8.3 Customer Support
- [ ] Set up email templates for:
  - [ ] Payment received receipts
  - [ ] Payment failed / retry required
  - [ ] Subscription cancelled confirmation
  - [ ] Upgrade confirmation
- [ ] Document refund/cancellation policy
- [ ] Set up process for manual subscription fixes
- [ ] Create admin panel for subscription management

---

## Testing Data

### Test Credit Cards (Stripe)
```
Visa (Success):     4242 4242 4242 4242
Visa (Declined):    4000 0000 0000 0002
Visa (Exp Decline): 4000 0000 0000 9995
MasterCard (Auth):  5555 5555 5555 4444
Amex:               3782 822463 10005
```

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits

### Test Customers
```json
{
  "email": "test@example.com",
  "name": "Test User"
}
```

---

## Troubleshooting

### Webhook Not Triggering
- [ ] Check Stripe Dashboard → Webhooks → Recent Deliveries
- [ ] Verify signing secret matches `.env`
- [ ] Check API logs for signature verification errors
- [ ] Try resending webhook from Stripe dashboard

### Database Not Updating After Payment
- [ ] Check if webhook handler called
- [ ] Verify `stripeCustomerId` in Subscription matches webhook customer
- [ ] Check if `BillingService.handleSubscriptionCreated()` has errors
- [ ] Manually update for testing: `UPDATE "Subscription" SET "plan" = 'STARTER' WHERE "id" = '...'`

### Proration Not Working
- [ ] Verify `updateSubscription()` passes `proration_behavior: 'create_prorations'`
- [ ] Check Stripe Dashboard for proration invoice created
- [ ] Ensure prices are in same currency and billing cycle

### Feature Gate Always Blocking
- [ ] Check `lastResetDate` in database (should be in past month)
- [ ] Verify `generationsThisMonth` counter
- [ ] Test `canGenerateMusic()` directly in API

---

## Security Checklist

- [ ] Webhook signature always verified
- [ ] API keys only in environment variables (never in code)
- [ ] Rate limiting on checkout endpoint (prevent abuse)
- [ ] CORS configured properly for checkout requests
- [ ] User authentication verified before billing operations
- [ ] No sensitive Stripe data logged
- [ ] PCI compliance (never handle raw card data)
- [ ] HTTPS enforced for all billing endpoints
- [ ] Webhook endpoint not publicly cached
- [ ] Sensitive operations log audit trail

---

## Rollback Plan

If issues found in production:

1. **Stop accepting new subscriptions**: Disable checkout endpoint
2. **Revert code**: `git revert <commit>`
3. **Deploy previous version**: `npm run deploy`
4. **Notify customers**: Send email about temporary outage
5. **Contact Stripe support**: If webhooks affected

---

## Files Modified/Created

```
Backend:
  ✓ packages/db/prisma/schema.prisma (updated Subscription, new UsageLog)
  ✓ packages/api/src/billing/stripe.service.ts (enhanced)
  ✓ packages/api/src/billing/billing.service.ts (rewritten with feature gating)
  ✓ packages/api/src/billing/billing.controller.ts (enhanced)
  ✓ packages/api/src/billing/stripe-webhook.controller.ts (enhanced)
  ✓ packages/api/src/billing/billing.module.ts (no changes needed)

Frontend:
  ✓ packages/ui-components/src/billing/StripeCheckout.tsx (new)
  ✓ packages/ui-components/src/billing/FeatureGate.tsx (new)
  ✓ packages/ui-components/src/billing/useSubscription.ts (new)

Configuration:
  ✓ .env / .env.local (add Stripe keys)
  ✓ .env.example (add Stripe keys example)

Documentation:
  ✓ This file (STRIPE_IMPLEMENTATION_CHECKLIST.md)
```

---

## Success Criteria

- [ ] Users can upgrade from Free to Starter ($49/month)
- [ ] Users can upgrade from Starter to Pro ($99/month)
- [ ] Proration applied correctly on upgrades
- [ ] Users can downgrade to Free (cancels subscription)
- [ ] Generation limits enforced:
  - [ ] Free: 5/month
  - [ ] Starter: 100/month (if configured)
  - [ ] Pro: Unlimited
- [ ] Monthly counter resets on schedule
- [ ] Webhooks reliably update database
- [ ] Failed payments block generation
- [ ] Feature gate UI prevents blocked actions
- [ ] All test cases pass (see Phase 5)
- [ ] Production monitoring active
- [ ] No stripe keys in logs or code

---

## Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Stripe Docs**: https://stripe.com/docs/payments/accept-a-payment
- **API Reference**: https://stripe.com/docs/api
- **Webhook Testing**: https://stripe.com/docs/webhooks/test

---

**Last Updated**: 2026-07-18
**Maintained By**: @dev
**Status**: Ready for implementation
