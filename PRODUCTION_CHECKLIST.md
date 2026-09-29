# WISE² Production Deployment Checklist

Complete checklist before going live.

## Pre-Deployment

- [ ] Stripe account created and verified
- [ ] SendGrid account created and verified
- [ ] Production database configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Environment variables set in .env.local
- [ ] Docker & Docker Compose installed
- [ ] Git repository cloned and updated

## Configuration

- [ ] STRIPE_PUBLIC_KEY set
- [ ] STRIPE_SECRET_KEY set
- [ ] STRIPE_STARTER_PRICE_ID set
- [ ] STRIPE_PRO_PRICE_ID set
- [ ] STRIPE_WEBHOOK_SECRET set
- [ ] SENDGRID_API_KEY set
- [ ] SENDGRID_FROM_EMAIL verified
- [ ] DATABASE_URL set (production)
- [ ] APP_URL set (production domain)
- [ ] API_BASE_URL set (production domain)

## Deployment

- [ ] Run `./deploy.sh production`
- [ ] All 5 services are running (postgres, api, website, studio, nginx)
- [ ] No errors in Docker logs
- [ ] All health checks passing

## Database

- [ ] Schema migrations completed
- [ ] Tables created: subscriptions, workspaces, workspace_members, invoices, analytics_events
- [ ] Indexes created for performance
- [ ] Database backups configured (daily)
- [ ] Connection pooling configured

## API

- [ ] Health check endpoint responds: `curl https://api.wise2.io/health`
- [ ] Swagger docs accessible: `https://api.wise2.io/api/docs`
- [ ] Billing endpoints working
- [ ] Webhook endpoint accessible: `https://api.wise2.io/v1/billing/webhook`
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error logging configured (Sentry)

## Frontend

- [ ] Website loads: `https://wise2.io`
- [ ] Pricing page displays: `https://wise2.io/pricing`
- [ ] Checkout form loads: `https://wise2.io/checkout`
- [ ] Onboarding wizard works: `https://wise2.io/onboarding`
- [ ] Subscription dashboard loads: `https://wise2.io/dashboard/subscription`
- [ ] All static assets load (no 404s)
- [ ] Mobile responsive design tested
- [ ] Dark theme renders correctly

## Stripe Integration

- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] All webhook events subscribed:
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
  - [ ] charge.refunded
- [ ] Test payment succeeds (4242 4242 4242 4242)
- [ ] Test payment failure handled (4000 0000 0000 0002)
- [ ] Refund process tested
- [ ] Upgrade/downgrade tested
- [ ] Cancellation with `cancel_at_period_end` tested

## Email

- [ ] SendGrid API key working
- [ ] From email verified
- [ ] Welcome email template works
- [ ] Onboarding tip emails scheduled
- [ ] Invoice email template works
- [ ] Payment failure emails escalate
- [ ] Cancellation email sends
- [ ] Unsubscribe links work
- [ ] SMTP relay configured (backup)

## Customer Journey

- [ ] **Step 1: Pricing Page**
  - [ ] Visit pricing page
  - [ ] Monthly/annual toggle works
  - [ ] All tiers display
  - [ ] CTA button navigates to checkout

- [ ] **Step 2: Checkout**
  - [ ] Stripe Checkout loads
  - [ ] Test card (4242...) succeeds
  - [ ] Invalid card fails appropriately
  - [ ] Redirect to success page works

- [ ] **Step 3: Workspace Creation**
  - [ ] Workspace created in database
  - [ ] Subscription record created
  - [ ] Workspace members added
  - [ ] Workspace invite link generated

- [ ] **Step 4: Welcome Email**
  - [ ] Welcome email sent immediately
  - [ ] Email contains workspace link
  - [ ] Email shows trial end date

- [ ] **Step 5: Onboarding**
  - [ ] Onboarding wizard appears
  - [ ] Step 1: Workspace setup
  - [ ] Step 2: Team setup
  - [ ] Step 3: Integrations (optional)
  - [ ] Step 4: Preferences
  - [ ] Step 5: Completion
  - [ ] Success redirect to subscription dashboard

- [ ] **Step 6: Subscription Dashboard**
  - [ ] Current plan displays
  - [ ] Pricing shows correctly
  - [ ] Billing date shows correctly
  - [ ] Invoice history visible
  - [ ] Upgrade button works
  - [ ] Cancel button works

- [ ] **Step 7: Upgrade Flow**
  - [ ] Upgrade to higher plan
  - [ ] Stripe handles proration
  - [ ] Confirmation email sent
  - [ ] Subscription updated in database

- [ ] **Step 8: Cancellation**
  - [ ] Cancel subscription
  - [ ] Cancellation email sent
  - [ ] `cancel_at_period_end` set
  - [ ] Access continues until period end
  - [ ] Reactivation option works

## Monitoring & Alerting

- [ ] Error tracking configured (Sentry/DataDog)
- [ ] Error alerts to Slack/PagerDuty
- [ ] Uptime monitoring configured
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled
- [ ] Backup verification automated
- [ ] Log aggregation configured

## Security

- [ ] HTTPS enforced on all domains
- [ ] SSL certificate valid and not expired
- [ ] Security headers configured
- [ ] CORS whitelist set correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (ORM used)
- [ ] XSS protection enabled
- [ ] CSRF tokens configured
- [ ] API keys stored securely (not in code)
- [ ] Database password strong & unique
- [ ] Regular security updates planned

## Performance

- [ ] API response time < 200ms
- [ ] Website load time < 2 seconds
- [ ] Images optimized (WebP format)
- [ ] Database queries optimized
- [ ] Caching enabled (Redis/CDN)
- [ ] Database connection pooling configured
- [ ] Memory usage monitored
- [ ] CPU usage monitored

## Backup & Disaster Recovery

- [ ] Daily database backups configured
- [ ] Backups stored off-site
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined
- [ ] Runbook created for failover

## Documentation

- [ ] CUSTOMER_JOURNEY.md reviewed
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] QUICKSTART.md tested
- [ ] API documentation up-to-date
- [ ] Runbooks created
- [ ] Incident response plan documented
- [ ] Team trained on deployment process

## Legal & Compliance

- [ ] Terms of Service updated
- [ ] Privacy Policy updated
- [ ] Billing info clearly displayed
- [ ] Trial terms clear (14 days free)
- [ ] Cancellation policy documented
- [ ] Refund policy documented
- [ ] GDPR compliance (if EU users)
- [ ] SOC 2 compliance (if needed)

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rate (target: <0.1%)
- [ ] Monitor API latency
- [ ] Monitor database performance
- [ ] Monitor email delivery rate (target: >99%)
- [ ] Monitor Stripe webhook delivery (target: 100%)
- [ ] Monitor checkout conversion
- [ ] Monitor customer support tickets
- [ ] Be on call for incidents

## Success Criteria

✅ **Go-Live Ready When:**
- All items checked
- No P0 bugs outstanding
- Team trained on operations
- Monitoring & alerting working
- 1-2 team members on standby first 24 hours

---

## Sign-Off

- [ ] Engineering Lead Approval: _________________ Date: _______
- [ ] Product Lead Approval: _________________ Date: _______
- [ ] Operations Lead Approval: _________________ Date: _______

---

**Status**: Ready to launch on [DATE]
