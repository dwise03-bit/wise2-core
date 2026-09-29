import type {
  DemoAssistantContext,
  DemoContentAsset,
  DemoEvent,
  DemoLead,
  DemoLeadInput,
  DemoMetrics,
  DemoProfile,
  DemoRuntimeState,
  DemoTourStep,
  DemoTourStepId,
  DemoSectionId,
} from "./types";
import { isValidTourStepId, sanitizeCurrency } from "./profiles";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function leadStageLabel(stage: DemoLead["stage"]) {
  switch (stage) {
    case "new":
      return "New Lead";
    case "contacted":
      return "Contacted";
    case "interested":
      return "Interested";
    case "qualified":
      return "Qualified";
    case "customer":
      return "Customer";
  }
}

function stageOrder(stage: DemoLead["stage"]) {
  const order: DemoLead["stage"][] = ["new", "contacted", "interested", "qualified", "customer"];
  return order.indexOf(stage);
}

export function createDemoLead(input: DemoLeadInput): DemoLead {
  const createdAt = nowIso();
  return {
    id: id("lead"),
    ...input,
    stage: "new",
    statusLabel: leadStageLabel("new"),
    createdAt,
    notes: ["Imported from Javon's Spirits demo inquiry."],
    followUpAt: createdAt,
  };
}

export function createInitialDemoState(profile: DemoProfile): DemoRuntimeState {
  return {
    demoMode: true,
    assistantOpen: true,
    assistantWelcomeSeen: false,
    assistantMode: "open",
    currentSection: "command-center",
    tourStarted: false,
    tourFinished: false,
    currentTourStepId: null,
    completedTourStepIds: [],
    skippedTourStepIds: [],
    resumedTourCount: 0,
    tourLaunchCount: 0,
    recentEvents: [
      {
        id: id("event"),
        type: "demo_viewed",
        label: "Demo viewed",
        detail: `Opened the ${profile.companyName} demo.`,
        createdAt: nowIso(),
      },
    ],
    assistantMessages: [
      {
        id: id("assistant"),
        role: "assistant",
        text: profile.assistantGreeting,
        chips: [
          "START TOUR",
          "SHOW ME HOW WISE² MAKES MONEY",
          "LET ME EXPLORE",
        ],
      },
    ],
    leads: [
      {
        id: "lead-mia",
        name: "Mia Thompson",
        email: "mia@hotelbarrel.com",
        phone: "(555) 019-2048",
        interest: "Private tasting partnership",
        message: "Interested in a premium launch campaign for the holiday season.",
        source: "Instagram",
        stage: "qualified",
        statusLabel: leadStageLabel("qualified"),
        createdAt: nowIso(),
        notes: ["Requested a call this week.", "Prefers text follow-up."],
        followUpAt: nowIso(),
      },
      {
        id: "lead-omar",
        name: "Omar Fields",
        email: "omar@vaultclub.com",
        phone: "(555) 019-8188",
        interest: "Retail distribution inquiry",
        message: "Wants to understand state availability and wholesale terms.",
        source: "Website",
        stage: "contacted",
        statusLabel: leadStageLabel("contacted"),
        createdAt: nowIso(),
        notes: ["Sent age-gate and licensing info.", "Awaiting response."],
        followUpAt: nowIso(),
      },
    ],
    selectedLeadId: "lead-mia",
    contentTheme: "Crafted for the Moment",
    contentAssets: [],
    workflowProgress: [],
    workflowRunning: false,
    pricingAckOpen: false,
    pricingAcknowledged: false,
    pricingConfirmed: false,
    adminUnlocked: false,
    adminMessage: "",
  };
}

export function getCurrentLead(state: DemoRuntimeState) {
  return state.leads.find((lead) => lead.id === state.selectedLeadId) ?? state.leads[0] ?? null;
}

export function getCurrentTourStep(profile: DemoProfile, state: DemoRuntimeState) {
  if (!state.currentTourStepId) return null;
  return profile.tourSteps.find((step) => step.id === state.currentTourStepId) ?? null;
}

export function getNextTourStep(profile: DemoProfile, stepId: DemoTourStepId | null) {
  if (!stepId) return profile.tourSteps[0] ?? null;
  const index = profile.tourSteps.findIndex((step) => step.id === stepId);
  return profile.tourSteps[index + 1] ?? null;
}

