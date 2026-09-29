'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface Prospect {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  primaryProblem: string;
  leadSource: string;
  estimatedOpportunity: number;
  status: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

interface PipelineStats {
  byStatus: Record<string, number>;
  totalProspects: number;
  totalOpportunity: number;
  closedOpportunity: number;
  wonOpportunity: number;
  conversionRate: number;
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'AUDIT_SCHEDULED', 'AUDIT_COMPLETE', 'PROPOSAL_SENT', 'WON', 'LOST'];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    NEW: 'wise-badge-info',
    CONTACTED: 'wise-badge-info',
    QUALIFIED: 'wise-badge-info',
    AUDIT_SCHEDULED: 'wise-badge-warning',
    AUDIT_COMPLETE: 'wise-badge-warning',
    PROPOSAL_SENT: 'wise-badge-info',
    WON: 'wise-badge-success',
    LOST: 'wise-badge-danger',
  };
  return map[status] || 'wise-badge-neutral';
};

export default function ProspectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', primaryProblem: '', leadSource: 'WEBSITE', estimatedOpportunity: '',
  });

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';
  const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });
  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');
      params.append('limit', '100');
      const res = await fetch(`${API_URL}/v1/prospects?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setProspects(data.prospects || []);
      } else {
        setProspects([]);
        if (res.status !== 404) setError(`Failed to load prospects (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/v1/prospects/stats/pipeline`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setStats(await res.json());
    } catch { /* optional */ }
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchProspects();
    fetchStats();
  }, [user?.id, fetchProspects, fetchStats]);

  const handleCreate = async () => {
    if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/prospects`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ ...form, estimatedOpportunity: Number(form.estimatedOpportunity) || 0, status: 'NEW', tags: [] }),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ businessName: '', contactName: '', email: '', primaryProblem: '', leadSource: 'WEBSITE', estimatedOpportunity: '' });
        fetchProspects();
        fetchStats();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.message || `Create failed (${res.status})`);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Create failed'); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/v1/prospects/${id}/status`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProspects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        setEditingId(null);
        fetchStats();
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/v1/prospects/${id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) {
        setProspects(prev => prev.filter(p => p.id !== id));
        fetchStats();
      }
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="wise-skeleton h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="wise-page-title">Prospects</h1>
          <p className="wise-page-subtitle">Sales pipeline and lead management</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="wise-btn-primary">
          + New Prospect
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* Pipeline Stats */}
      {stats && stats.totalProspects > 0 && (
        <div className="wise-card p-1">
          <div className="grid grid-cols-2 md:grid-cols-5">
            {[
              { label: 'Total', value: stats.totalProspects },
              { label: 'Pipeline', value: fmt(stats.totalOpportunity) },
              { label: 'Closed', value: fmt(stats.closedOpportunity) },
              { label: 'Won', value: fmt(stats.wonOpportunity) },
              { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%` },
            ].map(s => (
              <div key={s.label} className="px-4 py-3">
                <div className="text-xl font-bold text-text-primary tabular-nums">{s.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="wise-card p-5 border-wise-electric/30">
          <h3 className="text-sm font-semibold text-text-primary mb-4">New Prospect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Business Name *</label>
              <input type="text" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })}
                className="wise-input" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Contact Name *</label>
              <input type="text" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                className="wise-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="wise-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Estimated Value</label>
              <input type="number" value={form.estimatedOpportunity} onChange={e => setForm({ ...form, estimatedOpportunity: e.target.value })}
                className="wise-input" placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-muted mb-1">Primary Problem</label>
              <input type="text" value={form.primaryProblem} onChange={e => setForm({ ...form, primaryProblem: e.target.value })}
                className="wise-input" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={creating || !form.businessName.trim() || !form.contactName.trim() || !form.email.trim()}
              className="wise-btn-primary disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowCreate(false)} className="wise-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="wise-input max-w-xs" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="wise-input w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="wise-input w-auto">
          <option value="createdAt">Newest</option>
          <option value="estimatedOpportunity">Highest Value</option>
          <option value="contactName">Name A-Z</option>
        </select>
      </div>

      {/* Table */}
      {prospects.length > 0 ? (
        <div className="wise-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="wise-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {prospects.map(p => (
                  <tr key={p.id} className="group">
                    <td>
                      <p className="font-medium text-text-primary">{p.businessName}</p>
                      {p.industry && <p className="text-xs text-text-muted mt-0.5">{p.industry}</p>}
                    </td>
                    <td>
                      <p className="text-text-primary text-sm">{p.contactName}</p>
                      <p className="text-xs text-text-muted">{p.email}</p>
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <select defaultValue={p.status} onChange={e => handleStatusChange(p.id, e.target.value)}
                          onBlur={() => setEditingId(null)} autoFocus
                          className="wise-input py-1 px-2 text-xs w-auto">
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingId(p.id)} className={statusBadge(p.status)}>
                          {p.status.replace(/_/g, ' ')}
                        </button>
                      )}
                    </td>
                    <td>
                      <span className="text-sm font-medium text-wise-electric tabular-nums">{fmt(p.estimatedOpportunity)}</span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !showCreate ? (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#128203;</div>
          <h3 className="wise-empty-title">No Prospects Yet</h3>
          <p className="wise-empty-desc">Start building your sales pipeline by adding your first prospect.</p>
          <button onClick={() => setShowCreate(true)} className="wise-btn-primary">+ Add First Prospect</button>
        </div>
      ) : null}
    </div>
  );
}
