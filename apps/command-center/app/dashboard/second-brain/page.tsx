'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

const getToken = () =>
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''
    : '';

interface KnowledgeEntry {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  business: string;
  createdAt: string;
}

interface BrainStats {
  knowledgeCount: number;
  mongo: boolean;
  ollama: boolean;
  model: string;
}

export default function SecondBrainPage() {
  const [stats, setStats] = useState<BrainStats | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const h = { Authorization: `Bearer ${getToken()}` };
      try {
        const [statusRes, entriesRes] = await Promise.allSettled([
          fetch(`${API_URL}/v1/brain-auth/status`, { headers: h }).then(r => r.json()),
          fetch(`${API_URL}/brain/knowledge`, { headers: h }).then(r => r.json()),
        ]);
        if (statusRes.status === 'fulfilled') setStats(statusRes.value);
        if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.entries || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const doSearch = async () => {
    if (!search.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/brain/knowledge/search?q=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data.entries) ? data.entries : Array.isArray(data.results) ? data.results : []);
    } finally {
      setSearching(false);
    }
  };

  const displayed = searchResults ?? entries;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="wise-page-title">Second Brain</h1>
          <p className="wise-page-subtitle">Knowledge base — memory and retrieval for WISE²</p>
        </div>
      </div>

      {/* Stats */}
      <Card className="p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Knowledge Items', value: loading ? '…' : (stats?.knowledgeCount ?? '--') },
            { label: 'MongoDB', value: loading ? '…' : (stats?.mongo ? 'Connected' : 'Offline'), ok: stats?.mongo },
            { label: 'Ollama', value: loading ? '…' : (stats?.ollama ? 'Connected' : 'Offline'), ok: stats?.ollama },
            { label: 'Model', value: loading ? '…' : (stats?.model || '--') },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 border-r border-border-subtle last:border-0">
              <div className={`text-lg font-bold tabular-nums ${s.ok === false ? 'text-red-400' : s.ok === true ? 'text-green-400' : 'text-text-primary'}`}>
                {String(s.value)}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Knowledge Search</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search knowledge base…"
            className="flex-1 bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors"
          />
          <Button onClick={doSearch} disabled={searching} variant="secondary" className="text-sm px-4">
            {searching ? '…' : 'Search'}
          </Button>
          {searchResults !== null && (
            <Button onClick={() => { setSearchResults(null); setSearch(''); }} variant="secondary" className="text-sm px-3">
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Knowledge entries */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          {searchResults !== null ? `Search Results (${searchResults.length})` : `All Knowledge (${entries.length})`}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 w-full animate-pulse bg-border-medium rounded-lg" />)}
          </div>
        ) : displayed.length === 0 ? (
          <p className="text-xs text-text-muted">
            {searchResults !== null ? 'No results found.' : 'No knowledge stored yet. Ask Hermes to store knowledge, or use the API.'}
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {displayed.map(entry => (
              <div key={entry._id} className="p-3 rounded-lg bg-wise-black/30 border border-border-subtle">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-text-secondary leading-snug">{entry.title}</p>
                  <Badge variant="neutral" className="shrink-0 text-[9px]">{entry.business}</Badge>
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {entry.tags.slice(0, 4).map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-wise-electric/10 text-wise-electric/80">{t}</span>
                    ))}
                  </div>
                )}
                <p className="text-[9px] text-text-muted mt-1">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Link to Hermes */}
      <Card className="p-4">
        <p className="text-xs text-text-muted">
          Second Brain provides memory and retrieval context for <a href="/dashboard/ai" className="text-wise-electric hover:underline">Hermes</a>.
          Ask Hermes a question — it automatically retrieves relevant knowledge to ground its answers.
        </p>
      </Card>
    </div>
  );
}