export function getPreviousTourStep(profile: DemoProfile, stepId: DemoTourStepId | null) {
  if (!stepId) return null;
  const index = profile.tourSteps.findIndex((step) => step.id === stepId);
  return profile.tourSteps[index - 1] ?? null;
}

export function syncTourStepId(stepId: string | null, profile: DemoProfile) {
  if (!stepId) return null;
  return isValidTourStepId(stepId) && profile.tourSteps.some((step) => step.id === stepId)
    ? stepId
    : null;
}

export function createEvent(
  type: DemoEvent["type"],
  label: string,
  detail: string
): DemoEvent {
  return {
    id: id("event"),
    type,
    label,
    detail,
    createdAt: nowIso(),
  };
}

export function startTour(profile: DemoProfile, state: DemoRuntimeState) {
  const step = getNextTourStep(profile, state.currentTourStepId);
  const nextState: DemoRuntimeState = {
    ...state,
    tourStarted: true,
    tourFinished: false,
    tourLaunchCount: state.tourLaunchCount + 1,
    currentSection: step?.sectionId ?? state.currentSection,
    currentTourStepId: step?.id ?? null,
    completedTourStepIds: step ? [...state.completedTourStepIds] : state.completedTourStepIds,
    assistantMessages: [
      ...state.assistantMessages,
      {
        id: id("assistant"),
        role: "assistant" as const,
        text: "The guided tour is live. I will keep us oriented as we move through the system.",
        chips: ["Next step", "Skip tour", "Ask AI"],
      },
    ],
    recentEvents: [
      ...state.recentEvents,
      createEvent("tour_started", "Tour started", `Started the tour for ${profile.companyName}.`),
      ...(step
        ? [
            createEvent(
              "tour_step_viewed",
              `Viewed ${step.title}`,
              `Opened the ${step.title} step.`
            ),
          ]
        : []),
    ],
  };
  return nextState;
}

export function resumeTour(profile: DemoProfile, state: DemoRuntimeState) {
  const nextStep = getNextTourStep(profile, state.currentTourStepId);
  return {
    ...state,
    resumedTourCount: state.resumedTourCount + 1,
    tourStarted: true,
    currentSection: nextStep?.sectionId ?? state.currentSection,
    currentTourStepId: nextStep?.id ?? state.currentTourStepId,
    recentEvents: [
      ...state.recentEvents,
      createEvent(
        "feature_opened",
        "Tour resumed",
        `Resumed the tour at ${nextStep?.title ?? "the current step"}.`
      ),
    ],
  };
}

export function goToSection(state: DemoRuntimeState, sectionId: DemoSectionId) {
  return {
    ...state,
    currentSection: sectionId,
    recentEvents: [
      ...state.recentEvents,
      createEvent("feature_opened", `Opened ${sectionId}`, `Opened the ${sectionId} section.`),
    ],
  };
}

export function completeTourStep(profile: DemoProfile, state: DemoRuntimeState, stepId?: DemoTourStepId) {
  const current = stepId ?? state.currentTourStepId;
  if (!current) return state;
  const step = profile.tourSteps.find((tourStep) => tourStep.id === current) ?? null;
  const completedTourStepIds = state.completedTourStepIds.includes(current)
    ? state.completedTourStepIds
    : [...state.completedTourStepIds, current];
  const nextStep = step ? getNextTourStep(profile, current) : null;
  const finished = !nextStep;

  return {
    ...state,
    completedTourStepIds,
    tourFinished: finished,
    currentTourStepId: nextStep?.id ?? null,
    currentSection: nextStep?.sectionId ?? state.currentSection,
    recentEvents: [
      ...state.recentEvents,
      createEvent(
        finished ? "tour_completed" : "tour_step_viewed",
        finished ? "Tour completed" : `Viewed ${step?.title ?? current}`,
        finished
          ? `Finished the tour for ${profile.companyName}.`
          : `Moved to ${nextStep?.title ?? "the next step"}.`
      ),
    ],
  };
}

