'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LiveEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  source: string;
  title: string;
  message: string;
  deviceId?: string;
  meta?: Record<string, string | number | boolean>;
}

type Filter = 'all' | 'system' | 'edge' | 'brain' | 'discord' | 'revenue';

const MAX_EVENTS = 100;

const SEVERITY_CLASSES: Record<string, string> = {
  info: 'bg-wise-electric/10 text-wise-electric border-wise-electric/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SEVERITY_DOT: Record<string, string> = {
  info: 'bg-wise-electric',
  success: 'bg-green-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
};

const TYPE_SOURCE_MAP: Record<Filter, string[]> = {
  all: [],
  system: ['system', 'command-center'],
  edge: ['edge', 'wisepi', 'pi'],
  brain: ['brain', 'second-brain'],
  discord: ['discord'],
  revenue: ['revenue', 'stripe'],
};

function matchesFilter(event: LiveEvent, filter: Filter): boolean {
  if (filter === 'all') return true;
  const prefixes = TYPE_SOURCE_MAP[filter];
  return prefixes.some(
    (p) => event.type.startsWith(p) || event.source.toLowerCase().includes(p)
  );
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return ts; }
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    'command-center': 'SYSTEM',
    'wise-discord': 'DISCORD',
    'second-brain': 'BRAIN',
    'edge': 'EDGE',
    'wisepi': 'WISEPI',
    'revenue': 'REVENUE',
    'stripe': 'STRIPE',
  };
  return map[source.toLowerCase()] ?? source.toUpperCase().slice(0, 10);
}

export default function LiveOpsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'offline'>('connecting');
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCount = useRef(0);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    setStatus('connecting');
    const es = new EventSource('/api/events');
    esRef.current = es;

    es.onopen = () => {
      setStatus('connected');
      setConnectedAt(new Date().toISOString());
      reconnectCount.current = 0;
    };

    es.onmessage = (e) => {
      try {
        const event: LiveEvent = JSON.parse(e.data);
        if (event.type === 'stream.heartbeat') return;
        setEvents((prev) => {
          const next = [event, ...prev];
          return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
      } catch { /* ignore malformed */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setStatus('reconnecting');
      const delay = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000);
      reconnectCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const filtered = events.filter((e) => matchesFilter(e, filter));

  const statusConfig = {
    connected: { dot: 'bg-green-400 animate-pulse', label: 'LIVE', color: 'text-green-400' },
    connecting: { dot: 'bg-amber-400 animate-pulse', label: 'CONNECTING', color: 'text-amber-400' },
    reconnecting: { dot: 'bg-amber-400 animate-pulse', label: 'RECONNECTING', color: 'text-amber-400' },
    offline: { dot: 'bg-red-500', label: 'OFFLINE', color: 'text-red-400' },
  }[status];

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'system', label: 'System' },
    { key: 'edge', label: 'Edge' },
    { key: 'brain', label: 'Brain' },
    { key: 'discord', label: 'Discord' },
    { key: 'revenue', label: 'Revenue' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="wise-page-title">Live Ops</h1>
          <p className="wise-page-subtitle">Real-time event stream — edge, brain, discord, revenue</p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          <span className={`text-xs font-semibold tracking-wider ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {connectedAt && status === 'connected' && (
            <span className="text-xs text-text-muted hidden sm:inline">
              since {formatTime(connectedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-3 divide-x divide-border-subtle">
          <div className="px-4 py-2.5">
            <div className="text-xl font-bold tabular-nums text-text-primary">{events.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mt-0.5">Total events</div>
          </div>
          <div className="px-4 py-2.5">
            <div className="text-xl font-bold tabular-nums text-text-primary">
              {events.filter((e) => e.severity === 'error' || e.severity === 'warning').length}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mt-0.5">Alerts</div>
          </div>
          <div className="px-4 py-2.5">
            <div className="text-xl font-bold tabular-nums text-text-primary">
              {events.filter((e) => e.type.startsWith('edge')).length}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mt-0.5">Edge events</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === key
                ? 'bg-wise-electric text-wise-black'
                : 'bg-wise-surface border border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-strong'
            }`}
          >
            {label}
            {key !== 'all' && (
              <span className="ml-1.5 opacity-70">
                {events.filter((e) => matchesFilter(e, key)).length}
              </span>
            )}
          </button>
        ))}
        {events.length > 0 && (
          <button
            onClick={() => setEvents([])}
            className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold text-text-muted hover:text-danger transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Event feed — natural document scroll, Pi-safe bounded list */}
      <div className="wise-card divide-y divide-border-subtle">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className={`w-2.5 h-2.5 rounded-full mb-3 ${statusConfig.dot}`} />
            <p className="text-sm font-medium text-text-secondary">
              {status === 'connected' ? 'Waiting for events…' : statusConfig.label}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {status === 'connected'
                ? 'Events appear here in real time as they occur'
                : 'Attempting to connect to the event stream'}
            </p>
          </div>
        ) : (
          filtered.map((event) => (
            <div key={event.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
              {/* Severity dot */}
              <div className="flex-shrink-0 pt-[5px]">
                <span className={`block w-2 h-2 rounded-full ${SEVERITY_DOT[event.severity] ?? 'bg-text-muted'}`} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${SEVERITY_CLASSES[event.severity] ?? ''}`}>
                    {sourceLabel(event.source)}
                  </span>
                  <span className="text-sm font-medium text-text-secondary leading-5">{event.title}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{event.message}</p>
                {event.deviceId && (
                  <p className="text-[10px] text-text-muted mt-0.5 font-mono">device: {event.deviceId}</p>
                )}
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-[10px] text-text-muted pt-[5px] font-mono">
                {formatTime(event.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reconnect button when offline */}
      {status === 'offline' && (
        <div className="flex justify-center">
          <button
            onClick={() => { reconnectCount.current = 0; connect(); }}
            className="wise-btn-secondary text-sm"
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  );
}
