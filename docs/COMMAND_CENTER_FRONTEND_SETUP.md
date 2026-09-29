# Command Center Dashboard - Frontend Setup & Components

## Installation

### 1. Install Dependencies

```bash
npm install @tanstack/react-query axios
```

### 2. Environment Configuration

Add to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

### 3. Files Created

```
apps/dashboard/src/
├── hooks/
│   └── useCommandCenter.ts           (500+ lines - React Query hooks)
├── components/
│   ├── CommandCenter/
│   │   ├── CardContainer.tsx         (Reusable card components)
│   │   ├── DashboardCards.tsx        (6 KPI cards)
│   │   ├── DashboardPanels.tsx       (5 main panels)
│   │   └── TrendIcon.tsx             (Trend indicator)
│   └── ui/
│       └── CircularProgress.tsx      (Progress ring visualization)
├── pages/
│   └── command-center.tsx            (Main dashboard page)
└── lib/
    └── date-utils.ts                 (Formatting utilities)
```

## Component Architecture

### Hooks

#### `useCommandCenter()`

Provides access to all dashboard data with automatic refetching:

```typescript
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function MyComponent() {
  const { 
    todayRevenue,        // Revenue data
    todayJobs,           // Jobs data
    techUtilization,     // Tech metrics
    openEstimates,       // Estimates
    outstandingAR,       // AR metrics
    marginAlerts,        // Margin warnings
    aiRecommendations,   // AI insights
    todaySchedule,       // Schedule items
    businessHealth,      // Health metrics
    recentCalls,         // Call log
    permissionEngine,    // Permissions
    completeDashboard,   // All together
  } = useCommandCenter();

  return (
    <>
      {todayRevenue.isLoading && <div>Loading...</div>}
      {todayRevenue.error && <div>Error: {todayRevenue.error.message}</div>}
      {todayRevenue.data && <div>{todayRevenue.data.amount}</div>}
    </>
  );
}
```

### Card Components

**KPI Cards** (in `DashboardCards.tsx`):
- `<RevenueCard />` - Today's revenue with change
- `<JobsCard />` - Job count and status
- `<TechUtilizationCard />` - Tech utilization %
- `<OpenEstimatesCard />` - Sales pipeline
- `<OutstandingARCard />` - Accounts receivable
- `<MarginAlertsCard />` - Margin warnings

**Panel Components** (in `DashboardPanels.tsx`):
- `<AIRecommendationsPanel />` - Top 3 AI recommendations
- `<TodaySchedulePanel />` - Schedule list with times
- `<BusinessHealthPanel />` - KPI tiles
- `<RecentCallsPanel />` - Call activity log
- `<PermissionEnginePanel />` - AI control levels

### Container Components

**`CardContainer`** - Wrapper for all cards with styling

```typescript
<CardContainer>
  <CardTitle>Title</CardTitle>
  <CardValue>Value</CardValue>
  <CardMeta positive={true}>Meta info</CardMeta>
</CardContainer>
```

**`CircularProgress`** - Ring progress visualization

```typescript
<CircularProgress 
  value={75}        // Current value
  max={100}         // Max value
  size="lg"         // sm | md | lg
  color="#00ff00"   // Custom color
/>
```

## Usage Examples

### Basic Integration

```typescript
'use client';

import { RevenueCard } from '@/components/CommandCenter/DashboardCards';

export function Dashboard() {
  return (
    <div className="grid grid-cols-6 gap-4">
      <RevenueCard />
    </div>
  );
}
```

### Custom Data Handling

```typescript
'use client';

import { useCommandCenter } from '@/hooks/useCommandCenter';
import { CardContainer, CardTitle, CardValue } from '@/components/CommandCenter/CardContainer';

export function CustomRevenue() {
  const { todayRevenue } = useCommandCenter();

  if (todayRevenue.isLoading) return <div>Loading...</div>;
  if (todayRevenue.error) return <div>Error: {todayRevenue.error.message}</div>;

  const data = todayRevenue.data;

  return (
    <CardContainer>
      <CardTitle>Today's Revenue</CardTitle>
      <CardValue>${data.amount.toLocaleString()}</CardValue>
      <p className="text-gray-400 text-sm mt-2">
        {data.change > 0 ? '↑' : '↓'} {Math.abs(data.change)}% vs yesterday
      </p>
    </CardContainer>
  );
}
```

### Complete Dashboard

```typescript
'use client';

import CommandCenterPage from '@/pages/command-center';

export default function Page() {
  return <CommandCenterPage />;
}
```

## Styling

All components use WISE² Design System:

- **Colors**: `bg-black`, `text-neon-green`, `text-white`, `border-gray-700`
- **Borders**: `border border-neon-green` for primary, `border-gray-700` for secondary
- **Spacing**: Tailwind grid system (gap-4, p-4, etc.)
- **Responsive**: Mobile-first with `lg:` breakpoints