export function skipTourStep(state: DemoRuntimeState, stepId?: DemoTourStepId) {
  const current = stepId ?? state.currentTourStepId;
  if (!current) return state;
  return {
    ...state,
    skippedTourStepIds: state.skippedTourStepIds.includes(current)
      ? state.skippedTourStepIds
      : [...state.skippedTourStepIds, current],
    recentEvents: [
      ...state.recentEvents,
      createEvent("feature_opened", "Tour step skipped", `Skipped ${current}.`),
    ],
  };
}

export function addTourAssistMessage(
  state: DemoRuntimeState,
  text: string,
  chips?: string[]
): DemoRuntimeState {
  return {
    ...state,
    assistantMessages: [
      ...state.assistantMessages,
      {
        id: id("assistant"),
        role: "assistant" as const,
        text,
        chips,
      },
    ],
  };
}

export function addUserAssistantMessage(state: DemoRuntimeState, text: string): DemoRuntimeState {
  return {
    ...state,
    assistantMessages: [
      ...state.assistantMessages,
      {
        id: id("user"),
        role: "user" as const,
        text,
      },
    ],
  };
}

export function createAssistantContext(
  profile: DemoProfile,
  state: DemoRuntimeState,
  route: string
): DemoAssistantContext {
  return {
    prospect: {
      name: profile.prospectName,
      companyName: profile.companyName,
      industry: profile.industry,
      brandVoice: profile.brandVoice,
    },
    route,
    currentSection: state.currentSection,
    currentTourStep: state.currentTourStepId,
    metrics: getDemoMetrics(profile, state),
    modules: profile.modules,
    recentEvents: state.recentEvents.slice(-6),
    pricing: profile.pricing,
    demoMode: true,
    assistantPrompt: profile.assistantPrompt,
    leadCount: state.leads.length,
    activeLead: getCurrentLead(state),
  };
}

export function getDemoMetrics(profile: DemoProfile, state: DemoRuntimeState): DemoMetrics {
  const leads = state.leads.length;
  const customers = state.leads.filter((lead) => lead.stage === "customer").length;
  const inquiries = profile.demoMetrics.inquiries + Math.max(0, leads - 2) * 2;
  const followUps = profile.demoMetrics.followUps + state.completedTourStepIds.length;
  const workflowActivity = profile.demoMetrics.workflowActivity + state.workflowProgress.length * 6;
  const conversionRate = Math.min(
    100,
    Math.round((customers / Math.max(leads, 1)) * 100) || profile.demoMetrics.conversionRate
  );
  const pipelineValue =
    profile.demoMetrics.pipelineValue +
    state.leads.reduce((total, lead) => total + (stageOrder(lead.stage) + 1) * 550, 0);

  return {
    ...profile.demoMetrics,
    leads,
    customers,
    inquiries,
    followUps,
    workflowActivity,
    pipelineValue,
    conversionRate,
  };
}

export function createLeadFromInput(profile: DemoProfile, input: DemoLeadInput) {
  const lead = createDemoLead(input);
  const statePatch = createEvent(
    "demo_lead_created",
    "Demo lead created",
    `Captured ${lead.name} from ${lead.source}.`
  );
  const demoMetrics = profile.demoMetrics;
  const nextMetrics = {
    ...demoMetrics,
    leads: demoMetrics.leads + 1,
    inquiries: demoMetrics.inquiries + 1,
    followUps: demoMetrics.followUps + 1,
    pipelineValue: demoMetrics.pipelineValue + 550,
    conversionRate: demoMetrics.conversionRate,
  };
  return {
    lead,
    event: statePatch,
    metrics: nextMetrics,
  };
}

export function addLead(
  profile: DemoProfile,
  state: DemoRuntimeState,
  input: DemoLeadInput
): DemoRuntimeState {
  const { lead, event } = createLeadFromInput(profile, input);
  return {
    ...state,
    leads: [lead, ...state.leads],
    selectedLeadId: lead.id,
    recentEvents: [...state.recentEvents, event],
    assistantMessages: [
      ...state.assistantMessages,
      {
        id: id("assistant"),
        role: "assistant" as const,
        text: `That lead just entered your system automatically. You didn't have to copy anything into a spreadsheet or remember to follow up later.`,
        chips: ["Open CRM", "Create follow-up", "Ask AI"],
      },
    ],
  };
}

