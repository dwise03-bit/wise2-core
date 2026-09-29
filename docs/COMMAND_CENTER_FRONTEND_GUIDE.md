# Command Center Dashboard Frontend Integration Guide

This guide shows how to integrate the Command Center Dashboard API endpoints into your frontend application.

## Setup

### API Service

Create a `useCommandCenter` hook to fetch dashboard data:

```typescript
// hooks/useCommandCenter.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCommandCenter() {
  const token = useAuthStore((s) => s.token);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return {
    // Individual endpoints
    todayRevenue: useQuery({
      queryKey: ['command-center', 'revenue'],
      queryFn: () => api.get('/command-center/revenue/today', { headers }),
      refetchInterval: 60000, // Refresh every minute
    }),

    todayJobs: useQuery({
      queryKey: ['command-center', 'jobs'],
      queryFn: () => api.get('/command-center/jobs/today', { headers }),
      refetchInterval: 30000,
    }),

    techUtilization: useQuery({
      queryKey: ['command-center', 'tech-util'],
      queryFn: () => api.get('/command-center/techs/utilization', { headers }),
      refetchInterval: 60000,
    }),

    openEstimates: useQuery({
      queryKey: ['command-center', 'estimates'],
      queryFn: () => api.get('/command-center/estimates/open', { headers }),
      refetchInterval: 120000,
    }),

    outstandingAR: useQuery({
      queryKey: ['command-center', 'ar'],
      queryFn: () => api.get('/command-center/ar/outstanding', { headers }),
      refetchInterval: 300000, // 5 minutes
    }),

    marginAlerts: useQuery({
      queryKey: ['command-center', 'margins'],
      queryFn: () => api.get('/command-center/margins/alerts', { headers }),
      refetchInterval: 120000,
    }),

    aiRecommendations: useQuery({
      queryKey: ['command-center', 'ai-recs'],
      queryFn: () => api.get('/command-center/ai/recommendations', { headers }),
      refetchInterval: 600000, // 10 minutes
    }),

    todaySchedule: useQuery({
      queryKey: ['command-center', 'schedule'],
      queryFn: () => api.get('/command-center/schedule/today', { headers }),
      refetchInterval: 60000,
    }),

    businessHealth: useQuery({
      queryKey: ['command-center', 'health'],
      queryFn: () => api.get('/command-center/business/health', { headers }),
      refetchInterval: 300000,
    }),

    recentCalls: useQuery({
      queryKey: ['command-center', 'calls'],
      queryFn: () => api.get('/command-center/calls/recent', { headers }),
      refetchInterval: 30000,
    }),

    permissionEngine: useQuery({
      queryKey: ['command-center', 'permissions'],
      queryFn: () => api.get('/command-center/permissions/engine', { headers }),
      refetchInterval: 600000,
    }),

    // Complete dashboard (all panels at once)
    completeDashboard: useQuery({
      queryKey: ['command-center', 'dashboard'],
      queryFn: () => api.get('/command-center/dashboard', { headers }),
      refetchInterval: 60000,
    }),
  };
}
```

## Component Examples

### Revenue Card

```typescript
// components/CommandCenter/RevenueCard.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function RevenueCard() {
  const { todayRevenue } = useCommandCenter();

  if (todayRevenue.isLoading) return <div>Loading...</div>;
  if (todayRevenue.error) return <div>Error loading revenue</div>;

  const data = todayRevenue.data;
  const isPositive = data.change >= 0;

  return (
    <div className="bg-black border border-neon-green p-4 rounded">
      <h3 className="text-neon-green font-bold">TODAY'S REVENUE</h3>
      <p className="text-4xl text-white font-bold">${data.amount.toLocaleString()}</p>
      <p className={isPositive ? 'text-neon-green' : 'text-red-500'}>
        {isPositive ? '↑' : '↓'} {data.change}% vs yesterday
      </p>
    </div>
  );
}
```

### Jobs Summary Card

