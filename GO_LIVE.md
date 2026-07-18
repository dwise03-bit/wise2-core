# 🚀 Go Live — Accepting Clients

**Code status: READY.** The website builds, the Stripe checkout flow is wired
(publishable key + live price ID), and success/cancel pages exist. What remains
are 3 switches only you can throw (they involve the live secret key + your
server). Once these are set, wise2.net can take real subscriptions.

## What's already done (code)
- ✅ Publishable key + price ID wired (reads from env)
- ✅ `/api/checkout/session` creates a live subscription checkout
- ✅ `/api/webhooks/stripe` verifies signatures and routes events
- ✅ `/checkout/success` and `/checkout/cancel` pages
- ✅ Production build passes

## 3 steps to switch payments on (you)

### 1. Roll + set the secret key
- Stripe Dashboard (Live) → Developers → API keys → **roll** the `sk_live_` key
- Put the new value where the app runs — NOT in git:
  - Server: add `STRIPE_SECRET_KEY=sk_live_…` to the server's env / compose
  - (Optional CI) GitHub → Settings → Secrets and variables → Actions → `STRIPE_SECRET_KEY`

### 2. Create the webhook + set its signing secret
- Stripe Dashboard (Live) → Developers → **Webhooks** → **Add endpoint**
- Endpoint URL: `https://wise2.net/api/webhooks/stripe`
- Events to send (minimum): `checkout.session.completed`,
  `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_succeeded`,
  `invoice.payment_failed`
- After creating, copy the **Signing secret** (`whsec_…`) → set `STRIPE_WEBHOOK_SECRET`
  in the server env

### 3. Deploy with the env present
- Ensure the server has `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` available to
  the app, then deploy (push to main triggers the deploy workflow once
  `DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_KEY` secrets are configured)

## Verify it works (Stripe test mode first, recommended)
1. Temporarily use **test** keys + a test price, deploy to staging (or run locally)
2. Buy with card `4242 4242 4242 4242`, any future expiry, any CVC
3. Confirm: redirected to `/checkout/success`, and the payment shows in Stripe →
   Payments; the webhook shows a `200` in Stripe → Webhooks → your endpoint
4. Switch back to live keys

## Known gap (not a blocker for revenue)
The webhook handlers currently log events but don't yet write to a database,
send confirmation emails, or auto-provision in-app access (they're marked TODO).
You WILL collect subscriptions and see paying customers in the Stripe dashboard.
Automated provisioning/emails is a follow-up once you have a user store.

## Don't forget
- Rotate the other exposed secrets per `SECRETS_ROTATION.md` (DB/Redis/JWT/Discord)
