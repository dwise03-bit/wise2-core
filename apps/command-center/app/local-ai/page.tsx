'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

type RouteMode = 'auto' | 'mac' | 'vps';

interface RouteInfo {
  mode: RouteMode;
  endpoint: string;
  model: string;
  description: string;
}

interface Message {
  id: string;
  query: string;
  response: string;
  route: RouteInfo;
  timestamp: Date;
  tokensUsed?: number;
}

// Move outside component to prevent recreation on every render
const ROUTE_CONFIGS: Record<RouteMode, RouteInfo> = {
  auto: {
    mode: 'auto',
    endpoint: 'local-auto',
    model: 'Smart Router',
    description: 'Automatically selects Mac or VPS based on query complexity and Mac responsiveness',
  },
  mac: {
    mode: 'mac',
    endpoint: 'local-mac',
    model: 'Mac Local (Ollama)',
    description: 'Keeps your Mac responsive by routing to lower-complexity tasks',
  },
  vps: {
    mode: 'vps',
    endpoint: 'gpu-nmls',
    model: 'VPS GPU (NMLS)',
    description: 'GPU-NMLS remote server for heavy/complex workloads',
  },
};

const MAX_HISTORY = 50;
const MAX_QUERY_LENGTH = 10000;

// Memoized message card component to prevent unnecessary re-renders
const MessageCard = React.memo(({ message }: { message: Message }) => {
  const timeStr = useMemo(
    () => message.timestamp.toLocaleTimeString(),
    [message.timestamp]
  );

  return (
    <Card className="p-6 border border-border-subtle space-y-4">
      {/* Query */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Query
        </div>
        <div className="text-text-primary">{message.query}</div>
      </div>

      {/* Route Info Badge */}
      <div className="flex items-center gap-3 py-3 px-3 bg-wise-surface rounded-lg border border-border-subtle">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary">
            {message.route.model}
          </div>
          <div className="text-xs text-text-muted">
            {message.route.description}
          </div>
        </div>
        {message.tokensUsed && (
          <div className="text-xs font-mono text-text-muted">
            {message.tokensUsed} tokens
          </div>
        )}
      </div>

      {/* Response */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Response
        </div>
        <div className="text-text-secondary whitespace-pre-wrap break-words">
          {message.response}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-text-muted">
        {timeStr}
      </div>
    </Card>
  );
});

MessageCard.displayName = 'MessageCard';

export default function LocalAIRouterPage() {
  const [query, setQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteMode>('auto');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clear error when user edits query
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (error) setError(null);
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError('Please enter a query');
      return;
    }

    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      setError(`Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/local-ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmedQuery,
          route: selectedRoute,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to process query`);
      }

      const data = await response.json();
      const routeInfo = ROUTE_CONFIGS[data.routeUsed || selectedRoute];

      setMessages((prev) => {
        const updated = [
          {
            id: `msg_${Date.now()}`,
            query: trimmedQuery,
            response: data.response,
            route: routeInfo,
            timestamp: new Date(),
            tokensUsed: data.tokensUsed,
          },
          ...prev,
        ];
        // Cap history to prevent memory bloat
        return updated.slice(0, MAX_HISTORY);
      });

      setQuery('');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [query, selectedRoute]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Local AI Router</h1>
        <p className="text-text-muted">
          Route AI workloads between your Mac and GPU-NMLS VPS server with smart optimization
        </p>
      </div>

      {/* Query Form */}
      <Card className="p-6 border border-border-subtle">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">
              Your Query
            </label>
            <textarea
              value={query}
              onChange={handleQueryChange}
              placeholder="Ask anything... The router will automatically optimize for speed and efficiency"
              className="w-full px-4 py-3 bg-wise-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-wise-electric/50 focus:border-wise-electric resize-none"
              rows={4}
              disabled={loading}
              maxLength={MAX_QUERY_LENGTH}
            />
          </div>

          {/* Route Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">
              Routing Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(ROUTE_CONFIGS) as [RouteMode, RouteInfo][]).map(
                ([mode, config]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedRoute(mode)}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      selectedRoute === mode
                        ? 'border-wise-electric bg-wise-electric/10'
                        : 'border-border-subtle hover:border-border-default'
                    }`}
                  >
                    <div className="font-semibold text-text-primary capitalize">
                      {config.model}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {config.description}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full bg-wise-electric hover:bg-wise-electric/90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send to AI Router'}
          </Button>
        </form>
      </Card>

      {/* Messages Display */}
      {messages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Query History ({messages.length})</h2>
          {messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && !loading && (
        <Card className="p-12 text-center border border-border-subtle">
          <div className="space-y-3">
            <svg
              className="w-12 h-12 mx-auto text-text-muted opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36-5.36l.707-.707M5.337 17h4.673"
              />
            </svg>
            <p className="text-text-muted">No queries yet. Ask something to get started!</p>
          </div>
        </Card>
      )}
    </div>
  );
}
