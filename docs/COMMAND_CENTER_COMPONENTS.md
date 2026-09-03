# Command Center Dashboard - Component Library Reference

Complete reference for all frontend components with usage examples.

## Components Overview

### Hooks

#### `useCommandCenter()`

**Location**: `apps/dashboard/src/hooks/useCommandCenter.ts`

Main hook for accessing all dashboard data. Provides 12 query objects with auto-refetching.

**Returns**:

```typescript
{
  todayRevenue: UseQueryResult<TodayRevenue>;
  todayJobs: UseQueryResult<TodayJobs>;
  techUtilization: UseQueryResult<TechUtilization>;
  openEstimates: UseQueryResult<OpenEstimates>;
  outstandingAR: UseQueryResult<OutstandingAR>;
  marginAlerts: UseQueryResult<MarginAlerts>;
  aiRecommendations: UseQueryResult<AIRecommendation[]>;
  todaySchedule: UseQueryResult<ScheduleItem[]>;
  businessHealth: UseQueryResult<BusinessHealth>;
  recentCalls: UseQueryResult<RecentCall[]>;
  permissionEngine: UseQueryResult<PermissionEngine>;
  completeDashboard: UseQueryResult<CompleteDashboard>;
}
```

**Usage**:

```typescript
const { todayRevenue, todayJobs } = useCommandCenter();

return (
  <>
    {todayRevenue.data && <div>{todayRevenue.data.amount}</div>}
    {todayJobs.isLoading && <div>Loading...</div>}
    {todayRevenue.error && <div>Error</div>}
  </>
);
```

---

## Card Components

### RevenueCard

**Location**: `DashboardCards.tsx`

Displays today's revenue with percentage change from yesterday.

**Props**: None (uses hook internally)

**Example**:

```typescript
<RevenueCard />
// Output:
// Today's Revenue
// $12,740
// ↑ 14% vs yesterday
```

**Variants**:
- Shows ↑ (up) for positive change in neon-green
- Shows ↓ (down) for negative change in red

---

### JobsCard

**Location**: `DashboardCards.tsx`

Shows job count breakdown by status.

**Props**: None

**Example**:

```typescript
<JobsCard />
// Output:
// Jobs Today
// 11
// 3 completed • 2 in progress
// 6 scheduled
```

---

### TechUtilizationCard

**Location**: `DashboardCards.tsx`

Displays active technicians and utilization percentage with visual progress ring.

**Props**: None

**Example**:

```typescript
<TechUtilizationCard />
// Output:
// Techs Active
// 3 [with 75% progress ring]
// 75% utilization • 4 total
```

---

### OpenEstimatesCard

**Location**: `DashboardCards.tsx`

Shows open estimates and potential revenue value.

**Props**: None

**Example**:

```typescript
<OpenEstimatesCard />
// Output:
// Open Estimates
// 5
// $24,850 potential
```

---

### OutstandingARCard

**Location**: `DashboardCards.tsx`

Displays total AR and count of overdue invoices.

**Props**: None

**Example**:

```typescript
<OutstandingARCard />
// Output:
// Outstanding AR
// $3,840
// 8 invoices overdue
```

---

### MarginAlertsCard

**Location**: `DashboardCards.tsx`

Shows count of jobs with low profit margins. Turns red if alerts exist.

**Props**: None

**Example**:

```typescript
<MarginAlertsCard />
// Output (when alerts exist):
// Margin Alerts (in red)
// 2
// Jobs at risk
```

---

## Panel Components

### AIRecommendationsPanel

**Location**: `DashboardPanels.tsx`

Shows top 3 AI-generated recommendations with action buttons.

**Props**: None

**Features**:
- Priority ranking (P1, P2, P3)
- Action buttons (FOLLOW_UP_ESTIMATES, REVIEW_MARGINS, SEND_SURVEY)
- Hover effects on recommendation cards

**Example**:

