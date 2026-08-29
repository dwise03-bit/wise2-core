'use client';

import { Activity, ClipboardList, Cpu, House, MoreHorizontal } from 'lucide-react';

export type FieldTechTab = 'dashboard' | 'jobs' | 'tools' | 'imp' | 'more';

const TABS: Array<{ id: FieldTechTab; label: string; icon: typeof House }> = [
  { id: 'dashboard', label: 'Dashboard', icon: House },
  { id: 'jobs', label: 'Jobs', icon: ClipboardList },
  { id: 'tools', label: 'Tools', icon: Activity },
  { id: 'imp', label: 'IMP Tech', icon: Cpu },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function FieldTechBottomNav({
  active,
  onChange,
}: {
  active: FieldTechTab;
  onChange: (tab: FieldTechTab) => void;
}) {
  return (
    <nav className="imp-bottom-nav" aria-label="Field Tech">
      {TABS.map((tab) => {
        const Icon = tab.icon;
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
