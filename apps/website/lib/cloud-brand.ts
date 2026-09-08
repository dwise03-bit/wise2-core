export const WISE_CLOUD = {
  bg: '#020403',
  panel: '#060907',
  panelDarker: '#090D0A',
  primary: '#B8FF00',
  primarySecondary: '#76FF00',
  text: '#FFFFFF',
  muted: '#A7ADA8',
  chrome: '#E8E8E8',
  steel: '#7A7F77',
  glow: 'rgba(184, 255, 0, 0.12)',
} as const;

export const CLOUD_TAGLINE = 'YOUR BUSINESS. OUR INFRASTRUCTURE.';

export const CLOUD_TRUST_ITEMS = [
  'Enterprise Grade',
  'Global Infrastructure',
  ' 24/7 Support',
  ' 99.99% Uptime',
] as const;

export const CLOUD_PLANS_STATIC = [
  {
    id: 'starter' as const,
    name: 'WISE² Starter',
    price: 19,
    tagline: 'A clean foundation for one business site',
    cta: 'Get started',
    features: [
      '1 Website',
      'Free SSL',
      'Email mailboxes',
      'Weekly backups',
    ],
  },
  {
    id: 'business' as const,
    name: 'WISE² Business',
    price: 39,
    tagline: 'The best fit for a growing business',
    highlight: true,
    cta: 'Get started',
    features: [
      'Up to 5 Websites',
      'Free SSL',
      'Email mailboxes',
      'Daily Backups',
      'Uptime monitoring',
    ],
  },
  {
    id: 'pro' as const,
    name: 'WISE² Pro',
    price: 59,
    tagline: 'For multi-site operators and agencies',
    cta: 'Get started',
    features: [
      'Unlimited Websites',
      'Free SSL',
      'Email mailboxes',
      'Daily Backups',
      'Priority support',
      'Staging Tools',
    ],
  },
];

export const CLOUD_UPSELLS = [
  {
    id: 'contractor',
    name: 'WISE² Contractor Cloud',
    price: 99,
    tagline: 'Hosting + website + leads + CRM + automations',
    status: 'contact_sales' as const,
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
  'border border-white/10 bg-[#060907] shadow-[0_0_40px_rgba(184,255,0,0.08)]';
export const cloudPanelActive =
  'border border-[#B8FF00] bg-[#090D0A] shadow-[0_0_48px_rgba(184,255,0,0.18)]';
export const cloudEyebrow = 'text-xs font-semibold uppercase tracking-[0.28em] text-[#B8FF00]';
export const cloudBtnPrimary =
  'inline-flex items-center justify-center gap-2 bg-[#B8FF00] px-6 py-3 text-sm font-bold text-[#020403] transition hover:bg-[#76FF00] disabled:opacity-60';
export const cloudBtnGhost =
  'inline-flex items-center justify-center gap-2 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#B8FF00] hover:text-[#B8FF00]';
