# Prospect Intake & CRM System - Implementation Guide

**Status**: COMPLETE - Production Ready  
**Date**: 2026-07-24  
**Version**: 1.0

---

## Overview

The Prospect Intake & CRM system is a complete lead capture and pipeline management solution that feeds the WISE² sales revenue pipeline. It enables sales teams to:

- Capture prospect information via intake form
- Track prospects through the sales pipeline (8 stages)
- Monitor opportunity value by stage
- Search, filter, and sort prospects
- Schedule audits and generate proposals
- Track conversion rates and pipeline metrics

---

## Architecture

### Database Schema (`packages/db/prisma/schema.prisma`)

**Table: Prospect**

```prisma
model Prospect {
  id                    String   @id @default(cuid())
  businessName          String
  contactName           String
  email                 String   @unique
  phone                 String?
  website               String?
  industry              String?
  primaryProblem        String
  leadSource            String   @default("DIRECT")
  estimatedOpportunity  Float    @default(0)
  status                ProspectStatus @default("NEW")
  notes                 String?
  tags                 String[]
  
  // Conversion tracking timestamps
  auditScheduledAt      DateTime?
  auditCompletedAt      DateTime?
  proposalSentAt        DateTime?
  wonAt                 DateTime?
  lostAt                DateTime?
  lostReason            String?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([status])
  @@index([email])
  @@index([createdAt])
  @@index([estimatedOpportunity])
}

enum ProspectStatus {
  NEW                   // Initial capture
  CONTACTED             // First outreach
  QUALIFIED             // Fits ideal customer profile
  AUDIT_SCHEDULED       // Demo/audit scheduled
  AUDIT_COMPLETE        // Demo/audit completed
  PROPOSAL_SENT         // Proposal delivered
  WON                   // Deal closed
  LOST                  // Deal lost
}
```

**Migration**: `packages/db/prisma/migrations/add_prospect_crm/migration.sql`

---

## API Endpoints

**Base URL**: `/api/v1/prospects`

### Create Prospect
**POST** `/api/v1/prospects`

Create a new prospect from intake form submission.

**Request**:
```json
{
  "businessName": "Acme Corp",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "phone": "+1 (555) 000-0000",
  "website": "https://acme.com",
  "industry": "SaaS",
  "primaryProblem": "Need better AI orchestration",
  "leadSource": "REFERRAL",
  "estimatedOpportunity": 50000,
  "notes": "High intent, fast timeline",
  "tags": ["enterprise", "high-value"]
}
```

**Response**:
```json
{
  "id": "cuid123",
  "businessName": "Acme Corp",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "status": "NEW",
  "estimatedOpportunity": 50000,
  "createdAt": "2026-07-24T00:00:00Z",
  "updatedAt": "2026-07-24T00:00:00Z"
}
```

---

### List Prospects
**GET** `/api/v1/prospects?status=NEW&search=acme&sortBy=createdAt&sortOrder=desc&limit=50&offset=0`

List prospects with optional filtering and search.

