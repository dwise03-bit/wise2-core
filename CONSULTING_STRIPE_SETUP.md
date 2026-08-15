# WISE² Consulting - Stripe Products Setup

This guide walks you through creating the 4 consulting products in Stripe and seeding the database.

## Prerequisites

✅ Stripe account with API access  
✅ Stripe Secret Key (from https://dashboard.stripe.com/apikeys)  
✅ PostgreSQL database running (DATABASE_URL configured)  
✅ Node.js with `stripe` npm package installed

## Step 1: Install Dependencies

```bash
cd /Users/danielwise/Projects/wise2-core
npm install stripe
```

## Step 2: Run Setup Script

Export your Stripe Secret Key and database URL, then run the setup script:

```bash
export STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx  # Your actual Stripe Secret Key
export DATABASE_URL=postgresql://wise2_prod_user:password@localhost:5432/wise2_core_prod

node scripts/setup-consulting-stripe.js
```

## What This Script Does

✅ **Creates 4 Stripe Products:**
- AI Business Audit ($149, one-time)
- WISE² Live Build Session ($497, one-time, marked as featured)
- AI Implementation Day ($997, one-time)
- WISE² Management ($297/month, recurring)

✅ **Generates Stripe Price IDs** for each product

✅ **Seeds ConsultingService Database Records** with:
- Service name, description, pricing
- Stripe price ID (for checkout integration)
- Featured flag, recurring flag, management tier flag

## Output

After running the script, you'll get:

```
✅ SETUP COMPLETE!

📋 Consulting Products Created:
   • AI Business Audit ($149)
   • WISE² Live Build Session ($497) - FEATURED
   • AI Implementation Day ($997)
   • WISE² Management ($297/month)

🔑 Price IDs for Reference:
   audit: price_xxxxx
   live-build: price_xxxxx
   impl-day: price_xxxxx
   management: price_xxxxx
```

## Next Steps After Setup

1. ✅ Database Migration: `npx prisma migrate deploy` (if not already done)
2. ✅ Stripe Products Created (this script)
3. 📧 **Create Email Templates** - 12 templates in your email provider (SendGrid/Resend)
4. 🤖 **Implement Worker Jobs** - Automation for lead intake, payments, follow-ups
5. 🧪 **Test the Flow:**
   ```bash
   npm run dev
   # Visit http://localhost:3001/consulting
   # Fill intake form
   # Verify lead created in database
   # Test Stripe checkout with test card: 4242 4242 4242 4242
   ```

## Environment Variables

Optional: Save the price IDs to your `.env` file for reference:

```bash
STRIPE_CONSULTING_AUDIT_PRICE_ID=price_xxxxx
STRIPE_CONSULTING_LIVEBUILD_PRICE_ID=price_xxxxx
STRIPE_CONSULTING_IMPLDAY_PRICE_ID=price_xxxxx
STRIPE_CONSULTING_MANAGEMENT_PRICE_ID=price_xxxxx
```

## Testing Stripe Products

Once created, verify in Stripe Dashboard:
1. Go to https://dashboard.stripe.com/products
2. Find the 4 new products (all tagged with `consulting`)
3. Verify pricing and recurring settings

## Troubleshooting

**Script fails with "Invalid API Key"**
- Check your STRIPE_SECRET_KEY is correct (starts with `sk_live_` or `sk_test_`)
- Make sure it's exported to the environment

**Database insert fails**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check that database migrations have been applied: `npx prisma migrate deploy`

**Port already in use**
- Kill existing processes: `lsof -i :5432` (for PostgreSQL)
- Or use a different database URL

## Manual Alternative

If you prefer to create products manually in Stripe:

1. Go to https://dashboard.stripe.com/products/create
2. Create each product with the pricing above
3. Note the Price IDs from each product
4. Run this SQL to update the database:

```sql
INSERT INTO "ConsultingService" (id, name, description, "hourlyRate", tags, "stripePriceId", featured, "isRecurring", "isManagementTier", "createdAt", "updatedAt") VALUES
  ('audit', 'AI Business Audit', '60-minute business audit', 149, ARRAY['consulting'], 'price_xxxxx', false, false, false, NOW(), NOW()),
  ('live-build', 'WISE² Live Build Session', '60-minute live implementation', 497, ARRAY['consulting', 'featured'], 'price_xxxxx', true, false, false, NOW(), NOW()),
  ('impl-day', 'AI Implementation Day', 'Full-day implementation', 997, ARRAY['consulting'], 'price_xxxxx', false, false, false, NOW(), NOW()),
  ('management', 'WISE² Management', 'Monthly management', 297, ARRAY['consulting', 'management'], 'price_xxxxx', false, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET "stripePriceId" = EXCLUDED."stripePriceId";
```

---

**After Stripe Setup Complete**, you have 2 remaining configuration tasks:

1. **📧 Email Templates** (20 min) - Add 12 templates to SendGrid/Resend
2. **🤖 Worker Jobs** (1-2 hrs) - Implement automation for lead intake → payment → follow-ups

Then the system is fully operational and ready for testing!
