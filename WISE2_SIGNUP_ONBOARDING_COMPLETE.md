# WISE² Signup & Onboarding System ✅

**Status**: ✅ PRODUCTION READY  
**Date**: 2026-08-23  
**Version**: 1.0.0

---

## Overview

Complete customer signup and 5-step onboarding flow for WISE² AI Phone platform.

### Features
- Email/password signup with validation
- OAuth (Google, Discord)
- Email verification requirement
- 5-step guided onboarding
- Progress tracking
- Integration management
- Billing setup
- Dashboard configuration
- AI Phone enablement
- Launch verification

---

## Signup Flow

### Endpoint: `POST /api/v1/auth/signup`

**Request**:
```json
{
  "email": "customer@business.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "customer@business.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Account created. Please verify your email."
}
```

**UI**: `/auth/signup` page with:
- Email validation
- Password strength meter
- OAuth options (Google, Discord)
- Email verification confirmation screen

---

## 5-Step Onboarding

### Step 1: Connect Integration

**Purpose**: Link business systems (Jobber, Stripe, Zapier)

**Endpoint**: `POST /api/v1/onboarding/step/1/complete`

```json
{
  "data": {
    "provider": "jobber|stripe|zapier",
    "accountId": "integration-account-id"
  }
}
```

**Stores**: Integration record in database

---

### Step 2: Setup Billing

**Purpose**: Add payment method and select pricing tier

**Plans**:
- **Starter** — $499/month (100 calls/month)
- **Pro** — $999/month (1000 calls/month, analytics)
- **Enterprise** — Custom (unlimited calls, dedicated support)

**Endpoint**: `POST /api/v1/onboarding/step/2/complete`

```json
{
  "data": {
    "plan": "starter|pro|enterprise",
    "stripeCustomerId": "cus_xxxxx"
  }
}
```

**Stores**: Stripe customer ID and plan selection

---

### Step 3: Configure Dashboard

**Purpose**: Customize command center widgets and theme

**Widgets**: Calls, Bookings, Revenue, Analytics

**Endpoint**: `POST /api/v1/onboarding/step/3/complete`

```json
{
  "data": {
    "widgets": ["calls", "bookings", "revenue"],
    "theme": "dark|light"
  }
}
```

**Stores**: DashboardConfig record

---

### Step 4: Enable AI Phone

**Purpose**: Configure greeting message and business hours

**Endpoint**: `POST /api/v1/onboarding/step/4/complete`

```json
{
  "data": {
    "greeting": "Hello! Thanks for calling. How can I help?",
    "businessHours": {
      "monday": "9:00-17:00",
      "tuesday": "9:00-17:00",
      "wednesday": "9:00-17:00",
      "thursday": "9:00-17:00",
      "friday": "9:00-17:00",
      "saturday": "closed",
      "sunday": "closed"
    },
    "timezone": "America/New_York"
  }
}
```

**Stores**: AIPhoneConfig record

---

### Step 5: Launch

**Purpose**: Verify configuration and activate account

**Endpoint**: `POST /api/v1/onboarding/step/5/complete`

```json
{
  "data": {}
}
```

**Stores**: Sets account status to `active`

**Result**: Account is now live and can receive calls

---

## API Endpoints

### Onboarding Status
```
GET /api/v1/onboarding/status
```

**Response**:
```json
{
  "currentStep": 1,
  "steps": [
    {
      "step": 1,
      "name": "Connect Integration",
      "status": "in_progress"
    },
    {
      "step": 2,
      "name": "Setup Billing",
      "status": "pending"
    }
  ],
  "progress": 20
}
```

### Skip Step
```
POST /api/v1/onboarding/skip-step/:step
```

---

## Database Schema

### Onboarding
```sql
CREATE TABLE "Onboarding" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL UNIQUE,
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "steps" JSONB NOT NULL,
  "startedAt" TIMESTAMP NOT NULL,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);
```

### AIPhoneConfig
```sql
CREATE TABLE "AIPhoneConfig" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL UNIQUE,
  "greeting" TEXT NOT NULL,
  "businessHours" JSONB NOT NULL,
  "timezone" VARCHAR(50),
  "recordCalls" BOOLEAN DEFAULT true,
  "transcribeCalls" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);
```

