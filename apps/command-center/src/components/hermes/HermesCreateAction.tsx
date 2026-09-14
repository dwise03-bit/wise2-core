'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { HermesAction } from './HermesActionsQueue';

interface HermesCreateActionProps {
  token: string;
  apiUrl: string;
  onSuccess?: (action: HermesAction) => void;
  onCancel?: () => void;
}

const MODES = ['executive', 'audit', 'sales', 'projects', 'support', 'systems'];
const RISKS = ['low', 'medium', 'high', 'critical'];

export default function HermesCreateAction({
  token,
  apiUrl,
  onSuccess,
  onCancel,
}: HermesCreateActionProps) {
  const [mode, setMode] = useState<string>('executive');
  const [kind, setKind] = useState('');
  const [risk, setRisk] = useState<string>('medium');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim() || !kind.trim()) return;

    setCreating(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/v1/hermes/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode,
          kind,
          risk,
          title,
          summary: summary || undefined,
          requiresApproval,
          payload: {},
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const action = await res.json();
      onSuccess?.(action);
      // Reset form
      setMode('executive');
      setKind('');
      setRisk('medium');
      setTitle('');
      setSummary('');
      setRequiresApproval(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create action');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-text-primary">Create Action</h3>
      </div>

      <Card className="p-4 space-y-4">
        {error && (
          <div className="rounded-lg bg-danger/5 border border-danger/20 p-3">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {/* Mode & Kind */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
              Mode
            </label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-wise-electric/50 transition-colors"
            >
              {MODES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
              Kind *
            </label>
            <input
              type="text"
              value={kind}
              onChange={e => setKind(e.target.value.slice(0, 80))}
              placeholder="e.g., emergency-reboot"
              maxLength={80}
              className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 240))}
            placeholder="Brief action title"
            maxLength={240}
            className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors"
          />
        </div>

        {/* Risk & Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
              Risk Level
            </label>
            <select
              value={risk}
              onChange={e => setRisk(e.target.value)}
              className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-wise-electric/50 transition-colors"
            >
              {RISKS.map(r => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={e => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 rounded border-border-subtle bg-wise-black/60"
              />
              <span>Requires Approval</span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 block">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value.slice(0, 4000))}
            placeholder="Detailed description of the action…"
            maxLength={4000}
            rows={4}
            className="w-full bg-wise-black/60 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border-subtle">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={creating || !title.trim() || !kind.trim()}
            className="flex-1"
          >
            {creating ? 'Creating…' : 'Create Action'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={creating}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
}
