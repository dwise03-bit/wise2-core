'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge, Input, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../../src/components/ui';

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
        <div className="h-6 w-48 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-64 animate-pulse bg-border-medium rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
          <Link href="/dashboard/business-os" className="hover:text-wise-electric">Business</Link>
          <span className="opacity-30">/</span>
          <span>CRM / Customers</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">👥 CRM / Customers</h1>
        <p className="text-sm text-text-muted mt-1">Customer relationship management</p>
      </div>

      {error && (
        <Card className="p-4 border-danger/20 bg-danger/5">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {!apiAvailable && (
        <Card className="p-4 border-warning/20 space-y-2">
          <div className="flex items-start gap-3">
            <Badge variant="warning">Awaiting Deploy</Badge>
            <div>
              <p className="text-sm font-medium text-text-primary">Customer API Not Active</p>
              <p className="text-xs text-text-muted mt-0.5">
                The Customer REST API is built and tested. A container rebuild will activate this module.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {apiAvailable && customers.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Revenue</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-text-primary">{c.name}</TableCell>
                    <TableCell className="text-text-muted">{c.email}</TableCell>
                    <TableCell>{c.company || <span className="text-text-muted">--</span>}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-wise-electric tabular-nums">
                      {c.totalRevenue ? fmt(c.totalRevenue) : '--'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : apiAvailable ? (
        <Card className="p-16 text-center space-y-3">
          <div className="text-4xl opacity-20">👥</div>
          <h3 className="text-base font-semibold text-text-secondary">No Customers Found</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Customers appear here once converted from prospects or added through billing.
          </p>
        </Card>
      ) : null}

      {/* CRM Status */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">CRM Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Prospect Pipeline', status: 'Active', ok: true },
            { label: 'Customer List', status: apiAvailable ? 'Active' : 'Awaiting Deploy', ok: apiAvailable },
            { label: 'Customer Timeline', status: 'Awaiting Deploy', ok: false },
          ].map(cap => (
            <div key={cap.label} className="flex items-center gap-3 p-3 rounded-lg bg-wise-black/30 border border-border-subtle">
              <span className={`w-2 h-2 rounded-full ${cap.ok ? 'bg-success' : 'bg-warning'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-secondary">{cap.label}</p>
                <p className={`text-xs ${cap.ok ? 'text-success' : 'text-warning'}`}>{cap.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