### Integration
```sql
CREATE TABLE "Integration" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL,
  "provider" VARCHAR(50) NOT NULL,
  "accountId" VARCHAR(255),
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "status" VARCHAR(20) DEFAULT 'connected',
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  UNIQUE("userId", "provider")
);
```

---

## User Journey

### Day 1: Signup
1. Customer lands on `https://wise2.net`
2. Clicks "Get Started"
3. Signs up at `/auth/signup`
4. Receives verification email
5. Clicks email link to verify
6. Redirected to `/dashboard/onboarding`

### Day 1-2: Onboarding
1. **Step 1** (5 min): Connect Jobber or Stripe
2. **Step 2** (5 min): Add billing info and choose plan
3. **Step 3** (5 min): Customize dashboard
4. **Step 4** (10 min): Configure AI Phone greeting + hours
5. **Step 5** (2 min): Review and launch

### Day 2+: Active
- Account is `active` and receiving calls
- Customers can:
  - View call history
  - Read transcripts
  - Download recordings
  - Manage integrations
  - Update settings
  - Invite team members

---

## Client Examples

### Get Down Pressure Washing (Field Service)
- Jobber integration (jobs → appointments)
- AI Phone: "Book a pressure washing appointment for your home or business"
- Booking flow: Call → Check availability → Schedule → SMS confirmation

### CC Craft & Create (E-commerce)
- Stripe integration (products → pricing)
- AI Phone: "Browse our personalized product catalog"
- Order flow: Call → Browse → Add to cart → Pay → Ship

---

## Deployment

### Prerequisites
- PostgreSQL 13+
- Redis 6+
- Node.js 18+
- Stripe account
- Twilio account
- OpenAI API key

### Environment Setup
```bash
cp .env.production.example .env.production
# Fill in all credentials

# Database
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."

# Auth
export JWT_SECRET="your-secret"

# Integrations
export STRIPE_SECRET_KEY="sk_live_..."
export TWILIO_ACCOUNT_SID="AC..."
export OPENAI_API_KEY="sk-proj-..."
```

### Deploy
```bash
# Build
pnpm build

# Run migrations
pnpm exec -- npx prisma migrate deploy

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://wise2.net/api/health
```

---

## Testing

### Test Signup
```bash
curl -X POST https://wise2.net/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@wise2.net",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "Customer"
  }'
```

### Test Onboarding Flow
```bash
# Step 1: Connect integration
curl -X POST https://wise2.net/api/v1/onboarding/step/1/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"provider": "jobber"}}'

# Check status
curl https://wise2.net/api/v1/onboarding/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## Monitoring

### Key Metrics
- Signup conversion rate
- Step completion rate by step
- Time to completion
- Dropout rate
- Integration success rate
- Billing setup completion
- Launch rate

### Logs
```bash
# View API logs
docker-compose logs -f api

# View auth service logs
docker-compose logs -f auth

# View onboarding logs
docker-compose logs -f api | grep onboarding
```

---

## Support & Troubleshooting

### Common Issues

**Email verification not arriving**
- Check spam folder
- Verify SendGrid API key
- Check SENDGRID_FROM_EMAIL in env

**Stripe payment fails**
- Verify Stripe keys (live vs test)
- Check card details
- Review Stripe dashboard for errors

**Integration connection fails**
- Verify API credentials
- Check integration provider status
- Review logs for error details

**AI Phone not receiving calls**
- Verify Twilio credentials
- Confirm webhook URL is correct
- Check firewall allows HTTPS
- Verify phone number is active

---

## Next Steps

### For Customers
1. Sign up at https://wise2.net
2. Complete 5-step onboarding
3. Receive phone number
4. Configure greeting
5. Start receiving AI-powered calls

### For Team
1. Monitor signup analytics
2. Track onboarding completion rates
3. Support customers with integrations
4. Gather feedback for improvements
5. Plan Phase 2 features

---

## Sign-Off

✅ **Signup & Onboarding System: PRODUCTION READY**

All components in place:
- ✅ Signup page with OAuth
- ✅ Email verification
- ✅ 5-step onboarding UI
- ✅ API endpoints
- ✅ Database schema
- ✅ Integration management
- ✅ Billing setup
- ✅ AI Phone configuration
- ✅ Deployment scripts
- ✅ Documentation

Ready to deploy and accept customers.

---

**Built by**: WISE² Engineering  
**Date**: 2026-08-23  
**Status**: ✅ PRODUCTION LIVE
