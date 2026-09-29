'use client';

import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../../../src/components/ui';
import { useAuth } from '../../../src/contexts/AuthContext';

const BRAIN_API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || '/brain-api';

interface BrainHealth {
  overallStatus: string;
  components: {
    ai?: { status?: string };
    automation?: { status?: string };
    documents?: { status?: string };
    graph?: { status?: string };
  };
}

interface BrainStats {
  totalOperations?: number;
  successRate?: number;
  totalCostUSD?: number;
  byOperationType?: Record<string, number>;
}

interface Vault {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  syncDirection?: string;
  syncInterval?: number;
  status?: string;
  entryCount?: number;
  updatedAt?: string;
}

interface KnowledgeEntry {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  business?: string;
  createdAt?: string;
  score?: number;
  vaultName?: string;
}

export default function SecondBrainPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [health, setHealth] = useState<BrainHealth | null>(null);
  const [stats, setStats] = useState<BrainStats | null>(null);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [healthRes, statsRes, vaultsRes] = await Promise.allSettled([
          fetch(`${BRAIN_API_URL}/brain/dashboard/health`, { headers }),
          fetch(`${BRAIN_API_URL}/brain/dashboard/ai/stats`, { headers }),
          fetch(`${BRAIN_API_URL}/brain/knowledge/vaults`, { headers }),
        ]);

        if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
          setHealth(await healthRes.value.json());
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          setStats(await statsRes.value.json());
        }

        if (vaultsRes.status === 'fulfilled' && vaultsRes.value.ok) {
          const data = await vaultsRes.value.json();
          setVaults(Array.isArray(data.vaults) ? data.vaults : []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, token, user?.id]);

  const doSearch = async () => {
    if (!token) return;

    const query = search.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`${BRAIN_API_URL}/brain/knowledge/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      setSearchResults(Array.isArray(data.entries) ? data.entries : []);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearch('');
  };

  const componentState = (state?: string) => {
    if (state === 'healthy' || state === 'online') return 'success';
    if (state === 'degraded' || state === 'warning') return 'warning';
    return 'danger';
  };

  const valueClass = (state?: string) => {
    switch (componentState(state)) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-danger';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="wise-page-title">Second Brain</h1>
          <p className="wise-page-subtitle">Knowledge vaults, retrieval, and AI health for WISE²</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      <Card className="p-1">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Operations', value: loading ? '…' : (stats?.totalOperations ?? '--') },
            { label: 'Success Rate', value: loading ? '…' : (typeof stats?.successRate === 'number' ? `${stats.successRate.toFixed(1)}%` : '--') },
            { label: 'AI Health', value: loading ? '…' : (health?.components?.ai?.status || health?.overallStatus || '--'), state: health?.components?.ai?.status || health?.overallStatus },
            { label: 'Documents', value: loading ? '…' : (health?.components?.documents?.status || '--'), state: health?.components?.documents?.status },
          ].map(item => (
            <div key={item.label} className="px-4 py-3 border-r border-border-subtle last:border-0">
              <div className={`text-lg font-bold tabular-nums ${item.state ? valueClass(item.state) : 'text-text-primary'}`}>
                {String(item.value)}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-text-primary mb-1">Knowledge Search</h2>
            <p className="text-xs text-text-muted">Search live entries and vault content indexed by the Brain API.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search knowledge base…"
              className="flex-1 bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors"
            />
            <Button onClick={doSearch} disabled={searching} variant="secondary" className="text-sm px-4">
              {searching ? 'Searching…' : 'Search'}
            </Button>
            {searchResults !== null && (
              <Button onClick={clearSearch} variant="secondary" className="text-sm px-3">
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Vaults</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 w-full animate-pulse bg-border-medium rounded-lg" />
              ))}
            </div>
          ) : vaults.length === 0 ? (
            <p className="text-xs text-text-muted">No vaults registered yet. Add one through the Brain API or sync a vault from the backend.</p>
          ) : (
            <div className="space-y-2 max-h-[48vh] overflow-y-auto">
              {vaults.map((vault, index) => {
                const key = vault._id || vault.id || `${vault.name || 'vault'}-${index}`;
                return (
                  <div key={key} className="p-3 rounded-lg bg-wise-black/30 border border-border-subtle">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text-secondary leading-snug">{vault.name || 'Untitled Vault'}</p>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">{vault.description || 'No description provided.'}</p>
                      </div>
                      <Badge variant={vault.status === 'active' ? 'success' : 'neutral'} className="shrink-0 text-[9px]">
                        {vault.status || 'unknown'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="neutral" className="text-[9px]">{vault.syncDirection || 'sync'}</Badge>
                      <Badge variant="info" className="text-[9px]">{vault.entryCount ?? 0} entries</Badge>
                      <Badge variant="neutral" className="text-[9px]">{vault.syncInterval ? `${vault.syncInterval} min` : 'interval unknown'}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            {searchResults !== null ? `Search Results (${searchResults.length})` : 'Brain Health'}
          </h2>
          {searchResults !== null ? (
            searchResults.length === 0 ? (
              <p className="text-xs text-text-muted">No results found.</p>
            ) : (
              <div className="space-y-2 max-h-[48vh] overflow-y-auto">
                {searchResults.map((entry, index) => {
                  const key = entry._id || entry.id || `${entry.title || 'entry'}-${index}`;
                  return (
                    <div key={key} className="p-3 rounded-lg bg-wise-black/30 border border-border-subtle">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-text-secondary leading-snug">{entry.title || 'Untitled Entry'}</p>
                        <Badge variant="neutral" className="shrink-0 text-[9px]">{entry.vaultName || entry.business || 'brain'}</Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{entry.content || 'No content available.'}</p>
                      {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {entry.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-wise-electric/10 text-wise-electric/80">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Automation', value: health?.components?.automation?.status || '--' },
                  { label: 'Graph', value: health?.components?.graph?.status || '--' },
                  { label: 'Cost', value: typeof stats?.totalCostUSD === 'number' ? `$${stats.totalCostUSD.toFixed(2)}` : '--' },
                  { label: 'Top Ops', value: stats?.byOperationType ? Object.keys(stats.byOperationType).slice(0, 2).join(', ') || '--' : '--' },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-text-muted">{item.label}</div>
                    <div className="text-sm font-semibold text-text-primary mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted">
                {health?.overallStatus === 'healthy'
                  ? 'Second Brain is healthy and ready for Hermes retrieval.'
                  : 'Brain services are partially degraded or still booting. Check the API and background services.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-xs text-text-muted">
          Second Brain provides memory and retrieval context for{' '}
          <a href="/dashboard/ai" className="text-wise-electric hover:underline">Hermes</a>.
          Ask Hermes a question and it will ground answers in live Brain data.
        </p>
      </Card>
    </div>
  );
}