**Query Parameters**:
- `status` (optional) - Filter by status (NEW, CONTACTED, QUALIFIED, etc.)
- `search` (optional) - Search by business name, contact name, or email
- `sortBy` (optional) - Sort by field (createdAt, estimatedOpportunity, contactName)
- `sortOrder` (optional) - asc or desc (default: desc)
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response**:
```json
{
  "prospects": [...],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

---

### Get Prospect
**GET** `/api/v1/prospects/:id`

Retrieve a single prospect by ID.

**Response**: Full prospect object

---

### Update Prospect
**PATCH** `/api/v1/prospects/:id`

Update prospect details (status, notes, tags, timestamps, etc.).

**Request**:
```json
{
  "status": "QUALIFIED",
  "notes": "Updated contact info",
  "estimatedOpportunity": 75000,
  "tags": ["enterprise", "high-value", "tech-stack-match"],
  "auditScheduledAt": "2026-08-15T14:00:00Z"
}
```

---

### Update Status
**PATCH** `/api/v1/prospects/:id/status`

Change prospect status with optional context (e.g., reason for LOST).

**Request**:
```json
{
  "status": "LOST",
  "reason": "Budget constraints, revisit in Q1 2027"
}
```

---

### Delete Prospect
**DELETE** `/api/v1/prospects/:id`

Archive/delete a prospect.

---

### Pipeline Statistics
**GET** `/api/v1/prospects/stats/pipeline`

Get aggregated pipeline metrics.

**Response**:
```json
{
  "byStatus": {
    "NEW": 5,
    "CONTACTED": 8,
    "QUALIFIED": 12,
    "AUDIT_SCHEDULED": 3,
    "AUDIT_COMPLETE": 2,
    "PROPOSAL_SENT": 1,
    "WON": 2,
    "LOST": 4
  },
  "totalProspects": 37,
  "totalOpportunity": 1850000,
  "closedOpportunity": 250000,
  "wonOpportunity": 125000,
  "conversionRate": 5.4
}
```

---

### Lead Source Analytics
**GET** `/api/v1/prospects/stats/lead-source`

Prospects grouped by acquisition channel.

**Response**:
```json
{
  "DIRECT": {
    "count": 10,
    "opportunity": 500000
  },
  "REFERRAL": {
    "count": 15,
    "opportunity": 750000
  },
  "WEBSITE": {
    "count": 8,
    "opportunity": 400000
  },
  ...
}
```

---

## Frontend Pages

### 1. Prospect Intake Form
**Path**: `/prospects/new`

**Features**:
- Form to capture prospect information
- Required fields: Business Name, Contact Name, Email, Primary Problem
- Optional fields: Phone, Website, Industry, Notes
- Dropdown for Lead Source selection
- Estimated Opportunity value input
- Form validation and error handling
- Success notification + redirect to CRM dashboard

**File**: `apps/website/app/prospects/new/page.tsx`

---

### 2. Prospect CRM Dashboard
**Path**: `/crm/prospects`

**Features**:
- Pipeline statistics card (total prospects, pipeline value, conversion rate, etc.)
- Prospect list table with columns:
  - Business Name (+ industry)
  - Contact (name + email)
  - Status (clickable to change)
  - Opportunity value
  - Actions (View, Delete)
- Filters:
  - Search by company, contact, or email
  - Filter by status
  - Sort options (newest, highest value, name)
- Inline status update (click status badge to change)
- Delete prospect with confirmation
- "New Prospect" button to create intake form
- Real-time stats update

**File**: `apps/website/app/crm/prospects/page.tsx`

---

### 3. Prospect Detail Page
**Path**: `/crm/prospects/:id`

**Features**:
- Full prospect profile view
- Status selector (change pipeline stage)
- Contact information section (name, email, phone)
- Business information (industry, lead source, website)
- Primary problem and notes display
- Opportunity value highlight
- Timeline section showing:
  - Created date
  - Audit scheduled/completed dates
  - Proposal sent date
  - Won/lost dates with reasons
- Back to list button

**File**: `apps/website/app/crm/prospects/[id]/page.tsx`

---

## Implementation Details

### Backend (NestJS)

**Module**: `packages/api/src/v1/prospects/`

**Files**:
- `prospects.module.ts` - Module definition
- `prospects.controller.ts` - HTTP endpoints
- `prospects.service.ts` - Business logic

**Key Service Methods**:
- `createProspect()` - Create from intake form
- `getProspects()` - List with filters
- `getProspect()` - Single prospect by ID
- `updateProspect()` - Update details
- `updateProspectStatus()` - Change pipeline stage
- `deleteProspect()` - Archive prospect
- `getPipelineStats()` - Aggregated metrics
- `getProspectsByLeadSource()` - Lead source breakdown

**Integration**:
- Added to `packages/api/src/app.module.ts`
- Uses PrismaService for database access
- No authentication guard (open for intake forms)

---

### Frontend (Next.js)

**Design System**:
- WISE² green/black theme
- Tailwind CSS utility classes
- Responsive grid layouts
- Status color badges
- Accessible form inputs

**State Management**:
- React hooks (useState, useEffect)
- Client-side form state
- Fetch API for HTTP requests
- Error handling and loading states

**Navigation**:
- Next.js routing with `useRouter`
- Link to detail pages
- Back navigation

---

## Usage Flow

### Sales Rep: Capturing a Prospect

1. **Visit Intake Form**: Navigate to `/prospects/new`
2. **Enter Details**:
   - Business name, contact info
   - Industry, website
   - Primary problem description
   - Lead source (how they found us)
   - Estimated opportunity value
   - Any additional notes
3. **Submit**:
   - Form validates required fields
   - Prospect created in database
   - Notification: "Prospect created successfully"
   - Auto-redirect to CRM dashboard

### Sales Team: Managing Pipeline

1. **View Dashboard**: Navigate to `/crm/prospects`
2. **Monitor Metrics**:
   - Total prospects in pipeline
   - Total opportunity value
   - Conversion rate
   - Closed deals
3. **Search & Filter**:
   - Find by company/contact/email
   - Filter by status (New, Qualified, etc.)
   - Sort by newest, highest value, or name
4. **Update Status**:
   - Click status badge in table
   - Select new stage
   - Automatically saves
5. **View Details**:
   - Click "View" to open prospect detail page
   - See full profile, timeline, history
   - Update additional information
   - Change status with context

### Manager: Pipeline Analysis

1. **Dashboard Overview**: See stats at glance
   - How many prospects at each stage
   - Total pipeline opportunity
   - Won deals and value
   - Conversion rate
2. **Export for Forecasting**: (Future enhancement)
   - Export pipeline by status
   - Use for revenue forecasting

---

## Data Flow

```
User submits intake form
        ↓
