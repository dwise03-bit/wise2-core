# WISE² Consulting & Audits Revenue System - Implementation Guide

**Status**: Core infrastructure built and ready for testing. Remaining steps are configuration and automation.

## What's Been Built ✅

### 1. Database Models
- **ConsultingLead** - Captures intake form responses with scoring, qualification status, and service recommendations
- **ConsultingFollowUp** - Tracks all follow-up automations (emails, calls, upsells)
- **Extended ConsultingService** - Added stripePriceId, featured, isRecurring, isManagementTier
- **Extended Booking** - Added leadId, stripeCheckoutSessionId, deliverableReportUrl, managementSubscriptionId

**Migration**: `/packages/db/prisma/migrations/add_consulting_revenue_system/migration.sql`

### 2. API Routes
**Base**: `/api/v1/consulting`

- `POST /leads` - Submit intake form, calculate lead score, get service recommendation
- `GET /leads/:leadId` - Get lead details (user or admin)
- `PATCH /leads/:leadId` - Update lead status (admin only)
- `POST /checkout` - Create Stripe Checkout Session with pre-selected service
- `GET /services` - List all consulting services with pricing
- `POST /projects/:projectId/complete` - Mark session complete, trigger deliverables
- `GET /projects/:projectId` - Get project details (admin only)

**Implementation**: 
- Routes: `services/api/src/routes/consulting.ts`
- Service layer: `services/api/src/services/consulting.service.ts`
- Registered in: `services/api/src/server.ts`

### 3. Website Pages
- **`/consulting`** - Landing page with 4 service cards, benefits, how it works, FAQ
- **`/intake`** - Lead intake form with dynamic scoring and service recommendation
- **`/consulting/audit`** - AI Business Audit details
- **`/consulting/live-build`** - WISE² Live Build Session details

### 4. Admin Dashboard
- **`/admin/consulting`** - Hub with metrics (leads, qualified, bookings, revenue, conversion rate)
- Plus navigation links to:
  - `/admin/consulting/leads` (template ready)
  - `/admin/consulting/projects` (template ready)
  - `/admin/consulting/follow-ups` (template ready)

## What Still Needs to Be Done ⚙️

### 1. Stripe Setup (MANUAL)
Create products in Stripe dashboard and update database:

```sql
-- Example: After creating products in Stripe, update ConsultingService records

-- First, create the services if they don't exist
INSERT INTO "ConsultingService" (id, name, description, "hourlyRate", tags, "stripePriceId", featured, "isRecurring", "isManagementTier")
VALUES
  ('audit', 'AI Business Audit', '60-minute business audit', 149, ARRAY['consulting', 'audit'], 'price_XXXXX', false, false, false),
  ('live-build', 'WISE² Live Build Session', '60-minute live implementation', 497, ARRAY['consulting', 'build'], 'price_XXXXX', true, false, false),
  ('impl-day', 'AI Implementation Day', 'Full-day implementation', 997, ARRAY['consulting', 'implementation'], 'price_XXXXX', false, false, false),
  ('management', 'WISE² Management', 'Monthly management subscription', 297, ARRAY['consulting', 'management'], 'price_XXXXX', false, true, true);
```

### 2. Worker Jobs
Create `services/worker/automations/consulting.js`:

```javascript
// Listening to these Redis events:
// consulting:events -> lead.created, checkout.created, session.completed

// Jobs to implement:
1. consulting.lead.created
   - Send intake confirmation email
   - Create admin notification

2. consulting.payment.completed
   - Create Booking record
   - Assign to consultant (round-robin)
   - Create calendar event
   - Send booking confirmation email
   - Trigger consulting.prep.workflow

3. consulting.prep.workflow
   - Send client prep materials
   - Send consultant prep materials
   - Schedule session reminders

4. consulting.session.reminder
   - 24 hours before: send reminder
   - 1 hour before: send join link

5. consulting.session.completed
   - Generate deliverable report
   - Send to customer
   - Request testimonial
   - Schedule follow-ups

6. consulting.followup.24h, 7d, 30d
   - Send progress updates
   - Offer support

7. consulting.managementupsell
   - Offer 1-month free trial of management plan
```

### 3. Email Templates
Create in `services/api/src/templates/emails/`:

1. **consulting_intake_received.html** - Confirm intake submission
2. **consulting_qualified.html** - You qualify for [Service] at [Price]
3. **consulting_payment_confirmation.html** - Order confirmation + next steps
4. **consulting_booking_confirmation.html** - Session scheduled + prep materials
5. **consulting_session_reminder_24h.html** - 24-hour session reminder
6. **consulting_session_reminder_1h.html** - 1-hour reminder with join link
7. **consulting_session_complete.html** - Deliverables + recommendations
8. **consulting_followup_24h.html** - Check-in + satisfaction survey
9. **consulting_followup_7d.html** - Progress update
10. **consulting_followup_30d.html** - Month after session
11. **consulting_management_offer.html** - Management subscription offer
12. **consulting_management_trial.html** - 1-month free trial confirmation

### 4. Admin Dashboard Pages
Templates ready, implement full functionality:

- **`/admin/consulting/leads/page.tsx`** - Leads table with filters, search, bulk actions
- **`/admin/consulting/leads/[leadId]/page.tsx`** - Lead detail view with score breakdown and notes
- **`/admin/consulting/projects/page.tsx`** - Projects table with status, date, duration
- **`/admin/consulting/projects/[projectId]/page.tsx`** - Project management with checklists and deliverables
- **`/admin/consulting/follow-ups/page.tsx`** - Follow-up automation queue
- **`/admin/consulting/services/page.tsx`** - Service configuration (optional)

