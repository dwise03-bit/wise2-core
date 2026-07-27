'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

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
  const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();

    try {
      const [templatesRes, executionsRes, statsRes] = await Promise.allSettled([
        fetch('/api/v1/brain-auth/workflows/templates', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/brain-auth/workflows/executions?limit=10', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/brain-auth/workflows/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (templatesRes.status === 'fulfilled' && templatesRes.value.ok) {
        const data = await templatesRes.value.json();
        setTemplates(data.templates || data || []);
        setApiAvailable(true);
      }

      if (executionsRes.status === 'fulfilled' && executionsRes.value.ok) {
        const data = await executionsRes.value.json();
        setExecutions(data.executions || data || []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
    } catch {
      setApiAvailable(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchData();
  }, [user?.id, fetchData]);

  const handleExecute = async (templateId: string) => {
    setExecuting(templateId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/brain-auth/workflows/templates/${templateId}/execute`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({}),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || `Execution failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(null);
    }
  };

  const handleToggle = async (templateId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/brain-auth/workflows/templates/${templateId}`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setTemplates(prev => prev.map(t => t._id === templateId ? { ...t, isActive: !isActive } : t));
      }
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Workflows</h1>
        <p className="text-text-secondary">Automation templates, triggers, and execution history</p>
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
              <h3 className="text-lg font-semibold text-text-primary mb-1">Workflow Engine Not Connected</h3>
              <p className="text-text-muted text-sm mb-2">
                The workflow engine requires the Brain Auth service (MongoDB-backed) to be running. Templates and executions are stored in MongoDB.
              </p>
              <p className="text-xs text-text-muted">
                Backend: Fully functional workflow service with templates, async execution, and retry policies.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Templates', value: stats.totalTemplates, icon: '📋' },
            { label: 'Active', value: stats.activeTemplates, icon: '✅' },
            { label: 'Executions', value: stats.totalExecutions, icon: '⚡' },
            { label: 'Success Rate', value: `${stats.successRate.toFixed(0)}%`, icon: '📊' },
          ].map(s => (
            <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{s.icon}</span>
                <p className="text-xs text-text-muted">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-wise-electric">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {templates.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">Workflow Templates</h2>
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t._id} className="bg-wise-surface border border-wise-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-text-primary">{t.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {t.category && (
                        <span className="text-xs px-2 py-0.5 bg-wise-electric/10 text-wise-electric rounded">{t.category}</span>
                      )}
                    </div>
                    {t.description && <p className="text-sm text-text-muted">{t.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span>{t.steps.length} step{t.steps.length !== 1 ? 's' : ''}</span>
                      {t.trigger && <span>Trigger: {t.trigger.type}</span>}
                      {t.retryPolicy && <span>Retries: {t.retryPolicy.maxRetries}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(t._id, t.isActive)}
                      className="px-3 py-1.5 text-xs border border-wise-border text-text-secondary rounded hover:text-text-primary transition-colors">
                      {t.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => handleExecute(t._id)} disabled={executing === t._id}
                      className="px-3 py-1.5 text-xs bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded transition-colors disabled:opacity-50">
                      {executing === t._id ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {executions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">Recent Executions</h2>
          <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wise-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Execution</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Started</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wise-border">
                  {executions.map(e => (
                    <tr key={e._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-text-primary">{e._id.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          e.status === 'completed' ? 'bg-green-500/20 text-green-400'
                            : e.status === 'failed' ? 'bg-red-500/20 text-red-400'
                              : e.status === 'running' ? 'bg-wise-electric/20 text-wise-electric'
                                : 'bg-gray-500/20 text-gray-400'
                        }`}>{e.status.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {new Date(e.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {e.completedAt
                          ? `${((new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime()) / 1000).toFixed(1)}s`
                          : '—'}
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
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-5xl block mb-4 opacity-30">⚡</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Workflow Templates</h3>
          <p className="text-text-muted">Create workflow templates to automate tasks across your business.</p>
        </div>
      )}

      {!apiAvailable && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Templates', value: '—', icon: '📋' },
              { label: 'Active', value: '—', icon: '✅' },
              { label: 'Executions', value: '—', icon: '⚡' },
              { label: 'Success Rate', value: '—', icon: '📊' },
            ].map(s => (
              <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{s.icon}</span>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-wise-electric">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Automation Capabilities</h3>
              <div className="space-y-3">
                {[
                  { name: 'Template Engine', status: 'Requires Brain API', color: 'amber' },
                  { name: 'Async Execution', status: 'Requires Brain API', color: 'amber' },
                  { name: 'Retry Policies', status: 'Requires Brain API', color: 'amber' },
                  { name: 'Scheduled Triggers', status: 'Requires Brain API', color: 'amber' },
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{c.name}</span>
                    <span className="text-xs text-amber-400">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Example Workflows</h3>
              <div className="space-y-3">
                {[
                  { name: 'Prospect Follow-Up', desc: 'Auto-email new leads after 24h' },
                  { name: 'Invoice Generator', desc: 'Create invoices on subscription renewal' },
                  { name: 'Content Pipeline', desc: 'Route gallery uploads through review' },
                  { name: 'System Health Check', desc: 'Monitor API and database status' },
                ].map(w => (
                  <div key={w.name} className="p-3 bg-wise-black/30 rounded-lg">
                    <p className="text-sm font-semibold text-text-primary">{w.name}</p>
                    <p className="text-xs text-text-muted">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