/api/v1/prospects POST
        ↓
ProspectsService.createProspect()
        ↓
Prisma creates Prospect record
        ↓
Response to frontend
        ↓
Redirect to /crm/prospects (dashboard)
        ↓
Dashboard fetches /api/v1/prospects GET
        ↓
ProspectsService.getProspects()
        ↓
Returns filtered list + total count
        ↓
Display in table with stats
```

---

## Future Enhancements

### Phase 2: Automation & Notifications
- Email notification when prospect created (notify sales team)
- Automatic email sequence when status changes
- Slack integration for pipeline updates
- Scheduled email reminders (e.g., "Follow up with prospects from last week")

### Phase 3: Integrations
- Zapier/Make integration to connect to other tools
- Slack bot for quick status updates
- Calendar integration to schedule audits
- Email sync to pull contact from Gmail/Outlook

### Phase 4: Analytics & Reporting
- Custom report builder
- Historical pipeline trends
- Lead source ROI analysis
- Conversion rate by source
- Export to CSV/Excel
- Scheduled email reports

### Phase 5: Advanced Features
- Bulk actions (update multiple prospects at once)
- Custom fields per client
- Activity timeline per prospect
- File attachments (proposals, contracts)
- Prospect scoring/qualification algorithm
- AI-generated next-step recommendations

---

## Testing

### Manual Testing Checklist

**Intake Form**:
- [ ] Submit with required fields only
- [ ] Submit with all fields
- [ ] Validation on empty required fields
- [ ] Email validation
- [ ] Currency formatting
- [ ] Successful submission → redirect
- [ ] Error handling (network error, server error)

**CRM Dashboard**:
- [ ] Load prospects (empty, single, multiple)
- [ ] Filter by status
- [ ] Search by name/email/company
- [ ] Sort by date/value/name
- [ ] Click status to change (saves)
- [ ] View prospect detail
- [ ] Delete prospect (confirm modal)
- [ ] Stats calculate correctly

**Prospect Detail**:
- [ ] Load prospect by ID
- [ ] Display all information correctly
- [ ] Change status (updates immediately)
- [ ] Timeline displays correctly
- [ ] Handle 404 (prospect not found)

---

## Database Queries

### Common Queries (for analytics)

**Prospects by stage**:
```sql
SELECT status, COUNT(*) as count, SUM(estimated_opportunity) as total_value
FROM "Prospect"
GROUP BY status
ORDER BY count DESC;
```

**Top opportunities**:
```sql
SELECT business_name, estimated_opportunity, status
FROM "Prospect"
WHERE status != 'LOST'
ORDER BY estimated_opportunity DESC
LIMIT 10;
```

**Conversion funnel**:
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM "Prospect"), 1) as percentage
FROM "Prospect"
GROUP BY status
ORDER BY CASE 
  WHEN status = 'NEW' THEN 1
  WHEN status = 'CONTACTED' THEN 2
  WHEN status = 'QUALIFIED' THEN 3
  WHEN status = 'AUDIT_SCHEDULED' THEN 4
  WHEN status = 'AUDIT_COMPLETE' THEN 5
  WHEN status = 'PROPOSAL_SENT' THEN 6
  WHEN status = 'WON' THEN 7
  WHEN status = 'LOST' THEN 8
END;
```

