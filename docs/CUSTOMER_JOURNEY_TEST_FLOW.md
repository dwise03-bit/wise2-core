# WISE² Customer Journey Test Flow

**Version**: 1.0  
**Last Updated**: 2026-07-23  
**Status**: Revenue-Ready Gate Verification  
**Author**: WISE² QA Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Test Setup](#pre-test-setup)
3. [Flow 1: Landing Page](#flow-1-landing-page)
4. [Flow 2: Signup & Email Verification](#flow-2-signup--email-verification)
5. [Flow 3: Authentication & JWT](#flow-3-authentication--jwt)
6. [Flow 4: Stripe Payment (Test Mode)](#flow-4-stripe-payment-test-mode)
7. [Flow 5: Dashboard Access](#flow-5-dashboard-access)
8. [Flow 6: Consulting Booking (Optional)](#flow-6-consulting-booking-optional)
9. [Flow 7: Account Management](#flow-7-account-management)
10. [Verification Checklist](#verification-checklist)
11. [Troubleshooting](#troubleshooting)
12. [Database Verification Queries](#database-verification-queries)
13. [API Endpoint Reference](#api-endpoint-reference)

---

## Overview

This document defines the **complete revenue-ready customer journey** that must be tested and verified before production deployment. Each step includes:

- Clear instructions
- Expected outcomes
- Verification steps
- Error handling
- Database impact

**Test Environment**: Local dev (`localhost:3000`) or staging  
**Test Mode**: Stripe TEST_MODE enabled  
**Duration**: ~20 minutes per complete run  
**Success Criteria**: All checkboxes pass in Verification Checklist

---

## Pre-Test Setup

### Prerequisites

Before starting, ensure:

```bash
# 1. Clone repo and install dependencies
git clone <repo-url>
cd wise2-core
npm install

# 2. Environment variables are set
cat .env.example > .env.local
# Fill in:
# - NEXT_PUBLIC_API_URL=http://localhost:3001
# - DATABASE_URL=postgresql://user:pass@localhost:5432/wise2_dev
# - STRIPE_PUBLIC_KEY=pk_test_<your-test-key>
# - STRIPE_SECRET_KEY=sk_test_<your-test-key>
# - SENDGRID_API_KEY=SG.<your-sendgrid-key>
# - JWT_SECRET=your-jwt-secret-key

# 3. Database is initialized
npm run db:migrate

# 4. API server is running (port 3001)
npm run dev:api

# 5. Website is running (port 3000)
npm run dev:website

# 6. Stripe is in TEST mode
# Verify in Stripe Dashboard: Settings → API Keys → Test mode active
```

### Test Credentials

| Service | Credential | Value |
|---------|-----------|-------|
| **Stripe Card** | Number | 4242 4242 4242 4242 |
| | Expiry | 12/25 (any future date) |
| | CVC | 123 (any 3 digits) |
| | ZIP | 12345 (any 5 digits) |
| **Test Email** | Primary | testuser@wise2.dev |
| | Backup | testuser2@wise2.dev |
| | Mailbox | [MailHog](#mailhog-setup) |
| **JWT Secret** | Key | `test-jwt-secret-key` |

### MailHog Setup (for email testing)

MailHog captures all outgoing emails locally without sending.

```bash
# 1. Install MailHog (macOS)
brew install mailhog

# 2. Start MailHog
mailhog
# Listens on: localhost:1025 (SMTP), localhost:8025 (Web UI)

# 3. Configure SendGrid API key in .env.local
# Or use MailHog's built-in SMTP (bypass SendGrid)

# 4. View emails
# Open http://localhost:8025 in browser
```

---

## Flow 1: Landing Page

**Objective**: Verify landing page loads and pricing/CTAs are visible  
**Duration**: 2 minutes  
**Prerequisites**: Website server running on port 3000

### Steps

#### 1.1 Navigate to landing page

```
1. Open browser to http://localhost:3000
2. Verify page loads within 3 seconds
3. Check no console errors (F12 → Console)
```

**Expected Result**: 
- Page loads successfully
- No 404 or 500 errors
- Pricing section visible
- "Get Started" CTA button visible

**Verification**:
```javascript
// In browser console:
document.querySelectorAll('[data-testid="pricing-card"]').length > 0
// Expected: true

document.querySelectorAll('[data-testid="get-started-btn"]').length > 0
// Expected: true
```

#### 1.2 Inspect pricing page

```
1. Scroll to pricing section
2. Verify 3 plans visible: Starter, PRO, Enterprise
3. Each plan shows price, features, CTA button
```

**Expected Result**:
- Starter plan: $29/month
- PRO plan: $99/month
- Enterprise plan: Custom pricing

#### 1.3 Click "Get Started" button

```
1. Click "Get Started" on PRO plan
2. Verify redirect to /signup
3. Check URL: http://localhost:3000/signup
```

**Expected Result**: 
- Redirects to signup page immediately
- No error toast/banner
- Signup form is visible and focused

---

## Flow 2: Signup & Email Verification

**Objective**: User creates account and verifies email  
**Duration**: 5 minutes  
**Prerequisites**: Landing page working, MailHog running

### Steps

#### 2.1 Fill signup form

```
1. Navigate to http://localhost:3000/signup
2. Fill in:
   - Email: testuser@wise2.dev
   - Password: TestPass123!@
   - Confirm Password: TestPass123!@
   - Full Name: Test User
3. Check "I agree to Terms" checkbox
4. Click "Create Account"
```

**Expected Result**:
- Form validation passes
- No client-side errors
- Loading spinner appears briefly

#### 2.2 Verify API response

```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for POST request to: /api/v1/auth/signup
4. Response status: 201 Created
5. Response body includes:
   {
     "userId": "uuid",
     "email": "testuser@wise2.dev",
     "message": "Account created. Verification email sent."
   }
```

**Expected Result**:
- 201 status (not 400, 409, 500)
- userId returned
- No "Email already exists" error

#### 2.3 Check database

```sql
-- Run in database client
SELECT id, email, verified_at, created_at 
FROM users 
WHERE email = 'testuser@wise2.dev';

-- Expected:
-- id: <uuid>
-- email: testuser@wise2.dev
-- verified_at: NULL (not yet verified)
-- created_at: 2026-07-23 14:30:15
```

#### 2.4 Check email delivery

```
1. Open MailHog: http://localhost:8025
2. Look for email FROM: noreply@wise2.net
3. TO: testuser@wise2.dev
4. Subject: "Verify Your WISE² Account"
5. Body contains verification link: 
   http://localhost:3000/verify?token=<jwt-token>
```

**Expected Result**:
- Email arrives within 5 seconds
- Link is clickable and properly formatted
- No malformed tokens

#### 2.5 Click verification link

```
1. Copy verification link from MailHog email
2. Paste into new browser tab
3. Verify page shows "Email verified successfully"
4. Check redirect to /login or /dashboard
```

**Expected Result**:
- Verification succeeds with success toast
- Redirects to login page
- verified_at timestamp set in database

#### 2.6 Verify database updated

```sql
-- Verify email is now marked as verified
SELECT id, email, verified_at, created_at 
FROM users 
WHERE email = 'testuser@wise2.dev';

-- Expected verified_at: 2026-07-23 14:32:10 (not NULL)
```

---

## Flow 3: Authentication & JWT

**Objective**: User logs in and receives JWT token  
**Duration**: 3 minutes  
**Prerequisites**: Email verified (Flow 2 complete)

### Steps

#### 3.1 Navigate to login

```
1. Go to http://localhost:3000/login
2. Verify login form visible
3. Form has fields:
   - Email input
   - Password input
   - "Remember me" checkbox
   - "Forgot password?" link
   - "Sign up" link
```

#### 3.2 Enter credentials

```
1. Email: testuser@wise2.dev
2. Password: TestPass123!@
3. Click "Log In"
```

**Expected Result**:
- Form validation passes
- Loading spinner appears
- No client-side errors

#### 3.3 Verify API response

```
1. Open DevTools → Network
2. Look for POST: /api/v1/auth/login
3. Response status: 200 OK
4. Response body:
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "<uuid>",
       "email": "testuser@wise2.dev",
       "name": "Test User"
     },
     "expiresIn": 86400
   }
```

**Expected Result**:
- 200 status (not 401, 500)
- JWT token is valid (can decode at jwt.io)
- ExpiresIn is 24 hours (86400 seconds)

#### 3.4 Verify JWT persisted

```javascript
// In browser console:
localStorage.getItem('wise2_auth_token')
// Expected: <jwt-token> (string starting with eyJ...)

JSON.parse(localStorage.getItem('wise2_auth_token'))
// Should not throw error

// Decode JWT (optional, for verification):
const decoded = JSON.parse(atob(token.split('.')[1]))
// Expected decoded payload:
// {
//   "userId": "<uuid>",
//   "email": "testuser@wise2.dev",
//   "iat": 1690107615,
//   "exp": 1690194015
// }
```

#### 3.5 Verify redirect to dashboard

```
1. After login, verify automatic redirect
2. Check URL is /dashboard or /dashboard/overview
3. User info appears in header (name, avatar)
4. No "Unauthorized" error
```

---

## Flow 4: Stripe Payment (Test Mode)

**Objective**: User purchases subscription via Stripe  
**Duration**: 5 minutes  
**Prerequisites**: User logged in (Flow 3 complete), Stripe test mode enabled

### Steps

#### 4.1 Navigate to billing

```
1. Go to http://localhost:3000/dashboard/billing
   OR click "Billing" in sidebar
2. Verify page shows current subscription status
3. If no active subscription, show plan selection
```

**Expected Result**:
- Billing page loads
- Shows current plan or "No active subscription"
- Plan selector visible

#### 4.2 Select plan

```
1. Click "Upgrade to PRO" or "Select Plan"
2. Verify plan details modal/page:
   - Plan name: PRO
   - Price: $99/month
   - Features list
   - "Subscribe" CTA button
```

#### 4.3 Click subscribe

```
1. Click "Subscribe" button
2. Verify redirect to Stripe Checkout
3. Stripe Checkout iframe loads (or redirects to stripe.com/pay)
```

**Expected Result**:
- Stripe Checkout is loading (may take 2-3 seconds)
- No CORS errors in console
- Stripe public key is correct

#### 4.4 Fill payment form

```
1. Enter test card details:
   - Card Number: 4242 4242 4242 4242
   - Expiry: 12/25 (or any future date)
   - CVC: 123
   - Billing ZIP: 12345
2. Click "Pay" or "Subscribe"
```

**Expected Result**:
- Stripe processes payment (no errors)
- Success page appears or redirects back to dashboard

#### 4.5 Verify payment in Stripe Dashboard

```
1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to: Payments → Charges (or Billing → Invoices)
3. Look for charge: $99.00 USD
4. Status: Succeeded
5. Description: "WISE² PRO Subscription"
6. Customer: testuser@wise2.dev
```

**Expected Result**:
- Charge appears in Stripe Dashboard within 10 seconds
- Status is "Succeeded" (not "Failed" or "Pending")
- Amount matches plan price

#### 4.6 Verify database subscription record

```sql
-- Check subscription was created
SELECT id, user_id, stripe_customer_id, stripe_subscription_id, 
       plan, status, current_period_start, current_period_end 
FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev');

-- Expected:
-- id: <uuid>
-- stripe_customer_id: cus_<stripe-id>
-- stripe_subscription_id: sub_<stripe-id>
-- plan: pro
-- status: active
-- current_period_start: 2026-07-23 14:45:00
-- current_period_end: 2026-08-23 14:45:00
```

#### 4.7 Verify confirmation email

```
1. Check MailHog: http://localhost:8025
2. Look for email:
   - FROM: noreply@wise2.net
   - TO: testuser@wise2.dev
   - Subject: "Welcome to WISE² PRO"
   - Body includes:
     * Subscription details
     * Plan features
     * Invoice link
     * Next billing date
```

**Expected Result**:
- Email arrives within 30 seconds
- Contains invoice number
- Contains next billing date

#### 4.8 Verify dashboard reflects subscription

```
1. Go to http://localhost:3000/dashboard
2. Check sidebar or header shows:
   - "PRO Plan"
   - Next billing date
   - "Manage Subscription" link
```

**Expected Result**:
- Dashboard shows active subscription
- No "Free Trial" or "No Plan" messages
- All PRO features are accessible

---

## Flow 5: Dashboard Access

**Objective**: User can access all dashboard features with active subscription  
**Duration**: 5 minutes  
**Prerequisites**: User logged in with active subscription (Flow 4 complete)

### Steps

#### 5.1 Navigate to main dashboard

```
1. Go to http://localhost:3000/dashboard
2. Verify page loads (no 401, 403, 500 errors)
3. Check URL shows /dashboard/overview (or main view)
```

**Expected Result**:
- Dashboard loads in under 3 seconds
- No authorization errors
- Main layout with sidebar visible

#### 5.2 Verify all sections accessible

```
Navigation sidebar should show:
- ✅ Overview (default page)
- ✅ Analytics
- ✅ Projects
- ✅ Team
- ✅ Settings
- ✅ Billing
- ✅ Help/Support
```

**Steps**:
```
1. Click each sidebar item
2. Verify page loads without error
3. Check URL changes to /dashboard/<section>
4. No 401/403 errors
```

#### 5.3 Check subscription details

```
1. Go to /dashboard/billing
2. Look for:
   - Current plan: "PRO"
   - Status: "Active"
   - Next billing date
   - Last invoice with payment successful
   - "Cancel Subscription" button (if allowed)
```

**Expected Result**:
- All subscription info displays correctly
- Payment method shows (ending in 4242)
- Next billing date is correct (30 days from now)

#### 5.4 Verify invoices

```
1. Go to /dashboard/billing → Invoices section
2. Click on latest invoice
3. Verify PDF or invoice page shows:
   - Invoice number
   - Date issued
   - Amount due: $99.00
   - Items: "WISE² PRO Monthly"
   - Payment status: Paid
```

**Expected Result**:
- Invoice loads and is readable
- Payment status is correct
- No broken links or missing data

#### 5.5 Check user profile

```
1. Go to /dashboard/settings → Account
2. Verify user info displays:
   - Name: Test User
   - Email: testuser@wise2.dev
   - Joined date: 2026-07-23
   - Account status: Active
```

**Expected Result**:
- User profile data is correct
- Can edit name, email
- Can change password
- Can set 2FA (if implemented)

---

## Flow 6: Consulting Booking (Optional)

**Objective**: User books and pays for consulting session  
**Duration**: 5 minutes  
**Prerequisites**: Active subscription (Flow 4 complete), consulting feature enabled

### Steps

#### 6.1 Navigate to consulting

```
1. Go to http://localhost:3000/consulting
   OR /dashboard/consulting
2. Verify page loads with consultant list
```

**Expected Result**:
- Consulting page visible
- List of consultants with:
  * Photo
  * Name
  * Title/specialty
  * Rate (e.g., $200/hour)
  * Availability calendar

#### 6.2 Select consultant and time

```
1. Click on a consultant
2. View their availability calendar
3. Click an available time slot (e.g., tomorrow at 2 PM)
4. Verify booking modal/page appears
```

**Expected Result**:
- Time slot highlights as selected
- Booking details modal appears
- Shows:
  * Consultant name
  * Selected date/time
  * Rate: $200 (or whatever)
  * Total: $200
  * "Confirm Booking" button

#### 6.3 Confirm booking and pay

```
1. Click "Confirm Booking"
2. Verify redirect to Stripe Checkout
   (PaymentIntent for one-time payment)
3. Enter test card details:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVC: 123
4. Click "Pay"
```

**Expected Result**:
- Stripe processes payment
- Success message or redirect to booking confirmation

#### 6.4 Verify booking record

```sql
-- Check booking was created
SELECT id, user_id, consultant_id, scheduled_at, 
       payment_status, meeting_link, created_at
FROM consulting_bookings
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev')
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- id: <uuid>
-- scheduled_at: 2026-07-24 14:00:00 (tomorrow at 2 PM)
-- payment_status: paid
-- meeting_link: https://zoom.us/j/<meeting-id>
```

#### 6.5 Verify confirmation email

```
1. Check MailHog for email:
   - Subject: "Consulting Session Booked"
   - Body includes:
     * Consultant name
     * Date/time
     * Zoom link (or meeting link)
     * Invoice
```

**Expected Result**:
- Email arrives with all booking details
- Meeting link is valid and clickable

#### 6.6 Verify dashboard shows booking

```
1. Go to /dashboard/consulting or /bookings
2. See the new booking in list:
   - Consultant name
   - Date/time
   - Status: Confirmed
   - Can reschedule or cancel
```

---

## Flow 7: Account Management

**Objective**: User manages subscription, profile, and bookings  
**Duration**: 5 minutes  
**Prerequisites**: Active subscription, optional consulting booking

### Steps

#### 7.1 Update profile

```
1. Go to /dashboard/settings → Account
2. Click "Edit Profile"
3. Change name to "Test User Updated"
4. Change email to testuser@wise2.dev (or new email)
5. Click "Save"
```

**Expected Result**:
- Success toast: "Profile updated"
- Changes persist on page reload
- Database updated

**Database verification**:
```sql
SELECT id, name, email FROM users 
WHERE email = 'testuser@wise2.dev';
-- Expected: name = "Test User Updated"
```

#### 7.2 Change password

```
1. Go to /dashboard/settings → Security
2. Click "Change Password"
3. Enter:
   - Current password: TestPass123!@
   - New password: NewPass456!@
   - Confirm: NewPass456!@
4. Click "Update Password"
```

**Expected Result**:
- Success toast: "Password changed"
- Session doesn't end (no logout)
- Old password no longer works for login

#### 7.3 Reschedule consulting booking (if booked)

```
1. Go to /dashboard/bookings (or /consulting)
2. Find the booking made in Flow 6
3. Click "Reschedule"
4. Pick new date/time (e.g., 3 days from now)
5. Click "Confirm Reschedule"
```

**Expected Result**:
- Booking updates immediately
- Consultant receives reschedule notification
- New time is reflected in calendar

**Database verification**:
```sql
SELECT id, scheduled_at, updated_at 
FROM consulting_bookings 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev')
ORDER BY updated_at DESC LIMIT 1;
-- Expected: scheduled_at = new date/time
```

#### 7.4 Cancel consulting booking (if booked)

```
1. Go to /dashboard/bookings
2. Find the booking
3. Click "Cancel Booking"
4. Confirm in modal
```

**Expected Result**:
- Booking status changes to "Cancelled"
- Refund email sent
- Refund appears in Stripe Dashboard within 30 seconds

**Database verification**:
```sql
SELECT id, payment_status, cancelled_at 
FROM consulting_bookings 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev')
ORDER BY cancelled_at DESC LIMIT 1;
-- Expected: payment_status = "refunded", cancelled_at is set
```

#### 7.5 View subscription history

```
1. Go to /dashboard/billing → Subscription History
2. Should show:
   - Date created: 2026-07-23
   - Plan: PRO
   - Status: Active
   - Next billing: 2026-08-23
```

**Expected Result**:
- All historical subscriptions visible
- Correct status for each
- No missing records

#### 7.6 Cancel subscription (optional test)

```
1. Go to /dashboard/billing
2. Click "Cancel Subscription"
3. Select reason (optional)
4. Confirm cancellation
```

**Expected Result**:
- Subscription status changes to "Cancelled"
- Cancellation effective date shown
- Access revoked at end of billing period
- Confirmation email sent

**Database verification**:
```sql
SELECT id, status, cancelled_at 
FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev');
-- Expected: status = "cancelled", cancelled_at is set
```

---

## Verification Checklist

Use this checklist to verify the complete customer journey before shipping to production.

### Pre-Test
- [ ] Database initialized and migrated
- [ ] API server running on port 3001
- [ ] Website running on port 3000
- [ ] MailHog running on port 8025
- [ ] Stripe test mode enabled
- [ ] Environment variables configured (.env.local)
- [ ] No hanging processes from previous runs

### Flow 1: Landing Page
- [ ] Landing page loads without errors
- [ ] Pricing section visible with 3 plans
- [ ] "Get Started" buttons present
- [ ] Click "Get Started" redirects to /signup
- [ ] No console errors in DevTools

### Flow 2: Signup & Email Verification
- [ ] Signup form loads
- [ ] Form validates correctly (email format, password strength)
- [ ] POST /api/v1/auth/signup returns 201
- [ ] User record created in database
- [ ] Verification email sent within 5 seconds
- [ ] Verification email contains valid token link
- [ ] Clicking verification link updates verified_at in database
- [ ] verified_at timestamp is non-NULL after verification
- [ ] Redirect to /login after verification successful

### Flow 3: Authentication & JWT
- [ ] Login page loads at /login
- [ ] POST /api/v1/auth/login returns 200
- [ ] JWT token returned in response
- [ ] JWT token stored in localStorage
- [ ] JWT token is valid (can decode at jwt.io)
- [ ] JWT expires in 24 hours (86400 seconds)
- [ ] User redirected to /dashboard after login
- [ ] User info appears in header

### Flow 4: Stripe Payment
- [ ] Billing page loads at /dashboard/billing
- [ ] Plan selection visible
- [ ] Stripe Checkout loads without CORS errors
- [ ] Test card 4242... is accepted
- [ ] Charge appears in Stripe Dashboard with "Succeeded" status
- [ ] Charge amount is correct ($99)
- [ ] Subscription record created in database
- [ ] stripe_subscription_id is set (sub_...)
- [ ] stripe_customer_id is set (cus_...)
- [ ] Subscription status is "active"
- [ ] Confirmation email sent to user
- [ ] Dashboard shows "PRO Plan" active
- [ ] Billing period dates are correct

### Flow 5: Dashboard Access
- [ ] Dashboard loads at /dashboard/overview
- [ ] No 401 or 403 errors
- [ ] Sidebar navigation shows all sections
- [ ] Each section loads without error
- [ ] /dashboard/billing shows active subscription
- [ ] /dashboard/billing/invoices shows latest invoice
- [ ] Invoice PDF or HTML renders correctly
- [ ] /dashboard/settings/account shows user profile
- [ ] User info is accurate (name, email, join date)

### Flow 6: Consulting Booking (If Implemented)
- [ ] Consulting page loads at /consulting
- [ ] Consultants list visible with photos and details
- [ ] Calendar picker shows available slots
- [ ] Clicking time slot shows booking summary
- [ ] Stripe Checkout loads for payment
- [ ] Payment succeeds (test card accepted)
- [ ] Booking record created in database
- [ ] meeting_link is generated
- [ ] Confirmation email sent with meeting link
- [ ] Booking appears in /dashboard/bookings or /dashboard/consulting

### Flow 7: Account Management
- [ ] Profile update saves successfully
- [ ] Changes persist on page reload
- [ ] Password change succeeds with correct old password
- [ ] Old password doesn't work for login after change
- [ ] Booking reschedule updates scheduled_at in database
- [ ] Cancellation of booking creates refund
- [ ] Refund appears in Stripe Dashboard
- [ ] Subscription cancellation updates status to "cancelled"
- [ ] Cancellation email sent

### Database Integrity
- [ ] No orphaned records (booking without user, subscription without customer)
- [ ] All timestamps are in UTC
- [ ] No duplicate records
- [ ] Foreign keys are correct
- [ ] Indexes are created for fast queries

### Email Delivery
- [ ] All emails arrive within 30 seconds
- [ ] No spam in email content
- [ ] Links in emails are clickable and formatted correctly
- [ ] From address is noreply@wise2.net
- [ ] Subject lines are clear and branded
- [ ] HTML email template renders correctly in major clients
- [ ] Unsubscribe link present (if applicable)

### API Logging & Errors
- [ ] No 500 errors in API logs
- [ ] No unhandled promise rejections
- [ ] All API calls logged with method, path, status, duration
- [ ] Error responses have proper error messages (not generic)
- [ ] Rate limiting works (if implemented)

### Browser & Console
- [ ] No console errors (❌ icons in DevTools)
- [ ] No console warnings (⚠️ that are actionable)
- [ ] No CORS errors
- [ ] No 404s for static assets
- [ ] LocalStorage persists auth token
- [ ] SessionStorage (if used) is cleared on logout

### Performance
- [ ] Landing page loads in < 3 seconds
- [ ] Signup form submits in < 2 seconds
- [ ] Login succeeds in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Billing page loads in < 2 seconds
- [ ] Stripe Checkout overlay loads in < 5 seconds

### Security
- [ ] JWT token is HttpOnly (if possible) or at least not logged
- [ ] Password is never logged or exposed
- [ ] API requires JWT for protected endpoints
- [ ] Rate limiting on auth endpoints (if implemented)
- [ ] CSRF protection on forms (if applicable)
- [ ] No hardcoded credentials in frontend code

---

## Troubleshooting

### Issue: Signup fails with "Email already exists"

**Cause**: User already exists in database  
**Solution**:
```bash
# Option 1: Use different test email
# Use testuser2@wise2.dev or testuser-<timestamp>@wise2.dev

# Option 2: Delete existing user
# DELETE FROM users WHERE email = 'testuser@wise2.dev';
# DELETE FROM subscriptions WHERE stripe_customer_id = 'cus_...';
```

### Issue: Email verification link doesn't work

**Cause**: Token expired or invalid  
**Solution**:
```bash
# 1. Check token in MailHog email
# 2. Verify token hasn't expired (JWT tokens have exp claim)
# 3. Check JWT_SECRET matches in .env.local and backend

# Decode token to check expiration:
# Copy token from email, paste at https://jwt.io
# Check exp claim: should be current timestamp + 24 hours
```

### Issue: Stripe payment fails with "Invalid API key"

**Cause**: Stripe keys not configured or in wrong mode  
**Solution**:
```bash
# 1. Verify Stripe is in TEST mode:
# https://dashboard.stripe.com → Settings → Test mode toggle

# 2. Copy test keys from Stripe Dashboard
STRIPE_PUBLIC_KEY=pk_test_<key>
STRIPE_SECRET_KEY=sk_test_<key>

# 3. Restart API and website servers
npm run dev:api
npm run dev:website
```

### Issue: Stripe Checkout shows CORS error

**Cause**: Stripe public key is not configured correctly  
**Solution**:
```bash
# Check website .env.local has:
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_<key>

# Verify in DevTools:
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
// Should output: pk_test_<key>

# Restart website server
npm run dev:website
```

### Issue: Dashboard shows "Not Authenticated" or 401

**Cause**: JWT token is missing or invalid  
**Solution**:
```javascript
// Check in browser console:
localStorage.getItem('wise2_auth_token')
// Should return a token string

// If missing, log out and log back in:
localStorage.removeItem('wise2_auth_token')
// Refresh page
// Go to /login and authenticate
```

### Issue: Database migration fails

**Cause**: Database not running or schema mismatch  
**Solution**:
```bash
# 1. Check Postgres is running
psql -U postgres -c "SELECT 1"

# 2. Check DATABASE_URL in .env.local
echo $DATABASE_URL

# 3. Drop and recreate database
dropdb wise2_dev
createdb wise2_dev

# 4. Re-run migrations
npm run db:migrate
```

### Issue: MailHog not receiving emails

**Cause**: MailHog not running or SMTP not configured  
**Solution**:
```bash
# 1. Start MailHog
mailhog

# 2. Check it's running on port 1025 (SMTP) and 8025 (Web UI)
lsof -i :8025

# 3. Verify .env.local has SMTP config (if using MailHog's SMTP):
# SMTP_HOST=127.0.0.1
# SMTP_PORT=1025
# SMTP_FROM=noreply@wise2.net

# 4. Restart API server
npm run dev:api
```

### Issue: Payment succeeds in Stripe but subscription not created in DB

**Cause**: Webhook handler not triggered or not processing correctly  
**Solution**:
```bash
# 1. Check Stripe webhook is configured:
# https://dashboard.stripe.com → Developers → Webhooks

# 2. Verify webhook endpoint is correct:
# URL should be: https://<your-domain>/api/v1/webhooks/stripe

# 3. Check webhook events are sent (View logs in Stripe Dashboard)

# 4. Check webhook handler is implemented in API:
# packages/api/src/v1/webhooks/stripe.controller.ts

# 5. Verify ngrok or similar if testing locally:
# ngrok http 3001
# Update Stripe webhook URL to ngrok URL
```

### Issue: Consulting booking shows "Payment failed" but charge succeeded

**Cause**: Webhook not marking booking as paid  
**Solution**:
```bash
# Same as above webhook issue
# Also check:
# 1. PaymentIntent has associated booking_id metadata
# 2. Webhook handler updates booking payment_status to "paid"
```

---

## Database Verification Queries

Use these SQL queries to verify data integrity throughout the journey.

### Check user creation

```sql
SELECT id, email, name, verified_at, created_at 
FROM users 
WHERE email = 'testuser@wise2.dev';
```

### Check subscription

```sql
SELECT id, user_id, stripe_customer_id, stripe_subscription_id, 
       plan, status, current_period_start, current_period_end, created_at
FROM subscriptions 
WHERE stripe_customer_id LIKE 'cus_%'
ORDER BY created_at DESC 
LIMIT 1;
```

### Check invoices

```sql
SELECT id, subscription_id, stripe_invoice_id, amount, status, created_at
FROM invoices
WHERE subscription_id IN (SELECT id FROM subscriptions)
ORDER BY created_at DESC
LIMIT 5;
```

### Check consulting bookings (if implemented)

```sql
SELECT id, user_id, consultant_id, scheduled_at, payment_status, 
       meeting_link, created_at
FROM consulting_bookings
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev')
ORDER BY created_at DESC;
```

### Check JWT tokens (if stored in DB)

```sql
SELECT id, user_id, token_hash, issued_at, expires_at
FROM auth_tokens
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@wise2.dev')
ORDER BY issued_at DESC
LIMIT 5;
```

### Verify data integrity - no orphans

```sql
-- Check for subscriptions without users
SELECT s.id FROM subscriptions s
LEFT JOIN users u ON s.user_id = u.id
WHERE u.id IS NULL;

-- Check for invoices without subscriptions
SELECT i.id FROM invoices i
LEFT JOIN subscriptions s ON i.subscription_id = s.id
WHERE s.id IS NULL;

-- Check for bookings without users
SELECT b.id FROM consulting_bookings b
LEFT JOIN users u ON b.user_id = u.id
WHERE u.id IS NULL;
```

---

## API Endpoint Reference

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/v1/auth/signup | Register new user |
| POST | /api/v1/auth/login | Authenticate user, return JWT |
| POST | /api/v1/auth/logout | Invalidate token |
| POST | /api/v1/auth/refresh | Refresh JWT token |
| POST | /api/v1/auth/verify-email | Verify email with token |
| POST | /api/v1/auth/forgot-password | Send password reset email |
| POST | /api/v1/auth/reset-password | Reset password with token |

### Users

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/users/me | Get current user profile |
| PATCH | /api/v1/users/me | Update current user |
| POST | /api/v1/users/me/password | Change password |
| POST | /api/v1/users/me/avatar | Upload profile picture |

### Subscriptions

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/subscriptions | Get current subscription |
| POST | /api/v1/subscriptions | Create subscription (initiate Stripe checkout) |
| PATCH | /api/v1/subscriptions/:id | Update subscription (plan change) |
| DELETE | /api/v1/subscriptions/:id | Cancel subscription |
| GET | /api/v1/subscriptions/invoices | Get all invoices |
| GET | /api/v1/subscriptions/invoices/:id | Get single invoice |

### Consulting (if implemented)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/consulting/consultants | List all consultants |
| GET | /api/v1/consulting/consultants/:id | Get consultant details |
| GET | /api/v1/consulting/consultants/:id/availability | Get available time slots |
| POST | /api/v1/consulting/bookings | Create booking |
| GET | /api/v1/consulting/bookings | Get user's bookings |
| GET | /api/v1/consulting/bookings/:id | Get booking details |
| PATCH | /api/v1/consulting/bookings/:id | Reschedule booking |
| DELETE | /api/v1/consulting/bookings/:id | Cancel booking |

### Webhooks

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/v1/webhooks/stripe | Stripe webhook receiver |
| POST | /api/v1/webhooks/sendgrid | SendGrid webhook receiver |

### Expected Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Login successful |
| 201 | Created | User created, subscription created |
| 204 | No Content | Logout, delete booking |
| 400 | Bad Request | Missing email, invalid password format |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Trying to cancel another user's subscription |
| 404 | Not Found | Booking not found |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Database error, Stripe API failure |
| 503 | Service Unavailable | Maintenance mode |

---

## Sign-Off

**Prepared by**: WISE² QA Team  
**Date**: 2026-07-23  
**Version**: 1.0  
**Status**: Ready for Testing  

**To approve for production**:
- [ ] All checkboxes passed (see Verification Checklist)
- [ ] Product Manager sign-off
- [ ] CTO/Tech Lead sign-off
- [ ] Security review passed
- [ ] Performance testing passed

**Notes**:
- This document should be updated after each major release
- Test this flow weekly before production deployments
- Maintain test credentials in a separate, secure document
- Archive test runs with timestamps for audit trail

---

**Document End**
