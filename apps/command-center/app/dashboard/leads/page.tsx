'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

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
    NEW: 'bg-wise-electric/20 text-wise-electric',
    CONTACTED: 'bg-wise-electric/10 text-wise-electric/80',
    QUALIFIED: 'bg-wise-electric/30 text-wise-electric',
    AUDIT_SCHEDULED: 'bg-amber-500/20 text-amber-400',
    AUDIT_COMPLETE: 'bg-amber-500/10 text-amber-300',
    PROPOSAL_SENT: 'bg-wise-electric/20 text-wise-electric',
    WON: 'bg-green-500/20 text-green-400',
    LOST: 'bg-red-500/20 text-red-400',
  };
  return map[status] || 'bg-gray-500/20 text-gray-400';
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
      const res = await fetch(`/api/v1/prospects?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
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
      const res = await fetch('/api/v1/prospects/stats/pipeline', { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setStats(await res.json());
    } catch { /* stats are optional */ }
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
      const res = await fetch('/api/v1/prospects', {
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
      const res = await fetch(`/api/v1/prospects/${id}/status`, {
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
      const res = await fetch(`/api/v1/prospects/${id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) {
        setProspects(prev => prev.filter(p => p.id !== id));
        fetchStats();
      }
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-48 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64 mb-8" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-wise-surface rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Prospects</h1>
          <p className="text-text-secondary">Sales pipeline and lead management</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors flex items-center gap-2">
          <span>+</span> New Prospect
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <span className="font-semibold">Error: </span>{error}
        </div>
      )}

      {stats && stats.totalProspects > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Prospects', value: stats.totalProspects },
            { label: 'Pipeline Value', value: fmt(stats.totalOpportunity) },
            { label: 'Closed Value', value: fmt(stats.closedOpportunity) },
            { label: 'Won Value', value: fmt(stats.wonOpportunity) },
            { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%` },
          ].map(s => (
            <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
              <p className="text-xs text-text-muted mb-1">{s.label}</p>
              <p className="text-xl font-bold text-wise-electric">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="bg-wise-surface border border-wise-electric/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">New Prospect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Business Name *</label>
              <input type="text" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none" autoFocus />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Contact Name *</label>
              <input type="text" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Estimated Value</label>
              <input type="number" value={form.estimatedOpportunity} onChange={e => setForm({ ...form, estimatedOpportunity: e.target.value })}
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none" placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-muted mb-1">Primary Problem</label>
              <input type="text" value={form.primaryProblem} onChange={e => setForm({ ...form, primaryProblem: e.target.value })}
                className="w-full px-3 py-2 bg-wise-black border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={creating || !form.businessName.trim() || !form.contactName.trim() || !form.email.trim()}
              className="px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Prospect'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-wise-border text-text-secondary rounded-lg hover:text-text-primary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Search prospects..." value={search} onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-wise-surface border border-wise-border rounded-lg text-text-primary placeholder-text-muted focus:border-wise-electric focus:outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-wise-surface border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 bg-wise-surface border border-wise-border rounded-lg text-text-primary focus:border-wise-electric focus:outline-none">
          <option value="createdAt">Newest First</option>
          <option value="estimatedOpportunity">Highest Value</option>
          <option value="contactName">Name (A-Z)</option>
        </select>
      </div>

      {prospects.length > 0 ? (
        <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wise-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wise-border">
                {prospects.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{p.businessName}</p>
                      {p.industry && <p className="text-xs text-text-muted">{p.industry}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary text-sm">{p.contactName}</p>
                      <p className="text-xs text-text-muted">{p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <select defaultValue={p.status} onChange={e => handleStatusChange(p.id, e.target.value)}
                          onBlur={() => setEditingId(null)} autoFocus
                          className="px-2 py-1 bg-wise-black border border-wise-border rounded text-sm text-text-primary">
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingId(p.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(p.status)}`}>
                          {p.status.replace(/_/g, ' ')}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-wise-electric">{fmt(p.estimatedOpportunity)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(p.id)}
                        className="text-sm text-red-400/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
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
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-5xl block mb-4 opacity-30">📋</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Prospects Yet</h3>
          <p className="text-text-muted mb-6">Start building your sales pipeline.</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors">
            + Add First Prospect
          </button>
        </div>
      ) : null}
    </div>
  );
}
