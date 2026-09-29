# Stripe Payment - Testing Checklist

Quick reference for testing the implementation. Use this during Phase 5 of STRIPE_IMPLEMENTATION_CHECKLIST.md.

---

## Phase 1: Setup Verification

```
[ ] Stripe test API keys configured in .env.local
[ ] Database migration applied: npx prisma migrate dev
[ ] Backend API starts without errors
[ ] Frontend components import correctly
[ ] Stripe CLI forwarding active (optional, for local testing)
```

---

## Phase 2: Free Tier Testing

### 2.1 User Creation
```
[ ] Register new user
[ ] Subscription defaults to FREE plan
[ ] GET /api/v1/billing/subscription returns:
      - plan: "FREE"
      - status: "INACTIVE"
      - generationsPerMonth: 5
      - generationsUsed: 0
```

### 2.2 Generation Limit - Allow First 5
```
[ ] POST /api/v1/billing/record-generation (1st time) → Success
[ ] generationsUsed increments to 1
[ ] POST /api/v1/billing/record-generation (2nd time) → Success
[ ] generationsUsed increments to 2
[ ] Repeat for 3rd, 4th, 5th
[ ] All 5 succeed, counter at 5
```

### 2.3 Generation Limit - Block 6th
```
[ ] GET /api/v1/billing/can-generate (6th attempt)
    Response: { allowed: false, remaining: 0 }
[ ] Error message: "Monthly generation limit reached"
[ ] UI shows "Upgrade to Unlimited" button
```

---

## Phase 3: Checkout Flow

### 3.1 Create Checkout Session
```
[ ] Click "Upgrade to Starter" button
[ ] POST /api/v1/billing/checkout called with:
      - planId: "STARTER"
      - successUrl: "..."
      - cancelUrl: "..."
[ ] Response includes:
      - sessionId: "cs_test_..."
      - url: "https://checkout.stripe.com/..."
[ ] User redirected to Stripe checkout
```

### 3.2 Stripe Checkout Page
```
[ ] Stripe checkout loads with plan details
[ ] Displays: Starter Plan, $49/month
[ ] Email field pre-filled
[ ] Card input ready
```

---

## Phase 4: Payment Success Flow

### 4.1 Enter Test Payment
```
[ ] Card number: 4242 4242 4242 4242
[ ] Expiry: Any future date (12/25)
[ ] CVC: Any 3 digits (123)
[ ] Click "Pay" or "Subscribe"
```

### 4.2 Verify Stripe Events
```
[ ] Stripe Dashboard shows:
    ✓ Payment intent created & succeeded
    ✓ Customer created
    ✓ Subscription created
```

### 4.3 Verify Webhook Received
```
[ ] Server logs show:
    "📢 Received Stripe webhook: payment_intent.succeeded"
    "📢 Received Stripe webhook: customer.subscription.created"
    "✅ Processed webhook: customer.subscription.created"
```

### 4.4 Verify Database Updated
```
[ ] Query: SELECT * FROM "Subscription" WHERE "userId" = '...'
[ ] Check:
    ✓ stripeCustomerId populated
    ✓ stripeSubscriptionId populated
    ✓ stripePriceId populated (price_STARTER_monthly)
    ✓ plan = "STARTER"
    ✓ status = "ACTIVE"
    ✓ currentPeriodStart set
    ✓ currentPeriodEnd set (30 days from now)
```

### 4.5 Redirect to Success Page
```
[ ] Redirected to /billing/success
[ ] Shows: "Payment Successful!"
[ ] Auto-redirects to /billing after 2 seconds
```

---

## Phase 5: Post-Upgrade Testing

### 5.1 Verify New Limits
```
[ ] GET /api/v1/billing/subscription returns:
      - plan: "STARTER"
      - status: "ACTIVE"
      - generationsPerMonth: 100 (or 50, depends on config)
      - generationsUsed: 0 (reset after plan change)
```

### 5.2 Can Generate More
```
[ ] POST /api/v1/billing/record-generation (6th time) → Success
[ ] POST /api/v1/billing/record-generation (50th time) → Success
[ ] POST /api/v1/billing/record-generation (100th time) → Success
[ ] GET /api/v1/billing/can-generate → { allowed: true, remaining: 0 }
[ ] POST /api/v1/billing/record-generation (101st time) → Blocked
```

---

## Phase 6: Upgrade (Pro) Testing

### 6.1 Initiate Upgrade
```
[ ] Already on Starter ($49)
[ ] Click "Upgrade to Pro" ($99)
[ ] POST /api/v1/billing/checkout with planId: "PRO"
[ ] Stripe checkout shows Pro plan
```

### 6.2 Verify Proration
```
[ ] Stripe invoice shows:
    ✓ Credit for remaining Starter period
    ✓ Charge for Pro remainder
    ✓ Net difference calculated correctly
[ ] Example: Mid-month upgrade should be partial month
```

