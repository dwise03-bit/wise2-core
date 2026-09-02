import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth.context';

interface TodayRevenue {
  amount: number;
  change: number;
  currency: string;
}

interface TodayJobs {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  jobs: Array<{ id: string; title: string; customer: string; status: string; time: Date; tech: string }>;
}

interface TechUtilization {
  active: number;
  total: number;
  utilization: number;
}

interface OpenEstimates {
  count: number;
  totalValue: number;
  estimates: Array<{ id: string; customer: string; amount: number; status: string; createdAt: Date }>;
}

interface OutstandingAR {
  totalAmount: number;
  invoiceCount: number;
  invoices: Array<{ id: string; customer: string; amount: number; dueDate: Date; daysOverdue: number }>;
}

interface MarginAlert {
  id: string;
  customer: string;
  margin: number;
  status: string;
}

interface MarginAlerts {
  count: number;
  alerts: MarginAlert[];
}

interface AIRecommendation {
  priority: number;
  title: string;
  description: string;
  action: string;
}

interface ScheduleItem {
  id: string;
  time: Date;
  customer: string;
  serviceType: string;
  address: string;
  tech: string;
  status: string;
}

interface BusinessHealth {
  revenue: { value: number; label: string };
  profitMargin: { value: number; label: string; unit: string };
  satisfaction: { value: number; label: string; max: number };
  repeatRate: { value: number; label: string; unit: string };
}

interface RecentCall {
  id: string;
  name: string;
  type: string;
  time: Date;
  status: string;
  duration: string;
}

interface PermissionLevel {
  label: string;
  enabled: boolean;
}

interface PermissionEngine {
  level0: PermissionLevel;
  level1: PermissionLevel;
  level2: PermissionLevel;
  level3: PermissionLevel;
  level4: PermissionLevel;
  level5: PermissionLevel;
}

interface CompleteDashboard {
  timestamp: Date;
  todayRevenue: TodayRevenue;
  todayJobs: TodayJobs;
  techUtilization: TechUtilization;
  openEstimates: OpenEstimates;
  outstandingAR: OutstandingAR;
  marginAlerts: MarginAlerts;
  aiRecommendations: AIRecommendation[];
  todaySchedule: ScheduleItem[];
  businessHealth: BusinessHealth;
  recentCalls: RecentCall[];
  permissionEngine: PermissionEngine;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useCommandCenter() {
  const { token } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchApi = async <T,>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE}/command-center${endpoint}`, { headers });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  };

  return {
    // Individual endpoints
    todayRevenue: useQuery<TodayRevenue>({
      queryKey: ['command-center', 'revenue', token],
      queryFn: () => fetchApi('/revenue/today'),
      enabled: !!token,
      staleTime: 60000,
      refetchInterval: 60000,
    }),

    todayJobs: useQuery<TodayJobs>({
      queryKey: ['command-center', 'jobs', token],
      queryFn: () => fetchApi('/jobs/today'),
      enabled: !!token,
      staleTime: 30000,
      refetchInterval: 30000,
    }),

    techUtilization: useQuery<TechUtilization>({
      queryKey: ['command-center', 'tech-util', token],
      queryFn: () => fetchApi('/techs/utilization'),
      enabled: !!token,
      staleTime: 60000,
      refetchInterval: 60000,
    }),

    openEstimates: useQuery<OpenEstimates>({
      queryKey: ['command-center', 'estimates', token],
      queryFn: () => fetchApi('/estimates/open'),
      enabled: !!token,
      staleTime: 120000,
      refetchInterval: 120000,
    }),

    outstandingAR: useQuery<OutstandingAR>({
      queryKey: ['command-center', 'ar', token],
      queryFn: () => fetchApi('/ar/outstanding'),
      enabled: !!token,
      staleTime: 300000,
      refetchInterval: 300000,
    }),

    marginAlerts: useQuery<MarginAlerts>({
      queryKey: ['command-center', 'margins', token],
      queryFn: () => fetchApi('/margins/alerts'),
      enabled: !!token,
      staleTime: 120000,
      refetchInterval: 120000,
    }),

    aiRecommendations: useQuery<AIRecommendation[]>({
      queryKey: ['command-center', 'ai-recs', token],
      queryFn: () => fetchApi('/ai/recommendations'),
      enabled: !!token,
      staleTime: 600000,
      refetchInterval: 600000,
    }),

    todaySchedule: useQuery<ScheduleItem[]>({
      queryKey: ['command-center', 'schedule', token],
      queryFn: () => fetchApi('/schedule/today'),
      enabled: !!token,
      staleTime: 60000,
      refetchInterval: 60000,
    }),

    businessHealth: useQuery<BusinessHealth>({
      queryKey: ['command-center', 'health', token],
      queryFn: () => fetchApi('/business/health'),
      enabled: !!token,
      staleTime: 300000,
      refetchInterval: 300000,
    }),

    recentCalls: useQuery<RecentCall[]>({
      queryKey: ['command-center', 'calls', token],
      queryFn: () => fetchApi('/calls/recent'),
      enabled: !!token,
      staleTime: 30000,
      refetchInterval: 30000,
    }),

    permissionEngine: useQuery<PermissionEngine>({
      queryKey: ['command-center', 'permissions', token],
      queryFn: () => fetchApi('/permissions/engine'),
      enabled: !!token,
      staleTime: 600000,
      refetchInterval: 600000,
    }),

    // Complete dashboard (all panels at once)
    completeDashboard: useQuery<CompleteDashboard>({
      queryKey: ['command-center', 'dashboard', token],
      queryFn: () => fetchApi('/dashboard'),
      enabled: !!token,
      staleTime: 60000,
      refetchInterval: 60000,
    }),
  };
}
