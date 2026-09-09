# BLAKKHAIL Stripe Setup — Separate Account Configuration

**Status:** SenCere Partner Account Created ✅  
**Date:** 2026-09-09  
**Partner Email:** sencere@wise2.net

---

## Financial Separation Model

```
┌─────────────────────────────────────────┐
│     BLAKKHAIL.COM Storefront            │
│  (SenCere Partner - Independent Client) │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    ┌────▼────┐    ┌────▼────┐
    │ Stripe  │    │ WISE²    │
    │ Connect │    │ Platform │
    │ (Private│    │ (Provider│
    │ Account)│    │ Fee Only)│
    └─────────┘    └──────────┘
```

---

## Setup Checklist

### Partner Account (✅ COMPLETE)
- [x] sencere@wise2.net created with ADMIN role
- [x] Full dashboard access (command.wise2.net)
- [x] BLAKKHAIL storefront management access
- [x] Temporary password provided securely

### Stripe Setup (🔄 IN PROGRESS)
- [ ] Sencere creates own Stripe Connect account (sencere-stripe.com)
- [ ] Connects Stripe to BLAKKHAIL dashboard settings
- [ ] WISE² redirects checkout to sencere's Stripe
- [ ] Revenue flows directly to sencere's account

### Financial Tracking (📋 TODO)
- [ ] Set up provider fee arrangement (% of revenue or flat monthly)
- [ ] Configure WISE² invoice/billing for platform service
- [ ] Separate revenue reporting dashboards
- [ ] Monthly reconciliation process

---

## Stripe Account Setup Instructions

### For SenCere (Partner)

1. **Create Stripe Connect Account**
   - Go to: https://stripe.com/connect
   - Create business account for BLAKKHAIL LLC
   - Verify business details and banking info
   - Save Stripe API keys (Public & Secret)

2. **Connect to BLAKKHAIL Dashboard**
   - Login: https://command.wise2.net
   - Email: sencere@wise2.net
   - Navigate: Settings → Payments → Stripe
   - Paste Stripe API keys from your account
   - Save and verify connection

3. **Test Payment Processing**
   - Add test product to storefront
   - Process test payment
   - Verify funds appear in Stripe Connect dashboard
   - Check revenue report in BLAKKHAIL admin

### For WISE² (Platform)

1. **Configure Multi-Tenant Stripe**
   ```
   Each partner can use their own Stripe account
   - Store partner's Stripe API keys encrypted in database
   - Route payments to partner's Stripe (not WISE² master account)
   - Track platform fee separately (if applicable)
   ```

2. **Revenue Tracking**
   - WISE² tracks platform fee: [to be determined with partner]
   - Partner revenue: automatically tracked in their Stripe account
   - Monthly invoicing for WISE² platform service

---

## Database Configuration

### SenCere Partner Record
```
Email:              sencere@wise2.net
Role:               ADMIN
Stripe Account:     [Private - managed by sencere]
Stripe API Key:     [Encrypted in database]
Stripe Webhook:     https://blakkhail.com/api/webhooks/stripe
Revenue Share:      100% to sencere (minus platform fee)
Status:             Active
Created:            2026-09-09
```

### Financial Relationship
```
WISE² Role:     Platform Provider
SenCere Role:   Storefront Owner & Client
Revenue Model:  [TO BE CONFIGURED]
  Option A:     Flat monthly fee (e.g., $299/month)
  Option B:     % of revenue (e.g., 5-10% of BLAKKHAIL sales)
  Option C:     Hybrid (base + percentage)
Billing:        Monthly invoice from WISE² to sencere
Payment Terms:  [To be determined]
```

---

## Webhook Configuration

Once Stripe account is connected:

1. **Stripe Webhook URL**
   - Endpoint: `https://blakkhail.com/api/webhooks/stripe`
   - Events to subscribe:
     - `payment_intent.succeeded`
     - `charge.refunded`
     - `invoice.payment_succeeded`

2. **WISE² Monitoring**
   - Track partnership health metrics
   - Monitor transaction volume
   - Alert on failed payments

---

## Security Notes

⚠️ **Important:**
- Stripe API keys are encrypted in database
- Partner cannot access other partner accounts
- All payment data isolated per partner
- WISE² platform logs all transactions for audit trail
- Monthly reconciliation required

---

## Next Steps

1. **SenCere Action Items:**
   - [ ] Create Stripe Connect account
   - [ ] Send API keys to WISE² dashboard
   - [ ] Test payment processing
   - [ ] Verify revenue flow to own account

2. **WISE² Action Items:**
   - [ ] Store partner Stripe credentials (encrypted)
   - [ ] Update checkout to use partner's Stripe
   - [ ] Configure webhook handling per partner
   - [ ] Set up monthly billing for platform fee
   - [ ] Create partner revenue dashboard

3. **Financial Agreement:**
   - [ ] Define platform fee structure
   - [ ] Agree on billing terms
   - [ ] Document revenue split arrangement
   - [ ] Schedule monthly reconciliation meeting

---

## Contact

- **Partner:** sencere@wise2.net
- **Platform:** WISE² (dwise03@gmail.com)
- **Storefront:** https://blakkhail.com
- **Dashboard:** https://command.wise2.net
