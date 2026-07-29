# STEP 2: Production Environment Variables Setup

## 🔐 Required Credentials from Stripe Dashboard

### 1. STRIPE_SECRET_KEY
- **Get from**: https://dashboard.stripe.com/apikeys
- **Format**: `sk_live_*` (production only, NOT test keys)
- **Security**: Backend only - NEVER expose in frontend code
- **Purpose**: Stripe API authentication for webhook processing

### 2. STRIPE_WEBHOOK_SECRET
- **Get from**: https://dashboard.stripe.com/webhooks
- **Format**: `whsec_*`
- **Steps to obtain**:
  1. Create endpoint: `https://wise2.net/api/webhooks/stripe`
  2. Select event: `checkout.session.completed`
  3. Copy signing secret after creation
- **Security**: Backend only - verifies webhook authenticity
- **Purpose**: Cryptographically verify webhook from Stripe

### 3. Stripe Price IDs (create 3 products)
- **Get from**: https://dashboard.stripe.com/products
- **Format**: `price_*` (one for each plan)
- **Required variables**:
  - `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
- **Security**: OK to expose in frontend (public pricing)
- **Purpose**: Map plans to Stripe products in checkout

### 4. DISCORD_WEBHOOK_URL
- **Get from**: Discord Server → Channel → Integrations → Create Webhook
- **Format**: `https://discord.com/api/webhooks/[id]/[token]`
- **Security**: Keep secret - prevents channel spam/abuse
- **Purpose**: Send payment alerts to admin channel

---

## 📋 Deployment Configuration

### Option A: Vercel (Recommended)
```bash
# 1. Open Vercel dashboard
# https://vercel.com/dashboard/[project]/settings/environment-variables

# 2. Add variables (repeat for each):
Name: STRIPE_SECRET_KEY
Value: sk_live_[your-actual-key]
Environments: Production, Preview (NOT Development)

Name: STRIPE_WEBHOOK_SECRET  
Value: whsec_[your-actual-secret]
Environments: Production, Preview

Name: NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
Value: price_[xxxxx]
Environments: Production, Preview

# 3. Redeploy
$ vercel deploy --prod
```

### Option B: Docker Local Deployment
```bash
# 1. Create .env.production
$ cat > .env.production << 'EOF'
STRIPE_SECRET_KEY=sk_live_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_[xxxxx]
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_[yyyyy]
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_[zzzzz]
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/[url]
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_SITE_URL=https://wise2.net
EOF

# 2. Add to .gitignore
$ echo ".env.production" >> .gitignore

# 3. Load into containers
$ docker-compose --env-file .env.production up -d
```

### Option C: AWS/GCP/Azure Secrets Manager
1. Create secret: `wise2-stripe-prod`
2. Store each variable as separate secret
3. Reference in deployment/container config
4. Enable key rotation (90-day policy)

---

## ✅ Pre-Deployment Security Checklist

- [ ] Stripe keys are LIVE (`sk_live_`, `whsec_`), not test
- [ ] `.env.production` is in `.gitignore`
- [ ] No `.env.production` file in git history
- [ ] HTTPS enabled on production domain
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Environment variables configured in deployment platform
- [ ] Keys have minimal required permissions
- [ ] Key rotation schedule documented (90 days)
- [ ] Audit logs enabled for credential access
- [ ] Incident response plan for compromised keys

---

## 🔗 Verification Commands

After setting variables, run these tests:

```bash
# 1. Verify Stripe API key is valid
curl -s -H "Authorization: Bearer sk_live_[KEY]" \
  https://api.stripe.com/v1/account | jq '.charges_enabled'
# Expected: true

# 2. List registered webhooks
curl -s -H "Authorization: Bearer sk_live_[KEY]" \
  https://api.stripe.com/v1/webhook_endpoints | jq '.data[].url'
# Expected: https://wise2.net/api/webhooks/stripe

# 3. Verify price ID exists
curl -s -H "Authorization: Bearer sk_live_[KEY]" \
  https://api.stripe.com/v1/prices/price_[xxxxx] | jq '.active'
# Expected: true

# 4. Test Discord webhook (should post message)
curl -X POST -H 'Content-Type: application/json' \
  -d '{"content":"✅ Discord webhook working"}' \
  https://discord.com/api/webhooks/[YOUR-URL]
```

---

## 📝 Variable Reference Table

| Variable | Example | Visibility | Purpose |
|----------|---------|------------|---------|
| STRIPE_SECRET_KEY | sk_live_ABC123... | Backend only | API authentication |
| STRIPE_WEBHOOK_SECRET | whsec_test_secret | Backend only | Webhook verification |
| NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID | price_1Abc2Def3 | Public | Frontend checkout |
| NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID | price_2Ghi4Jkl5 | Public | Frontend checkout |
| NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID | price_3Mno6Pqr7 | Public | Frontend checkout |
| DISCORD_WEBHOOK_URL | https://discord.com/api/webhooks/... | Backend only | Payment alerts |
| NEXT_PUBLIC_API_URL | https://api.wise2.net | Public | Backend requests |
| NEXT_PUBLIC_SITE_URL | https://wise2.net | Public | OAuth redirects |

---

## 🎯 Next Steps

Once environment variables are configured:

1. ✅ Test connectivity (run verification commands above)
2. ➡️ **Step 3**: Deploy website/command-center containers
3. ➡️ **Step 4**: Run test payment with card `4242 4242 4242 4242`
4. ➡️ **Step 5**: Verify end-to-end (webhook → user creation → discord alert)

---

## ❓ Troubleshooting

**Issue: "Invalid API key"**
- Verify key starts with `sk_live_` (not `sk_test_`)
- Check key is copied completely (no truncation)
- Verify key has not been revoked in Stripe Dashboard

**Issue: "Webhook not receiving events"**
- Verify endpoint registered: https://dashboard.stripe.com/webhooks
- Check HTTPS is enabled (Stripe requires it)
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

**Issue: "Price ID not found"**
- Verify price ID format: `price_*`
- Ensure product is ACTIVE in Stripe Dashboard
- Check price_id is for LIVE account, not TEST

**Issue: "Discord message not posted"**
- Verify webhook URL is complete (includes both id and token)
- Check Discord channel still exists and webhook hasn't been deleted
- Ensure Discord bot has permission to post

---

**Questions?** Check `README.md` or contact the team.
