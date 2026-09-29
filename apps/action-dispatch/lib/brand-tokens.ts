export const WISE = {
  carbon: '#050505',
  smoked: '#101214',
  steel: '#1A1E22',
  chrome: '#C9D0D6',
  ice: '#27C7FF',
  white: '#F7FBFF',
  emerald: '#2EE59D',
  amber: '#F5B942',
  critical: '#FF3B5C',
  violet: '#8B7CFF',
} as const;

export const NAV = [
  { href: '/', label: 'Command Center', icon: 'LayoutDashboard' },
  { href: '/calls', label: 'Calls', icon: 'Phone' },
  { href: '/dispatch', label: 'Dispatch', icon: 'Truck' },
  { href: '/customers', label: 'Customers', icon: 'Users' },
  { href: '/jobs', label: 'Jobs', icon: 'Briefcase' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'needs_action', label: 'Needs Action' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
] as const;
