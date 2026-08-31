export const WISE_CLOUD = {
  bg: '#050607',
  panel: '#090C10',
  panelHover: '#0D141A',
  electric: '#4DA3FF',
  electricBright: '#7BC0FF',
  chrome: '#C8CCD2',
  steel: '#8FA0AE',
  text: '#DCE7EF',
  muted: '#B7C0CB',
  ink: '#031018',
  neonGreen: '#3DFF9A',
  glow: 'rgba(77, 163, 255, 0.15)',
} as const;

export const CLOUD_TAGLINE = 'HOST. AUTOMATE. SCALE. PROFIT.';

export const CLOUD_TRUST_ITEMS = [
  'Managed Hosting',
  'SSL Included',
  'Automated Backups',
  'Secure Infrastructure',
  'WISE² Support',
] as const;

export const CLOUD_PLANS_STATIC = [
  {
    id: 'starter' as const,
    name: 'WISE² Starter',
    price: 19,
    tagline: 'Solo businesses, landing pages, local shops',
    cta: 'Start for $19',
    features: [
      '1 website',
      'Managed hosting',
      'Free SSL',
      'Business email',
      'Automated backups',
      'Basic security',
      'Customer control panel',
      'WISE² support',
      'Migration assistance',
    ],
  },
  {
    id: 'business' as const,
    name: 'WISE² Business',
    price: 39,
    tagline: 'Growing brands that need room to scale',
    highlight: true,
    cta: 'Grow with WISE²',
    features: [
      'Up to 5 websites',
      'Managed hosting',
      'Free SSL & email',
      'Enhanced backups',
      'Uptime monitoring',
      'Security hardening',
      'Staging where supported',
      'Priority support',
      'Migration assistance',
    ],
  },
  {
    id: 'pro' as const,
    name: 'WISE² Pro',
    price: 59,
    tagline: 'Agencies, contractors, operators',
    cta: 'Go Pro',
    features: [
      'Higher hosting allocation',
      'Multiple websites',
      'Enhanced performance',
      'SSL & email everywhere',
      'Daily backups',
      'Monitoring & staging',
      'Priority support',
      'Migration assistance',
      'WISE² business integration ready',
    ],
  },
];

export const CLOUD_UPSELLS = [
  {
    id: 'contractor',
    name: 'WISE² Contractor Cloud',
    price: 99,
    tagline: 'Hosting + website + leads + CRM + automations',
    status: 'coming_soon' as const,
  },
  {
    id: 'managed',
    name: 'WISE² Managed Cloud',
    price: 149,
    tagline: 'Hosting, maintenance, monitoring, AI & ops support',
    status: 'contact_sales' as const,
  },
];

export const cloudPanel =
  'border border-white/10 bg-[#090C10] shadow-[0_0_40px_rgba(77,163,255,0.08)]';
export const cloudPanelActive =
  'border border-[#4DA3FF] bg-[#0D141A] shadow-[0_0_48px_rgba(77,163,255,0.18)]';
export const cloudEyebrow = 'text-xs font-semibold uppercase tracking-[0.28em] text-[#4DA3FF]';
export const cloudBtnPrimary =
  'inline-flex items-center justify-center gap-2 bg-[#4DA3FF] px-6 py-3 text-sm font-bold text-[#031018] transition hover:bg-[#7BC0FF] disabled:opacity-60';
export const cloudBtnGhost =
  'inline-flex items-center justify-center gap-2 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#4DA3FF] hover:text-[#4DA3FF]';
