# WISE² Complete Deployment Guide

**Status**: 🚀 Ready to Deploy (3 configuration items required)  
**Last Updated**: 2026-09-12  
**Estimated Time**: ~45 minutes

---

## 🎯 Quick Summary

Your WISE² deployment is ready. You just need to:
1. Get 2 Stripe Price IDs from your Stripe dashboard
2. Provide your database connection URL  
3. Run the deployment script

---

## ⚠️ Missing Configuration (3 Items)

### 1. STRIPE_STARTER_PRICE_ID 
**Price ID for $49/month plan**
- Go to: https://dashboard.stripe.com/products
- Find the "Starter" product
- Copy the Price ID (looks like: price_1MqvOg2eZvKYlo2C...)

### 2. STRIPE_PRO_PRICE_ID
**Price ID for $99/month plan**
- Go to: https://dashboard.stripe.com/products
- Find the "Pro" product
- Copy the Price ID (looks like: price_1MqvOh2eZvKYlo2C...)

### 3. DATABASE_URL
**PostgreSQL connection string**
Format: `postgresql://user:password@host:port/database?sslmode=require`
Example: `postgresql://wise2:password123@173.208.147.165:5432/wise2?sslmode=require`

---

## 🚀 Deployment Steps

### Step 1: Configure Environment

Interactive setup (recommended):
```bash
bash setup-production-env.sh
```

### Step 2: Verify

```bash
grep "STRIPE_STARTER_PRICE_ID\|STRIPE_PRO_PRICE_ID\|DATABASE_URL" .env.production
```

### Step 3: Deploy

```bash
bash fix-all.sh
```

---

## ✅ After Deployment

```bash
# Check containers
docker ps

# Check API
curl https://api.wise2.net/health

# Check website
curl https://wise2.net
```

---

Ready? Start with: `bash setup-production-env.sh`
