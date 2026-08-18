export type DemoSectionId =
  | "command-center"
  | "website"
  | "lead-capture"
  | "crm"
  | "assistant"
  | "content-studio"
  | "automation"
  | "journey"
  | "analytics"
  | "mobile"
  | "pricing"
  | "legacy"
  | "admin";

export type DemoTourStepId =
  | "command-center"
  | "website"
  | "lead-capture"
  | "crm"
  | "assistant"
  | "content-studio"
  | "automation"
  | "journey"
  | "analytics"
  | "mobile"
  | "pricing"
  | "legacy"
  | "admin";

export interface DemoTheme {
  background: string;
  backgroundSoft: string;
  panel: string;
  panelStrong: string;
  gold: string;
  goldSoft: string;
  blue: string;
  blueSoft: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface DemoPricing {
  setupFee: number;
  monthlyPrice: number;
  currency: "USD";
}

export interface DemoTourStep {
  id: DemoTourStepId;
  title: string;
  sectionId: DemoSectionId;
  eyebrow: string;
  body: string;
  assistantPrompt: string;
  actionLabel: string;
}

export interface DemoLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  source: string;
  stage: "new" | "contacted" | "interested" | "qualified" | "customer";
  statusLabel: string;
  createdAt: string;
  notes: string[];
  followUpAt: string;
}

export interface DemoWorkflowNode {
  id: string;
  label: string;
  detail: string;
}

export interface DemoEvent {
  id: string;
  type:
    | "demo_viewed"
    | "tour_started"
    | "tour_step_viewed"
    | "tour_completed"
    | "feature_opened"
    | "ai_question_asked"
    | "demo_lead_created"
    | "pricing_viewed"
    | "activation_clicked"
    | "workflow_executed"
    | "content_generated";
  label: string;
  detail: string;
  createdAt: string;
}

export interface DemoAssistantMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  chips?: string[];
}

export interface DemoInsight {
  title: string;
  body: string;
}

export interface DemoMetrics {
  leads: number;
  customers: number;
  websiteVisitors: number;
  inquiries: number;
  campaigns: number;
  followUps: number;
  workflowActivity: number;
  pipelineValue: number;
  conversionRate: number;
  demoDataLabel: string;
}

export interface DemoProfile {
  slug: string;
  prospectName: string;
  companyName: string;
  industry: string;
  crest: string;
  brandTagline: string;
  brandPromise: string;
  poweredBy: string;
  legacyLine: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCopy: string;
  primaryCta: string;
  secondaryCta: string;
  assistantName: string;
  assistantGreeting: string;
  assistantWelcome: string;
  assistantPrompt: string;
  offerTitle: string;
  offerDescription: string;
  starterPlanName: string;
  starterPlanSubtitle: string;
  pricing: DemoPricing;
  theme: DemoTheme;
  brandVoice: string;
  modules: string[];
  websiteSections: string[];
  demoMetrics: DemoMetrics;
  leadSources: Array<{ label: string; value: number }>;
  trafficSeries: Array<{ label: string; value: number }>;
  conversionSeries: Array<{ label: string; value: number }>;
  pipelineSeries: Array<{ label: string; value: number }>;
  insights: DemoInsight[];
  workflowNodes: DemoWorkflowNode[];
  customerJourney: string[];
  socialProof: string;
  disclaimer: string;
  customNotes: string[];
  tourSteps: DemoTourStep[];
  pricingHandoff: string;
  mobileCallout: string;
}

export interface DemoAssistantContext {
  prospect: {
    name: string;
    companyName: string;
    industry: string;
    brandVoice: string;
  };
  route: string;
  currentSection: DemoSectionId;
  currentTourStep: DemoTourStepId | null;
  metrics: DemoMetrics;
  modules: string[];
  recentEvents: DemoEvent[];
  pricing: DemoPricing;
  demoMode: true;
  assistantPrompt: string;
  leadCount: number;
  activeLead: DemoLead | null;
}

export interface DemoRuntimeState {
  demoMode: true;
  assistantOpen: boolean;
  assistantWelcomeSeen: boolean;
  assistantMode: "open" | "compact";
  currentSection: DemoSectionId;
  tourStarted: boolean;
  tourFinished: boolean;
  currentTourStepId: DemoTourStepId | null;
  completedTourStepIds: DemoTourStepId[];
  skippedTourStepIds: DemoTourStepId[];
  resumedTourCount: number;
  tourLaunchCount: number;
  recentEvents: DemoEvent[];
  assistantMessages: DemoAssistantMessage[];
  leads: DemoLead[];
  selectedLeadId: string | null;
  contentTheme: string;
  contentAssets: DemoContentAsset[];
  workflowProgress: string[];
  workflowRunning: boolean;
  pricingAckOpen: boolean;
  pricingAcknowledged: boolean;
  pricingConfirmed: boolean;
  adminUnlocked: boolean;
  adminMessage: string;
}

export interface DemoContentAsset {
  channel: "Instagram" | "Facebook" | "TikTok" | "Email" | "SMS" | "Website";
  title: string;
  body: string;
}

export interface DemoLeadInput {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  source: string;
}
