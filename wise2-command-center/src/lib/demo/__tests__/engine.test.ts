import {
  addLead,
  buildAssistantReply,
  advanceWorkflowStep,
  completeTourStep,
  createAssistantContext,
  createContentAssets,
  createInitialDemoState,
  formatCurrency,
  getCurrentTourStep,
  openPricingAck,
  runWorkflow,
  startTour,
  unlockAdmin,
} from "@/lib/demo/engine";
import {
  DEMO_ADMIN_CODE,
  JAVON_DEMO_PROFILE,
  createGeneratedDemoProfile,
  resolveDemoProfile,
} from "@/lib/demo/profiles";

describe("demo profile resolution", () => {
  it("returns the Javon profile for the canonical slug", () => {
    const profile = resolveDemoProfile("javon");
    expect(profile.companyName).toBe("Javon's Spirits");
    expect(profile.heroTitle).toContain("JAVON");
  });

  it("generates a reusable profile for other demo slugs", () => {
    const profile = createGeneratedDemoProfile("craig");
    expect(profile.slug).toBe("craig");
    expect(profile.prospectName).toBe("Craig");
    expect(profile.companyName).toContain("Craig");
  });
});

describe("tour engine", () => {
  it("starts the guided tour at the first step", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const next = startTour(JAVON_DEMO_PROFILE, state);
    expect(next.tourStarted).toBe(true);
    expect(next.currentTourStepId).toBe("command-center");
    expect(getCurrentTourStep(JAVON_DEMO_PROFILE, next)?.title).toBe("Command Center");
  });

  it("advances the tour and completes the final step", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const active = {
      ...state,
      tourStarted: true,
      currentTourStepId: "legacy" as const,
    };
    const finished = completeTourStep(JAVON_DEMO_PROFILE, active);
    expect(finished.tourFinished).toBe(true);
    expect(finished.completedTourStepIds).toContain("legacy");
  });
});

describe("lead capture and context", () => {
  it("captures a demo lead and updates the CRM state", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const next = addLead(JAVON_DEMO_PROFILE, state, {
      name: "Ari Stone",
      email: "ari@example.com",
      phone: "(555) 010-1100",
      interest: "Launch campaign",
      message: "Looking for a premium launch campaign.",
      source: "Website",
    });

    expect(next.leads[0]?.name).toBe("Ari Stone");
    expect(next.selectedLeadId).toBe(next.leads[0]?.id);
    expect(next.recentEvents.at(-1)?.type).toBe("demo_lead_created");
  });

  it("builds structured assistant context from the active demo state", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const context = createAssistantContext(JAVON_DEMO_PROFILE, state, "/demo/javon");
    expect(context.prospect.companyName).toBe("Javon's Spirits");
    expect(context.route).toBe("/demo/javon");
    expect(context.demoMode).toBe(true);
    expect(context.leadCount).toBe(state.leads.length);
  });
});

describe("assistant and pricing safety", () => {
  it("routes pricing questions to the pricing section and keeps demo safeguards explicit", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const reply = buildAssistantReply(
      JAVON_DEMO_PROFILE,
      state,
      "How does the starter plan work?",
      "/demo/javon"
    );

    expect(reply.sectionId).toBe("pricing");
    expect(reply.reply).toContain("DEMO_MODE");
  });

  it("keeps the pricing confirmation separate from real checkout", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const next = openPricingAck(state);
    expect(next.pricingAckOpen).toBe(true);
    expect(next.recentEvents.at(-1)?.type).toBe("pricing_viewed");
    expect(formatCurrency(JAVON_DEMO_PROFILE.pricing.setupFee)).toBe("$499");
  });
});

describe("workflow and admin", () => {
  it("generates content assets and runs the demo workflow", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const content = createContentAssets(JAVON_DEMO_PROFILE, "Crafted for the Moment");
    const workflow = runWorkflow(JAVON_DEMO_PROFILE, state);
    const progressed = advanceWorkflowStep(workflow, JAVON_DEMO_PROFILE.workflowNodes[0].id, JAVON_DEMO_PROFILE.workflowNodes[0].label);

    expect(content).toHaveLength(6);
    expect(workflow.workflowRunning).toBe(true);
    expect(workflow.workflowProgress).toHaveLength(0);
    expect(progressed.workflowProgress).toHaveLength(1);
  });

  it("enforces the internal admin unlock gate", () => {
    const state = createInitialDemoState(JAVON_DEMO_PROFILE);
    const denied = unlockAdmin(state, "wrong-code");
    const allowed = unlockAdmin(state, DEMO_ADMIN_CODE);

    expect(denied.adminUnlocked).toBe(false);
    expect(allowed.adminUnlocked).toBe(true);
  });
});
