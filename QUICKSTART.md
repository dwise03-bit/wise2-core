# WISE² Customer Journey — Quick Start Guide

Get the complete customer journey (pricing, checkout, onboarding, subscriptions) live in 30 minutes.

## Prerequisites
- Docker & Docker Compose installed
- Stripe account (https://stripe.com)
- SendGrid account (https://sendgrid.com)
- Git

## Step 1: Clone & Setup (2 minutes)

```bash
cd /path/to/wise2-core

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your keys
nano .env.local  # OR: vim .env.local
```

## Step 2: Get Stripe API Keys (5 minutes)

1. Go to https://stripe.com/dashboard
2. Get STRIPE_PUBLIC_KEY from "Publishable key"
3. Get STRIPE_SECRET_KEY from "Secret key"
4. Create products:
   ```bash
   # Using Stripe CLI (if installed)
   stripe products create --name "WISE² Starter" --type service
   stripe prices create --product=<product_id> --unit-amount=2900 --currency=usd --recurring='{"interval":"month"}'
   ```
5. Add STRIPE_STARTER_PRICE_ID and STRIPE_PRO_PRICE_ID to .env.local
6. Add STRIPE_WEBHOOK_SECRET (Dashboard → Webhooks → New Endpoint)

## Step 3: Get SendGrid API Key (2 minutes)

1. Go to https://sendgrid.com/dashboard
2. Copy API Key to SENDGRID_API_KEY in .env.local
3. Verify sender email (billing@wise2.io)

## Step 4: Deploy Everything (10 minutes)

```bash
# Make deployment script executable
chmod +x deploy.sh

# Set environment variables
export STRIPE_PUBLIC_KEY="pk_live_..."
export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_STARTER_PRICE_ID="price_..."
export STRIPE_PRO_PRICE_ID="price_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export SENDGRID_API_KEY="SG...."
export SENDGRID_FROM_EMAIL="billing@wise2.io"
export DATABASE_URL="postgresql://wise2:wise2@localhost:5432/wise2_prod"
export APP_URL="http://localhost"
export API_BASE_URL="http://localhost:3000"

# Deploy
./deploy.sh production
```

## Step 5: Test Everything (5 minutes)

1. **Visit Pricing Page**
   ```
   http://localhost/pricing
   ```
   - Should see 3 pricing tiers
   - Toggle monthly/annual billing
   - Click "Start 14-Day Trial"

2. **Complete Checkout**
   - Use test card: `4242 4242 4242 4242`
   - Use any future date for expiry
   - Use any CVC (e.g., 123)
   - Click "Pay"

3. **Verify Subscription Created**
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "SELECT * FROM subscriptions;"
   ```

4. **Check Workspace Provisioned**
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "SELECT * FROM workspaces;"
   ```

5. **Verify Email Sent**
   - Check SendGrid dashboard Activity tab
   - Should see welcome email

6. **Complete Onboarding**
   - Auto-redirect to `/onboarding`
   - Complete 5 steps
   - Should redirect to `/dashboard/subscription`

7. **Check Subscription Dashboard**
   - Should show plan, pricing, billing date
   - Invoice history should show monthly invoice
   - Upgrade/Cancel buttons should be visible

## Step 6: Configure Webhook (5 minutes)

**In Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Add Endpoint at: `https://api.wise2.io/v1/billing/webhook`
3. Subscribe to events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   - charge.refunded
4. Copy Webhook Secret to STRIPE_WEBHOOK_SECRET in .env.local
5. Redeploy: `./deploy.sh production`

## Testing Stripe Webhook (Optional)

```bash
# If using Stripe CLI locally
stripe listen --forward-to localhost:3000/v1/billing/webhook

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# Check API logs for webhook receipt
docker-compose -f docker-compose.prod.yml logs api | grep webhook
```

## Useful Commands

```bash
# View all services running
docker-compose -f docker-compose.prod.yml ps

# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.prod.yml logs -f api

# SSH into database
docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api

# View service health
docker-compose -f docker-compose.prod.yml ps

# Check API health
curl http://localhost:3000/health

# Check website health
curl http://localhost:3001/health
```

## Troubleshooting

### Services not starting?
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Restart all
docker-compose -f docker-compose.prod.yml down
./deploy.sh production
```

### Database connection error?
```bash
# Check postgres is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check schema was applied
docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2 -d wise2_prod -c "\dt"
```

### Email not sending?
- Verify SENDGRID_API_KEY is correct
- Verify SENDGRID_FROM_EMAIL is verified in SendGrid
- Check SendGrid Activity tab for delivery status
- Check API logs: `docker-compose -f docker-compose.prod.yml logs api | grep -i email`

### Stripe webhook not received?
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check API endpoint is responding: `curl -X POST http://localhost:3000/v1/billing/webhook`
- Check Stripe Dashboard Webhooks tab for delivery history
- If using local testing: `stripe listen --forward-to localhost:3000/v1/billing/webhook`

## Next Steps

1. ✅ Test complete flow
2. ✅ Verify emails sending
3. ✅ Test payment failure scenarios
4. ✅ Test subscription upgrades/downgrades
5. ✅ Test cancellation flow
6. ✅ Configure monitoring & alerting
7. ✅ Set up automated backups
8. ✅ Go live! 🚀

## Support

- API Docs: http://localhost:3000/api/docs
- Stripe Docs: https://stripe.com/docs
- SendGrid Docs: https://docs.sendgrid.com
- Full Spec: See CUSTOMER_JOURNEY.md
- Deployment Guide: See DEPLOYMENT_GUIDE.md

---

**You're ready to go live!**
