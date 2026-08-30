const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

export function getApiBase() {
  return API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getStoredTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tenant_id');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const tenantId = getStoredTenantId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers['x-tenant-id'] = tenantId;

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `API error ${res.status}`);
  }

  return res.json();
}

export interface CherryWorkspace {
  tenantId: string;
  role: string;
  tenant: { id: string; name: string; slug: string; vertical: string };
}

export async function cherryListWorkspaces() {
  return apiFetch<CherryWorkspace[]>('/v1/cherry-count/workspaces');
}

export async function cherryBootstrap() {
  return apiFetch<{
    stats: {
      todaySales: number;
      inventoryItems: number;
      productCount: number;
      lowStock: number;
      bestSellerCount: number;
    };
    nextEvent: {
      id: string;
      name: string;
      date: string;
      venue: string;
      status: string;
    } | null;
  }>('/v1/cherry-count/bootstrap');
}

export async function cherryListProducts() {
  return apiFetch<
    Array<{
      id: string;
      name: string;
      sku: string;
      category: string | null;
      collection: string | null;
      retailPrice: number;
      cost: number | null;
      status: string;
      variants: Array<{
        id: string;
        size: string | null;
        color: string | null;
        quantity: number;
        minimumStock: number;
        bin: string | null;
      }>;
    }>
  >('/v1/cherry-count/products');
}

export async function cherryListCustomers() {
  return apiFetch<
    Array<{
      id: string;
      name: string;
      phone: string | null;
      instagram: string | null;
      preferredSize: string | null;
      favoriteColors: string[];
      vipStatus: boolean;
      lifetimeValue: number;
      notes: string | null;
    }>
  >('/v1/cherry-count/customers');
}

export async function cherryAiInsight(
  type: 'daily' | 'inventory' | 'sales' | 'packing' | 'restock' = 'daily',
) {
  return apiFetch('/v1/cherry-count/ai/insights', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export interface CherryPhoneCall {
  id: string;
  callerNumber: string;
  callerName: string | null;
  direction: string;
  status: string;
  durationSeconds: number | null;
  intent: string | null;
  outcome: string | null;
  summary: string | null;
  startedAt: string;
}

export interface CherryPhoneDashboard {
  config: {
    enabled: boolean;
    phoneNumber: string | null;
    greeting: string;
    afterHoursMessage: string | null;
    businessHours: Record<string, { open?: string; close?: string; closed?: boolean }>;
    transferNumber: string | null;
    smsEnabled: boolean;
    voicemailEnabled: boolean;
    aiPersona: string;
  };
  stats: {
    callsToday: number;
    totalCalls: number;
    avgDurationSeconds: number;
    leadsCaptured: number;
    aiActive: boolean;
  };
  recentCalls: CherryPhoneCall[];
  capabilities: string[];
  poweredBy: string;
}

export async function cherryPhoneDashboard() {
  return apiFetch<CherryPhoneDashboard>('/v1/cherry-count/phone');
}

export async function cherryUpdatePhoneConfig(input: Partial<CherryPhoneDashboard['config']>) {
  return apiFetch<{ config: CherryPhoneDashboard['config'] }>('/v1/cherry-count/phone', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function cherrySeedDemo() {
  return apiFetch('/v1/cherry-count/seed', { method: 'POST' });
}