export function updateLeadStage(state: DemoRuntimeState, leadId: string, stage: DemoLead["stage"]) {
  return {
    ...state,
    leads: state.leads.map((lead) =>
      lead.id === leadId
        ? {
            ...lead,
            stage,
            statusLabel: leadStageLabel(stage),
            notes: [...lead.notes, `Stage updated to ${leadStageLabel(stage)}.`],
          }
        : lead
    ),
    selectedLeadId: leadId,
    recentEvents: [
      ...state.recentEvents,
      createEvent("feature_opened", "Lead stage updated", `Lead ${leadId} moved to ${stage}.`),
    ],
  };
}

export function addLeadNote(state: DemoRuntimeState, leadId: string, note: string) {
  return {
    ...state,
    leads: state.leads.map((lead) =>
      lead.id === leadId ? { ...lead, notes: [note, ...lead.notes] } : lead
    ),
    recentEvents: [
      ...state.recentEvents,
      createEvent("feature_opened", "Lead note added", note),
    ],
  };
}

export function createContentAssets(profile: DemoProfile, theme: string): DemoContentAsset[] {
  const tone = profile.brandVoice;
  return [
    {
      channel: "Instagram",
      title: "Premium launch post",
      body: `${theme} on the feed. A cinematic brand post in ${tone.toLowerCase()} voice that invites the audience to experience ${profile.companyName}.`,
    },
    {
      channel: "Facebook",
      title: "Community story",
      body: `Tell the story behind ${profile.companyName}, the craft, and the legacy. Position the offer with warmth, confidence, and clarity.`,
    },
    {
      channel: "TikTok",
      title: "Short-form concept",
      body: `A 15-second concept showing the bottle, the moment, and the vibe. End with "${profile.brandTagline}" and a subtle WISE² callout.`,
    },
    {
      channel: "Email",
      title: "Campaign draft",
      body: `Subject: Crafted for the Moment. Body: A premium launch message that drives curiosity, follows the brand voice, and points toward the WISE² starter plan.`,
    },
    {
      channel: "SMS",
      title: "Follow-up text",
      body: `Quick check-in: thanks for reaching out to ${profile.companyName}. We kept your inquiry in WISE² and will follow up with the right next step.`,
    },
    {
      channel: "Website",
      title: "Homepage banner",
      body: `Headline: ${profile.heroTitle}. Subhead: ${profile.heroSubtitle}. CTA: ${profile.primaryCta}.`,
    },
  ];
}

export function runWorkflow(profile: DemoProfile, state: DemoRuntimeState) {
  return {
    ...state,
    workflowRunning: true,
    workflowProgress: [],
    recentEvents: [
      ...state.recentEvents,
      createEvent(
        "workflow_executed",
        "Workflow executed",
        `Ran the ${profile.companyName} website lead workflow in DEMO mode.`
      ),
    ],
  };
}

export function finishWorkflow(state: DemoRuntimeState) {
  return {
    ...state,
    workflowRunning: false,
  };
}

export function advanceWorkflowStep(state: DemoRuntimeState, nodeId: string, label: string) {
  if (state.workflowProgress.includes(nodeId)) return state;

  return {
    ...state,
    workflowProgress: [...state.workflowProgress, nodeId],
    recentEvents: [
      ...state.recentEvents,
      createEvent("workflow_executed", "Workflow node executed", label),
    ],
  };
}