```typescript
<AIRecommendationsPanel />
// Output:
// AI RECOMMENDATIONS
// ┌─ Follow up on 5 inactive estimates    [P1]
// │  Potential revenue waiting for action
// │  [FOLLOW_UP_ESTIMATES]
// ├─ 2 jobs need margin review            [P2]
// │  2 jobs have margins below 30%
// │  [REVIEW_MARGINS]
// └─ Send satisfaction survey             [P3]
//    Collect feedback from recent customers
//    [SEND_SURVEY]
```

---

### TodaySchedulePanel

**Location**: `DashboardPanels.tsx`

Scrollable list of today's scheduled appointments.

**Props**: None

**Features**:
- Sorted by time
- Shows customer, service type, tech assigned
- Green left border for visual hierarchy
- Scrollable up to 10 items

**Example**:

```typescript
<TodaySchedulePanel />
// Output:
// TODAY'S SCHEDULE
// 08:00 AM | Johnson Residence
//           Commercial
//           Tech: Darrin
// 09:30 AM | Smith Commercial
//           Maintenance
//           Tech: Chris
// (scrollable list...)
```

---

### BusinessHealthPanel

**Location**: `DashboardPanels.tsx`

4-tile metric display showing weekly health KPIs.

**Props**: None

**Displays**:
- Week Revenue (total $)
- Profit Margin (%)
- Customer Satisfaction (out of 5)
- Repeat Rate (%)

**Example**:

```typescript
<BusinessHealthPanel />
// Output:
// BUSINESS HEALTH
// ┌──────────────┬──────────────┐
// │Week Revenue  │Profit Margin │
// │$84.5K        │42%           │
// ├──────────────┼──────────────┤
// │Satisfaction  │Repeat Rate   │
// │4.8/5         │68%           │
// └──────────────┴──────────────┘
```

---

### RecentCallsPanel

**Location**: `DashboardPanels.tsx`

Scrollable log of recent inbound calls/leads.

**Props**: None

**Features**:
- Shows name, status, duration, time
- Status badges (CONTACTING, QUOTED, etc.)
- Color-coded status indicators
- Hover highlighting

**Example**:

```typescript
<RecentCallsPanel />
// Output:
// RECENT CALLS
// ┌─ New Lead - AC Not Cooling       [CONTACTING]
// │  08:42 AM • 2:34
// ├─ Johnson Residence               [QUOTED]
// │  07:15 AM • 5:12
// └─ Estimate Follow-Up              [NEW]
//    02:30 AM • 1:45
```

---

### PermissionEnginePanel

**Location**: `DashboardPanels.tsx`

Shows AI automation permission levels (0-5) with enabled/disabled status.

**Props**: None

**Features**:
- 6 permission levels with toggle dots
- Green dot = enabled, Gray dot = disabled
- Warning about limitations
- Red border for visual distinction

**Example**:

```typescript
<PermissionEnginePanel />
// Output:
// PERMISSION ENGINE
// AI can read                      ● (green)
// AI can analyze data              ● (green)
// AI can make recommendations      ● (green)
// AI can prepare actions           ● (green)
// AI can execute actions           ○ (gray)
// AI can automate fully            ○ (gray)
//
// AI automation limited to level 3. Enable with caution.
```

---

## Container Components

### CardContainer

**Location**: `CardContainer.tsx`

Base wrapper for all card content.

**Props**:

```typescript
interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}
```

**Example**:

```typescript
<CardContainer>
  <CardTitle>My Card</CardTitle>
  <CardValue>123</CardValue>
</CardContainer>
```

**Styling**:
- Black background
- Neon green border
- Shadow on hover
- Responsive height

---

### CardTitle

**Location**: `CardContainer.tsx`

Styled title for cards.

**Props**:

```typescript
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}
```

**Example**:

```typescript
<CardTitle>Revenue Today</CardTitle>
// Output: "REVENUE TODAY" (uppercase, neon green)
```

---

### CardValue

**Location**: `CardContainer.tsx`

Large value display for main metric.

**Props**:

```typescript
interface CardValueProps {
  children: React.ReactNode;
  className?: string;
}
```

**Example**:

```typescript
<CardValue>$12,740</CardValue>
// Output: Large white text "$ 12,740"
```

---

### CardMeta

**Location**: `CardContainer.tsx`

