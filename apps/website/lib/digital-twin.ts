export type DigitalTwinPackageId = 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE';
export type DigitalTwinStatus =
  | 'DRAFT'
  | 'ONBOARDING'
  | 'TRAINING'
  | 'TESTING'
  | 'AWAITING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'REVOKED'
  | 'ARCHIVED';
export type DigitalTwinAutonomyLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

export const digitalTwinPackages = [
  {
    id: 'STARTER' as const,
    name: 'Writing Clone',
    price: 1495,
    cadence: 'one-time build',
    summary: 'Launch the knowledge, writing, and approval foundation.',
    description: 'Best for founder-led teams that want WISE² to learn the business, generate content, and stay in draft mode.',
    badge: 'Fastest Start',
    includes: [
      'Tenant-scoped knowledge ingestion',
      'Writing clone profile and brand voice tuning',
      'Approval queue for outbound content',
      'Test lab with scenario review',
      'Revenue OS-ready tenant attachment',
    ],
  },
  {
    id: 'GROWTH' as const,
    name: 'Sales Clone',
    price: 3495,
    cadence: 'one-time build',
    summary: 'Add qualified lead response and follow-up support.',
    description: 'Built for teams that want the Digital Twin to help qualify, nurture, and route leads without crossing approval boundaries.',
    badge: 'Most Popular',
    includes: [
      'Everything in Writing Clone',
      'Sales profile, objections, and booking rules',
      'Lead qualification prompts and CRM notes',
      'Approval-required outbound sales actions',
      'Revenue OS handoff for opportunities',
    ],
  },
  {
    id: 'SCALE' as const,
    name: 'Full Digital Twin',
    price: 7495,
    cadence: 'one-time build',
    summary: 'Train all six clones into one operator-ready system.',
    description: 'For businesses ready to launch content, support, and sales workflows from one approved Digital Twin command center.',
    badge: '6 Clones',
    includes: [
      'Writing, sales, support, voice, and content engine setup',
      'Consent tracking for voice and likeness features',
      'Approval center and autonomy policy configuration',
      'Test lab, launch checklist, and activation review',
      'Dashboard with activity, analytics, and permissions',
    ],
  },
  {
    id: 'ENTERPRISE' as const,
    name: 'Legend Build',
    price: null,
    cadence: 'custom scope',
    summary: 'Multi-tenant rollout, provider integrations, and team training.',
    description: 'For brands that need custom providers, migration work, advanced automations, and operator enablement.',
    badge: 'Custom',
    includes: [
      'Everything in Full Digital Twin',
      'Provider abstraction and enterprise integration planning',
      'Custom onboarding, migration, and tenant templates',
      'Command center rollout and admin controls',
      'White-glove launch support',
    ],
  },
];

export const digitalTwinHero = {
  eyebrow: 'WISE² DIGITAL TWIN™',
  headline: "WHAT IF YOUR BUSINESS COULD OPERATE LIKE YOU — EVEN WHEN YOU'RE NOT THERE?",
  subheadline: 'Clone your knowledge. Clone your voice. Clone your sales process.',
  supportingCopy:
    'Build an AI version of your business that creates content, responds to leads, and helps operate your company 24/7.',
  primaryCta: 'BUILD MY DIGITAL TWIN',
  secondaryCta: 'EXPLORE THE SYSTEM',
  slogan: '6 CLONES. ONE DIGITAL TWIN.',
};