### 6.3 Payment Success
```
[ ] Enter test card
[ ] Webhook: customer.subscription.updated fires
[ ] Database update:
    ✓ plan = "PRO"
    ✓ stripePriceId = price_PRO_monthly
    ✓ status = "ACTIVE"
```

### 6.4 Unlimited Generations
```
[ ] GET /api/v1/billing/subscription returns:
      - plan: "PRO"
      - generationsPerMonth: 999999 (unlimited)
[ ] Can generate 1000+ times without hitting limit
```

---

## Phase 7: Downgrade Testing

### 7.1 Downgrade to Free
```
[ ] On Pro plan
[ ] Click "Downgrade to Free"
[ ] PUT /api/v1/billing/subscription/plan with planId: "FREE"
```

### 7.2 Verify Cancellation
```
[ ] Webhook: customer.subscription.deleted fires
[ ] Database update:
    ✓ plan = "FREE"
    ✓ status = "CANCELED"
    ✓ canceledAt = now()
    ✓ stripeSubscriptionId = null
```

### 7.3 Back to Free Limits
```
[ ] GET /api/v1/billing/subscription returns:
      - plan: "FREE"
      - generationsPerMonth: 5
      - generationsUsed: 0
[ ] 6th generation blocks again
```

---

## Phase 8: Monthly Reset Testing

### 8.1 Manual Database Test
```
[ ] Query: SELECT * FROM "Subscription" WHERE "userId" = '...'
[ ] Set: generationsThisMonth = 5
[ ] Set: lastResetDate = DATE_SUB(NOW(), INTERVAL 35 DAY)
    (Set to 35 days ago, simulating past month)
```

### 8.2 Verify Reset Logic
```
[ ] Call: GET /api/v1/billing/can-generate
[ ] Server calculates: now() > lastResetDate? YES
[ ] Resets: generationsThisMonth = 0, lastResetDate = now()
[ ] Response: { allowed: true, remaining: 5 }
```

### 8.3 Can Generate Full Amount
```
[ ] POST /api/v1/billing/record-generation (1st) → Success
[ ] POST /api/v1/billing/record-generation (5th) → Success
[ ] POST /api/v1/billing/record-generation (6th) → Blocked
```

---

## Phase 9: Error Cases

### 9.1 Declined Payment
```
[ ] Card: 4000 0000 0000 0002 (declined test card)
[ ] Attempt checkout
[ ] Stripe shows error: "Card declined"
[ ] Webhook: invoice.payment_failed fires
[ ] Database: status = "PAST_DUE" (if applicable)
[ ] Generation blocked with: "Subscription past_due"
```

### 9.2 Invalid Webhook Signature
```
[ ] Use curl to send webhook with wrong signature
[ ] Response: 400 Bad Request "Invalid signature"
[ ] Database: No changes made
[ ] Logs: "❌ Invalid Stripe webhook signature"
```

### 9.3 Webhook Signature Verification
```
[ ] Start Stripe CLI: stripe listen --forward-to ...
[ ] Trigger test event: stripe trigger payment_intent.succeeded
[ ] Server should verify signature
[ ] Webhook processed successfully
```

### 9.4 Duplicate Webhook Processing
```
[ ] Send same webhook twice (copy exact JSON)
[ ] First: Webhook processes, DB updates
[ ] Second: Same data, verify idempotent (no duplicate records)
[ ] Check: No duplicate UsageLog entries
```

---

## Phase 10: Feature Gate UI Testing

### 10.1 Component Renders
```
[ ] <FeatureGate> component loads without error
[ ] Shows content when allowed
[ ] Shows "Blocked" message when limit reached
[ ] Displays upgrade modal when blocked
```

### 10.2 Limit Warning
```
[ ] At 80% usage (4/5 for free tier)
[ ] Banner shows: "You have 1 generation remaining"
[ ] Shows "Upgrade for unlimited" link
[ ] Content still accessible
```

### 10.3 Limit Blocking
```
[ ] At 100% usage (5/5 for free tier)
[ ] Content blocked by modal
[ ] Modal shows pricing options
[ ] "Upgrade Now" button redirects to checkout
```

### 10.4 Auto-Refresh
```
[ ] Feature gate checks limit
[ ] Wait 1 minute (or manually call checkLimit())
[ ] Limit re-checked automatically
[ ] If limit changed, UI updates
```

---

## Phase 11: Integration Testing

### 11.1 End-to-End Flow
```
[ ] Create account
[ ] Confirm free tier (5 generation limit)
[ ] Generate music 5 times
[ ] 6th blocked
[ ] Upgrade to Starter
[ ] Generate music 50 times
[ ] Still under limit
[ ] Downgrade to Free
[ ] Back to 5 limit
[ ] Monthly reset works
```

