'use client';

import type { StabilityResult } from '@/lib/stability';
import type { FieldTechTab } from '@/lib/field-tech-nav';
import type { SyncState } from '@/lib/field-session';

const STEPS: Array<{ id: string; label: string; tab: FieldTechTab; hash?: string }> = [
  { id: 'equipment', label: 'Equipment', tab: 'jobs' },
  { id: 'connected', label: 'Connected', tab: 'tools' },
  { id: 'stabilized', label: 'Stabilized', tab: 'tools', hash: 'live' },
  { id: 'diagnose', label: 'Diagnose', tab: 'imp' },
  { id: 'repair', label: 'Repair', tab: 'more', hash: 'repair' },
  { id: 'verify', label: 'Verify', tab: 'more', hash: 'repair' },
];

export function FieldHeader({
  title,
  subtitle,
  badgeLabel,
  badgeValue,
}: {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeValue: string;
}) {
  return (
    <header className="imp-header">
      <div className="imp-wordmark">
        <strong>WISE²</strong>
        <span>FIELD TECH</span>
      </div>
      <div className="imp-header-title">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="imp-system-id">
        <span>{badgeLabel}</span>
        <strong>{badgeValue}</strong>
      </div>
    </header>
  );
}

export function StatusStrip({
  online,
  toolsLabel,
  impAvailable,
  syncState,
}: {
  online: boolean;
  toolsLabel: string;
  impAvailable: boolean;
  syncState: SyncState;
}) {
  return (
    <div className="imp-status-strip" aria-label="Technician status">
      <span className="imp-chip" data-ok={online} data-bad={!online}>{online ? 'ONLINE' : 'OFFLINE'}</span>
      <span className="imp-chip" data-ok={toolsLabel === 'LIVE TOOL'} data-warn={toolsLabel !== 'LIVE TOOL'}>{toolsLabel}</span>
      <span className="imp-chip" data-ok={impAvailable} data-bad={!impAvailable}>{impAvailable ? 'IMP READY' : 'IMP UNAVAILABLE'}</span>
      <span className="imp-chip">{syncState}</span>
    </div>
  );
}

export function WorkflowRail({
  activeId,
  completed,
  onSelect,
}: {
  activeId: string;
  completed: Record<string, boolean>;
  onSelect: (tab: FieldTechTab, hash?: string) => void;
}) {
  return (
    <div className="imp-workflow-rail" aria-label="Diagnostic workflow">
      {STEPS.map((step) => (
        <button
          key={step.id}
          type="button"
          data-active={activeId === step.id}
          data-done={completed[step.id] || undefined}
          onClick={() => onSelect(step.tab, step.hash)}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}

export function Unknown({ value }: { value?: string | number | null }) {
  const text = value === 0 ? '0' : (value === null || value === undefined || value === '' ? '—' : String(value));
  return <strong>{text}</strong>;
}

export function stabilityTone(state: StabilityResult['state']): { ok?: boolean; warn?: boolean; bad?: boolean } {
  if (state === 'STABLE') return { ok: true };
  if (state === 'UNSTABLE' || state === 'LOST_SIGNAL') return { bad: true };
  return { warn: true };
}
