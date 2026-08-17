/**
 * Wise Imp knowledge base — the only source of truth injected into the AI's
 * system prompt. Everything here is either pulled directly from existing,
 * already-live site content (consulting services, FAQ, contact info) or left
 * as an explicit placeholder. Do not add invented pricing, timelines, or
 * guarantees — extend PROJECT_CATEGORIES / FAQ / POLICIES with real copy as
 * it's supplied instead.
 *
 * Maintainable by editing this file directly (no CMS in this pass — see the
 * Wise Imp implementation plan for the Phase 2 non-engineer editor).
 */

export interface ProjectCategory {
  id: string;
  label: string;
  description: string;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'brand-creation', label: 'Brand Creation', description: 'Naming, identity, visual system, brand voice.' },
  { id: 'website-build', label: 'Website Build', description: 'A new site or a rebuild of an existing one.' },
  { id: 'app-or-platform', label: 'App or Platform', description: 'A web or mobile app, or a multi-user platform.' },
  { id: 'product-development', label: 'Product Development', description: 'A physical or digital product, from concept to launch.' },
  { id: 'marketing-campaign', label: 'Marketing Campaign', description: 'A specific campaign or launch push.' },
  { id: 'music-and-entertainment', label: 'Music and Entertainment', description: 'Audio production, releases, entertainment content.' },
  { id: 'ai-and-automation', label: 'AI and Automation', description: 'Automating workflows, AI-assisted tools and agents.' },
  { id: 'business-system', label: 'Business System', description: 'Operations, CRM, internal tooling, process systems.' },
  { id: 'full-a-to-z-build', label: 'Full A-to-Z Build', description: 'Everything above, combined into one build.' },
  { id: 'something-new', label: 'Something New', description: "Doesn't fit the categories above — tell us what you have in mind." },
];

export interface ConsultingService {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  deliverables: string[];
  href: string;
}

// Mirrors apps/website/app/consulting/page.tsx SERVICES — already-live, approved
// pricing and copy. Keep these two in sync if consulting/page.tsx changes.
export const CONSULTING_SERVICES: ConsultingService[] = [
  {
    id: 'audit',
    title: 'AI Business Audit',
    price: '$149',
    duration: '60 minutes',
    description:
      'Complete business systems audit. We analyze your workflows, identify AI opportunities, and deliver a personalized automation roadmap.',
    deliverables: ['AI Readiness Score (0-100)', 'Opportunity Report', 'Quick-Win Recommendations', 'Priority 90-Day Plan'],
    href: '/consulting/audit',
  },
  {
    id: 'live-build',
    title: 'WISE² Live Build Session',
    price: '$497',
    duration: '60 minutes',
    description:
      "Build something real with us. Choose your project, and we'll implement it live during the session. You leave with working code.",
    deliverables: ['Working Implementation', 'Configured Systems', 'Integration Setup', 'Next-Steps Roadmap'],
    href: '/consulting/live-build',
  },
  {
    id: 'implementation-day',
    title: 'AI Implementation Day',
    price: '$997',
    duration: 'Up to 6 hours',
    description:
      'Comprehensive implementation for larger scope projects. Multiple automations, integrations, dashboards, and workflows built together.',
    deliverables: ['Multiple Automations', 'AI Assistants', 'Custom Integrations', 'Training & Documentation'],
    href: '/consulting/implementation-day',
  },
  {
    id: 'management',
    title: 'WISE² Management',
    price: '$297/mo',
    duration: 'Ongoing',
    description: 'Recurring management and optimization. Monthly reviews, system tuning, new automations, and ongoing support.',
    deliverables: ['Monthly Strategy Call', 'System Optimization', 'AI Monitoring', 'Priority Support'],
    href: '/consulting/management',
  },
];

// Mirrors apps/website/app/consulting/page.tsx FAQ.
export const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Do I need technical experience?',
    a: 'Not at all. We handle the technical side. You just need to know your business and be ready to make decisions.',
  },
  {
    q: 'What if the project takes longer than the session?',
    a: "We scope projects to fit the time. If something's too big, we recommend the longer Implementation Day or offer Management follow-ups.",
  },
  {
    q: 'Can you work with my specific tools/platforms?',
    a: 'We integrate with 500+ platforms and tools. If it has an API or Zapier connector, we can likely connect it.',
  },
  {
    q: 'What happens after the session?',
    a: 'You get a deliverable report, a roadmap for next steps, and an option to subscribe to our Management plan.',
  },
  {
    q: 'Is the session recorded?',
    a: 'Yes, we record every session for your reference and for our follow-up communications.',
  },
  {
    q: 'Can you manage the system afterward?',
    a: 'Yes! We offer our Management plan ($297/month) for ongoing optimization and support.',
  },
];

export const CONTACT = {
  email: 'hello@wise2.net',
  supportEmail: 'contact@wise2.net',
  contactPage: '/contact',
  consultingPage: '/consulting',
};

export const ABOUT = {
  summary:
    'WISE² is a creator operating system — an "Organized Chaos Command Center" that helps people and businesses turn ideas into completed projects. One system, several powered businesses, built by a small team who use it to run their own operations too.',
};

/**
 * Explicit placeholders. The brief requires Wise Imp to never invent pricing,
 * timelines, guarantees, or policy — anything not covered by the fields above
 * should be met with "let me connect you with the team" rather than a guess.
 * Add real copy here as it's supplied; until then these stay empty/TODO.
 */
export const POLICIES: Array<{ topic: string; content: string }> = [
  // TODO: refund policy, SLA/turnaround guarantees, data/privacy specifics
  // beyond what's already on /privacy and /terms.
];