### Customizing Styles

Edit `CardContainer.tsx` to modify default card styling:

```typescript
<div className={cn(
  'bg-black border border-neon-green rounded-lg p-4 h-full',
  'shadow-lg shadow-neon-green/20',
  'hover:shadow-neon-green/40 transition-shadow',
  className
)}>
```

## Refresh Intervals

Data auto-refetches based on importance:

| Data | Interval | Reason |
|------|----------|--------|
| Revenue | 60s | Real-time KPI |
| Jobs | 30s | Dispatch-critical |
| Schedule | 60s | Planning |
| Estimates | 2m | Sales slower |
| AR | 5m | Less frequent |
| Health | 5m | Aggregates |

To change intervals, edit `useCommandCenter.ts`:

```typescript
todayRevenue: useQuery({
  queryKey: ['command-center', 'revenue', token],
  queryFn: () => fetchApi('/revenue/today'),
  refetchInterval: 30000, // 30 seconds
}),
```

## State Management

### Using React Query

Data is cached automatically and refetched on interval:

```typescript
const { data, isLoading, error, refetch } = useCommandCenter().todayRevenue;

// Manual refetch
<button onClick={() => refetch()}>Refresh</button>
```

### Offline Support (Optional)

Add localStorage fallback:

```typescript
const { data = localStorage.getItem('cc-revenue') } = useCommandCenter().todayRevenue;
```

## Error Handling

All components handle errors gracefully:

```typescript
{error && <CardError error={error} />}
{isLoading && <CardLoading />}
{data && <CardContent data={data} />}
```

### Custom Error Handling

```typescript
const { todayRevenue } = useCommandCenter();

if (todayRevenue.error?.message?.includes('401')) {
  // Handle auth error
  return <div>Please log in again</div>;
}

if (todayRevenue.error) {
  // Handle other errors
  return <CardError error={todayRevenue.error} />;
}
```

## Performance Optimization

### Lazy Loading

Split components into separate code chunks:

```typescript
const RevenueCard = dynamic(() => import('./RevenueCard'), {
  loading: () => <CardLoading />,
});
```

### Memoization

Prevent unnecessary re-renders:

```typescript
export const RevenueCard = memo(function RevenueCard() {
  // Component code
});
```

### Selective Queries

Use only needed endpoints:

```typescript
// Instead of:
const { completeDashboard } = useCommandCenter();

// Use specific queries:
const { todayRevenue, todayJobs } = useCommandCenter();
```

## Testing

### Unit Tests

```typescript
// __tests__/DashboardCards.test.tsx
import { render, screen } from '@testing-library/react';
import { RevenueCard } from '@/components/CommandCenter/DashboardCards';

jest.mock('@/hooks/useCommandCenter', () => ({
  useCommandCenter: () => ({
    todayRevenue: {
      isLoading: false,
      data: { amount: 12740, change: 14, currency: 'USD' },
    },
  }),
}));

describe('RevenueCard', () => {
  it('displays revenue correctly', () => {
    render(<RevenueCard />);
    expect(screen.getByText(/12740/)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/command-center.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommandCenterPage from '@/pages/command-center';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('Command Center Dashboard', () => {
  it('loads and displays all panels', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CommandCenterPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/COMMAND CENTER/)).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Issue: "useCommandCenter is not defined"

**Solution**: Make sure to import the hook:

```typescript
import { useCommandCenter } from '@/hooks/useCommandCenter';
```

### Issue: "Cannot find module '@/lib/utils'"

**Solution**: Create the utility file if missing:

```typescript
// lib/utils.ts
export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}
```

### Issue: Data not loading

**Solution**: Check:
1. API server is running
2. JWT token is valid
3. Browser console for CORS errors
4. Network tab in DevTools

### Issue: Slow performance

**Solution**:
1. Use lazy loading for components
2. Reduce refetch intervals
3. Implement pagination for long lists
4. Use React Query DevTools to debug

## Next Steps

1. **Customize styling** to match your brand
2. **Add error boundaries** for resilience
3. **Implement quick actions** (buttons in footer)
4. **Add filters** for jobs, estimates, etc.
5. **Create detail pages** linked from dashboard
6. **Add real-time WebSocket** updates (optional)

## Support

For questions about:
- **API endpoints**: See [COMMAND_CENTER_API.md](./COMMAND_CENTER_API.md)
- **Backend integration**: See [COMMAND_CENTER_ARCHITECTURE.md](./COMMAND_CENTER_ARCHITECTURE.md)
- **Component props**: Check component JSDoc comments
- **Styling**: Refer to WISE² Design System documentation
