# Phase 7: Frontend Integration Guide

**Status**: Planning Phase  
**Scope**: Connect Command Center (Next.js dashboard) to API endpoints  
**Timeline**: 3-5 days estimated  
**Priority**: High - unblocks Phase 8 (Testing) and Phase 9 (Production)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Command Center (Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│  Pages:                   Components:          Services:     │
│  - Dashboard              - Card               - API Client  │
│  - Leads (CRUD)           - DataTable          - Auth        │
│  - Estimates              - Form               - Cache       │
│  - Dispatch               - Modal              - Validators  │
│  - Approvals              - Timeline           - Mappers     │
│  - Workflows              - Chart              - Hooks       │
│  - Reports                                                   │
│  - Settings                                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                    (REST API calls + WebSocket)
                                │
         ┌──────────────────────┴──────────────────────┐
         │                                             │
    ┌────────────────────────┐            ┌──────────────────────┐
    │   Express API Server   │            │   PostgreSQL DB      │
    │  (services/api)        │            │                      │
    ├────────────────────────┤            ├──────────────────────┤
    │ Routes:                │            │ Tables:              │
    │ - /crm/*               │            │ - tenants            │
    │ - /approvals/*         │            │ - leads              │
    │ - /workflows/*         │            │ - estimates          │
    │ - /dispatch/*          │            │ - jobs               │
    │ - /reports/*           │            │ - approvals          │
    │ - /business-intel/*    │            │ - workflows          │
    │ - /communications/*    │            │ - audit_logs         │
    │ - /payments/*          │            │                      │
    └────────────────────────┘            └──────────────────────┘
```

---

## Folder Structure (Command Center)

```
apps/command-center/
├── app/                          # Next.js app directory
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard home
│   │
│   ├── leads/
│   │   ├── page.tsx              # Leads list
│   │   ├── [id]/
│   │   │   └── page.tsx          # Lead detail/edit
│   │   └── create/
│   │       └── page.tsx          # Create lead form
│   │
│   ├── estimates/
│   │   ├── page.tsx              # Estimates list
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Estimate detail
│   │   │   └── preview/          # View estimate PDF
│   │   └── create/
│   │       └── page.tsx          # Create estimate
│   │
│   ├── dispatch/
│   │   ├── page.tsx              # Dispatch queue
│   │   ├── [jobId]/
│   │   │   └── page.tsx          # Job detail/assign
│   │
│   ├── approvals/
│   │   ├── page.tsx              # Pending approvals
│   │   ├── [id]/
│   │   │   └── page.tsx          # Approval detail
│   │
│   ├── workflows/
│   │   ├── page.tsx              # Workflows list
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Workflow detail
│   │   │   └── runs/             # Execution history
│   │   └── create/
│   │       └── page.tsx          # Create workflow
│   │
│   ├── reports/
│   │   ├── sales/
│   │   ├── dispatch/
│   │   ├── revenue/
│   │   └── forecast/
│   │
│   ├── settings/
│   │   ├── page.tsx              # Business settings
│   │   ├── team/
│   │   ├── integrations/
│   │   └── billing/
│   │
│   └── api/                      # Route handlers (server-side)
│       └── auth/                 # Auth callback handlers
│
├── src/
│   ├── components/               # Reusable React components
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   ├── cards/
│   │   ├── tables/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── charts/
│   │
│   ├── services/                 # API clients & utilities
│   │   ├── api-client.ts         # Base HTTP client
│   │   ├── auth-service.ts       # Authentication
│   │   ├── leads-service.ts      # Lead CRUD
│   │   ├── estimates-service.ts  # Estimate CRUD
│   │   ├── dispatch-service.ts   # Dispatch CRUD
│   │   ├── approvals-service.ts  # Approvals
│   │   ├── workflows-service.ts  # Workflows
│   │   └── reports-service.ts    # Reports
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useApi.ts             # API data fetching
│   │   ├── usePagination.ts      # Pagination state
│   │   ├── useFormData.ts        # Form state
│   │   └── useAuth.ts            # Auth context
│   │
│   ├── types/                    # TypeScript types
│   │   ├── common.ts             # Shared types
│   │   ├── leads.ts              # Lead types
│   │   ├── estimates.ts          # Estimate types
│   │   └── ...
│   │
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Date, currency formatting
│   │   ├── validators.ts         # Input validation
│   │   ├── mappers.ts            # Data transformation
│   │   └── constants.ts          # Enums, status values
│   │
│   ├── context/                  # React context providers
│   │   ├── auth-context.tsx      # Auth state
│   │   ├── tenant-context.tsx    # Tenant state
│   │   └── notification-context.tsx # Notifications
│   │
│   └── styles/                   # Tailwind customization
│       ├── globals.css
│       └── theme.css
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── package.json
```

---

## Implementation Tasks

### Phase 7A: API Client & Auth (1-2 days)

**Goal**: Build reusable API client and authentication layer

#### Task 1: Create API Client
**File**: `src/services/api-client.ts`

```typescript
// Core HTTP client with:
// - Base URL configuration
// - Automatic tenant ID injection
// - Bearer token authentication
// - Error handling & retry logic
// - Request/response logging
// - Type-safe request/response types

export class ApiClient {
  constructor(baseUrl: string, token?: string) { }
  
  async request<T>(method, endpoint, body?, options?): Promise<T> { }
  
  // Convenience methods
  async get<T>(endpoint, options?): Promise<T> { }
  async post<T>(endpoint, body, options?): Promise<T> { }
  async put<T>(endpoint, body, options?): Promise<T> { }
  async patch<T>(endpoint, body, options?): Promise<T> { }
  async delete<T>(endpoint, options?): Promise<T> { }
}
```

#### Task 2: Auth Context
**File**: `src/context/auth-context.tsx`

```typescript
// React context providing:
// - Current user (from JWT)
// - Tenant ID
// - Login/logout/signup handlers
// - Token refresh logic
// - Auth guard wrapper

export const useAuth = () => {
  return useContext(AuthContext)
}

interface AuthContextType {
  user: User | null
  tenantId: string | null
  isLoading: boolean
  login(email, password): Promise<void>
  logout(): void
  signup(email, password, businessName): Promise<void>
  refreshToken(): Promise<void>
}
```

#### Task 3: Tenant Context
**File**: `src/context/tenant-context.tsx`

```typescript
// React context providing:
// - Current tenant settings
// - Business info (name, logo, location)
// - Team members
// - Integrations status
// - Tenant data fetching

export const useTenant = () => {
  return useContext(TenantContext)
}

interface TenantContextType {
  tenantId: string
  business: Business
  team: TeamMember[]
  integrations: Integration[]
  reloadTenant(): Promise<void>
}
```

### Phase 7B: Domain Services (1-2 days)

**Goal**: Create typed service layer for each domain

#### Task 4: Leads Service
**File**: `src/services/leads-service.ts`

```typescript
export class LeadsService {
  constructor(private api: ApiClient, private tenantId: string) { }
  
  // List
  async listLeads(page, limit, filters?): Promise<PaginatedResponse<Lead>> { }
  
  // CRUD
  async getLead(leadId): Promise<Lead> { }
  async createLead(data): Promise<Lead> { }
  async updateLead(leadId, data): Promise<Lead> { }
  async deleteLead(leadId): Promise<void> { }
  
  // Actions
  async changeLead Status(leadId, newStatus): Promise<Lead> { }
  async addNote(leadId, note): Promise<LeadNote> { }
  
  // Search
  async searchLeads(query): Promise<Lead[]> { }
}
```

#### Task 5: Estimates Service
**File**: `src/services/estimates-service.ts`

- List estimates (paginated, filtered by status)
- Create estimate from lead
- Get estimate details
- Send estimate (triggers approval)
- Mark accepted/declined
- Add line items
- Export to PDF

#### Task 6: Dispatch Service
**File**: `src/services/dispatch-service.ts`

- List unassigned jobs
- Create job
- Assign to technician
- Update job status
- Get routing info
- Real-time job tracking

#### Task 7: Approvals Service
**File**: `src/services/approvals-service.ts`

- List pending approvals (SMS, Email, Social, Payment)
- Get approval details
- Approve/reject actions
- Trigger execution
- View execution result

### Phase 7C: Reusable Components (1-2 days)

**Goal**: Build component library for consistent UI

#### Task 8: Data Table Component
**File**: `src/components/tables/data-table.tsx`

```typescript
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: PaginationState
  isLoading?: boolean
  onRowClick?: (row: T) => void
  onPaginationChange?: (state: PaginationState) => void
}

export const DataTable = <T,>(props: DataTableProps<T>) => {
  // Render table with:
  // - Sortable columns
  // - Pagination controls
  // - Row selection
  // - Loading skeleton
  // - Empty state
}
```

#### Task 9: Form Components
**File**: `src/components/forms/form-builder.tsx`

- TextField (with validation)
- SelectField (with options)
- DatePickerField
- PhoneField (formatted)
- CurrencyField (formatted)
- CheckboxField
- RadioField
- TextareaField

#### Task 10: Modal Component
**File**: `src/components/modals/modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  actions?: ModalAction[]
  size?: 'sm' | 'md' | 'lg'
}

export const Modal = (props: ModalProps) => {
  // Render modal with:
  // - Backdrop overlay
  // - Header with title
  // - Content
  // - Footer with actions
}
```

#### Task 11: Charts Component
**File**: `src/components/charts/chart-builder.tsx`

- Bar chart (revenue by month)
- Line chart (lead velocity)
- Pie chart (leads by status)
- KPI cards (metrics)

### Phase 7D: Pages & Features (2-3 days)

**Goal**: Build pages for each feature

#### Task 12: Leads Page
**File**: `app/leads/page.tsx`

- List leads with filters (status, date range)
- Create lead button
- Search leads
- Sort by name, date, value
- Quick actions (edit, delete, view details)

#### Task 13: Estimates Page
**File**: `app/estimates/page.tsx`

- List estimates by status
- Create estimate
- Send estimate (approval)
- Mark accepted/declined
- Export to PDF

#### Task 14: Dispatch Page
**File**: `app/dispatch/page.tsx`

- Show unassigned jobs queue
- Assign job to technician
- Update job status
- Show job routing on map (optional)
- Real-time notifications

#### Task 15: Approvals Page
**File**: `app/approvals/page.tsx`

- Show pending approvals (SMS, Email, Social, Payment)
- Approve/reject with notes
- View previous approvals
- See execution status

#### Task 16: Workflows Page
**File**: `app/workflows/page.tsx`

- List workflows
- Create workflow (form builder)
- Edit workflow
- Test workflow
- View execution history

#### Task 17: Reports Page
**File**: `app/reports/page.tsx`

- Sales report (leads by status, conversion rates)
- Dispatch report (jobs by technician)
- Revenue report (by service type)
- Pipeline forecast (next 30/60/90 days)
- Export reports (CSV, PDF)

#### Task 18: Dashboard/Home Page
**File**: `app/page.tsx`

- KPI cards (revenue MTD, leads, jobs)
- Sales pipeline chart
- Recent approvals
- Dispatch queue
- Overdue follow-ups
- Quick actions

### Phase 7E: Testing (1-2 days)

**Goal**: Test frontend against API

#### Task 19: Integration Tests
```bash
# Test auth flow (login, signup, logout)
npm test -- auth.test.ts

# Test CRUD operations (leads, estimates, jobs)
npm test -- crud.test.ts

# Test approval flow (send, approve, execute)
npm test -- approvals.test.ts

# Test forms and validation
npm test -- forms.test.ts
```

#### Task 20: E2E Tests
```bash
# Test full workflows with Cypress/Playwright
npm run e2e

# Scenarios:
# 1. User signup → Create lead → Send estimate → Approve → Payment
# 2. Admin: Create workflow → Trigger event → Verify execution
# 3. Dispatch: List jobs → Assign → Update status → Mark complete
```

---

## API Endpoints Used

### CRM
- GET `/crm/tenants/:id/leads` - List leads
- POST `/crm/tenants/:id/leads` - Create lead
- GET `/crm/tenants/:id/leads/:leadId` - Get lead
- PATCH `/crm/tenants/:id/leads/:leadId` - Update lead
- DELETE `/crm/tenants/:id/leads/:leadId` - Delete lead

### Estimates
- GET `/crm/tenants/:id/estimates` - List estimates
- POST `/crm/tenants/:id/estimates` - Create estimate
- PATCH `/crm/tenants/:id/estimates/:estimateId` - Update estimate
- POST `/crm/tenants/:id/estimates/:estimateId/send` - Send estimate

### Dispatch
- GET `/crm/tenants/:id/dispatch/queue` - List jobs
- POST `/crm/tenants/:id/dispatch/jobs` - Create job
- POST `/crm/tenants/:id/dispatch/jobs/:jobId/assign` - Assign job
- PATCH `/crm/tenants/:id/dispatch/jobs/:jobId` - Update job

### Approvals
- GET `/crm/tenants/:id/approvals` - List approvals
- POST `/crm/tenants/:id/approvals/:id/approve` - Approve
- POST `/crm/tenants/:id/approvals/:id/reject` - Reject
- POST `/crm/tenants/:id/approvals/:id/execute` - Execute

### Workflows
- GET `/crm/tenants/:id/workflows` - List workflows
- POST `/crm/tenants/:id/workflows` - Create workflow
- POST `/crm/tenants/:id/workflows/:id/trigger-test` - Test workflow
- GET `/crm/tenants/:id/workflows/:id/runs` - Execution history

### Reports
- GET `/crm/tenants/:id/reports/sales` - Sales report
- GET `/crm/tenants/:id/reports/dispatch` - Dispatch report
- GET `/crm/tenants/:id/reports/revenue` - Revenue report

### Business Intelligence
- POST `/crm/tenants/:id/business-intelligence/insights` - AI insights
- GET `/crm/tenants/:id/business-intelligence/summary` - KPIs

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0",
    "react": "^18.0",
    "react-dom": "^18.0",
    "axios": "^1.0",
    "react-hook-form": "^7.0",
    "zod": "^3.0",
    "@tanstack/react-query": "^4.0",
    "@tanstack/react-table": "^8.0",
    "recharts": "^2.0",
    "date-fns": "^2.0",
    "zustand": "^4.0",
    "tailwindcss": "^3.0",
    "@headlessui/react": "^1.0"
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_TENANT_ID=
AUTH_SECRET=
```

---

## Deployment Notes

- **Build**: `npm run build` (static export with dynamic API calls)
- **Dev Server**: `npm run dev` (runs on port 3000)
- **Production**: Deploy to Vercel with API redirects

---

## Success Criteria

✅ All pages load without errors  
✅ Auth flow works (login/signup/logout)  
✅ CRUD operations work (create/read/update/delete)  
✅ Forms validate input and show errors  
✅ Real-time notifications work  
✅ Responsive on mobile/tablet  
✅ Performance: pages load < 2s  
✅ All tests pass (unit + integration + e2e)  

---

## Timeline

- **Day 1-2**: API Client + Auth + Tenant contexts (Tasks 1-3)
- **Day 2-3**: Domain services (Tasks 4-7)
- **Day 3-4**: Reusable components (Tasks 8-11)
- **Day 4-5**: Pages & features (Tasks 12-18)
- **Day 5-6**: Testing (Tasks 19-20)
- **Day 6-7**: Bug fixes & refinement

**Total**: ~7 days (5 business days)

---

## Next Steps

1. ✅ Complete Phase 6: Endpoint Validation (DONE)
2. 👉 **Phase 7**: Frontend Integration (IN PROGRESS)
3. ⏭️ Phase 8: Testing & Security
4. ⏭️ Phase 9: Production Readiness

---

Generated: 2026-08-20
Last Updated: 2026-08-20