```typescript
// components/CommandCenter/JobsCard.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function JobsCard() {
  const { todayJobs } = useCommandCenter();

  if (todayJobs.isLoading) return <div>Loading...</div>;
  if (todayJobs.error) return <div>Error loading jobs</div>;

  const data = todayJobs.data;

  return (
    <div className="bg-black border border-neon-green p-4 rounded">
      <h3 className="text-neon-green font-bold">JOBS TODAY</h3>
      <p className="text-4xl text-white font-bold">{data.total}</p>
      <div className="text-sm text-white mt-2 space-y-1">
        <p>{data.completed} completed • {data.inProgress} in progress</p>
        <p className="text-neon-green">{data.scheduled} scheduled</p>
      </div>
    </div>
  );
}
```

### Tech Utilization Card

```typescript
// components/CommandCenter/TechCard.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';
import { CircularProgress } from '@/components/ui/CircularProgress';

export function TechCard() {
  const { techUtilization } = useCommandCenter();

  if (techUtilization.isLoading) return <div>Loading...</div>;
  if (techUtilization.error) return <div>Error loading tech data</div>;

  const data = techUtilization.data;

  return (
    <div className="bg-black border border-neon-green p-4 rounded">
      <h3 className="text-neon-green font-bold">TECHS ACTIVE</h3>
      <p className="text-4xl text-white font-bold">{data.active}</p>
      <CircularProgress value={data.utilization} max={100} />
      <p className="text-white text-sm mt-2">Utilization {data.utilization}%</p>
    </div>
  );
}
```

### Schedule List

