export type FieldTechTab = 'dashboard' | 'jobs' | 'tools' | 'imp' | 'more';

export type ToolsView = 'discover' | 'live' | 'trends';
export type MoreView = 'job-closeout' | 'repair' | 'notes' | 'report';
export type ImpView = 'capture' | 'results' | 'next-test' | 'guided';

export const HASH_TO_TAB: Record<string, FieldTechTab> = {
  '': 'dashboard',
  today: 'dashboard',
  dashboard: 'dashboard',
  job: 'jobs',
  jobs: 'jobs',
  'work-order': 'jobs',
  equipment: 'jobs',
  instruments: 'tools',
  tools: 'tools',
  live: 'tools',
  trends: 'tools',
  crm: 'more',
  closeout: 'more',
  more: 'more',
  repair: 'more',
  notes: 'more',
  report: 'more',
  diagnostics: 'imp',
  imp: 'imp',
  test: 'imp',
  guided: 'imp',
};

export function tabFromHash(hash = ''): FieldTechTab {
  const key = hash.replace(/^#/, '');
  return HASH_TO_TAB[key] || 'dashboard';
}

export function hashForTab(tab: FieldTechTab): string {
  if (tab === 'imp') return 'diagnostics';
  if (tab === 'jobs') return 'work-order';
  if (tab === 'tools') return 'instruments';
  if (tab === 'dashboard') return 'today';
  return 'more';
}

export function toolsViewFromHash(hash = ''): ToolsView {
  const key = hash.replace(/^#/, '');
  if (key === 'live') return 'live';
  if (key === 'trends') return 'trends';
  return 'discover';
}

export function moreViewFromHash(hash = ''): MoreView {
  const key = hash.replace(/^#/, '');
  if (key === 'repair') return 'repair';
  if (key === 'notes') return 'notes';
  if (key === 'report') return 'report';
  return 'job-closeout';
}

export function impViewFromHash(hash = ''): ImpView {
  const key = hash.replace(/^#/, '');
  if (key === 'test') return 'next-test';
  if (key === 'guided') return 'guided';
  return 'capture';
}

export const PRIMARY_NAV: Array<{ id: FieldTechTab; label: string }> = [
  { id: 'dashboard', label: 'TODAY' },
  { id: 'jobs', label: 'JOB' },
  { id: 'tools', label: 'TOOLS' },
  { id: 'imp', label: 'IMP' },
  { id: 'more', label: 'MORE' },
];
