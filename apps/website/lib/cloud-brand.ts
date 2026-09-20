export const WISE_CLOUD = {
  bg: '#050816',
  panel: '#07111F',
  panelDarker: '#050816',
  primary: '#00D9FF',
  primarySecondary: '#2563EB',
  text: '#F5F7FF',
  muted: '#AEB8CB',
  chrome: '#F5F7FF',
  steel: '#AEB8CB',
  glow: 'rgba(0, 217, 255, 0.14)',
} as const;

export const CLOUD_TAGLINE = 'YOUR BUSINESS. OUR INFRASTRUCTURE.';

export const CLOUD_TRUST_ITEMS = [
  'WISE² Managed',
  'Secure Infrastructure',
  '24/7 Monitoring',
  'Built for Business',
] as const;

export const CLOUD_PLANS_STATIC = [
  {
    id: 'starter' as const,
    name: 'WISE² Cloud Starter',
    price: 29,
    tagline: 'A professional home for your business online',
    cta: 'Start with WISE²',
    features: ['1 Website', 'Free SSL', 'Business Email', 'Weekly Backups', 'WISE² Support'],
  },
  {
    id: 'business' as const,
    name: 'WISE² Cloud Business',
    price: 49,
    tagline: 'Built for growing businesses',
    highlight: true,
    cta: 'Choose Business',
    features: ['Up to 5 Websites', 'Free SSL', 'Business Email', 'Daily Backups', 'Uptime Monitoring', 'WISE² Priority Support'],
  },
  {
    id: 'pro' as const,
    name: 'WISE² Cloud Pro',
    price: 79,
    tagline: 'Managed hosting for serious growth',
    cta: 'Go Pro',
    features: ['Unlimited Websites', 'Free SSL', 'Business Email', 'Daily Backups', 'Priority Support', 'Staging Tools', 'Managed WISE² Cloud Experience'],
  },
];

export const CLOUD_UPSELLS = [
  { id: 'contractor', name: 'WISE² Contractor Cloud', price: 99, tagline: 'Hosting + website + leads + CRM + automations', status: 'contact_sales' as const },
  { id: 'managed', name: 'WISE² Managed Cloud', price: 149, tagline: 'Hosting, maintenance, monitoring, AI & ops support', status: 'contact_sales' as const },
];

export const cloudPanel = 'border border-white/10 bg-[#07111F]/90 shadow-[0_0_40px_rgba(0,217,255,0.08)]';
export const cloudPanelActive = 'border border-[#00D9FF] bg-[#0F205B]/40 shadow-[0_0_48px_rgba(0,217,255,0.18)]';
export const cloudEyebrow = 'text-xs font-semibold uppercase tracking-[0.28em] text-[#00D9FF]';
export const cloudBtnPrimary = 'inline-flex items-center justify-center gap-2 bg-[#00D9FF] px-6 py-3 text-sm font-bold text-[#050816] transition hover:bg-[#F5F7FF] disabled:opacity-60';
export const cloudBtnGhost = 'inline-flex items-center justify-center gap-2 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#00D9FF] hover:text-[#00D9FF]';
