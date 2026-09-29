# 🧪 Stripe CLI Testing Guide

Use the Stripe CLI to test your payment integration locally and in sandbox mode before going live.

## ✅ What's Already Installed

You have the Stripe CLI at: `/opt/homebrew/bin/stripe`

Verify it works:
```bash
stripe --version
```

## 🔑 Step 1: Authenticate with Stripe

### Get Your Test API Keys

1. Go to: https://dashboard.stripe.com
2. Click "Developers" → "API Keys" (Tab: "Test data")
3. You'll see:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...` (keep private!)

### Log In via CLI

```bash
stripe login
```

You'll be prompted:
```
Enter your API key:
```

Paste your **Secret Key** (`sk_test_...`)

This authorizes the CLI to make API calls on your behalf.

## 💰 Step 2: Create Test Products & Prices

Create products and prices in Stripe's test environment:

```bash
# Create Starter product
stripe products create \
  --name="WISE² Starter" \
  --type=service \
  --description="Perfect for teams getting started"

# Save the product ID (starts with prod_)
# Then create a price for it
stripe prices create \
  --product=prod_YOUR_ID \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month
```

Repeat for Pro ($99/mo = 9900 cents) and Enterprise.

Or use the Stripe Dashboard to create them (easier):
1. Go to: https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Name: "WISE² Starter"
4. Price: $29/month
5. Click "Save"
6. Copy the price ID (starts with `price_`)

## 🔗 Step 3: Create Webhook Endpoint for Testing

The Stripe CLI can forward webhook events to your local development server:

```bash
# Listen for webhook events and forward to your local API
stripe listen --forward-to localhost:3010/api/webhooks/stripe
```

This creates a **Webhook Signing Secret** that you need:
```
Your webhook signing secret is: whsec_test_...
```

Save this - you'll add it to `.env.local` for testing.

## 📡 Step 4: Test the Payment Flow

### Option A: Test with Stripe CLI (No Frontend Needed)

```bash
# Create a test checkout session
stripe checkout sessions create \
  --line-items \
    price=price_YOUR_PRICE_ID,quantity=1 \
  --mode=subscription \
  --success-url=https://example.com/success \
  --cancel-url=https://example.com/cancel
```

This returns a checkout URL you can visit in your browser.

### Option B: Test via Your Website (Full Flow)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Add test keys to .env.local:**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   
   # Add your test price IDs
   NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_...
   ```

3. **Start webhook listener (in new terminal):**
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

4. **Visit pricing page:**
   ```
   http://localhost:3001/pricing
   ```

5. **Click "Get Started"** → Fill form → "Continue to Payment"

6. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Exp: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

7. **Complete payment** → See success page

### Option C: Trigger Webhook Events Manually

While webhook listener is running:

```bash
# Simulate a successful payment
stripe trigger payment_intent.succeeded

# Simulate subscription created
stripe trigger customer.subscription.created

# Simulate subscription updated
stripe trigger customer.subscription.updated

