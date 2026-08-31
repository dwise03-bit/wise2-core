'use client';

import { Activity, ClipboardList, Cpu, House, MoreHorizontal } from 'lucide-react';
import { PRIMARY_NAV, type FieldTechTab } from '@/lib/field-tech-nav';

export type { FieldTechTab };

const ICONS: Record<FieldTechTab, typeof House> = {
  dashboard: House,
  jobs: ClipboardList,
  tools: Activity,
  imp: Cpu,
  more: MoreHorizontal,
};

export function FieldTechBottomNav({
  active,
  onChange,
}: {
  active: FieldTechTab;
  onChange: (tab: FieldTechTab) => void;
}) {
  return (
    <nav className="imp-bottom-nav" aria-label="Field Tech">
      {PRIMARY_NAV.map((tab) => {
        const Icon = ICONS[tab.id];
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className="imp-nav-item"
            data-active={isActive}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="imp-nav-icon">
              <Icon aria-hidden />
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
