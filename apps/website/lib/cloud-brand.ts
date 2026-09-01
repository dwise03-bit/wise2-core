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
    id: 'launch' as const,
    name: 'WISE² Launch',
    price: 4.99,
    tagline: 'Perfect for getting started',
    cta: 'Get started',
    features: [
      '1 Website',
      '10 GB SSD Storage',
      '50 GB Bandwidth',
      'Free SSL Certificate',
      'Free Domain (1yr)',
    ],
  },
  {
    id: 'grow' as const,
    name: 'WISE² Grow',
    price: 9.99,
    tagline: 'Built for growing businesses',
    highlight: true,
    cta: 'Get started',
    features: [
      'Up to 5 Websites',
      '50 GB SSD Storage',
      'Unlimited Bandwidth',
      'Free SSL Certificate',
      'Free Domain (1yr)',
      'Daily Backups',
    ],
  },
  {
    id: 'scale' as const,
    name: 'WISE² Scale',
    price: 19.99,
    tagline: 'For established businesses',
    cta: 'Get started',
    features: [
      'Unlimited Websites',
      '100 GB SSD Storage',
      'Unlimited Bandwidth',
      'Free Domain (1yr)',
      'Daily Backups',
      'Priority Support',
      'Staging Tools',
      'Unlimited Servers',
    ],
  },
  {
    id: 'performance' as const,
    name: 'WISE² Performance',
    price: 39.99,
    tagline: 'Maximum power & speed',
    cta: 'Get started',
    features: [
      'Unlimited Websites',
      '500 GB SSD Storage',
      'Unlimited Bandwidth',
      'Free Domain (1yr)',
      'Daily Backups',
      'Priority Support',
      'Staging Tools',
      'Unlimited Servers',
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