```typescript
// components/CommandCenter/ScheduleList.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';
import { formatTime } from '@/lib/utils';

export function ScheduleList() {
  const { todaySchedule } = useCommandCenter();

  if (todaySchedule.isLoading) return <div>Loading...</div>;
  if (todaySchedule.error) return <div>Error loading schedule</div>;

  const jobs = todaySchedule.data || [];

  return (
    <div className="bg-black border border-neon-green p-4 rounded">
      <h3 className="text-neon-green font-bold">TODAY'S SCHEDULE</h3>
      <div className="space-y-3 mt-4">
        {jobs.map((job) => (
          <div key={job.id} className="border-l-2 border-neon-green pl-3 py-2">
            <div className="text-white font-semibold">{formatTime(job.time)}</div>
            <div className="text-white text-sm">{job.serviceType}</div>
            <div className="text-neon-green text-sm">{job.customer}</div>
            {job.tech && <div className="text-gray-400 text-xs">Tech: {job.tech}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### AI Recommendations

```typescript
// components/CommandCenter/AiRecommendations.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function AiRecommendations() {
  const { aiRecommendations } = useCommandCenter();

  if (aiRecommendations.isLoading) return <div>Loading...</div>;
  if (aiRecommendations.error) return <div>Error loading recommendations</div>;

  const recs = aiRecommendations.data || [];

  return (
    <div className="bg-black border border-neon-green p-4 rounded">
      <h3 className="text-neon-green font-bold">AI RECOMMENDATIONS</h3>
      <div className="space-y-3 mt-4">
        {recs.map((rec, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded">
            <div className="text-white font-semibold">{rec.title}</div>
            <div className="text-gray-400 text-sm">{rec.description}</div>
            <button
              className="mt-2 bg-neon-green text-black px-3 py-1 rounded text-sm font-bold"
              onClick={() => handleAction(rec.action)}
            >
              {rec.action.replace(/_/g, ' ')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Business Health Metrics

```typescript
// components/CommandCenter/BusinessHealth.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';
import { StatTile } from '@/components/ui/StatTile';

export function BusinessHealth() {
  const { businessHealth } = useCommandCenter();

  if (businessHealth.isLoading) return <div>Loading...</div>;
  if (businessHealth.error) return <div>Error loading metrics</div>;

  const data = businessHealth.data;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        label={data.revenue.label}
        value={`$${data.revenue.value.toLocaleString()}`}
        trend="up"
      />
      <StatTile
        label={data.profitMargin.label}
        value={`${data.profitMargin.value}${data.profitMargin.unit}`}
        trend="up"
      />
      <StatTile
        label={data.satisfaction.label}
        value={`${data.satisfaction.value}/${data.satisfaction.max}`}
        trend="stable"
      />
      <StatTile
        label={data.repeatRate.label}
        value={`${data.repeatRate.value}${data.repeatRate.unit}`}
        trend="up"
      />
    </div>
  );
}
```

### Permission Engine Status

```typescript
// components/CommandCenter/PermissionEngine.tsx
import { useCommandCenter } from '@/hooks/useCommandCenter';

export function PermissionEngine() {
  const { permissionEngine } = useCommandCenter();

  if (permissionEngine.isLoading) return <div>Loading...</div>;
  if (permissionEngine.error) return <div>Error loading permissions</div>;

  const permissions = permissionEngine.data;

  return (
    <div className="bg-black border border-red-500 p-4 rounded">
      <h3 className="text-red-500 font-bold">PERMISSION ENGINE</h3>
      <div className="space-y-2 mt-3">
        {Object.entries(permissions).map(([key, perm]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-white text-sm">{perm.label}</span>
            <div className={perm.enabled ? 'w-3 h-3 bg-neon-green rounded-full' : 'w-3 h-3 bg-gray-600 rounded-full'} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Complete Dashboard Layout

```typescript
// pages/CommandCenter.tsx
import { RevenueCard } from '@/components/CommandCenter/RevenueCard';
import { JobsCard } from '@/components/CommandCenter/JobsCard';
import { TechCard } from '@/components/CommandCenter/TechCard';
import { OpenEstimates } from '@/components/CommandCenter/OpenEstimates';
import { OutstandingAR } from '@/components/CommandCenter/OutstandingAR';
import { MarginAlerts } from '@/components/CommandCenter/MarginAlerts';
import { AiRecommendations } from '@/components/CommandCenter/AiRecommendations';
import { ScheduleList } from '@/components/CommandCenter/ScheduleList';
import { BusinessHealth } from '@/components/CommandCenter/BusinessHealth';
import { RecentCalls } from '@/components/CommandCenter/RecentCalls';
import { PermissionEngine } from '@/components/CommandCenter/PermissionEngine';

export default function CommandCenterPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-neon-green mb-8">COMMAND CENTER</h1>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <RevenueCard />
        <JobsCard />
        <TechCard />
        <OpenEstimates />
        <OutstandingAR />
        <MarginAlerts />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <AiRecommendations />
          <BusinessHealth />
          <PermissionEngine />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-1">
          <ScheduleList />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <RecentCalls />
        </div>
      </div>
    </div>
  );
}
```

## State Management

For better performance and offline support, consider using React Query's offline mode:

```typescript
// hooks/useCommandCenterSync.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCommandCenterSync() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['command-center', 'sync'],
    queryFn: async () => {
      const response = await api.get('/command-center/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Cache entire dashboard for offline use
      localStorage.setItem('cc-dashboard', JSON.stringify(response));
      return response;
    },
    staleTime: 60000,
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
  });
}
```

## Real-Time Updates (Optional)

For live updates, consider adding WebSocket support:

```typescript
// hooks/useCommandCenterLive.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useCommandCenterLive(onUpdate) {
  useEffect(() => {
    const socket = io('/command-center', {
      auth: { token: getAuthToken() },
    });

    socket.on('dashboard:update', (data) => {
      onUpdate(data);
    });

    return () => socket.disconnect();
  }, []);
}
```

## Performance Tips

1. **Refetch Intervals**: Adjust based on business needs:
   - Revenue/Jobs/Schedule: 30-60 seconds
   - AR/Estimates/Health: 2-5 minutes
   - Recommendations/Permissions: 5-10 minutes

2. **Pagination**: For large datasets (jobs, schedule), implement pagination:
   ```typescript
   const [page, setPage] = useState(1);
   const jobs = useQuery({
     queryKey: ['jobs', page],
     queryFn: () => api.get(`/command-center/jobs/today?page=${page}`),
   });
   ```

3. **Filtering**: Add real-time filters:
   ```typescript
   const [filter, setFilter] = useState('all');
   const jobs = useQuery({
     queryKey: ['jobs', filter],
     queryFn: () => api.get(`/command-center/jobs/today?status=${filter}`),
   });
   ```

4. **Caching**: Leverage React Query's built-in cache strategies

5. **Error Boundaries**: Wrap dashboard components in error boundaries for resilience
