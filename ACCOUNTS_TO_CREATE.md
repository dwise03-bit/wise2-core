# Accounts to Create for Revenue Ready Gate

Create these accounts and obtain the credentials listed. Save all keys to `.env.production` on the production server (never commit).

---

## 1. **Stripe** (Payment Processing) — CRITICAL
https://dashboard.stripe.com

### What You Need:
- [ ] Create Stripe account (if new)
- [ ] Go to **Developers → API Keys**
- [ ] Copy **Publishable Key** (pk_live_...)
  - `STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY`
- [ ] Copy **Secret Key** (sk_live_...)
  - `STRIPE_SECRET_KEY=sk_live_YOUR_KEY`
- [ ] Go to **Webhooks** → Add endpoint
  - URL: `https://wise2.net/api/webhooks/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
  - Copy **Signing Secret** (whsec_...)
  - `STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`

### Create Products & Prices:
- [ ] Create Product "WISE² Starter Plan" → get Price ID
  - `STRIPE_STARTER_PRICE_ID=price_YOUR_ID`
- [ ] Create Product "WISE² Pro Plan" → get Price ID
  - `STRIPE_PRO_PRICE_ID=price_YOUR_ID`

**Test Before Production:** Use Stripe test keys first (pk_test_..., sk_test_...)

---

## 2. **SendGrid** (Email Delivery) — CRITICAL
https://app.sendgrid.com

### What You Need:
- [ ] Create SendGrid account (if new)
- [ ] Go to **Settings → API Keys**
- [ ] Create new API key (full access)
  - `SENDGRID_API_KEY=SG.YOUR_API_KEY`
- [ ] Go to **Settings → Sender Authentication**
- [ ] Verify your sender email (e.g., noreply@wise2.net)
  - `SENDGRID_FROM_EMAIL=noreply@wise2.net`

---

## 3. **Google Cloud** (OAuth + Calendar) — CRITICAL
https://console.cloud.google.com

### Create OAuth Credentials:
- [ ] Create new Google Cloud project (or use existing)
- [ ] Enable **Google Calendar API** and **Google+ API**
- [ ] Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
- [ ] Application type: Web application
- [ ] Authorized redirect URIs: `https://wise2.net/api/auth/google/callback`
- [ ] Copy **Client ID**
  - `GOOGLE_CLIENT_ID=YOUR_CLIENT_ID`
- [ ] Copy **Client Secret**
  - `GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET`

### Create Calendar Service Account:
- [ ] Go to **Credentials → Create Credentials → Service Account**
- [ ] Download JSON key file
- [ ] Extract from JSON:
  - `GOOGLE_CALENDAR_CLIENT_ID=service_account_email`
  - `GOOGLE_CALENDAR_CLIENT_SECRET=private_key_from_json`

---

## 4. **AWS** (Backup Storage) — OPTIONAL (for Phase 2)
https://console.aws.amazon.com

### What You Need (for daily PostgreSQL backups):
- [ ] Create AWS account (if new)
- [ ] Create S3 bucket: `wise2-backups-prod`
- [ ] Create IAM user with S3 access
  - `AWS_ACCESS_KEY_ID=YOUR_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY`
  - `AWS_REGION=us-east-1`
  - `AWS_BUCKET=wise2-backups-prod`

---

## 5. **SSL Certificate** (HTTPS) — CRITICAL
### Option A: Let's Encrypt (FREE) — Recommended
```bash
# On production server (173.208.147.165):
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d wise2.net -d api.wise2.net -d studio.wise2.net
# Certificates saved to /etc/letsencrypt/live/wise2.net/
# Copy to: /etc/nginx/certs/wise2.net.crt and .key
```

### Option B: Purchase Certificate (CloudFlare, DigiCert, etc.)
- [ ] Purchase SSL certificate for wise2.net (include subdomains)
- [ ] Download certificate files
- [ ] Copy to production server `/etc/nginx/certs/`

---

## 6. **Discord Bot** (Deployment Notifications) — OPTIONAL
https://discord.com/developers/applications

### What You Need:
- [ ] Create Discord app
- [ ] Copy **Token**
  - `DISCORD_BOT_TOKEN=YOUR_TOKEN`
- [ ] Create webhook in your Discord server
  - `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN`

---

## Environment Variable Summary

Once you've created all accounts, your `.env.production` should have:

```bash
# ===== CRITICAL (Required for Revenue Ready) =====
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@wise2.net

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...

# ===== OPTIONAL (for backups & notifications) =====
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET=wise2-backups-prod

DISCORD_BOT_TOKEN=...
DISCORD_WEBHOOK_URL=...
```

---

## Deployment Checklist

Once you have all credentials:

1. [ ] SSH into production server: `ssh dwise@173.208.147.165`
2. [ ] Create `.env.production` with all credentials above
3. [ ] Run smoke test: `./revenue-readiness-test.sh` (should exit 0)
4. [ ] Run customer journey tests: Follow `docs/CUSTOMER_JOURNEY_TEST_FLOW.md`
5. [ ] Deploy monitoring: Follow `docs/MONITORING_AND_ALERTING_SETUP.md`
6. [ ] Declare Revenue Ready ✅

---

## Quick Links

- Stripe Dashboard: https://dashboard.stripe.com
- SendGrid Dashboard: https://app.sendgrid.com
- Google Cloud Console: https://console.cloud.google.com
- AWS Console: https://console.aws.amazon.com
- Discord Developer Portal: https://discord.com/developers/applications
- Let's Encrypt: https://letsencrypt.org

---

**Timeline:** 30-45 minutes to create all accounts and gather credentials.