### 5. Complete Service Detail Pages
- `apps/website/app/consulting/implementation-day/page.tsx`
- `apps/website/app/consulting/management/page.tsx`

### 6. Database Seed/Setup
Create initial ConsultingService records in database:

```typescript
// Run in a migration or seed script
const services = [
  { id: 'audit', name: 'AI Business Audit', price: 149, duration: 60, featured: false },
  { id: 'live-build', name: 'WISE² Live Build Session', price: 497, duration: 60, featured: true },
  { id: 'impl-day', name: 'AI Implementation Day', price: 997, duration: 360, featured: false },
  { id: 'management', name: 'WISE² Management', price: 297, recurring: true, featured: false },
];
```

## Testing Checklist

### API Testing
- [ ] POST /api/v1/consulting/leads - Submit intake and verify scoring
- [ ] GET /api/v1/consulting/services - Verify all 4 services return
- [ ] POST /api/v1/consulting/checkout - Verify Stripe session created
- [ ] Verify webhook updates records on payment

### Website Testing
- [ ] /consulting loads with all 4 service cards
- [ ] /intake form submits successfully
- [ ] Recommendation displays after submission
- [ ] Checkout redirects to Stripe

### Admin Testing
- [ ] /admin/consulting shows metrics
- [ ] Can view leads in database
- [ ] Can view bookings/projects
- [ ] Can mark project complete

## Environment Variables Needed

```bash
# In .env or services/api/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
APP_URL=https://wise2.net
CONSULTING_LEAD_SCORING_WEIGHTS={"problemClarity":15,"budgetSignal":20,"businessSize":10}
```

## Deployment Steps

1. **Deploy database migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Deploy API changes**
   - Redeploy services/api service
   - Ensure consulting routes are registered

3. **Deploy website changes**
   - Redeploy apps/website
   - Clear CDN cache for /consulting and /intake

4. **Configure Stripe webhooks**
   - Set webhook endpoint to: `https://api.wise2.net/api/v1/payments/webhook`
   - Subscribe to: `checkout.session.completed`

5. **Create initial service records**
   - Add 4 ConsultingService records to database with Stripe price IDs

6. **Deploy worker jobs**
   - Add consulting automation handlers to services/worker
   - Deploy and verify event listeners

7. **Add email templates**
   - Upload templates to email provider (SendGrid/Resend)
   - Test email delivery

## Success Metrics

Track these in the admin dashboard:

- **Leads submitted** - /intake completions
- **Lead score distribution** - % qualified, % new
- **Conversion rate** - leads → bookings
- **Revenue** - total consulting revenue (one-time + MRR)
- **Average booking value** - total revenue / number of bookings
- **Time to conversion** - days from lead to booking
- **Management subscription rate** - % of customers who upsell to management

## Quick Start for Testing

1. Create a test account on Stripe (if not exists)
2. Create 4 test products and prices
3. Update `.env` with test Stripe keys
4. Run migration: `npx prisma migrate deploy`
5. Insert test ConsultingService records with Stripe price IDs
6. Visit `/consulting` and test the intake flow end-to-end
7. Verify payment completes (use Stripe test card 4242 4242 4242 4242)
8. Check admin dashboard to see lead/booking created

## Architecture Overview

```
User Journey:
  /consulting (hero + 4 service cards)
       ↓
  /intake (submit business info)
       ↓
  AI qualifies + recommends service
       ↓
  Stripe Checkout (payment)
       ↓
  Webhook creates Booking + ConsultingProject
       ↓
  Worker jobs trigger prep workflow
       ↓
  Customer receives confirmation email + prep materials
       ↓
  /admin/consulting/projects/[id] (session management)
       ↓
  Admin marks complete → Deliverables + follow-ups sent
       ↓
  Follow-up automation (24h, 7d, 30d, management upsell)
```

## Notes

- Lead scoring algorithm uses: problem clarity, budget, business size, existing infrastructure
- Service recommendation based on budget range: <$500 = Audit, $500-$5k = Live Build, $5k+ = Impl Day
- All API endpoints use existing auth middleware - admin endpoints check for ADMIN/FOUNDER role
- Stripe integration extends existing paymentService - no new payment handling needed
- Worker jobs publish events to Redis pub/sub for loosely coupled automation

## Files Summary

**Created**:
- `packages/db/prisma/schema.prisma` - Added 2 models + extended 2 existing
- `packages/db/prisma/migrations/add_consulting_revenue_system/migration.sql`
- `services/api/src/routes/consulting.ts` - API routes
- `services/api/src/services/consulting.service.ts` - Business logic
- `services/api/src/server.ts` - Registered routes
- `apps/website/app/consulting/page.tsx` - Landing page (REPLACED)
- `apps/website/app/intake/page.tsx` - Intake form (REPLACED)
- `apps/website/app/consulting/audit/page.tsx` - Service detail
- `apps/website/app/consulting/live-build/page.tsx` - Service detail
- `services/dashboard/apps/admin/app/consulting/page.tsx` - Admin hub

**Total lines of new code**: ~2000+ lines (excluding templates)

## Next Actions

1. ✅ Database - Ready to migrate
2. ⚙️ Stripe - Needs manual product creation
3. ⚙️ Worker jobs - Needs implementation
4. ⚙️ Email templates - Needs creation
5. ⚙️ Admin dashboard - Pages ready, needs data binding
6. 🧪 Testing - Ready for end-to-end testing

---

**Status**: Production-ready foundation. Ready for configuration and testing.
