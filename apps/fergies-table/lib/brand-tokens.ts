export const FERGIE = {
  royal: '#6A22E2',
  deep: '#3A0D6E',
  gold: '#FFD700',
  rose: '#EEC1C6',
  black: '#0A0A0A',
  charcoal: '#121212',
  white: '#FFFFFF',
} as const;

export const FERGIE_LAYOUT = {
  page: 'min-h-screen bg-fergie-black text-white overflow-x-hidden',
  container: 'mx-auto w-full max-w-lg px-4',
  glass:
    'rounded-fergie border border-fergie-gold/20 bg-fergie-charcoal/70 backdrop-blur-xl',
  glassCard:
    'rounded-fergie border border-fergie-gold/15 bg-fergie-charcoal/60 backdrop-blur-lg p-4',
  btnPrimary:
    'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold px-6 py-3 font-semibold text-white shadow-glow-gold transition hover:brightness-110 active:scale-[0.98]',
  btnGold:
    'inline-flex items-center justify-center rounded-full bg-fergie-gold px-6 py-3 font-semibold text-fergie-black shadow-glow-gold transition hover:brightness-110 active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center rounded-full border border-fergie-gold/30 px-6 py-3 font-medium text-fergie-gold transition hover:border-fergie-gold hover:bg-fergie-gold/10',
  statValue: 'text-2xl font-serif font-bold text-fergie-gold sm:text-3xl',
  statLabel: 'text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70',
  sectionTitle: 'font-serif text-xl font-bold tracking-wide sm:text-2xl',
} as const;

export const FERGIE_NAV = [
  { href: '/home', label: 'Home', icon: 'Home' },
  { href: '/menu', label: 'Menu', icon: 'UtensilsCrossed' },
  { href: '/orders', label: 'Orders', icon: 'ClipboardList' },
  { href: '/rewards', label: 'Rewards', icon: 'Crown' },
  { href: '/profile', label: 'Profile', icon: 'User' },
] as const;

export const FERGIE_OWNER_NAV = [
  { href: '/business', label: 'Command', icon: 'LayoutDashboard' },
  { href: '/kitchen', label: 'Kitchen', icon: 'ChefHat' },
  { href: '/calendar', label: 'Booked', icon: 'CalendarDays' },
  { href: '/leads', label: 'Leads', icon: 'Users' },
  { href: '/more', label: 'More', icon: 'Menu' },
] as const;

export const OWNER_PATHS = [
  '/business',
  '/kitchen',
  '/leads',
  '/calendar',
  '/quotes',
  '/payments',
  '/settings',
  '/more',
  '/menu-board',
] as const;

export const FERGIE_QUICK_ACTIONS = [
  { label: 'Order Now', href: '/menu', icon: 'UtensilsCrossed' },
  { label: 'Catering', href: '/catering', icon: 'Sparkles' },
  { label: 'Book a Table', href: '/book', icon: 'CalendarHeart' },
  { label: 'Rewards', href: '/rewards', icon: 'Crown' },
] as const;
