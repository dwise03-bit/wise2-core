'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  CONTACTED: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  QUALIFIED: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  AUDIT_SCHEDULED: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  AUDIT_COMPLETE: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  PROPOSAL_SENT: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  WON: 'bg-green-500/10 text-green-300 border-green-500/30',
  LOST: 'bg-red-500/10 text-red-300 border-red-500/30',
};

const STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'AUDIT_SCHEDULED',
  'AUDIT_COMPLETE',
  'PROPOSAL_SENT',
  'WON',
  'LOST',
];

export default function ProspectsCRMPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [editingProspectId, setEditingProspectId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    fetchProspects();
    fetchStats();
  }, [filters]);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', '100');

      const response = await fetch(`/api/v1/prospects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch prospects');

      const data = await response.json();
      setProspects(data.prospects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/prospects/stats/pipeline');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleStatusChange = async (prospectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/prospects/${prospectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setProspects((prev) =>
        prev.map((p) =>
          p.id === prospectId ? { ...p, status: newStatus } : p
        )
      );
      setEditingProspectId(null);
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (prospectId: string) => {
    if (!confirm('Are you sure you want to delete this prospect?')) return;

    try {
      const response = await fetch(`/api/v1/prospects/${prospectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prospect');

      setProspects((prev) => prev.filter((p) => p.id !== prospectId));
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-500/20 bg-gradient-to-r from-black via-black to-green-950/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Prospect CRM
              </h1>
              <p className="mt-2 text-gray-400">
                Manage sales pipeline and track prospects
              </p>
            </div>
            <button
              onClick={() => router.push('/prospects/new')}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              + New Prospect
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="border-b border-green-500/20 bg-black">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded border border-green-500/20 bg-green-950/10 p-4">
                <p className="text-sm text-gray-400">Total Prospects</p>
                <p className="mt-2 text-2xl font-bold text-green-400">
                  {stats.totalProspects}
                </p>
              </div>

              <div className="rounded border border-green-500/20 bg-green-950/10 p-4">
                <p className="text-sm text-gray-400">Pipeline Value</p>
                <p className="mt-2 text-lg font-bold text-green-400">
                  {formatCurrency(stats.totalOpportunity)}
                </p>
              </div>

              <div className="rounded border border-green-500/20 bg-green-950/10 p-4">
                <p className="text-sm text-gray-400">Closed Value</p>
                <p className="mt-2 text-lg font-bold text-green-400">
                  {formatCurrency(stats.closedOpportunity)}
                </p>
              </div>

              <div className="rounded border border-green-500/20 bg-green-950/10 p-4">
                <p className="text-sm text-gray-400">Won Value</p>
                <p className="mt-2 text-lg font-bold text-green-400">
                  {formatCurrency(stats.wonOpportunity)}
                </p>
              </div>

              <div className="rounded border border-green-500/20 bg-green-950/10 p-4">
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="mt-2 text-2xl font-bold text-green-400">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="border-b border-green-500/20 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search by company, contact, or email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white placeholder-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white focus:border-green-400 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full rounded border border-green-500/30 bg-black px-4 py-2 text-white focus:border-green-400 focus:outline-none"
              >
                <option value="createdAt">Newest First</option>
                <option value="estimatedOpportunity">Highest Value</option>
                <option value="contactName">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prospects List */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400">Loading prospects...</div>
        ) : prospects.length === 0 ? (
          <div className="rounded border border-green-500/20 bg-green-950/10 p-8 text-center">
            <p className="text-gray-400">No prospects found</p>
            <button
              onClick={() => router.push('/prospects/new')}
              className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Create Your First Prospect
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-green-500/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-500/20 bg-green-950/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-green-400">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-green-400">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-green-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-green-400">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-green-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/10">
                {prospects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className="hover:bg-green-950/5"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-white">
                          {prospect.businessName}
                        </p>
                        {prospect.industry && (
                          <p className="text-xs text-gray-500">
                            {prospect.industry}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="text-white">{prospect.contactName}</p>
                        <p className="text-xs text-gray-500">
                          {prospect.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingProspectId === prospect.id ? (
                        <select
                          value={newStatus || prospect.status}
                          onChange={(e) => setNewStatus(e.target.value)}
                          onBlur={() => {
                            if (newStatus && newStatus !== prospect.status) {
                              handleStatusChange(prospect.id, newStatus);
                            } else {
                              setEditingProspectId(null);
                              setNewStatus('');
                            }
                          }}
                          className="rounded border border-green-500/30 bg-black px-2 py-1 text-sm text-white focus:outline-none"
                          autoFocus
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingProspectId(prospect.id);
                            setNewStatus(prospect.status);
                          }}
                          className={`rounded border px-2 py-1 text-xs font-medium ${
                            STATUS_COLORS[prospect.status] ||
                            'bg-gray-500/10 text-gray-300 border-gray-500/30'
                          }`}
                        >
                          {prospect.status.replace(/_/g, ' ')}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-green-400">
                        {formatCurrency(prospect.estimatedOpportunity)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/crm/prospects/${prospect.id}`)
                          }
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(prospect.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