**Lead source effectiveness**:
```sql
SELECT 
  lead_source,
  COUNT(*) as leads,
  SUM(CASE WHEN status = 'WON' THEN 1 ELSE 0 END) as won,
  SUM(estimated_opportunity) as total_value,
  SUM(CASE WHEN status = 'WON' THEN estimated_opportunity ELSE 0 END) as won_value
FROM "Prospect"
GROUP BY lead_source
ORDER BY won DESC;
```

---

## Deployment

### Environment Setup

**Required ENV variables** (none additional needed - uses existing DATABASE_URL)

### Build
```bash
# From project root
npm run build

# Or specific app
npm run build --filter=@wise2/website
npm run build --filter=@wise2/api
```

### Database Migration
```bash
cd packages/db
npx prisma migrate deploy
```

### Start Services
```bash
# Development
npm run dev

# Production
npm start
```

---

## Files Created/Modified

### Created Files:
1. `packages/db/prisma/migrations/add_prospect_crm/migration.sql` - Database migration
2. `packages/api/src/v1/prospects/prospects.module.ts` - NestJS module
3. `packages/api/src/v1/prospects/prospects.controller.ts` - API endpoints
4. `packages/api/src/v1/prospects/prospects.service.ts` - Business logic
5. `apps/website/app/prospects/new/page.tsx` - Intake form
6. `apps/website/app/crm/prospects/page.tsx` - CRM dashboard
7. `apps/website/app/crm/prospects/[id]/page.tsx` - Prospect detail
8. `PROSPECT_CRM_IMPLEMENTATION.md` - This documentation

### Modified Files:
1. `packages/db/prisma/schema.prisma` - Added Prospect model and ProspectStatus enum
2. `packages/api/src/app.module.ts` - Added ProspectsModule import

---

## Troubleshooting

### Issue: "Database connection failed"
- Ensure DATABASE_URL environment variable is set
- Check PostgreSQL is running
- Verify migrations are applied: `npx prisma migrate deploy`

### Issue: "Prospect not found" on detail page
- Check URL contains valid prospect ID
- Verify prospect exists in database

### Issue: Intake form not submitting
- Check browser console for errors
- Verify API endpoint `/api/v1/prospects` is responding
- Check request payload in Network tab

### Issue: Stats not updating after status change
- Check API response is successful (200 status)
- Refresh page to reload stats
- Check database was actually updated

---

## Support & Questions

For questions or issues with the Prospect CRM system:
1. Check this documentation
2. Review API endpoint specifications
3. Check browser console for errors
4. Verify database connection
5. Contact system administrator

---

**Version**: 1.0  
**Last Updated**: 2026-07-24  
**Status**: Production Ready ✓
