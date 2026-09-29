import type { DemoProfile, DemoTourStepId } from "./types";

export const DEMO_ADMIN_CODE = "WISE2-LEGACY";

const DEFAULT_THEME = {
  background: "#050505",
  backgroundSoft: "#0b0b0c",
  panel: "rgba(12, 12, 14, 0.88)",
  panelStrong: "rgba(18, 18, 20, 0.96)",
  gold: "#d8a43a",
  goldSoft: "rgba(216, 164, 58, 0.18)",
  blue: "#1177ff",
  blueSoft: "rgba(17, 119, 255, 0.18)",
  text: "#f6f0e4",
  textMuted: "#a9a39a",
  border: "rgba(216, 164, 58, 0.34)",
};

const JAVON_TOUR_STEPS: Array<Pick<DemoProfile["tourSteps"][number], "id" | "title" | "sectionId" | "eyebrow" | "body" | "assistantPrompt" | "actionLabel">> = [
  {
    id: "command-center",
    title: "Command Center",
    sectionId: "command-center",
    eyebrow: "1. The system at a glance",
    body: "This is your Command Center. WISE² brings your brand, leads, content, automation, and analytics into one operating system instead of scattering them across apps.",
    assistantPrompt: "Explain my dashboard like I just opened it for the first time.",
    actionLabel: "Open command center",
  },
  {
    id: "website",
    title: "Website",
    sectionId: "website",
    eyebrow: "2. The site that sells",
    body: "Your website is more than a brochure. It is wired directly into your business system so every visitor can become an inquiry, a lead, or a customer.",
    assistantPrompt: "Show me how the website turns traffic into revenue.",
    actionLabel: "Preview website",
  },
  {
    id: "lead-capture",
    title: "Lead Capture",
    sectionId: "lead-capture",
    eyebrow: "3. Inquiries become data",
    body: "When someone reaches out, WISE² captures the lead, tags the source, and routes the activity without spreadsheet work or manual copy-paste.",
    assistantPrompt: "Write a follow-up for the newest lead.",
    actionLabel: "Open the form",
  },
  {
    id: "crm",
    title: "CRM",
    sectionId: "crm",
    eyebrow: "4. Pipeline and follow-up",
    body: "Every lead has a stage, a history, and a next step. You can move people through the pipeline while the system tracks the work.",
    assistantPrompt: "Which lead should I contact next?",
    actionLabel: "Review CRM",
  },
  {
    id: "assistant",
    title: "AI Assistant",
    sectionId: "assistant",
    eyebrow: "5. Always available",
    body: "Ask the assistant about priorities, campaigns, follow-up, or the business plan. It stays aware of this demo and the current page.",
    assistantPrompt: "Give me today's priorities.",
    actionLabel: "Ask the assistant",
  },
  {
    id: "content-studio",
    title: "Content Studio",
    sectionId: "content-studio",
    eyebrow: "6. Create the next campaign",
    body: "Generate social posts, email, SMS, and website copy from one brand voice. WISE² keeps the creative consistent and the workflow fast.",
    assistantPrompt: "Create a social post for Crafted for the Moment.",
    actionLabel: "Generate content",
  },
  {
    id: "automation",
    title: "Automation",
    sectionId: "automation",
    eyebrow: "7. Work without the busywork",
    body: "A new lead can trigger tagging, follow-up, alerts, and analytics updates automatically. This is where the operating system pays for itself.",
    assistantPrompt: "Run the new lead workflow in demo mode.",
    actionLabel: "Run workflow",
  },
  {
    id: "journey",
    title: "Customer Journey",
    sectionId: "journey",
    eyebrow: "8. Discover to refer",
    body: "The customer journey is visible end to end, so you can see where people discover the brand, where they convert, and where they come back.",
    assistantPrompt: "What is the best next step after inquiry?",
    actionLabel: "View journey",
  },
  {
    id: "analytics",
    title: "Analytics",
    sectionId: "analytics",
    eyebrow: "9. Measure what matters",
    body: "Traffic, leads, conversion, campaigns, and workflow activity all live in one reporting view so decisions happen faster.",
    assistantPrompt: "Summarize the performance of this demo.",
    actionLabel: "Review analytics",
  },
  {
    id: "mobile",
    title: "Mobile Command Center",
    sectionId: "mobile",
    eyebrow: "10. On the go",
    body: "You can review leads, reply to customers, and check metrics from your phone with the same premium experience.",
    assistantPrompt: "Show me how this looks on mobile.",
    actionLabel: "Preview mobile",
  },
  {
    id: "pricing",
    title: "WISE² Starter Plan",
    sectionId: "pricing",
    eyebrow: "11. Ready to activate",
    body: "The demo is designed to hand off cleanly into the starter plan with a clear confirmation step before any real checkout flow.",
    assistantPrompt: "Explain how the starter plan works.",
    actionLabel: "View pricing",
  },
  {
    id: "legacy",
    title: "Legacy Moment",
    sectionId: "legacy",
    eyebrow: "12. The transformation",
    body: "This closes the loop: one operating system for your brand, your customers, your marketing, your automations, your analytics, and your AI assistant.",
    assistantPrompt: "Summarize the value of the platform.",
    actionLabel: "Finish tour",
  },
];

