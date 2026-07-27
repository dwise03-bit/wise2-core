'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface WorkflowTemplate {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  trigger?: { type: string; config?: Record<string, unknown> };
  steps: Array<{ name: string; type: string }>;
  retryPolicy?: { maxRetries: number; retryDelay: number };
  createdAt: string;
  updatedAt: string;
}

interface WorkflowExecution {
  _id: string;
  templateId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface WorkflowStats {
  totalTemplates: number;
  activeTemplates: number;
  totalExecutions: number;
  successRate: number;
}

export default function WorkflowsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';
  const hdrs = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const [tRes, eRes, sRes] = await Promise.allSettled([
        fetch(`${API_URL}/v1/brain-auth/workflows/templates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/v1/brain-auth/workflows/executions?limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/v1/brain-auth/workflows/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (tRes.status === 'fulfilled' && tRes.value.ok) { setTemplates((await tRes.value.json()).templates || []); setApiAvailable(true); }
      if (eRes.status === 'fulfilled' && eRes.value.ok) { setExecutions((await eRes.value.json()).executions || []); }
      if (sRes.status === 'fulfilled' && sRes.value.ok) { setStats(await sRes.value.json()); }
    } catch { setApiAvailable(false); }
    setLoading(false);
  }, []);

  useEffect(() => { if (!user?.id) { setLoading(false); return; } fetchData(); }, [user?.id, fetchData]);

  const handleExecute = async (templateId: string) => {
    setExecuting(templateId); setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/brain-auth/workflows/templates/${templateId}/execute`, { method: 'POST', headers: hdrs(), body: '{}' });
      if (res.ok) { fetchData(); } else { const d = await res.json().catch(() => ({})); setError(d.message || `Failed (${res.status})`); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setExecuting(null); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`${API_URL}/v1/brain-auth/workflows/templates/${id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ isActive: !isActive }) });
      if (res.ok) setTemplates(prev => prev.map(t => t._id === id ? { ...t, isActive: !isActive } : t));
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-32" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="wise-skeleton h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">Workflows</h1>
        <p className="wise-page-subtitle">Automation templates, triggers, and execution history</p>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {!apiAvailable && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Not Connected</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Workflow Engine Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">Requires the Brain Auth service (MongoDB-backed). Templates and executions are stored in MongoDB.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Templates', value: stats?.totalTemplates ?? '--' },
            { label: 'Active', value: stats?.activeTemplates ?? '--' },
            { label: 'Executions', value: stats?.totalExecutions ?? '--' },
            { label: 'Success Rate', value: stats ? `${stats.successRate.toFixed(0)}%` : '--' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div>
          <h2 className="wise-section-title mb-3">Workflow Templates</h2>
          <div className="wise-card overflow-hidden divide-y divide-border-subtle">
            {templates.map(t => (
              <div key={t._id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-text-primary">{t.name}</h3>
                      <span className={t.isActive ? 'wise-badge-success' : 'wise-badge-neutral'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {t.category && <span className="wise-badge-info">{t.category}</span>}
                    </div>
                    {t.description && <p className="text-xs text-text-muted">{t.description}</p>}
                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-text-muted">
                      <span>{t.steps.length} step{t.steps.length !== 1 ? 's' : ''}</span>
                      {t.trigger && <span>Trigger: {t.trigger.type}</span>}
                      {t.retryPolicy && <span>Retries: {t.retryPolicy.maxRetries}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(t._id, t.isActive)} className="wise-btn-secondary text-xs py-1 px-2.5">
                      {t.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => handleExecute(t._id)} disabled={executing === t._id}
                      className="wise-btn-primary text-xs py-1 px-2.5 disabled:opacity-50">
                      {executing === t._id ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Executions */}
      {executions.length > 0 && (
        <div>
          <h2 className="wise-section-title mb-3">Recent Executions</h2>
          <div className="wise-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="wise-table">
                <thead>
                  <tr>
                    <th>Execution</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(e => (
                    <tr key={e._id}>
                      <td className="font-mono text-text-primary">{e._id.slice(-8)}</td>
                      <td>
                        <span className={
                          e.status === 'completed' ? 'wise-badge-success'
                            : e.status === 'failed' ? 'wise-badge-danger'
                              : e.status === 'running' ? 'wise-badge-info'
                                : 'wise-badge-neutral'
                        }>{e.status.toUpperCase()}</span>
                      </td>
                      <td className="text-text-muted">{new Date(e.startedAt).toLocaleString()}</td>
                      <td className="text-text-muted tabular-nums">
                        {e.completedAt ? `${((new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime()) / 1000).toFixed(1)}s` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {apiAvailable && templates.length === 0 && (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#9889;</div>
          <h3 className="wise-empty-title">No Workflow Templates</h3>
          <p className="wise-empty-desc">Create workflow templates to automate tasks across your business.</p>
        </div>
      )}

      {/* Capabilities + Examples when offline */}
      {!apiAvailable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="wise-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Automation Capabilities</h2>
            <div className="space-y-2">
              {['Template Engine', 'Async Execution', 'Retry Policies', 'Scheduled Triggers'].map(cap => (
                <div key={cap} className="flex items-center justify-between py-1">
                  <span className="text-xs text-text-secondary">{cap}</span>
                  <span className="text-xs text-amber-400">Requires Brain API</span>
                </div>
              ))}
            </div>
          </div>

          <div className="wise-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Example Workflows</h2>
            <div className="space-y-2">
              {[
                { name: 'Prospect Follow-Up', desc: 'Auto-email new leads after 24h' },
                { name: 'Invoice Generator', desc: 'Create invoices on subscription renewal' },
                { name: 'Content Pipeline', desc: 'Route gallery uploads through review' },
                { name: 'System Health Check', desc: 'Monitor API and database status' },
              ].map(w => (
                <div key={w.name} className="p-2.5 rounded-lg bg-wise-black/30">
                  <p className="text-xs font-medium text-text-secondary">{w.name}</p>
                  <p className="text-[10px] text-text-muted">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
