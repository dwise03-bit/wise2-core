# 🚀 START HERE - Deploy Revenue System

## What You Have
✅ Fully built pricing page  
✅ Checkout flow wired to Stripe  
✅ Success/cancel pages ready  
✅ Database ready to track customers  

## What You Need
⏳ Stripe API keys (2 min to get)  
⏳ One deployment command (3 min to run)  

## The 5-Minute Plan

### 1. Get Stripe Keys (2 min)
Go to: **https://dashboard.stripe.com**
1. Click "Developers" → "API Keys"
2. Copy: **Secret Key** (starts with `sk_live_`)
3. Copy: **Publishable Key** (starts with `pk_live_`)

### 2. Deploy Website (3 min)
```bash
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml rebuild website
docker-compose -f docker-compose.prod.yml up -d website
```

### 3. Add Stripe Keys (2 min)
```bash
# Still on server
nano .env.production.local

# Add these 3 lines:
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY

# Save: Ctrl+O, Enter, Ctrl+X

# Restart
docker-compose -f docker-compose.prod.yml restart api
```

## Test It Works

1. Open: **https://wise2.net/pricing**
2. Click: **"Get Started"** (Starter $29/mo)
3. Enter:
   - Name: `John Test`
   - Email: `test@example.com`
4. Click: **"Continue to Payment"**
5. Use test card:
   - Card: `4242 4242 4242 4242`
   - Exp: `12/25`
   - CVC: `123`
6. Should see: **Success page** ✅

## Done!

You're now accepting payments. Your customers can:
- Visit https://wise2.net/pricing
- Choose a plan
- Enter payment info
- Get instant access

## If Something's Wrong

### Website won't load?
```bash
docker logs wise2-website-prod
```

### Stripe errors?
```bash
docker logs wise2-api-prod | grep -i stripe
```

### Reset everything?
```bash
cd /home/dwise/wise2-core
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## More Info

- **Full Setup**: See `REVENUE_READY_CHECKLIST.md`
- **Architecture**: See `LIVE_TODAY_SUMMARY.md`
- **Status**: See `FINAL_STATUS.txt`

---

**That's it. You're live.** 🎉

Real payments start flowing once you add those Stripe keys.
