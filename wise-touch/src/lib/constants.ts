/** Navigation routes */
export const ROUTES = {
  HOME: '/',
  DEPLOYMENTS: '/deployments',
  INFRASTRUCTURE: '/infrastructure',
  AI: '/ai',
  SOUND_LABS: '/sound-labs',
} as const

/** Navigation menu items */
export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.HOME, icon: 'LayoutDashboard' },
  { label: 'Deployments', href: ROUTES.DEPLOYMENTS, icon: 'Cloud' },
  { label: 'Infrastructure', href: ROUTES.INFRASTRUCTURE, icon: 'Network' },
  { label: 'AI', href: ROUTES.AI, icon: 'Zap' },
  { label: 'Sound Labs', href: ROUTES.SOUND_LABS, icon: 'Music' },
] as const

/** Theme colors - aligned with design tokens */
export const THEME_COLORS = {
  PRIMARY_BLUE: '#0094FF',
  SECONDARY_BLUE: '#5BC0FF',
  DARK_BLUE: '#0056CC',
  CHROME_LIGHT: '#E8E8E8',
  CHROME_DARK: '#1a1a1a',
  SUCCESS_GREEN: '#22C55E',
  WARNING_AMBER: '#F59E0B',
  ERROR_RED: '#EF4444',
  BG_PRIMARY: '#000000',
  BG_SECONDARY: '#0f0f0f',
} as const

/** Animation durations (in ms) */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  SLOWER: 500,
} as const

/** Status badge colors */
export const STATUS_COLORS = {
  running: 'text-green-500 bg-green-500/10',
  stopped: 'text-red-500 bg-red-500/10',
  pending: 'text-amber-500 bg-amber-500/10',
  warning: 'text-yellow-500 bg-yellow-500/10',
  error: 'text-red-600 bg-red-600/10',
} as const

/** Accessibility */
export const A11Y = {
  FOCUS_RING: 'focus-visible:outline-2 outline-offset-2 outline-blue-500',
  SKIP_LINK: 'sr-only focus:not-sr-only',
} as const

/** Breakpoints */
export const BREAKPOINTS = {
  MOBILE: 375,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440,
} as const