function toTitleCaseSlug(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function clampCurrency(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function buildTourSteps() {
  return JAVON_TOUR_STEPS.map((step) => ({
    ...step,
    body: step.body,
  }));
}

export const JAVON_DEMO_PROFILE: DemoProfile = {
  slug: "javon",
  prospectName: "Javon",
  companyName: "Javon's Spirits",
  industry: "Luxury Spirits",
  crest: "JO",
  brandTagline: "Crafted for the Moment.",
  brandPromise: "Built for Today. Ready for Legacy.",
  poweredBy: "Powered by WISE² Business OS",
  legacyLine: "One operating system. One premium brand. One clear path to growth.",
  heroTitle: "WELCOME, JAVON",
  heroSubtitle: "Your Business. Your Brand. Your Operating System.",
  heroCopy:
    "We built this experience to show you what happens when your brand, customers, marketing, automation, analytics, and AI operate from one system.",
  primaryCta: "START MY GUIDED TOUR",
  secondaryCta: "EXPLORE ON MY OWN",
  assistantName: "WISE² IMP - JAVON'S BUSINESS GUIDE",
  assistantGreeting:
    "What's up, Javon. I'm your WISE² AI business assistant. This demo has been configured around Javon's Spirits so you can see what WISE² would look like running behind your business. I'll walk you through your website, leads, customers, marketing, automation, analytics, and AI tools. You can follow my tour or ask me questions at any time.",
  assistantWelcome:
    "I can guide you through the full operating system, answer questions about the business, or help you run the demo in plain language.",
  assistantPrompt:
    "Answer as a luxury business assistant who understands the current demo, Javon's Spirits, the current route, and the guided tour stage.",
  offerTitle: "WISE² Starter Plan",
  offerDescription:
    "A premium landing page, lead capture, CRM, automation, content tools, analytics, and AI guidance configured for Javon's Spirits.",
  starterPlanName: "WISE² STARTER PLAN",
  starterPlanSubtitle: "ONE-TIME SETUP — $499 | WISE² BUSINESS OS — $99/MONTH",
  pricing: {
    setupFee: 499,
    monthlyPrice: 99,
    currency: "USD",
  },
  theme: DEFAULT_THEME,
  brandVoice: "Premium, authentic, culture-driven, ambitious, approachable",
  modules: [
    "Brand identity",
    "Premium website",
    "Lead capture",
    "CRM pipeline",
    "Follow-up automation",
    "AI assistant",
    "Content studio",
    "Analytics",
  ],
  websiteSections: [
    "Premium hero",
    "Brand story",
    "Collection",
    "Lifestyle",
    "Contact",
    "Lead capture",
    "Social links",
    "Age-appropriate disclaimer",
  ],
  demoMetrics: {
    leads: 18,
    customers: 7,
    websiteVisitors: 1842,
    inquiries: 46,
    campaigns: 6,
    followUps: 21,
    workflowActivity: 88,
    pipelineValue: 14800,
    conversionRate: 24,
    demoDataLabel: "DEMO DATA",
  },
  leadSources: [
    { label: "Instagram", value: 36 },
    { label: "Website", value: 28 },
    { label: "Referral", value: 19 },
    { label: "Events", value: 17 },
  ],
  trafficSeries: [
    { label: "Mon", value: 162 },
    { label: "Tue", value: 198 },
    { label: "Wed", value: 245 },
    { label: "Thu", value: 221 },
    { label: "Fri", value: 280 },
    { label: "Sat", value: 332 },
    { label: "Sun", value: 273 },
  ],
  conversionSeries: [
    { label: "Visitors", value: 1842 },
    { label: "Inquiries", value: 46 },
    { label: "Qualified", value: 14 },
    { label: "Customers", value: 7 },
  ],
  pipelineSeries: [
    { label: "New Lead", value: 8 },
    { label: "Contacted", value: 6 },
    { label: "Interested", value: 4 },
    { label: "Qualified", value: 3 },
    { label: "Customer", value: 7 },
  ],
  insights: [
    {
      title: "AI INSIGHT",
      body: "Social traffic generated the highest number of demo inquiries this week.",
    },
    {
      title: "RECOMMENDED ACTION",
      body: "Create a follow-up campaign for leads who have not responded.",
    },
  ],
  workflowNodes: [
    { id: "save", label: "Save Lead", detail: "Add the inquiry to the CRM" },
    { id: "classify", label: "AI Classifies Interest", detail: "Identify the buyer intent" },
    { id: "stage", label: "Assign Pipeline Stage", detail: "Move the lead into the right lane" },
    { id: "welcome", label: "Prepare Welcome Message", detail: "Draft the first reply" },
    { id: "task", label: "Create Follow-Up Task", detail: "Queue the next touchpoint" },
    { id: "notify", label: "Notify Dashboard", detail: "Surface the activity immediately" },
    { id: "analytics", label: "Update Analytics", detail: "Track the demo interaction" },
  ],
  customerJourney: ["Discover", "Visit", "Inquire", "Follow-Up", "Convert", "Retain", "Refer"],
  socialProof:
    "Crafted for the Moment. Built for Today. Ready for Legacy. Powered by WISE².",
  disclaimer:
    "Age 21+ only. Demo content is illustrative and not a live alcohol commerce flow. Licensing, shipping, fulfillment, and payment eligibility must be configured before any real commerce.",
  customNotes: [
    "State availability, licensing, and shipping restrictions remain configurable placeholders.",
    "Outbound SMS, email, and checkout actions are simulated in DEMO_MODE unless explicitly approved.",
  ],
  tourSteps: buildTourSteps(),
  pricingHandoff:
    "I'M READY TO GET STARTED takes you to a confirmation step first. Demo mode will never submit a real charge without a deliberate handoff.",
  mobileCallout:
    "The same operating system works on phones, tablets, laptops, and desktop screens.",
};

function buildGenericMetrics(slug: string) {
  const seed = Math.max(1, slug.length * 7);
  return {
    leads: 10 + (seed % 11),
    customers: 3 + (seed % 6),
    websiteVisitors: 900 + seed * 11,
    inquiries: 22 + (seed % 17),
    campaigns: 4 + (seed % 4),
    followUps: 8 + (seed % 13),
    workflowActivity: 40 + (seed % 50),
    pipelineValue: 6500 + seed * 120,
    conversionRate: 14 + (seed % 19),
    demoDataLabel: "DEMO DATA",
  };
}

export function createGeneratedDemoProfile(slug: string): DemoProfile {
  const name = toTitleCaseSlug(slug);
  const businessName = `${name} Business OS`;
  const metrics = buildGenericMetrics(slug);

  return {
    ...JAVON_DEMO_PROFILE,
    slug,
    prospectName: name,
    companyName: businessName,
    industry: "Premium Services",
    crest: name.slice(0, 2).toUpperCase(),
    brandTagline: "Crafted for the Moment.",
    brandPromise: "Built for Today. Ready for Legacy.",
    heroTitle: `WELCOME, ${name.toUpperCase()}`,
    heroCopy: `This demo is preconfigured for ${businessName}, showing how WISE² can build, automate, operate, and grow the business from one operating system.`,
    assistantGreeting: `What's up, ${name}. I'm your WISE² AI business assistant. This demo has been configured around ${businessName} so you can see what WISE² would look like running behind your business.`,
    assistantWelcome:
      "I can guide you through the full operating system, answer questions about the business, or help you run the demo in plain language.",
    assistantPrompt: `Answer as a premium business assistant for ${businessName}.`,
    offerTitle: `${name} Starter Plan`,
    offerDescription: `A premium experience with lead capture, CRM, automation, content tools, analytics, and AI guidance configured for ${businessName}.`,
    starterPlanSubtitle: "ONE-TIME SETUP — $499 | WISE² BUSINESS OS — $99/MONTH",
    demoMetrics: metrics,
    leadSources: JAVON_DEMO_PROFILE.leadSources,
    trafficSeries: JAVON_DEMO_PROFILE.trafficSeries,
    conversionSeries: JAVON_DEMO_PROFILE.conversionSeries,
    pipelineSeries: JAVON_DEMO_PROFILE.pipelineSeries,
    insights: JAVON_DEMO_PROFILE.insights,
    workflowNodes: JAVON_DEMO_PROFILE.workflowNodes,
    customerJourney: JAVON_DEMO_PROFILE.customerJourney,
    socialProof: `${businessName} powered by WISE².`,
    disclaimer: JAVON_DEMO_PROFILE.disclaimer,
    customNotes: JAVON_DEMO_PROFILE.customNotes,
    tourSteps: JAVON_DEMO_PROFILE.tourSteps.map((step) => ({
      ...step,
      body: step.body.replace(/Javon's Spirits/g, businessName),
    })),
    pricingHandoff: JAVON_DEMO_PROFILE.pricingHandoff,
    mobileCallout: JAVON_DEMO_PROFILE.mobileCallout,
  };
}

export const BUILTIN_DEMO_PROFILES: Record<string, DemoProfile> = {
  javon: JAVON_DEMO_PROFILE,
};

export function resolveDemoProfile(slug: string) {
  return BUILTIN_DEMO_PROFILES[slug] ?? createGeneratedDemoProfile(slug);
}

export function sanitizeCurrency(value: number) {
  return clampCurrency(value);
}

export function createGeneratedProspectLabel(slug: string) {
  return toTitleCaseSlug(slug);
}

export function isValidTourStepId(value: string): value is DemoTourStepId {
  return JAVON_TOUR_STEPS.some((step) => step.id === value);
}

