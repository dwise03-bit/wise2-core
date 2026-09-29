# WISE² Consulting Platform Setup Guide

Welcome to the WISE² AI Consulting Platform! This guide covers all aspects of setting up, configuring, and managing the consulting service ecosystem.

**Version**: 1.0  
**Last Updated**: July 2024  
**Owner**: WISE² Core Team

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Admin Onboarding](#admin-onboarding)
7. [Troubleshooting](#troubleshooting)
8. [Future Enhancements](#future-enhancements)

---

## Features Overview

The WISE² Consulting Platform enables AI-native business consulting services with the following capabilities:

### Core Features

- **Consultant Management**
  - Create and manage consultant profiles
  - Define expertise areas and hourly rates
  - Set availability and working hours
  - Multi-service expertise mapping

- **Service Catalog**
  - Define consulting service types (Strategy, Implementation, Training, Audit)
  - Set hourly rates and minimum/maximum hour requirements
  - Tag services for filtering and discovery
  - Link consultants to services with custom rates

- **Booking Management**
  - Real-time availability checking
  - Time slot selection with timezone support
  - Automated scheduling confirmation
  - Booking status tracking (scheduled, in-progress, completed, cancelled, no-show)

- **Payment Processing**
  - Stripe integration for secure payments
  - Pre-booking payment authorization
  - Automatic invoice generation
  - Refund handling for cancelled bookings

- **Calendar Integration**
  - Google Calendar OAuth for availability
  - Automatic meeting link generation
  - Calendar event creation for both parties
  - Timezone-aware scheduling

- **Post-Call Management**
  - AI-generated summaries and transcripts
  - Action item tracking with ownership
  - Follow-up scheduling
  - Conversation notes storage

### User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **Customer** | Browse services, create bookings, view bookings, pay for sessions |
| **Consultant** | Manage availability, view bookings, add post-call notes |
| **Admin** | Full system access, manage consultants, view all bookings, analytics |
| **Founder** | All admin + billing configuration, system settings |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     WISE² CONSULTING PLATFORM                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATIONS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Web Client  │  │  Dashboard   │  │  Mobile App  │       │
│  │  (Next.js)   │  │  (React)     │  │  (React)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            CONSULTING API LAYER (Next.js Routes)            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ /api/consulting/services       - List/manage services │  │
│  │ /api/consulting/availability   - Check consultant slots│  │
│  │ /api/consulting/bookings       - Create/manage bookings│  │
│  │ /api/admin/consultants         - Manage consultants    │  │
│  │ /api/admin/bookings            - Admin booking view    │  │
│  │ /api/checkout                  - Stripe integration    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICE INTEGRATIONS                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Stripe    │  │   Google     │  │   SendGrid   │       │
│  │   (Payments) │  │  (Calendar)  │  │   (Email)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (PostgreSQL / Prisma)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Tables:                                               │  │
│  │ • Consultant         - Consultant profiles           │  │
│  │ • ConsultingService  - Service definitions           │  │
│  │ • ConsultantService  - Service/consultant mapping    │  │
│  │ • Booking            - Booking records               │  │
│  │ • CalendarAvailability - Availability slots          │  │
│  │ • PostCallSummary    - Call transcripts & summaries  │  │
│  │ • ActionItem         - Follow-up action items        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 13+ (local or managed)
- Docker & Docker Compose (for containerized deployment)
- Stripe account (for payments)
- Google OAuth credentials (for calendar integration)
- SendGrid account (for email notifications)

### 1. Database Migration

Initialize the consulting database schema:

```bash
# Navigate to the project root
cd /Users/danielwise/Projects/wise2-core

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npx prisma db seed
```

#### Check Migration Status

```bash
# See pending migrations
npx prisma migrate status

# View current schema
npx prisma db push --dry-run
```

#### Rollback (if needed)

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back migration_name

# Reset entire database (WARNING: destructive!)
npx prisma migrate reset
```

### 2. Stripe Product & Price Setup

Configure Stripe products for consulting services:

#### Create Products in Stripe Dashboard

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** > **Add Product**
3. Create services:

```
Service: AI Strategy Consulting
- Price: $250/hour
- Recurring: No (one-time)
- Product ID: prod_consulting_strategy

Service: Implementation Support
- Price: $300/hour
- Recurring: No
- Product ID: prod_consulting_implementation

Service: Training Session
- Price: $200/hour
- Recurring: No
- Product ID: prod_consulting_training
```

#### Retrieve Price IDs

After creating products, note the **Price IDs**:

```bash
# Use Stripe CLI to list prices
stripe prices list --product prod_consulting_strategy
```

Store these in your `.env.local`:

```env
STRIPE_STRATEGY_PRICE_ID=price_1Ov2Zk...
STRIPE_IMPLEMENTATION_PRICE_ID=price_1Ov2Zm...
STRIPE_TRAINING_PRICE_ID=price_1Ov2Zn...
```

### 3. Google Calendar OAuth Setup

Enable Google Calendar API for availability management:

#### 1. Create OAuth Credentials

```bash
# Visit Google Cloud Console
# https://console.cloud.google.com/

# Create a new project or select existing
# Search for "Google Calendar API" and enable it
# Navigate to Credentials > Create OAuth 2.0 Client ID
# Select "Web Application"
# Add authorized redirect URIs:
# - http://localhost:3000/api/auth/google/callback
# - https://yourdomain.com/api/auth/google/callback
```

#### 2. Store Credentials in Environment

After creating credentials, download the JSON file and extract:

```env
GOOGLE_CALENDAR_CLIENT_ID=XXXXXXXXXXX.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX_XXXXXXXXXXXXXXXX
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

#### 3. Verify Setup

```bash
# Test Google OAuth connection
curl -X GET https://www.googleapis.com/calendar/v3/users/me/calendarList \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### 4. SendGrid Email Setup

Configure transactional emails for booking confirmations and reminders:

```env
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXX
SENDGRID_FROM_EMAIL=consulting@wise2.io
SENDGRID_FROM_NAME=WISE² Consulting

# Optional: Template IDs for different email types
SENDGRID_BOOKING_CONFIRMATION_ID=d-XXXXXXXXXXXXX
SENDGRID_REMINDER_EMAIL_ID=d-XXXXXXXXXXXXX
SENDGRID_CANCELLATION_ID=d-XXXXXXXXXXXXX
```

### 5. Initial Database Seeding

Create sample consultants and services:

```bash
# Run seeding script
npm run db:seed:consulting
```

Or manually insert via SQL:

```sql
-- Insert sample consultant
INSERT INTO "Consultant" (id, name, email, bio, expertise, "hourlyRate", "isActive", "createdAt", "updatedAt")
VALUES (
  'con_001',
  'Sarah Chen',
  'sarah@wise2.io',
  'Product strategy and scaling expert',
  '{"Product Strategy", "Operations"}',
  250,
  true,
  NOW(),
  NOW()
);

-- Insert sample service
INSERT INTO "ConsultingService" (id, name, description, "hourlyRate", "minHours", tags, "createdAt", "updatedAt")
VALUES (
  'svc_001',
  'AI Strategy Consulting',
  'Expert guidance on AI implementation and business strategy',
  250,
  1,
  '{"strategy", "ai", "business"}',
  NOW(),
  NOW()
);

-- Link consultant to service
INSERT INTO "ConsultantService" (id, "consultantId", "serviceId", "customHourlyRate", capacity, "createdAt", "updatedAt")
VALUES (
  'cs_001',
  'con_001',
  'svc_001',
  250,
  10,
  NOW(),
  NOW()
);
```

---

## Environment Variables

Create `.env.local` in the project root with the following variables:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wise2_consulting"

# Stripe Integration
STRIPE_SECRET_KEY="sk_live_XXXXXXXXXXXXXXXXXXXXX"
STRIPE_PUBLISHABLE_KEY="pk_live_XXXXXXXXXXXXXXXXXXXXX"
STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXX"

# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID="XXXXXXXXX.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="GOCSPX_XXXXXXXXXXXXXXXXXXXXX"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# SendGrid Email
SENDGRID_API_KEY="SG.XXXXXXXXXXXXXXXXXXXXX"
SENDGRID_FROM_EMAIL="consulting@wise2.io"

# Application URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

### Optional Variables

```bash
# Email service (alternative to SendGrid)
# RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXX"

# Zoom Integration (for meeting links)
# ZOOM_CLIENT_ID="XXXXXXXXXXXXX"
# ZOOM_CLIENT_SECRET="XXXXXXXXXXXXX"

# Analytics
# MIXPANEL_TOKEN="XXXXXXXXXXXXX"
# SEGMENT_WRITE_KEY="XXXXXXXXXXXXX"

# Consultant meeting link generation
MEETING_LINK_PROVIDER="google_meet"  # or "zoom", "whereby"

# Timezone for default consultant availability
DEFAULT_CONSULTANT_TIMEZONE="America/New_York"

# Booking confirmation settings
BOOKING_CONFIRMATION_DELAY_MINUTES=5
REMINDER_EMAIL_HOURS_BEFORE=24

# Maximum booking window (days in advance)
MAX_BOOKING_DAYS_AHEAD=90
```

---

## API Endpoints Reference

### Consulting Services

#### List All Services

```bash
GET /api/consulting/services

# Query Parameters:
# - tags=strategy,implementation (optional)
# - limit=10 (optional)
# - offset=0 (optional)

# Response:
{
  "services": [
    {
      "id": "svc_001",
      "name": "AI Strategy Consulting",
      "description": "Expert guidance...",
      "hourlyRate": 250,
      "minHours": 1,
      "tags": ["strategy", "ai"],
      "consultants": [
        {
          "consultant": {
            "id": "con_001",
            "name": "Sarah Chen",
            "expertise": ["Product", "Strategy"],
            "hourlyRate": 250,
            "isActive": true
          }
        }
      ]
    }
  ]
}
```

#### Get Service Details

```bash
GET /api/consulting/services/:serviceId

# Response:
{
  "id": "svc_001",
  "name": "AI Strategy Consulting",
  "description": "...",
  "hourlyRate": 250,
  "minHours": 1,
  "consultants": [...],
  "bookings": [...]
}
```

### Bookings

#### Create Booking

```bash
POST /api/consulting/bookings

# Request Body:
{
  "serviceId": "svc_001",
  "consultantId": "con_001",
  "date": "2024-07-25",
  "time": "14:00",
  "duration": 60,
  "timezone": "America/New_York",
  "notes": "Discuss Q3 strategy"
}

# Response (201 Created):
{
  "success": true,
  "data": {
    "id": "bk_001",
    "serviceId": "svc_001",
    "consultantId": "con_001",
    "consultantName": "Sarah Chen",
    "consultantEmail": "sarah@wise2.io",
    "serviceName": "AI Strategy Consulting",
    "startTime": "2024-07-25T14:00:00Z",
    "endTime": "2024-07-25T15:00:00Z",
    "totalPrice": 250,
    "status": "scheduled",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "createdAt": "2024-07-23T10:30:00Z"
  }
}
```

#### List User Bookings

```bash
GET /api/consulting/bookings

# Query Parameters:
# - status=scheduled,completed (optional)
# - limit=20 (optional)
# - offset=0 (optional)

# Response:
{
  "bookings": [
    {
      "id": "bk_001",
      "serviceId": "svc_001",
      "consultantName": "Sarah Chen",
      "serviceName": "AI Strategy Consulting",
      "startTime": "2024-07-25T14:00:00Z",
      "status": "scheduled"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### Get Booking Details

```bash
GET /api/consulting/bookings/:bookingId

# Response:
{
  "id": "bk_001",
  "userId": "usr_001",
  "serviceId": "svc_001",
  "consultantId": "con_001",
  "consultantName": "Sarah Chen",
  "consultantEmail": "sarah@wise2.io",
  "serviceName": "AI Strategy Consulting",
  "startTime": "2024-07-25T14:00:00Z",
  "endTime": "2024-07-25T15:00:00Z",
  "durationHours": 1,
  "totalPrice": 250,
  "status": "completed",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "notes": "Discussed Q3 strategy",
  "createdAt": "2024-07-23T10:30:00Z"
}
```

#### Reschedule Booking

```bash
PUT /api/consulting/bookings/:bookingId

# Request Body:
{
  "date": "2024-07-26",
  "time": "15:00",
  "timezone": "America/New_York"
}

# Response:
{
  "success": true,
  "data": {
    "id": "bk_001",
    "startTime": "2024-07-26T15:00:00Z",
    "endTime": "2024-07-26T16:00:00Z",
    "status": "rescheduled",
    "meetingLink": "https://meet.google.com/abc-defg-hij"
  }
}
```

#### Cancel Booking

```bash
DELETE /api/consulting/bookings/:bookingId

# Query Parameters:
# - reason=Scheduling conflict (optional)

# Response:
{
  "success": true,
  "message": "Booking cancelled successfully. Refund processed."
}
```

### Availability

#### Get Consultant Availability

```bash
GET /api/consulting/availability

# Query Parameters:
# - consultantId=con_001 (required)
# - timezone=America/New_York (optional, default: UTC)
# - days=14 (optional, default: 14, max: 90)

# Response:
{
  "consultantId": "con_001",
  "consultantName": "Sarah Chen",
  "timezone": "America/New_York",
  "slots": [
    {
      "date": "2024-07-25",
      "time": "14:00",
      "available": true
    },
    {
      "date": "2024-07-25",
      "time": "15:00",
      "available": true
    },
    {
      "date": "2024-07-25",
      "time": "16:00",
      "available": false
    }
  ],
  "generatedAt": "2024-07-23T10:30:00Z"
}
```

### Admin Endpoints

#### List All Consultants

```bash
GET /api/admin/consultants

# Authorization: Required (admin)

# Response:
{
  "consultants": [
    {
      "id": "con_001",
      "name": "Sarah Chen",
      "email": "sarah@wise2.io",
      "bio": "Product strategy expert",
      "expertise": ["Product", "Strategy", "Operations"],
      "hourlyRate": 250,
      "isActive": true,
      "createdAt": "2024-06-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### Create Consultant

```bash
POST /api/admin/consultants

# Authorization: Required (admin)

# Request Body:
{
  "name": "Sarah Chen",
  "email": "sarah@wise2.io",
  "bio": "Product strategy and scaling expert with 10+ years in SaaS",
  "expertise": ["Product", "Strategy", "Operations"],
  "hourlyRate": 250
}

# Response (201 Created):
{
  "id": "con_001",
  "name": "Sarah Chen",
  "email": "sarah@wise2.io",
  "bio": "Product strategy and scaling expert...",
  "expertise": ["Product", "Strategy", "Operations"],
  "hourlyRate": 250,
  "isActive": true,
  "createdAt": "2024-07-23T10:30:00Z"
}
```

#### Update Consultant

```bash
PUT /api/admin/consultants/:consultantId

# Request Body:
{
  "name": "Sarah Chen",
  "expertise": ["Product", "Strategy", "Operations", "AI/ML"],
  "hourlyRate": 275,
  "isActive": true
}

# Response:
{
  "id": "con_001",
  "name": "Sarah Chen",
  "expertise": ["Product", "Strategy", "Operations", "AI/ML"],
  "hourlyRate": 275,
  "isActive": true
}
```

#### Delete Consultant

```bash
DELETE /api/admin/consultants/:consultantId

# Response:
{
  "success": true,
  "message": "Consultant deleted successfully"
}
```

#### List All Bookings (Admin)

```bash
GET /api/admin/bookings

# Authorization: Required (admin)

# Query Parameters:
# - status=completed (optional)
# - consultantId=con_001 (optional)
# - dateFrom=2024-07-01 (optional)
# - dateTo=2024-07-31 (optional)
# - limit=50 (optional)

# Response:
{
  "bookings": [
    {
      "id": "bk_001",
      "userId": "usr_001",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "consultantId": "con_001",
      "consultantName": "Sarah Chen",
      "serviceId": "svc_001",
      "serviceName": "AI Strategy Consulting",
      "startTime": "2024-07-25T14:00:00Z",
      "endTime": "2024-07-25T15:00:00Z",
      "totalPrice": 250,
      "status": "completed",
      "paymentStatus": "succeeded"
    }
  ],
  "total": 1
}
```

---

## Admin Onboarding

### Adding Your First Consultant

Follow these steps to onboard a consultant:

#### Step 1: Gather Information

Collect from the consultant:
- Full name
- Email address
- Bio/background
- Areas of expertise
- Hourly rate
- Availability (days/times)

Example data:

```
Name: Dr. Sarah Chen
Email: sarah@wise2.io
Bio: Product strategy and scaling expert with 10+ years experience in B2B SaaS
Expertise: Product Strategy, Operations, Board Advisory
Hourly Rate: $250
Availability: Mon-Fri 9am-5pm EST
```

#### Step 2: Create Consultant via Admin Panel

```bash
# Option A: Use Dashboard UI
# Navigate to Admin > Consultants > Add Consultant
# Fill in the form and submit

# Option B: Use API directly
curl -X POST http://localhost:3000/api/admin/consultants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Chen",
    "email": "sarah@wise2.io",
    "bio": "Product strategy and scaling expert...",
    "expertise": ["Product Strategy", "Operations"],
    "hourlyRate": 250
  }'
```

#### Step 3: Set Availability

After creating the consultant, set their working hours:

```bash
# Create recurring availability (e.g., 9am-5pm EST, Mon-Fri)
curl -X POST http://localhost:3000/api/admin/consultants/:consultantId/availability \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/New_York",
    "isRecurring": true
  }'

# Repeat for each day (dayOfWeek: 0=Mon, 1=Tue, ..., 4=Fri)
```

#### Step 4: Link to Services

Connect the consultant to available services:

```bash
curl -X POST http://localhost:3000/api/admin/consultants/:consultantId/services \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "svc_001",
    "customHourlyRate": 250,
    "capacity": 10
  }'
```

#### Step 5: Send Welcome Email

Automatically send consultant onboarding email:

```bash
curl -X POST http://localhost:3000/api/admin/consultants/:consultantId/send-welcome-email \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Email template content:

```
Subject: Welcome to WISE² Consulting Platform

Hi Sarah,

You've been onboarded as a consultant on the WISE² Consulting Platform.

Your Profile:
- Name: Sarah Chen
- Expertise: Product Strategy, Operations
- Hourly Rate: $250
- Status: Active

Next Steps:
1. Log in at https://wise2.io/consultant/login
2. Update your availability calendar
3. Review and accept bookings
4. Set up your Google Calendar integration

Questions? Contact support@wise2.io

Best regards,
WISE² Team
```

### Creating Services

Define the consulting services your business offers:

#### Add a New Service

```bash
curl -X POST http://localhost:3000/api/admin/services \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Strategy Consulting",
    "description": "Expert guidance on AI implementation and business strategy. Includes market analysis, technology assessment, and implementation roadmap.",
    "hourlyRate": 250,
    "minHours": 1,
    "maxHours": 8,
    "tags": ["strategy", "ai", "business", "enterprise"],
    "icon": "brain"
  }'
```

#### Service Templates

Here are common consulting service types:

**1. Strategy Consulting**
```
Name: AI Strategy Consulting
Price: $250/hour
Min Hours: 1
Max Hours: 8
Tags: strategy, ai, business
```

**2. Implementation Support**
```
Name: Implementation & Integration
Price: $300/hour
Min Hours: 4
Max Hours: 40
Tags: implementation, technical, integration
```

**3. Training**
```
Name: Team Training Session
Price: $200/hour
Min Hours: 2
Max Hours: 8
Tags: training, education, onboarding
```

**4. Technical Review**
```
Name: Architecture & Technical Review
Price: $350/hour
Min Hours: 2
Max Hours: 8
Tags: technical, review, architecture
```

### Managing Bookings

#### View All Bookings

Access the admin dashboard to see all bookings:

```
Dashboard > Analytics > Bookings
```

Filter by:
- Consultant
- Service
- Status (scheduled, completed, cancelled)
- Date range

#### Handle Cancellations

When a customer cancels:

1. **Automatic**: System automatically refunds payment
2. **Consultant Notification**: Email sent to consultant
3. **Availability**: Time slot becomes available again

```bash
# Cancel booking with refund
curl -X DELETE http://localhost:3000/api/admin/bookings/:bookingId \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"reason": "Customer request"}'
```

#### Rescheduling Issues

If a consultant needs to reschedule:

1. Notify the customer via email
2. Suggest alternative times based on availability
3. Let customer accept/reject
4. Update calendar events

---

## Troubleshooting

### Common Issues & Solutions

#### 1. "No Available Slots" Error

**Problem**: Customers see no available time slots for a consultant

**Causes**:
- Consultant has no availability configured
- All slots are fully booked
- Timezone mismatch

**Solution**:
```bash
# Check consultant availability
curl -X GET http://localhost:3000/api/admin/consultants/:consultantId/availability

# Verify calendar availability
# If empty, create availability:
curl -X POST http://localhost:3000/api/admin/consultants/:consultantId/availability \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/New_York",
    "isRecurring": true
  }'
```

#### 2. Stripe Payment Fails

**Problem**: "Payment declined" when booking

**Causes**:
- Invalid Stripe API keys
- Webhook not configured
- Card declined

**Solution**:
```bash
# Verify Stripe credentials
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# Test payment:
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "bk_001",
    "amount": 25000,
    "currency": "usd"
  }'

# Check webhook logs in Stripe Dashboard
# Dashboard > Developers > Webhooks > Select endpoint > Logs
```

#### 3. Google Calendar Integration Not Working

**Problem**: Calendar events not created, or OAuth failing

**Causes**:
- Invalid OAuth credentials
- Redirect URI mismatch
- Insufficient permissions

**Solution**:
```bash
# Verify OAuth credentials
echo $GOOGLE_CALENDAR_CLIENT_ID
echo $GOOGLE_CALENDAR_REDIRECT_URI

# Check credentials in Google Cloud Console:
# https://console.cloud.google.com/apis/credentials

# Verify scopes in code:
# Required scopes:
# - https://www.googleapis.com/auth/calendar
# - https://www.googleapis.com/auth/calendar.readonly
```

#### 4. Emails Not Sending

**Problem**: Booking confirmation/reminder emails not received

**Causes**:
- SendGrid API key invalid
- Email address misspelled
- Domain verification not complete

**Solution**:
```bash
# Test SendGrid connectivity
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "consulting@wise2.io"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'

# Check SendGrid logs
# Dashboard > Mail Settings > Event Notification > Logs
```

#### 5. Database Connection Issues

**Problem**: "Connection refused" or timeout errors

**Causes**:
- PostgreSQL not running
- Wrong DATABASE_URL
- Network connectivity issue

**Solution**:
```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# If not installed, use Docker
docker run --rm -it postgres:13 \
  psql -h host.docker.internal -U wise2

# Check env variable
cat .env.local | grep DATABASE_URL

# Verify database exists
psql -U postgres -l
```

#### 6. Timezone Issues

**Problem**: Bookings showing wrong time

**Causes**:
- Consultant/customer timezone mismatch
- Server timezone not set to UTC

**Solution**:
```bash
# Ensure server timezone is UTC
TZ=UTC node server.js

# Verify in code - convert times:
const booking = {
  startTime: new Date('2024-07-25T14:00:00Z'),  // Always UTC
  timezone: 'America/New_York'  // Customer's timezone
}
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
DEBUG=wise2:consulting npm run dev

# View logs
tail -f logs/consulting.log
```

### Getting Help

If issues persist:

1. Check logs: `tail -f .logs/app.log`
2. Verify all environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Contact support: support@wise2.io

---

## Future Enhancements

Planned features and improvements for the consulting platform:

### Phase 2 (Q3 2024)

- [ ] **Zoom Integration**
  - Native Zoom meeting creation for bookings
  - Automatic meeting link generation
  - Recording storage in S3
  
- [ ] **Bulk Consultant Import**
  - CSV import for multiple consultants
  - Batch availability setup
  - Service assignment automation

- [ ] **Advanced Analytics**
  - Revenue dashboard
  - Booking trends
  - Consultant utilization metrics
  - Customer satisfaction scores

### Phase 3 (Q4 2024)

- [ ] **Payment Plans**
  - Package deals (e.g., 10-hour bundles at discount)
  - Retainer options for ongoing consulting
  - Financing options

- [ ] **Consultant Portal**
  - Mobile app for consultants
  - Real-time booking notifications
  - Time tracking integration
  - Expense management

- [ ] **AI-Powered Matching**
  - Smart consultant recommendations based on need
  - Skill-based matching algorithm
  - Success prediction

### Phase 4 (2025)

- [ ] **Video Conference Recording**
  - Automatic recording and transcription
  - AI summary generation improvement
  - Video search/indexing

- [ ] **Marketplace Features**
  - Consultant ratings/reviews
  - Public consultant profiles
  - Service ratings

- [ ] **Integration Ecosystem**
  - Slack integration for notifications
  - Salesforce CRM sync
  - HubSpot integration
  - Zapier/Make.com support

- [ ] **Multi-Language Support**
  - Support for international consultants
  - Currency conversion
  - Translation features

### Technical Roadmap

- [ ] Migrate to real-time event system (WebSockets)
- [ ] Implement caching layer (Redis)
- [ ] Performance optimization for high-volume bookings
- [ ] Enhanced security (2FA, API key rotation)
- [ ] Improved disaster recovery procedures
- [ ] Consultant mobile app (React Native)

---

## Support & Resources

### Documentation

- [WISE² Core README](./README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Documentation](./docs/API.md)

### External Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

### Contact

- **Email**: support@wise2.io
- **Slack**: #consulting-platform
- **Issues**: GitHub Issues

---

**Last Updated**: July 23, 2024  
**Document Version**: 1.0  
**Maintained by**: WISE² Core Team
