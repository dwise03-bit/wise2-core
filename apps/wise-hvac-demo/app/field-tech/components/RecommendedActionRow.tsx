'use client';

import { ChevronRight, Cylinder, Filter, Scale, ShieldCheck, Wrench, Activity } from 'lucide-react';
import type { ActionIconKey, RecommendedActionModel } from '@/lib/imp-diagnostics';

const ACTION_ICONS: Record<ActionIconKey, typeof Wrench> = {
  cylinder: Cylinder,
  filter: Filter,
  vacuum: Activity,
  scale: Scale,
  shield: ShieldCheck,
  wrench: Wrench,
};

export function RecommendedActionRow({
  action,
  onPress,
}: {
  action: RecommendedActionModel;
  onPress?: (action: RecommendedActionModel) => void;
}) {
  const Icon = ACTION_ICONS[action.icon] || Wrench;

  return (
    <button
      type="button"
      className="imp-action-row"
      onClick={() => onPress?.(action)}
      aria-label={`Step ${action.index}: ${action.instruction}`}
    >
      <span className="imp-action-index">{action.index}</span>
      <span>
        <Icon aria-hidden />
        {action.instruction}
      </span>
      <em aria-hidden>
        <ChevronRight size={16} />
      </em>
    </button>
  );
}

export function RecommendedActionsPanel({
  actions,
  onActionPress,
}: {
  actions: RecommendedActionModel[];
  onActionPress?: (action: RecommendedActionModel) => void;
}) {
  return (
    <section className="imp-actions" aria-label="Recommended action">
      <div className="imp-section-label" style={{ padding: '10px 12px 4px' }}>
        <h2 data-tone="green">
          <Wrench size={14} aria-hidden />
          RECOMMENDED ACTION
        </h2>
      </div>
      {actions.length ? (
        actions.map((action) => (
          <RecommendedActionRow key={action.id} action={action} onPress={onActionPress} />
        ))
      ) : (
        <p className="imp-empty" style={{ padding: '12px' }}>No recommended actions available.</p>
      )}
    </section>
  );
}