# Simulate subscription deleted
stripe trigger customer.subscription.deleted
```

Your webhook handler will process these events.

## 🧪 Test Scenarios

### Test 1: Successful Payment
```bash
stripe trigger payment_intent.succeeded
```
Expected: User gets access, email sent, record in database

### Test 2: Failed Payment
Use card: `4000 0000 0000 0002` (always declines)
Expected: Error page, retry option

### Test 3: Card Declined - Insufficient Funds
Use card: `4000 0000 0000 9995`
Expected: Error message, can try different card

### Test 4: 3D Secure (Authentication Required)
Use card: `4000 0025 0000 3155`
Expected: 3D Secure modal appears

### Test 5: Expired Card
Use card: `4000 0000 0000 0069`
Expected: Decline, card expired error

## 📊 Monitor Events in Webhook Listener

When running `stripe listen`, you'll see real-time events:

```
2024-07-20 06:30:15 → stripe.1.9f0cd0bf-38c1-4c4a-ace0-5ad8cbfb8c2c [404] request_validation_missing
2024-07-20 06:30:16 → payment_intent.succeeded [200] Successfully sent to http://localhost:3001/api/webhooks/stripe
2024-07-20 06:30:17 → customer.subscription.created [200] Successfully sent to http://localhost:3001/api/webhooks/stripe
```

Green `[200]` = webhook processed successfully  
Red `[404]` or `[500]` = error (check your endpoint handler)

## 🔍 Debug Commands

### View all test events
```bash
stripe events list --limit=10
```

### View specific event
```bash
stripe events retrieve evt_1QeJ9eD5L8vqYqJz8...
```

### View customers
```bash
stripe customers list --limit=10
```

### View subscriptions
```bash
stripe subscriptions list --limit=10
```

### View invoices
```bash
stripe invoices list --limit=10
```

### View charges
```bash
stripe charges list --limit=10
```

## 💳 Test Cards Reference

| Scenario | Card Number | Exp | CVC |
|----------|-------------|-----|-----|
| Successful | 4242 4242 4242 4242 | Any future | Any 3 |
| Decline | 4000 0000 0000 0002 | Any future | Any 3 |
| Insufficient Funds | 4000 0000 0000 9995 | Any future | Any 3 |
| Lost Card | 4000 0000 0000 9987 | Any future | Any 3 |
| Stolen Card | 4000 0000 0000 9979 | Any future | Any 3 |
| 3D Secure | 4000 0025 0000 3155 | Any future | Any 3 |
| Expired | 4000 0000 0000 0069 | 12/20 (past) | Any 3 |

## 🚀 Go Live Checklist

When you're ready for real payments:

### 1. Get Live Keys
```bash
stripe login
# Switch to live keys in Stripe Dashboard
# Developers → API Keys → Live keys
# Copy sk_live_... and pk_live_...
```

### 2. Update Production Environment
```bash
# SSH to server
ssh dwise@173.208.147.165

# Add live keys
nano .env.production.local
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Restart
docker-compose -f docker-compose.prod.yml restart api
```

### 3. Set Up Webhook in Dashboard
```bash
# Go to: https://dashboard.stripe.com/webhooks
# Click "Add endpoint"
# URL: https://api.wise2.net/api/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.*
# Copy webhook signing secret
# Add to .env.production.local:
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### 4. Test with Small Real Payment
- Use real card (or test account)
- Make $1 payment
- Verify receipt and access granted
- Check webhook processing

### 5. Monitor Production
```bash
# View live webhook events
stripe logs tail

# View live subscriptions
stripe subscriptions list --live

# View live customers
stripe customers list --live
```

## 🆘 Troubleshooting

### Webhook not being received?
```bash
# Check webhook listener is running
# Check logs show [200] responses
# Verify endpoint URL is correct
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

### Invalid price ID error?
```bash
# List all test prices
stripe prices list

# Check you're using correct format: price_...
# Not product ID: prod_...
```

### Webhook secret mismatch?
```bash
# Get current webhook secret
stripe listen

# Copy the whsec_test_... value
# Add to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Can't find test data?
- Make sure you're in "Test data" mode
- Developers → API Keys → Tab: "Test data"
- Not "Live data"

## 📚 Useful Links

- **Stripe CLI Docs**: https://docs.stripe.com/stripe-cli
- **Test Cards**: https://docs.stripe.com/testing
- **Webhook Events**: https://docs.stripe.com/api/events
- **Checkout API**: https://docs.stripe.com/api/checkout/sessions

## ✅ You're Ready to Test

You have the Stripe CLI installed. Use this guide to:

1. Create test products and prices
2. Test the full payment flow locally
3. Verify webhooks are processed
4. Go live with confidence

**Quick start:**
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# In another terminal:
npm run dev --workspace=apps/website
# Visit: http://localhost:3001/pricing
```

That's it. You can now test the entire payment system end-to-end.
