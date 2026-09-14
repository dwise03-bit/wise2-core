'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { HermesAction } from './HermesActionsQueue';

interface HermesActionDetailProps {
  action: HermesAction | null;
  token: string;
  apiUrl: string;
  onClose?: () => void;
  onDecision?: (action: HermesAction, decision: 'approve' | 'reject') => void;
}

export default function HermesActionDetail({
  action,
  token,
  apiUrl,
  onClose,
  onDecision,
}: HermesActionDetailProps) {
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);

  if (!action) {
    return (
      <div className="text-sm text-text-muted text-center py-8">
        Select an action to view details
      </div>
    );
  }

  const canDecide = action.status === 'pending_approval';

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!token || !canDecide) return;

    setDeciding(true);
    try {
      const endpoint = decision === 'approve'
        ? `${apiUrl}/v1/hermes/actions/${action.id}/approve`
        : `${apiUrl}/v1/hermes/actions/${action.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: note || undefined }),
      });

      if (res.ok) {
        const updatedAction = await res.json();
        onDecision?.(updatedAction, decision);
        setNote('');
      }
    } catch (err) {
      console.error(`Failed to ${decision} action:`, err);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-text-primary">Action Details</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <Card className="p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-lg font-bold text-text-primary leading-tight">
              {action.title}
            </h4>
            <div className="text-right shrink-0">
              <div className="text-xs text-text-muted">
                {new Date(action.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            <Badge variant={action.risk === 'critical' || action.risk === 'high' ? 'danger' : 'warning'}>
              {action.risk.toUpperCase()} RISK
            </Badge>
            <Badge variant="neutral">{action.mode}</Badge>
            <Badge variant="neutral">{action.kind}</Badge>
          </div>
        </div>

        {/* Summary */}
        {action.summary && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Summary
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {action.summary}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Status
            </p>
            <Badge variant={
              action.status === 'pending_approval' ? 'warning' :
              ['completed', 'approved'].includes(action.status) ? 'success' :
              ['failed', 'rejected'].includes(action.status) ? 'danger' :
              'neutral'
            }>
              {action.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Requires Approval
            </p>
            <Badge variant={action.requiresApproval ? 'warning' : 'success'}>
              {action.requiresApproval ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {/* Approval info */}
        {action.approvedAt && (
          <div className="rounded-lg bg-success/5 border border-success/20 p-3">
            <p className="text-xs text-success font-semibold mb-1">✓ Approved</p>
            <p className="text-[10px] text-success/80">
              by {action.approvedBy} on {new Date(action.approvedAt).toLocaleString()}
            </p>
          </div>
        )}

        {action.rejectedAt && (
          <div className="rounded-lg bg-danger/5 border border-danger/20 p-3">
            <p className="text-xs text-danger font-semibold mb-1">✗ Rejected</p>
            <p className="text-[10px] text-danger/80">
              by {action.rejectedBy} on {new Date(action.rejectedAt).toLocaleString()}
            </p>
          </div>
        )}

        {action.executedAt && (
          <div className="rounded-lg bg-info/5 border border-info/20 p-3">
            <p className="text-xs text-info font-semibold mb-1">✓ Executed</p>
            <p className="text-[10px] text-info/80">
              on {new Date(action.executedAt).toLocaleString()}
            </p>
          </div>
        )}

        {action.errorMessage && (
          <div className="rounded-lg bg-danger/5 border border-danger/20 p-3">
            <p className="text-xs text-danger font-semibold mb-1">⚠ Error</p>
            <p className="text-[10px] text-danger/80 font-mono break-words">
              {action.errorMessage}
            </p>
          </div>
        )}

        {/* Decision UI */}
        {canDecide && (
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
                Decision Note
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note…"
                rows={3}
                className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleDecision('approve')}
                disabled={deciding}
                className="flex-1"
              >
                {deciding ? 'Processing…' : '✓ Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDecision('reject')}
                disabled={deciding}
                className="flex-1"
              >
                {deciding ? 'Processing…' : '✗ Reject'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
