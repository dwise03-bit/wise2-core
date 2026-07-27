'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  totalRevenue?: number;
  lastInteraction?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [apiAvailable, setApiAvailable] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '100');

      const res = await fetch(`/api/v1/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || data || []);
        setApiAvailable(true);
      } else if (res.status === 404) {
        setApiAvailable(false);
        setCustomers([]);
      } else {
        setError(`Failed to load customers (${res.status})`);
      }
    } catch {
      setApiAvailable(false);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchCustomers();
  }, [user?.id, fetchCustomers]);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-48 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">CRM / Customers</h1>
          <p className="text-text-secondary">Customer relationship management</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <span className="font-semibold">Error: </span>{error}
        </div>
      )}

      {!apiAvailable && (
        <div className="bg-wise-surface border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Customer API Not Deployed</h3>
              <p className="text-text-muted text-sm mb-2">
                The customer REST API is built and tested but not yet running in the current Docker container. A container rebuild will activate this module.
              </p>
              <p className="text-xs text-text-muted">
                Backend status: CustomersModule with full CRUD + Prospect→Customer conversion ready. Awaiting Docker image rebuild.
              </p>
            </div>
          </div>
        </div>
      )}

      <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md px-3 py-2 bg-wise-surface border border-wise-border rounded-lg text-text-primary placeholder-text-muted focus:border-wise-electric focus:outline-none" />

      {apiAvailable && customers.length > 0 ? (
        <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wise-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wise-border">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{c.company || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        c.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-wise-electric">{c.totalRevenue ? fmt(c.totalRevenue) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : apiAvailable ? (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-5xl block mb-4 opacity-30">👥</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Customers Found</h3>
          <p className="text-text-muted">Customers will appear here once added through the CRM or billing system.</p>
        </div>
      ) : null}

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">CRM Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Prospect Pipeline', status: 'Active', href: '/dashboard/leads', ok: true },
            { label: 'Customer List', status: apiAvailable ? 'Active' : 'Awaiting Deploy', ok: apiAvailable },
            { label: 'Customer Timeline', status: 'Awaiting Deploy', ok: false },
          ].map(cap => (
            <div key={cap.label} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${cap.ok ? 'bg-green-400' : 'bg-amber-400'}`} />
              <div>
                <p className="text-sm font-medium text-text-primary">{cap.label}</p>
                <p className={`text-xs ${cap.ok ? 'text-green-400' : 'text-amber-400'}`}>{cap.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
