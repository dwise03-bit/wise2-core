'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

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

      try {
        const res = await fetch('/api/v1/brain-auth/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBrainStatus({ authenticated: true, ...data });
          setBrainApiAvailable(true);
        }
      } catch { /* Brain API not available */ }

      try {
        const graphRes = await fetch('/api/v1/brain-auth/knowledge/graph/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (graphRes.ok) {
          const stats = await graphRes.json();
          setBrainStatus(prev => ({ ...prev, graphStats: stats }));
        }
      } catch { /* optional */ }

      const detectedProviders: AIProvider[] = [];

      try {
        const hermesRes = await fetch('/api/v1/brain-auth/chat/health', {
          headers: { Authorization: `Bearer ${token}` },
        });
        detectedProviders.push({
          name: 'Hermes (Ollama)',
          type: 'Local LLM',
          status: hermesRes.ok ? 'connected' : 'not_configured',
          endpoint: 'localhost:11434',
        });
      } catch {
        detectedProviders.push({ name: 'Hermes (Ollama)', type: 'Local LLM', status: 'not_configured', endpoint: 'localhost:11434' });
      }

      detectedProviders.push(
        { name: 'Claude API', type: 'Cloud LLM', status: 'not_configured' },
        { name: 'OpenAI API', type: 'Cloud LLM', status: 'not_configured' },
      );

      setProviders(detectedProviders);
      setLoading(false);
    };

    load();
  }, [user?.id]);

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
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Digital Brain</h1>
        <p className="text-text-secondary">AI providers, knowledge base, and intelligence systems</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Brain Status', value: brainApiAvailable ? 'Online' : 'Offline', icon: '🧠', ok: brainApiAvailable },
          { label: 'Knowledge Items', value: brainStatus.knowledgeCount ?? '—', icon: '📚', ok: !!brainStatus.knowledgeCount },
          { label: 'Graph Nodes', value: brainStatus.graphStats?.nodes ?? '—', icon: '🔗', ok: !!brainStatus.graphStats },
          { label: 'Graph Edges', value: brainStatus.graphStats?.edges ?? '—', icon: '🕸', ok: !!brainStatus.graphStats },
        ].map(s => (
          <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{s.icon}</span>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
            <p className={`text-xl font-bold ${s.ok ? 'text-wise-electric' : 'text-text-muted'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">AI Providers</h3>
        <div className="space-y-3">
          {providers.map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 bg-wise-black/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  p.status === 'connected' ? 'bg-green-400' : p.status === 'error' ? 'bg-red-400' : 'bg-gray-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.type}{p.endpoint ? ` — ${p.endpoint}` : ''}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                p.status === 'connected' ? 'bg-green-500/20 text-green-400'
                  : p.status === 'error' ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}>
                {p.status === 'connected' ? 'CONNECTED' : p.status === 'error' ? 'ERROR' : 'NOT CONFIGURED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Knowledge Base</h3>
          {brainApiAvailable ? (
            <div className="space-y-3">
              {[
                { label: 'Obsidian Vault Sync', status: 'Available' },
                { label: 'Document Search', status: 'Available' },
                { label: 'Version History', status: 'Available' },
              ].map(feat => (
                <div key={feat.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">{feat.label}</span>
                  <span className="text-xs text-green-400">{feat.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Brain API not connected. Knowledge base requires the Brain Auth service (MongoDB-backed).</p>
          )}
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Intelligence Capabilities</h3>
          <div className="space-y-3">
            {[
              { label: 'Knowledge Graph', status: brainApiAvailable ? 'Ready' : 'Requires Brain API', ok: brainApiAvailable },
              { label: 'Document Analysis', status: brainApiAvailable ? 'Ready' : 'Requires Brain API', ok: brainApiAvailable },
              { label: 'AI Chat (Hermes)', status: providers.find(p => p.name.includes('Hermes'))?.status === 'connected' ? 'Ready' : 'Requires Ollama', ok: false },
              { label: 'Google Integration', status: 'Requires OAuth Setup', ok: false },
            ].map(cap => (
              <div key={cap.label} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{cap.label}</span>
                <span className={`text-xs ${cap.ok ? 'text-green-400' : 'text-amber-400'}`}>{cap.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!brainApiAvailable && (
        <div className="bg-wise-surface border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Brain Service Not Connected</h3>
              <p className="text-text-muted text-sm mb-2">
                The Digital Brain requires the Brain Auth service (MongoDB-backed) to be running. This is separate from the main PostgreSQL-backed API.
              </p>
              <p className="text-xs text-text-muted">
                Services needed: MongoDB, Brain Auth API module. Optional: Ollama/Hermes for local AI chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
