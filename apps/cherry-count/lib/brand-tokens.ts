export const CHERRY_COUNT = {
  jetBlack: '#050505',
  softBlack: '#111111',
  darkPlum: '#17081B',
  bubblegumPink: '#FF5FA2',
  hotPink: '#FF2E88',
  cherryRed: '#C91C4A',
  royalPlum: '#7A2EFF',
  lavender: '#C98BFF',
  white: '#FFFFFF',
  chrome: '#C0C0C0',
} as const;

export const CHERRY_LAYOUT = {
  page: 'min-h-screen bg-cherry-black text-white overflow-x-hidden',
  container: 'mx-auto w-full max-w-lg px-4 sm:max-w-2xl lg:max-w-5xl',
  glass: 'rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/70 backdrop-blur-xl',
  glassCard: 'rounded-cherry border border-cherry-bubblegum/15 bg-cherry-soft/60 backdrop-blur-lg p-4',
  btnPrimary:
    'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cherry-hot to-cherry-red px-6 py-3 font-semibold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center rounded-full border border-cherry-bubblegum/30 px-6 py-3 font-medium text-white/80 transition hover:border-cherry-hot hover:text-white',
  statValue: 'text-2xl font-bold text-cherry-hot sm:text-3xl',
  statLabel: 'text-xs uppercase tracking-wider text-white/50',
  sectionTitle: 'font-serif text-xl font-bold uppercase tracking-wide sm:text-2xl',
} as const;

export const CHERRY_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/inventory', label: 'Inventory', icon: 'Package' },
  { href: '/pop-ups', label: 'Pop-Ups', icon: 'Calendar' },
  { href: '/more', label: 'More', icon: 'Menu' },
] as const;

export const CHERRY_QUICK_ACTIONS = [
  { label: 'Add Product', href: '/inventory/new', icon: 'Plus' },
  { label: 'Record Sale', href: '/sales/new', icon: 'DollarSign' },
  { label: 'Create Event', href: '/pop-ups/new', icon: 'CalendarPlus' },
  { label: 'Scan QR', href: '/scan', icon: 'QrCode' },
  { label: 'Scan Barcode', href: '/scan?mode=barcode', icon: 'Barcode' },
  { label: 'Add Customer', href: '/customers/new', icon: 'UserPlus' },
] as const;
