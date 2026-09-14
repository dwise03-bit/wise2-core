'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Badge, Button } from '../ui';

export interface HermesAction {
  id: string;
  mode: string;
  kind: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed' | 'cancelled';
  title: string;
  summary?: string;
  requiresApproval: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  executedAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

interface HermesActionsQueueProps {
  token: string;
  apiUrl: string;
  onActionSelect?: (action: HermesAction) => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'neutral';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'queued': return 'neutral';
    case 'pending_approval': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    case 'executing': return 'info';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'cancelled': return 'neutral';
    default: return 'neutral';
  }
};

export default function HermesActionsQueue({
  token,
  apiUrl,
  onActionSelect,
}: HermesActionsQueueProps) {
  const [actions, setActions] = useState<HermesAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending_approval');
  const [refreshing, setRefreshing] = useState(false);

  const loadActions = useCallback(async () => {
    if (!token) return;

    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`${apiUrl}/v1/hermes/actions${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setActions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl, filter]);

  useEffect(() => {
    setLoading(true);
    loadActions();
  }, [filter, loadActions]);

  const refresh = async () => {
    setRefreshing(true);
    await loadActions();
    setRefreshing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-text-primary">Actions Queue</h3>
        <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>
          {refreshing ? '⟳' : 'Refresh'}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {['pending_approval', 'queued', 'executing', 'completed', 'failed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? '' : s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (filter === s || (!filter && s === 'pending_approval'))
                ? 'bg-wise-electric/20 text-wise-electric border border-wise-electric/40'
                : 'bg-wise-black/40 text-text-muted border border-border-subtle hover:border-border-medium'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-xs text-text-muted py-8 text-center">Loading actions…</div>
        ) : actions.length === 0 ? (
          <div className="text-xs text-text-muted py-8 text-center">No actions found</div>
        ) : (
          actions.map(action => (
            <Card
              key={action.id}
              className="p-3 cursor-pointer hover:bg-wise-black/60 transition-colors"
              onClick={() => onActionSelect?.(action)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-text-primary truncate">
                      {action.title}
                    </h4>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{action.mode} · {action.kind}</p>
                  {action.summary && (
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                      {action.summary}
                    </p>
                  )}
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={getRiskColor(action.risk)}>
                      {action.risk.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(action.status)}>
                      {action.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-text-muted">
                    {new Date(action.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