export function buildAssistantReply(
  profile: DemoProfile,
  state: DemoRuntimeState,
  question: string,
  route: string
) {
  const text = question.trim();
  const normalized = text.toLowerCase();
  const context = createAssistantContext(profile, state, route);

  let reply = `${profile.companyName} is configured in DEMO mode so you can explore safely. `;
  let chips = ["Explain dashboard", "Show me leads", "Make a plan"];
  let sectionId: DemoSectionId = state.currentSection;

  if (/money|revenue|pricing|starter plan|sell/i.test(text)) {
    reply = `WISE² creates value by turning website traffic into leads, follow-up, content, and analytics inside one system. The starter plan is ${formatCurrency(profile.pricing.setupFee)} setup plus ${formatCurrency(profile.pricing.monthlyPrice)} per month, and DEMO_MODE will always stop before any real checkout.`;
    chips = ["View pricing", "Show checkout", "Explain value"];
    sectionId = "pricing";
  } else if (/tour|walk|begin/.test(normalized) || /^start(?!er\b)/.test(normalized)) {
    reply =
      "I can start the guided tour and keep us moving through the business system step by step.";
    chips = ["Start tour", "Skip tour", "Replay intro"];
    sectionId = "command-center";
  } else if (/lead|crm|follow-up|contact/i.test(text)) {
    reply = `Your CRM is showing ${context.metrics.leads} leads and ${context.metrics.followUps} follow-ups in motion. The safest next move is to contact the newest qualified lead and schedule the next touchpoint today.`;
    chips = ["Open CRM", "Add note", "Create follow-up"];
    sectionId = "crm";
  } else if (/content|post|campaign|email|sms/i.test(text)) {
    reply = `The content studio can draft social posts, email, and SMS in your premium brand voice: ${profile.brandVoice}. I can generate a full campaign around "${profile.brandTagline}".`;
    chips = ["Create social post", "Write follow-up", "Build campaign"];
    sectionId = "content-studio";
  } else if (/automation|workflow|trigger/i.test(text)) {
    reply = `This is where WISE² gives you time back. One website inquiry can save the lead, classify it, assign a stage, prepare a message, and update analytics without manual work.`;
    chips = ["Run workflow", "Show nodes", "Explain automation"];
    sectionId = "automation";
  } else if (/analytics|dashboard|metrics|performance/i.test(text)) {
    reply = `The demo dashboard is tracking ${context.metrics.websiteVisitors} visitors, ${context.metrics.inquiries} inquiries, and a ${context.metrics.conversionRate}% demo conversion rate. The charts are seeded with DEMO DATA so the system feels real without pretending to show live business results.`;
    chips = ["Show insights", "View pipeline", "Explain charts"];
    sectionId = "analytics";
  } else if (/mobile|phone|responsive/i.test(text)) {
    reply = "The entire experience is responsive, so your business still feels premium when you check it from a phone.";
    chips = ["Show mobile view", "Review CTA", "Continue tour"];
    sectionId = "mobile";
  } else {
    reply = `I’m watching the current demo context for ${profile.companyName}. We’re on ${route}, the current section is ${state.currentSection}, and I can help with the website, CRM, marketing, automation, analytics, or pricing.`;
    chips = ["Explain dashboard", "Analyze leads", "Build a 30-day plan"];
  }

  return {
    reply,
    chips,
    sectionId,
    context,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(sanitizeCurrency(value));
}

export function addSystemAssistantMessage(
  state: DemoRuntimeState,
  text: string,
  chips?: string[]
) {
  return addTourAssistMessage(state, text, chips);
}

export function selectLead(state: DemoRuntimeState, leadId: string) {
  return {
    ...state,
    selectedLeadId: leadId,
  };
}

export function openPricingAck(state: DemoRuntimeState) {
  return {
    ...state,
    pricingAckOpen: true,
    recentEvents: [
      ...state.recentEvents,
      createEvent("pricing_viewed", "Pricing viewed", "Opened the starter plan handoff."),
    ],
  };
}

export function closePricingAck(state: DemoRuntimeState) {
  return {
    ...state,
    pricingAckOpen: false,
  };
}

export function confirmPricingAck(state: DemoRuntimeState) {
  return {
    ...state,
    pricingAckOpen: false,
    pricingAcknowledged: true,
    pricingConfirmed: true,
    recentEvents: [
      ...state.recentEvents,
      createEvent("activation_clicked", "Activation confirmed", "Confirmed the safe demo handoff."),
    ],
  };
}

export function unlockAdmin(state: DemoRuntimeState, code: string) {
  if (code.trim() !== "WISE2-LEGACY") {
    return {
      ...state,
      adminUnlocked: false,
      adminMessage: "That code did not unlock the admin controls.",
    };
  }

  return {
    ...state,
    adminUnlocked: true,
    adminMessage: "Admin controls unlocked for this browser session.",
  };
}

export function summariseTourStep(step: DemoTourStep | null) {
  if (!step) return "Tour not started";
  return `${step.title} - ${step.eyebrow}`;
}
