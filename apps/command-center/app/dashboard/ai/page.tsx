'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface BrainStatus {
  authenticated: boolean;
  knowledgeCount?: number;
  graphStats?: { nodes: number; edges: number };
}

interface AIProvider {
  name: string;
  type: string;
  status: 'connected' | 'not_configured' | 'error';
  endpoint?: string;
}

export default function DigitalBrainPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [brainStatus, setBrainStatus] = useState<BrainStatus>({ authenticated: false });
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [brainApiAvailable, setBrainApiAvailable] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      const token = getToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      try {
        const res = await fetch(`${API_URL}/v1/brain-auth/status`, { headers: authHeader });
        if (res.ok) { setBrainStatus({ authenticated: true, ...(await res.json()) }); setBrainApiAvailable(true); }
      } catch { /* Brain API not available */ }

      try {
        const graphRes = await fetch(`${API_URL}/v1/brain-auth/knowledge/graph/stats`, { headers: authHeader });
        if (graphRes.ok) { const stats = await graphRes.json(); setBrainStatus(prev => ({ ...prev, graphStats: stats })); }
      } catch { /* optional */ }

      const detected: AIProvider[] = [];
      try {
        const hermesRes = await fetch(`${API_URL}/v1/brain-auth/chat/health`, { headers: authHeader });
        detected.push({ name: 'Hermes (Ollama)', type: 'Local LLM', status: hermesRes.ok ? 'connected' : 'not_configured', endpoint: 'localhost:11434' });
      } catch {
        detected.push({ name: 'Hermes (Ollama)', type: 'Local LLM', status: 'not_configured', endpoint: 'localhost:11434' });
      }
      detected.push(
        { name: 'Claude API', type: 'Cloud LLM', status: 'not_configured' },
        { name: 'OpenAI API', type: 'Cloud LLM', status: 'not_configured' },
      );
      setProviders(detected);
      setLoading(false);
    };

    load();
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
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
        <h1 className="wise-page-title">Digital Brain</h1>
        <p className="wise-page-subtitle">AI providers, knowledge base, and intelligence systems</p>
      </div>

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Brain Status', value: brainApiAvailable ? 'Online' : 'Offline' },
            { label: 'Knowledge Items', value: brainStatus.knowledgeCount ?? '--' },
            { label: 'Graph Nodes', value: brainStatus.graphStats?.nodes ?? '--' },
            { label: 'Graph Edges', value: brainStatus.graphStats?.edges ?? '--' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {!brainApiAvailable && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Not Connected</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Brain Service Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">
                Requires the Brain Auth service (MongoDB-backed). Services needed: MongoDB, Brain Auth API module. Optional: Ollama/Hermes for local AI chat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Providers */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">AI Providers</h2>
        <div className="space-y-2">
          {providers.map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-wise-black/30">
              <div className="flex items-center gap-3">
                <span className={`wise-status-dot ${
                  p.status === 'connected' ? 'bg-green-400' : p.status === 'error' ? 'bg-danger' : 'bg-text-muted'
                }`} />
                <div>
                  <p className="text-sm font-medium text-text-secondary">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.type}{p.endpoint ? ` - ${p.endpoint}` : ''}</p>
                </div>
              </div>
              <span className={
                p.status === 'connected' ? 'wise-badge-success' : p.status === 'error' ? 'wise-badge-danger' : 'wise-badge-neutral'
              }>
                {p.status === 'connected' ? 'Connected' : p.status === 'error' ? 'Error' : 'Not Configured'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge + Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="wise-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Knowledge Base</h2>
          {brainApiAvailable ? (
            <div className="space-y-2">
              {['Obsidian Vault Sync', 'Document Search', 'Version History'].map(feat => (
                <div key={feat} className="flex items-center justify-between py-1">
                  <span className="text-xs text-text-secondary">{feat}</span>
                  <span className="text-xs text-green-400">Available</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Brain API not connected. Knowledge base requires the Brain Auth service.</p>
          )}
        </div>

        <div className="wise-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Intelligence Capabilities</h2>
          <div className="space-y-2">
            {[
              { label: 'Knowledge Graph', status: brainApiAvailable ? 'Ready' : 'Requires Brain API', ok: brainApiAvailable },
              { label: 'Document Analysis', status: brainApiAvailable ? 'Ready' : 'Requires Brain API', ok: brainApiAvailable },
              { label: 'AI Chat (Hermes)', status: providers.find(p => p.name.includes('Hermes'))?.status === 'connected' ? 'Ready' : 'Requires Ollama', ok: false },
              { label: 'Google Integration', status: 'Requires OAuth Setup', ok: false },
            ].map(cap => (
              <div key={cap.label} className="flex items-center justify-between py-1">
                <span className="text-xs text-text-secondary">{cap.label}</span>
                <span className={`text-xs ${cap.ok ? 'text-green-400' : 'text-amber-400'}`}>{cap.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