export const digitalTwinClones = [
  {
    id: 'writing',
    number: '01',
    title: 'Writing Clone',
    tagline: 'Your words. Everywhere.',
    capabilities: ['Emails', 'SMS', 'Captions', 'Blogs', 'FAQs', 'Follow-ups'],
  },
  {
    id: 'voice',
    number: '02',
    title: 'Voice Clone',
    tagline: 'Your voice. Everywhere.',
    capabilities: ['Voiceovers', 'Training content', 'Voicemail', 'Podcast narration', 'Permitted customer comms'],
  },
  {
    id: 'video',
    number: '03',
    title: 'Video Clone',
    tagline: 'Your face. Your message. At scale.',
    capabilities: ['Avatar explainers', 'Onboarding videos', 'Lead nurture clips', 'FAQ videos', 'Sales presentations'],
  },
  {
    id: 'sales',
    number: '04',
    title: 'Sales Clone',
    tagline: 'Qualify. Nurture. Close.',
    capabilities: ['Qualification', 'Objection support', 'Follow-ups', 'Booking rules', 'CRM notes'],
  },
  {
    id: 'content',
    number: '05',
    title: 'Content Engine',
    tagline: 'Create more. Faster.',
    capabilities: ['Posts', 'Email', 'SMS', 'Blogs', 'Ad copy', 'Video scripts'],
  },
  {
    id: 'support',
    number: '06',
    title: 'Customer Service Clone',
    tagline: 'Happy customers. 24/7.',
    capabilities: ['FAQs', 'Intake', 'Escalation', 'Ticket creation', 'Issue categorization'],
  },
];

export const digitalTwinOnboardingSteps = [
  { id: 'business', label: 'Business', description: 'Company details, services, operating hours, and owner context.' },
  { id: 'personality', label: 'Personality', description: 'Tone, vocabulary, values, phrases, and prohibited language.' },
  { id: 'knowledge', label: 'Knowledge', description: 'FAQs, pricing, SOPs, policies, source materials, and offers.' },
  { id: 'writing', label: 'Writing Clone', description: 'Approved examples, generated profile, and approve/edit/regenerate review.' },
  { id: 'voice', label: 'Voice', description: 'Explicit authorization, approved samples, and revocation controls.' },
  { id: 'video', label: 'Video', description: 'Likeness authorization, source assets, and provenance checks.' },
  { id: 'sales', label: 'Sales', description: 'ICP, objections, promotions, pricing boundaries, and escalation rules.' },
  { id: 'support', label: 'Customer Service', description: 'FAQs, cancellations, complaints, emergencies, and routing.' },
  { id: 'test-lab', label: 'Test Lab', description: 'Run scenarios, inspect sources, confidence, approvals, and risk flags.' },
  { id: 'activate', label: 'Activate', description: 'Checklist for consent, training, approvals, and autonomy limits.' },
];

export const digitalTwinCommandCenterTabs = [
  'Overview',
  'Brain',
  'Content',
  'Sales',
  'Support',
  'Voice',
  'Video',
  'Automations',
  'Approvals',
  'Activity',
  'Settings',
];

export const digitalTwinDashboardCards = [
  'Knowledge',
  'Writing',
  'Voice',
  'Video',
  'Sales',
  'Content',
  'Customer Service',
  'Automations',
  'Activity',
  'Analytics',
  'Permissions',
];

export const digitalTwinQuickActions = [
  'CREATE CONTENT',
  'TEST MY TWIN',
  'ADD KNOWLEDGE',
  'REVIEW ACTIVITY',
  'PAUSE TWIN',
  'EDIT SALES RULES',
];

export const digitalTwinAutonomyLevels = [
  {
    id: 'LEVEL_0' as const,
    label: 'Level 0 — Off',
    description: 'No actions. Training and configuration only.',
  },
  {
    id: 'LEVEL_1' as const,
    label: 'Level 1 — Draft Only',
    description: 'Generates outputs but cannot send or publish.',
  },
  {
    id: 'LEVEL_2' as const,
    label: 'Level 2 — Approval Required',
    description: 'Prepares actions and waits for tenant approval.',
  },
  {
    id: 'LEVEL_3' as const,
    label: 'Level 3 — Approved Automation',
    description: 'Executes only approved workflows within configured boundaries.',
  },
];

export const digitalTwinConsentTypes = [
  'Voice cloning',
  'Video likeness',
  'Avatar creation',
  'Synthetic speech',
  'Public content',
  'Sales communication',
  'Customer communication',
];

export function getDigitalTwinPackage(packageId: string | null | undefined) {
  return digitalTwinPackages.find((pkg) => pkg.id === packageId) ?? digitalTwinPackages[1];
}
