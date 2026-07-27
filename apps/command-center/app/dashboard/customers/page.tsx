'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

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

      const res = await fetch(`${API_URL}/v1/customers?${params}`, {
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
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-48" />
        <div className="wise-skeleton h-3 w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="wise-breadcrumb mb-2">
            <Link href="/dashboard/business-os">Business</Link>
            <span className="opacity-30">/</span>
            <span className="text-text-secondary">CRM / Customers</span>
          </div>
          <h1 className="wise-page-title">CRM / Customers</h1>
          <p className="wise-page-subtitle">Customer relationship management</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {!apiAvailable && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Awaiting Deploy</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Customer API Not Active</p>
              <p className="text-xs text-text-muted mt-0.5">
                The Customer REST API is built and tested. A container rebuild will activate this module.
              </p>
            </div>
          </div>
        </div>
      )}

      <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
        className="wise-input max-w-sm" />

      {apiAvailable && customers.length > 0 ? (
        <div className="wise-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="wise-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium text-text-primary">{c.name}</td>
                    <td className="text-text-muted">{c.email}</td>
                    <td>{c.company || <span className="text-text-muted">--</span>}</td>
                    <td>
                      <span className={c.status === 'ACTIVE' ? 'wise-badge-success' : 'wise-badge-neutral'}>
                        {c.status}
                      </span>
                    </td>
                    <td className="font-medium text-wise-electric tabular-nums">{c.totalRevenue ? fmt(c.totalRevenue) : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : apiAvailable ? (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#128101;</div>
          <h3 className="wise-empty-title">No Customers Found</h3>
          <p className="wise-empty-desc">Customers appear here once converted from prospects or added through billing.</p>
        </div>
      ) : null}

      {/* CRM Status */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">CRM Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Prospect Pipeline', status: 'Active', ok: true, href: '/dashboard/leads' },
            { label: 'Customer List', status: apiAvailable ? 'Active' : 'Awaiting Deploy', ok: apiAvailable },
            { label: 'Customer Timeline', status: 'Awaiting Deploy', ok: false },
          ].map(cap => (
            <div key={cap.label} className="flex items-center gap-3 p-3 rounded-lg bg-wise-black/30">
              <span className={`wise-status-dot ${cap.ok ? 'bg-green-400' : 'bg-amber-400'}`} />
              <div>
                <p className="text-sm font-medium text-text-secondary">{cap.label}</p>
                <p className={`text-xs ${cap.ok ? 'text-green-400' : 'text-amber-400'}`}>{cap.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