Secondary information with optional positive/negative styling.

**Props**:

```typescript
interface CardMetaProps {
  children: React.ReactNode;
  positive?: boolean;
  className?: string;
}
```

**Example**:

```typescript
<CardMeta positive={true}>↑ 14% vs yesterday</CardMeta>
// Output: Green text with arrow
```

---

### CardLoading

**Location**: `CardContainer.tsx`

Animated skeleton loading state.

**Props**:

```typescript
interface CardLoadingProps {
  className?: string;
}
```

**Example**:

```typescript
<CardLoading />
// Output: Card with animated gray shimmer bars
```

---

### CardError

**Location**: `CardContainer.tsx`

Error state display.

**Props**:

```typescript
interface CardErrorProps {
  error?: Error;
  className?: string;
}
```

**Example**:

```typescript
<CardError error={new Error('API failed')} />
// Output: Card with red border and error message
```

---

## Utility Components

### CircularProgress

**Location**: `ui/CircularProgress.tsx`

SVG-based circular progress ring.

**Props**:

```typescript
interface CircularProgressProps {
  value: number;        // Current value
  max?: number;         // Max value (default: 100)
  size?: 'sm' | 'md' | 'lg';  // Size (default: 'md')
  color?: string;       // Color (default: '#00ff00')
}
```

**Example**:

```typescript
<CircularProgress value={75} max={100} size="lg" />
// Output: Large green ring at 75% with "75%" text in center
```

**Sizes**:
- `sm`: 100x100px
- `md`: 120x120px
- `lg`: 150x150px

---

### TrendIcon

**Location**: `TrendIcon.tsx`

Up/down arrow indicator.

**Props**:

```typescript
interface TrendIconProps {
  positive: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Example**:

```typescript
<TrendIcon positive={true} size="md" />
// Output: Up arrow (▲)

<TrendIcon positive={false} size="md" />
// Output: Down arrow (▼)
```

---

## Page Components

### CommandCenterPage

**Location**: `pages/command-center.tsx`

Complete dashboard layout combining all components.

**Props**: None (uses hooks internally)

**Features**:
- Full-page dashboard view
- Responsive grid layout
- Header with current date
- Top KPI row (6 cards)
- Main content grid (3 columns)
- Quick actions footer
- Error and loading states

**Layout**:

```
┌─ HEADER ──────────────────────────────┐
│ COMMAND CENTER
│ Thursday, September 1, 2026
├────────────────────────────────────────┤
│ [Revenue] [Jobs] [Techs] [Est] [AR] [Alerts]
├────────────────────────────────────────┤
│ [AI Recs]        │ [Schedule]    │ [Calls]
│ [Health]         │               │
│ [Permissions]    │               │
├────────────────────────────────────────┤
│ + New Lead | + New Job | + Est | + Schedule
└────────────────────────────────────────┘
```

---

## Complete Example

```typescript
'use client';

import { CommandCenterPage } from '@/pages/command-center';
import { useAuth } from '@/contexts/auth.context';
import { redirect } from 'next/navigation';

export default function Page() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <CommandCenterPage />;
}
```

## Component Composition Example

```typescript
'use client';

import { CardContainer, CardTitle, CardValue } from '@/components/CommandCenter/CardContainer';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function CustomDashboard() {
  const { completeDashboard } = useCommandCenter();

  if (completeDashboard.isLoading) return <div>Loading...</div>;
  if (completeDashboard.error) return <div>Error</div>;

  const data = completeDashboard.data;

  return (
    <div className="grid grid-cols-3 gap-4">
      <CardContainer>
        <CardTitle>Revenue</CardTitle>
        <CardValue>${data.todayRevenue.amount}</CardValue>
      </CardContainer>

      <CardContainer>
        <CardTitle>Utilization</CardTitle>
        <CircularProgress 
          value={data.techUtilization.utilization}
          max={100}
          size="lg"
        />
      </CardContainer>

      <CardContainer>
        <CardTitle>Health Score</CardTitle>
        <CardValue>{data.businessHealth.profitMargin.value}%</CardValue>
      </CardContainer>
    </div>
  );
}
```