### 11.2 Concurrent Users
```
[ ] Create 2 test users
[ ] User 1: On free tier, 5 generations
[ ] User 2: On pro tier, 1000+ generations
[ ] Verify limits per-user (isolated)
[ ] User 1 limited, User 2 unlimited
[ ] No cross-user interference
```

### 11.3 Multiple Plan Changes
```
[ ] User: Free → Starter → Pro → Starter → Free
[ ] Verify each transition:
    ✓ Webhook fires correctly
    ✓ Stripe subscription updates
    ✓ Database reflects current state
    ✓ Generation limits accurate
    ✓ No orphaned records
```

---

## Phase 12: Performance Testing

### 12.1 Checkout Performance
```
[ ] Time to checkout page: < 2 seconds
[ ] Stripe checkout load: < 3 seconds
[ ] No console errors
```

### 12.2 Webhook Performance
```
[ ] Webhook processing: < 1 second
[ ] Database queries optimized
[ ] No timeouts
```

### 12.3 Feature Gate Performance
```
[ ] Initial load: < 500ms
[ ] Limit check: < 300ms
[ ] No page slowdown when gating features
```

---

## Phase 13: Security Testing

### 13.1 Webhook Security
```
[ ] Signature required
[ ] Invalid signature: Rejected with 400
[ ] Tampered payload: Rejected
[ ] Expired timestamp: Rejected (if checking)
```

### 13.2 API Authentication
```
[ ] All endpoints (except webhook/pricing) require auth
[ ] Missing JWT: 401 Unauthorized
[ ] Invalid JWT: 401 Unauthorized
[ ] Expired JWT: 401 Unauthorized
```

### 13.3 User Data Isolation
```
[ ] User A cannot see User B's subscription
[ ] User A cannot modify User B's plan
[ ] User A cannot record generations for User B
```

### 13.4 No Sensitive Data Leaks
```
[ ] Logs don't contain API keys
[ ] Logs don't contain card numbers
[ ] Logs don't contain full customer IDs (use prefix only)
[ ] Error messages don't expose internal details
```

---

## Phase 14: Browser Compatibility

```
[ ] Chrome/Chromium: Full functionality
[ ] Firefox: Full functionality
[ ] Safari: Full functionality
[ ] Edge: Full functionality
[ ] Mobile (iOS Safari): Responsive
[ ] Mobile (Android Chrome): Responsive
```

---

## Phase 15: Documentation

```
[ ] README updated with setup instructions
[ ] API docs generated (Swagger/OpenAPI)
[ ] Frontend component docs created
[ ] Webhook docs complete
[ ] Example code provided
[ ] Troubleshooting guide written
```

---

## Phase 16: Monitoring & Alerts

```
[ ] Webhook failures monitored
[ ] Failed payment alerts configured
[ ] API error monitoring active
[ ] Database monitoring active
[ ] Logging aggregation working (if applicable)
[ ] Slack/Email alerts configured (if applicable)
```

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | __________ | __/__/__ | ☐ Pass / ☐ Fail |
| QA | __________ | __/__/__ | ☐ Pass / ☐ Fail |
| Reviewer | __________ | __/__/__ | ☐ Pass / ☐ Fail |

---

## Known Issues & Workarounds

### Issue: Webhook Not Triggering
```
Workaround:
1. Verify STRIPE_WEBHOOK_SECRET in .env
2. Check Stripe Dashboard → Webhooks → Recent Deliveries
3. Manually resend webhook from dashboard
4. Check server logs for errors
```

### Issue: Generation Limit Not Resetting
```
Workaround:
1. Check lastResetDate in database
2. Manually set: UPDATE "Subscription" SET "lastResetDate" = NOW()
3. Call GET /api/v1/billing/can-generate
4. Should trigger reset logic
```

### Issue: Stripe Checkout Redirect Fails
```
Workaround:
1. Verify successUrl/cancelUrl not localhost (won't work)
2. Use ngrok or similar for local HTTPS
3. Check browser console for error
4. Verify API endpoint returns valid session URL
```

---

## Test Data

### Test Credit Cards
```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
Exp Decline:    4000 0000 0000 9995
Requires Auth:  4000 2500 0000 3155
```

Expiry: 12/25 or any future date
CVC: 123 or any 3 digits

### Test Customers
```
Email: test@stripe.example.com
Name: Test User

Email: test2@stripe.example.com
Name: Another Test User
```

---

## Rollback Procedure

If critical issues found:

```bash
# 1. Disable checkout endpoint
# Temporarily return error from POST /api/v1/billing/checkout

# 2. Revert code
git revert <commit-hash>

# 3. Redeploy
npm run deploy

# 4. Notify users
Send email: "Billing temporarily unavailable - we're fixing it"

# 5. Contact Stripe Support
If webhooks affected: support@stripe.com
```

---

**Remember**: Each checkbox represents one test case. Don't skip sections.

**Total Estimated Time**: 2-3 hours for full test suite

**Last Updated**: 2026-07-18
