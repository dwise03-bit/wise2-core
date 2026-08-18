"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Check, ChevronLeft, ChevronRight, CircleAlert, Globe, Play, Send, Sparkles, Target, Users, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  addLead,
  addLeadNote,
  addSystemAssistantMessage,
  advanceWorkflowStep,
  buildAssistantReply,
  completeTourStep,
  confirmPricingAck,
  createAssistantContext,
  createContentAssets,
  createInitialDemoState,
  finishWorkflow,
  formatCurrency,
  getCurrentLead,
  getCurrentTourStep,
  getDemoMetrics,
  goToSection,
  openPricingAck,
  getPreviousTourStep,
  resumeTour,
  runWorkflow,
  selectLead,
  skipTourStep,
  startTour,
  updateLeadStage,
  unlockAdmin,
} from "@/lib/demo/engine";
import type {
  DemoLead,
  DemoLeadInput,
  DemoProfile,
  DemoRuntimeState,
  DemoSectionId,
} from "@/lib/demo/types";
import { DEMO_ADMIN_CODE } from "@/lib/demo/profiles";

type DemoPersistence = {
  state?: DemoRuntimeState;
  customProfile?: DemoProfile;
};

type DemoAction =
  | { type: "section"; sectionId: DemoSectionId }
  | { type: "tour-start" }
  | { type: "tour-next" }
  | { type: "tour-prev" }
  | { type: "tour-skip" }
  | { type: "tour-finish" }
  | { type: "tour-resume" }
  | { type: "assistant-toggle" }
  | { type: "assistant-open" }
  | { type: "assistant-close" }
  | { type: "assistant-mode"; mode: "open" | "compact" }
  | { type: "assistant-system"; text: string; chips?: string[] }
  | { type: "assistant-user"; text: string; route: string }
  | { type: "lead-add"; input: DemoLeadInput }
  | { type: "lead-note"; leadId: string; note: string }
  | { type: "lead-stage"; leadId: string; stage: "new" | "contacted" | "interested" | "qualified" | "customer" }
  | { type: "lead-select"; leadId: string }
  | { type: "content-generate" }
  | { type: "workflow-run" }
  | { type: "workflow-step"; nodeId: string; label: string }
  | { type: "workflow-finish" }
  | { type: "pricing-open" }
  | { type: "pricing-close" }
  | { type: "pricing-confirm" }
  | { type: "admin-unlock"; code: string };

const STORAGE_PREFIX = "wise2-demo";

function safeWindow() {
  return typeof window === "undefined" ? null : window;
}

function readPersistence(slug: string): DemoPersistence {
  const win = safeWindow();
  if (!win) return {};

  try {
    const raw = win.localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    if (!raw) return {};
    return JSON.parse(raw) as DemoPersistence;
  } catch {
    return {};
  }
}

function writePersistence(slug: string, payload: DemoPersistence) {
  const win = safeWindow();
  if (!win) return;

  try {
    win.localStorage.setItem(`${STORAGE_PREFIX}:${slug}`, JSON.stringify(payload));
  } catch {
    // Demo state should fail open if storage is unavailable.
  }
}

function readCustomProfile(slug: string) {
  const win = safeWindow();
  if (!win) return null;

  try {
    const raw = win.localStorage.getItem(`${STORAGE_PREFIX}:profile:${slug}`);
    return raw ? (JSON.parse(raw) as DemoProfile) : null;
  } catch {
    return null;
  }
}

function sectionLabel(sectionId: DemoSectionId) {
  return sectionId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function usePersistedDemoProfile(slug: string, profile: DemoProfile) {
  const [resolvedProfile] = useState<DemoProfile>(() => {
    const custom = readCustomProfile(slug);
    return custom ?? profile;
  });

  return resolvedProfile;
}

function demoReducer(profile: DemoProfile, state: DemoRuntimeState, action: DemoAction): DemoRuntimeState {
  switch (action.type) {
    case "section":
      return goToSection(state, action.sectionId);
    case "tour-start":
      return startTour(profile, state);
    case "tour-next":
      return completeTourStep(profile, state);
    case "tour-prev":
      return (() => {
        const previous = getPreviousTourStep(profile, state.currentTourStepId);
        if (!previous) return state;
        return {
          ...state,
          currentSection: previous.sectionId,
          currentTourStepId: previous.id,
          resumedTourCount: state.resumedTourCount + 1,
          recentEvents: [
            ...state.recentEvents,
            {
              id: `event-${Date.now()}`,
              type: "feature_opened",
              label: "Tour step revisited",
              detail: `Moved back to ${previous.title}.`,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      })();
    case "tour-skip":
      return skipTourStep(state);
    case "tour-finish":
      return completeTourStep(profile, state, state.currentTourStepId ?? undefined);
    case "tour-resume":
      return resumeTour(profile, state);
    case "assistant-toggle":
      return { ...state, assistantOpen: !state.assistantOpen };
    case "assistant-open":
      return { ...state, assistantOpen: true };
    case "assistant-close":
      return { ...state, assistantOpen: false };
    case "assistant-mode":
      return { ...state, assistantMode: action.mode, assistantOpen: true };
    case "assistant-system":
      return addSystemAssistantMessage(state, action.text, action.chips);
    case "assistant-user": {
      const reply = buildAssistantReply(profile, state, action.text, action.route);
      return {
        ...state,
        assistantOpen: true,
        assistantMessages: [
          ...state.assistantMessages,
          { id: `user-${Date.now()}`, role: "user" as const, text: action.text },
          {
            id: `assistant-${Date.now()}`,
            role: "assistant" as const,
            text: reply.reply,
            chips: reply.chips,
          },
        ],
        recentEvents: [
          ...state.recentEvents,
          {
            id: `event-${Date.now()}`,
            type: "ai_question_asked",
            label: "AI question asked",
            detail: action.text,
            createdAt: new Date().toISOString(),
          },
        ],
        currentSection: reply.sectionId,
      };
    }
    case "lead-add":
      return addLead(profile, state, action.input);
    case "lead-note":
      return addLeadNote(state, action.leadId, action.note);
    case "lead-stage":
      return updateLeadStage(state, action.leadId, action.stage);
    case "lead-select":
      return selectLead(state, action.leadId);
    case "content-generate":
      return {
        ...state,
        contentAssets: createContentAssets(profile, state.contentTheme),
        recentEvents: [
          ...state.recentEvents,
          {
            id: `event-${Date.now()}`,
            type: "content_generated",
            label: "Content generated",
            detail: `Generated a ${profile.companyName} campaign in demo mode.`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    case "workflow-run":
      return runWorkflow(profile, state);
    case "workflow-step":
      return advanceWorkflowStep(state, action.nodeId, action.label);
    case "workflow-finish":
      return finishWorkflow(state);
    case "pricing-open":
      return openPricingAck(state);
    case "pricing-close":
      return { ...state, pricingAckOpen: false };
    case "pricing-confirm":
      return confirmPricingAck(state);
    case "admin-unlock":
      return unlockAdmin(state, action.code);
    default:
      return state;
  }
}

function useDemoState(slug: string, profile: DemoProfile) {
  const [state, setState] = useState<DemoRuntimeState>(() => {
    const persisted = readPersistence(slug);
    const initial = persisted.state ?? createInitialDemoState(profile);
    return {
      ...initial,
      currentSection: initial.currentSection ?? "command-center",
      currentTourStepId: initial.currentTourStepId,
    };
  });

  useEffect(() => {
    writePersistence(slug, { state });
  }, [slug, state]);

  const dispatch = (action: DemoAction) => {
    setState((current) => demoReducer(profile, current, action));
  };

  return [state, dispatch] as const;
}

function SectionShell({
  id,
  className,
  eyebrow,
  title,
  description,
  action,
  children,
  tone = "gold",
}: {
  id: DemoSectionId;
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: "gold" | "blue";
}) {
  return (
    <section
      id={id}
      data-demo-target={id}
      className={cn(
        "scroll-mt-28 rounded-[2rem] border bg-[rgba(255,255,255,0.02)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl md:p-6",
        tone === "gold"
          ? "border-[rgba(216,164,58,0.24)]"
          : "border-[rgba(17,119,255,0.24)]",
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p
            className={cn(
              "text-[0.72rem] font-semibold uppercase tracking-[0.28em]",
              tone === "gold" ? "text-[#d8a43a]" : "text-[#1177ff]"
            )}
          >
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f6f0e4] md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#b5aea6] md:text-[15px]">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
      <CardHeader className="pb-3">
        <CardAction>{icon}</CardAction>
        <CardTitle className="text-sm uppercase tracking-[0.22em] text-[#d8a43a]">{label}</CardTitle>
        <CardDescription className="text-base text-[#f6f0e4]">{value}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs leading-6 text-[#a9a39a]">{detail}</p>
      </CardContent>
    </Card>
  );
}

function FlowDot({
  label,
  active,
  blue,
}: {
  label: string;
  active?: boolean;
  blue?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
          active
            ? blue
              ? "border-[#1177ff] bg-[rgba(17,119,255,0.2)] text-[#f6f0e4]"
              : "border-[#d8a43a] bg-[rgba(216,164,58,0.16)] text-[#f6f0e4]"
            : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#a9a39a]"
        )}
      >
        {label.slice(0, 1)}
      </div>
      <span className="text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">{label}</span>
    </div>
  );
}

function TourOverlay({
  profile,
  state,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: {
  profile: DemoProfile;
  state: DemoRuntimeState;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  const currentStep = getCurrentTourStep(profile, state);
  useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, true);
      window.addEventListener("resize", callback);
      return () => {
        window.removeEventListener("scroll", callback, true);
        window.removeEventListener("resize", callback);
      };
    },
    () => `${window.scrollY}:${window.innerWidth}:${window.innerHeight}`,
    () => "server"
  );

  const rect = (() => {
    if (!state.tourStarted || !currentStep || typeof document === "undefined") return null;
    const element = document.querySelector<HTMLElement>(
      `[data-demo-target="${currentStep.sectionId}"]`
    );
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    return {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    };
  })();

  if (!state.tourStarted || !currentStep) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[40]">
      {rect ? (
        <>
          <div className="absolute inset-0 bg-black/72" />
          <div
            className="absolute rounded-[1.8rem] border border-[#d8a43a]/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.72),0_0_40px_rgba(216,164,58,0.18)]"
            style={
              {
                top: rect.top - 10,
                left: rect.left - 10,
                width: rect.width + 20,
                height: rect.height + 20,
              } as CSSProperties
            }
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/72" />
      )}

      <div className="pointer-events-auto absolute right-4 bottom-4 left-4 mx-auto max-w-4xl rounded-[1.75rem] border border-[rgba(216,164,58,0.3)] bg-[rgba(8,8,10,0.96)] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:right-6 md:bottom-6 md:left-auto md:w-[min(760px,calc(100vw-3rem))]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#d8a43a]">
              Guided Tour
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#f6f0e4]">
              {currentStep.eyebrow} · {currentStep.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#d6cec4]">{currentStep.body}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8faef6]">
              Assistant prompt: {currentStep.assistantPrompt}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" className="border-[rgba(255,255,255,0.1)] bg-transparent text-[#f6f0e4]" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" className="border-[rgba(255,255,255,0.1)] bg-transparent text-[#f6f0e4]" onClick={onSkip}>
              Skip
            </Button>
            <Button variant="outline" className="border-[rgba(17,119,255,0.35)] bg-[rgba(17,119,255,0.12)] text-[#8fb8ff]" onClick={() => onFinish()}>
              Finish
            </Button>
            <Button
              className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
              onClick={currentStep.id === "legacy" ? onFinish : onNext}
            >
              {currentStep.id === "legacy" ? "Finish Tour" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantPanel({
  profile,
  state,
  route,
  onToggle,
  onOpenPricing,
  onLaunchTour,
  onQuestion,
}: {
  profile: DemoProfile;
  state: DemoRuntimeState;
  route: string;
  onToggle: () => void;
  onOpenPricing: () => void;
  onLaunchTour: () => void;
  onQuestion: (question: string) => void;
}) {
  const [input, setInput] = useState("");
  const currentLead = getCurrentLead(state);
  const context = createAssistantContext(profile, state, route);

  const handleChip = (chip: string) => {
    const normalized = chip.toLowerCase();
    if (normalized.includes("start tour")) {
      onLaunchTour();
      return;
    }
    if (normalized.includes("pricing") || normalized.includes("money")) {
      onOpenPricing();
      return;
    }
    if (normalized.includes("dashboard")) {
      onQuestion("Explain my dashboard");
      return;
    }
    if (normalized.includes("lead")) {
      onQuestion("Analyze my leads");
      return;
    }
    if (normalized.includes("social")) {
      onQuestion("Create a social post");
      return;
    }
    onQuestion(chip);
  };

  return (
    <aside className="fixed right-4 bottom-4 z-[50] w-[min(420px,calc(100vw-2rem))] rounded-[1.6rem] border border-[rgba(216,164,58,0.28)] bg-[rgba(8,8,10,0.94)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#1177ff]">
            {profile.assistantName}
          </p>
          <p className="mt-1 text-sm text-[#f6f0e4]">
            {state.assistantOpen ? "Available now" : "Collapsed"}
          </p>
          <p className="mt-1 text-[11px] text-[#a9a39a]">
            Current route: {route} · Current lead: {currentLead?.name ?? "None"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[rgba(216,164,58,0.35)] text-[#d8a43a]">
            DEMO
          </Badge>
          <Button variant="ghost" size="icon-sm" className="text-[#f6f0e4]" onClick={onToggle} aria-label="Toggle assistant">
            {state.assistantOpen ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {state.assistantOpen && (
        <div className="max-h-[74vh] overflow-hidden">
          <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
            <p className="text-sm leading-7 text-[#d6cec4]">{profile.assistantGreeting}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]" onClick={onLaunchTour}>
                START TOUR
              </Button>
              <Button size="sm" variant="outline" className="border-[rgba(17,119,255,0.35)] bg-[rgba(17,119,255,0.1)] text-[#8fb8ff]" onClick={onOpenPricing}>
                SHOW ME HOW WISE² MAKES MONEY
              </Button>
              <Button size="sm" variant="ghost" className="text-[#f6f0e4]" onClick={() => onToggle()}>
                LET ME EXPLORE
              </Button>
            </div>
          </div>

          <div className="max-h-[34vh] overflow-auto px-4 py-3">
            {state.assistantMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "mb-3 flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-[1.2rem] border px-3.5 py-2.5 text-sm leading-7",
                    message.role === "user"
                      ? "border-[rgba(17,119,255,0.28)] bg-[rgba(17,119,255,0.1)] text-[#f6f0e4]"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#f6f0e4]"
                  )}
                >
                  {message.text}
                  {message.chips?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.chips.map((chip) => (
                        <button
                          key={chip}
                          className="rounded-full border border-[rgba(255,255,255,0.08)] bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[#d6cec4] transition hover:border-[rgba(216,164,58,0.35)] hover:text-[#f6f0e4]"
                          onClick={() => handleChip(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
            <div className="mb-2 grid grid-cols-2 gap-2 text-[11px] text-[#a9a39a]">
              <span>Prospect: {context.prospect.name}</span>
              <span>Industry: {context.prospect.industry}</span>
              <span>Tour step: {context.currentTourStep ?? "None"}</span>
              <span>Leads: {context.leadCount}</span>
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about the business, the CRM, or the demo..."
                className="min-h-20 border-[rgba(255,255,255,0.09)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
              />
              <Button
                className="h-20 bg-[linear-gradient(135deg,#1177ff,#7ab2ff)] text-[#07101f]"
                onClick={() => {
                  if (!input.trim()) return;
                  onQuestion(input.trim());
                  setInput("");
                }}
                aria-label="Send question"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function InsightsChart({
  profile,
  state,
}: {
  profile: DemoProfile;
  state: DemoRuntimeState;
}) {
  const metrics = getDemoMetrics(profile, state);
  const leadSourceData = profile.leadSources.map((entry) => ({ ...entry, value: entry.value + metrics.leads }));
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)] lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-[#f6f0e4]">Traffic and inquiry growth</CardTitle>
          <CardDescription className="text-[#a9a39a]">
            DEMO DATA only. Tracks how social and web activity flows into the CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={profile.trafficSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#a9a39a" fontSize={11} />
              <YAxis stroke="#a9a39a" fontSize={11} />
              <RechartsTooltip
                contentStyle={{
                  background: "rgba(8,8,10,0.95)",
                  border: "1px solid rgba(216,164,58,0.22)",
                  borderRadius: 16,
                  color: "#f6f0e4",
                }}
              />
              <Bar dataKey="value" barSize={22} radius={[10, 10, 0, 0]} fill="#1177ff" />
              <Line type="monotone" dataKey="value" stroke="#d8a43a" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
        <CardHeader>
          <CardTitle className="text-[#f6f0e4]">Lead source mix</CardTitle>
          <CardDescription className="text-[#a9a39a]">Demo inquiries by source.</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={leadSourceData} dataKey="value" innerRadius={54} outerRadius={84} paddingAngle={3}>
                {leadSourceData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={index % 2 === 0 ? "#1177ff" : "#d8a43a"}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  background: "rgba(8,8,10,0.95)",
                  border: "1px solid rgba(17,119,255,0.22)",
                  borderRadius: 16,
                  color: "#f6f0e4",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function DemoExperience({ slug, profile: fallbackProfile }: { slug: string; profile: DemoProfile }) {
  const profile = usePersistedDemoProfile(slug, fallbackProfile);
  const [state, dispatch] = useDemoState(slug, profile);
  const [route] = useState(() =>
    typeof window === "undefined"
      ? `/demo/${slug}`
      : `${window.location.pathname}${window.location.search}`
  );
  const [leadForm, setLeadForm] = useState<DemoLeadInput>({
    name: "",
    email: "",
    phone: "",
    interest: "Private tasting partnership",
    message: "",
    source: "Website",
  });
  const [adminCode, setAdminCode] = useState("");

  const metrics = getDemoMetrics(profile, state);
  const currentLead = getCurrentLead(state);
  const currentTourStep = getCurrentTourStep(profile, state);

  const scrollToSection = (sectionId: DemoSectionId) => {
    dispatch({ type: "section", sectionId });
    const element = document.querySelector<HTMLElement>(`[data-demo-target="${sectionId}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAssistantQuestion = (question: string) => {
    const normalized = question.toLowerCase();
    if (normalized.includes("start tour")) {
      dispatch({ type: "tour-start" });
      scrollToSection("command-center");
      return;
    }
    if (normalized.includes("show me how wise² makes money")) {
      dispatch({ type: "pricing-open" });
      scrollToSection("pricing");
      return;
    }
    if (normalized.includes("explore")) {
      dispatch({ type: "assistant-close" });
      return;
    }
    if (normalized.includes("build a 30-day marketing plan")) {
      dispatch({ type: "section", sectionId: "content-studio" });
      dispatch({ type: "content-generate" });
      scrollToSection("content-studio");
      return;
    }
    if (normalized.includes("give me today's priorities")) {
      dispatch({
        type: "assistant-user",
        text: "Give me today's priorities.",
        route,
      });
      return;
    }
    if (normalized.includes("analyze my leads")) {
      dispatch({ type: "section", sectionId: "crm" });
      scrollToSection("crm");
      return;
    }
    if (normalized.includes("create a social post")) {
      dispatch({ type: "section", sectionId: "content-studio" });
      dispatch({ type: "content-generate" });
      scrollToSection("content-studio");
      return;
    }
    if (normalized.includes("write a follow-up")) {
      dispatch({
        type: "lead-note",
        leadId: currentLead?.id ?? state.leads[0].id,
        note: "Drafted a WISE² follow-up message in demo mode.",
      });
      dispatch({ type: "section", sectionId: "crm" });
      scrollToSection("crm");
      return;
    }

    dispatch({
      type: "assistant-user",
      text: question,
      route,
    });
  };

  const handleLeadSubmit = () => {
    if (!leadForm.name || !leadForm.email || !leadForm.message) return;
    dispatch({ type: "lead-add", input: leadForm });
    setLeadForm({
      name: "",
      email: "",
      phone: "",
      interest: "Private tasting partnership",
      message: "",
      source: "Website",
    });
    scrollToSection("crm");
  };

  const handleTourNext = () => {
    dispatch({ type: "tour-next" });
    if (currentTourStep?.id === "legacy") {
      dispatch({ type: "tour-finish" });
      scrollToSection("legacy");
      return;
    }
    if (currentTourStep) {
      const nextIndex = profile.tourSteps.findIndex((step) => step.id === currentTourStep.id) + 1;
      const next = profile.tourSteps[nextIndex];
      if (next) {
        dispatch({ type: "section", sectionId: next.sectionId });
        scrollToSection(next.sectionId);
      }
    }
  };

  const handleTourPrev = () => {
    if (!currentTourStep) return;
    const index = profile.tourSteps.findIndex((step) => step.id === currentTourStep.id);
    const prev = profile.tourSteps[index - 1];
    if (!prev) return;
    dispatch({ type: "section", sectionId: prev.sectionId });
    dispatch({ type: "tour-prev" });
    scrollToSection(prev.sectionId);
  };

  const handleWorkflowRun = () => {
    if (state.workflowRunning) return;
    dispatch({ type: "workflow-run" });
    profile.workflowNodes.forEach((node, index) => {
      window.setTimeout(() => {
        dispatch({
          type: "workflow-step",
          nodeId: node.id,
          label: node.label,
        });
        dispatch({
          type: "assistant-system",
          text: `Demo workflow executed: ${node.label}`,
          chips: ["Explain this step", "Show dashboard", "Continue"],
        });
        if (index === profile.workflowNodes.length - 1) {
          dispatch({ type: "workflow-finish" });
        }
      }, 300 * (index + 1));
    });
  };

  const heroStyle: CSSProperties = {
    background:
      "radial-gradient(circle at top right, rgba(17,119,255,0.18), transparent 32%), radial-gradient(circle at top left, rgba(216,164,58,0.18), transparent 26%), linear-gradient(180deg, rgba(10,10,12,0.95), rgba(5,5,5,0.98))",
  };

  const stages: Array<DemoLead["stage"]> = ["new", "contacted", "interested", "qualified", "customer"];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#f6f0e4]">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(circle_at_top_left,rgba(17,119,255,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(216,164,58,0.22),transparent_28%),linear-gradient(180deg,rgba(11,11,12,0.98),rgba(5,5,5,1))]"
        aria-hidden="true"
      />

      <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,5,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(216,164,58,0.4)] bg-[rgba(216,164,58,0.08)] text-lg font-semibold text-[#d8a43a]">
                {profile.crest}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[rgba(17,119,255,0.14)] text-[#8fb8ff]">
                    DEMO_MODE
                  </Badge>
                  <Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">
                    {profile.industry}
                  </Badge>
                </div>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-[#f6f0e4] md:text-2xl">
                  {profile.companyName}
                </h1>
                <p className="text-sm text-[#b5aea6]">{profile.poweredBy}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "command-center",
                "website",
                "lead-capture",
                "crm",
                "assistant",
                "content-studio",
                "automation",
                "analytics",
                "pricing",
              ].map((sectionId) => (
                <Button
                  key={sectionId}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "rounded-full border border-[rgba(255,255,255,0.06)] px-3 text-xs uppercase tracking-[0.16em] text-[#b5aea6]",
                    state.currentSection === sectionId && "border-[rgba(216,164,58,0.4)] text-[#d8a43a]"
                  )}
                  onClick={() => scrollToSection(sectionId as DemoSectionId)}
                >
                  {sectionLabel(sectionId as DemoSectionId)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#d8a43a]">
                Welcome
              </p>
              <p className="mt-2 text-sm text-[#f6f0e4]">{profile.heroTitle}</p>
              <p className="mt-1 text-[13px] leading-6 text-[#b5aea6]">{profile.heroSubtitle}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#1177ff]">
                Demo Signal
              </p>
              <p className="mt-2 text-sm text-[#f6f0e4]">
                {metrics.demoDataLabel} - all metrics are seeded and clearly marked.
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#b5aea6]">
                The application is real, but the data is isolated from production records.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#d8a43a]">
                Current tour
              </p>
              <p className="mt-2 text-sm text-[#f6f0e4]">
                {currentTourStep ? currentTourStep.title : "Tour not started"}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#b5aea6]">
                {currentTourStep?.body ?? profile.assistantWelcome}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 pb-24 lg:px-6">
        <section
          data-demo-target="command-center"
          className="scroll-mt-28 overflow-hidden rounded-[2.3rem] border border-[rgba(216,164,58,0.28)] bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(10,10,12,0.98))] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_80px_rgba(0,0,0,0.45)]"
          style={heroStyle}
        >
          <div className="grid gap-0 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[rgba(216,164,58,0.14)] text-[#d8a43a]">Crafted for the Moment.</Badge>
                <Badge variant="outline" className="border-[rgba(17,119,255,0.35)] text-[#8fb8ff]">
                  Built for Today. Ready for Legacy.
                </Badge>
                <Badge variant="outline" className="border-[rgba(255,255,255,0.1)] text-[#f6f0e4]">
                  Powered by WISE² Business OS
                </Badge>
              </div>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#f6f0e4] md:text-6xl">
                {profile.heroTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-[#b5aea6] md:text-xl">{profile.heroSubtitle}</p>
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#d6cec4] md:text-lg">
                {profile.heroCopy}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
                  onClick={() => {
                    dispatch({ type: "tour-start" });
                    scrollToSection("command-center");
                  }}
                >
                  {profile.primaryCta}
                  <Play className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[rgba(17,119,255,0.35)] bg-[rgba(17,119,255,0.1)] text-[#8fb8ff]"
                  onClick={() => {
                    dispatch({ type: "assistant-close" });
                    scrollToSection("analytics");
                  }}
                >
                  {profile.secondaryCta}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-[#f6f0e4]"
                  onClick={() => {
                    dispatch({ type: "pricing-open" });
                    scrollToSection("pricing");
                  }}
                >
                  View the plan
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricTile
                  label="Leads"
                  value={metrics.leads.toString()}
                  detail="CRM-ready demo records."
                  icon={<Users className="h-4 w-4 text-[#d8a43a]" />}
                />
                <MetricTile
                  label="Visitors"
                  value={metrics.websiteVisitors.toLocaleString()}
                  detail="Traffic flowing to the site."
                  icon={<Globe className="h-4 w-4 text-[#1177ff]" />}
                />
                <MetricTile
                  label="Pipeline"
                  value={formatCurrency(metrics.pipelineValue)}
                  detail="Estimated demo pipeline value."
                  icon={<Wallet className="h-4 w-4 text-[#d8a43a]" />}
                />
                <MetricTile
                  label="Conversion"
                  value={`${metrics.conversionRate}%`}
                  detail="Seeded demo conversion rate."
                  icon={<Target className="h-4 w-4 text-[#1177ff]" />}
                />
              </div>
            </div>

            <div className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 md:p-8 xl:border-l xl:border-t-0">
              <div className="grid gap-4">
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Brand identity</CardTitle>
                    <CardDescription className="text-[#b5aea6]">
                      Premium black, metallic gold, and electric WISE² blue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-[rgba(216,164,58,0.28)] bg-[#0b0b0c] p-4 text-center">
                      <div className="text-3xl font-semibold text-[#d8a43a]">{profile.crest}</div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">
                        Primary crest
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(17,119,255,0.28)] bg-[#07111f] p-4 text-center">
                      <div className="text-3xl font-semibold text-[#8fb8ff]">JO</div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">
                        Icon mark
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-center">
                      <div className="text-3xl font-semibold text-[#f6f0e4]">OS</div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">
                        System mark
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">DEMO safeguards</CardTitle>
                    <CardDescription className="text-[#b5aea6]">
                      Nothing irreversible is allowed from this experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-1 h-4 w-4 text-[#d8a43a]" />
                      <p>Real navigation, state, charts, and forms are live. External actions remain simulated in DEMO_MODE.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-1 h-4 w-4 text-[#1177ff]" />
                      <p>Alcohol commerce remains disabled until licensing, shipping, payment eligibility, and age-gate requirements are configured.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-1 h-4 w-4 text-[#d8a43a]" />
                      <p>All seeded metrics and leads are labeled as demo data and never overwrite production records.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <SectionShell
              id="website"
              eyebrow="2. JAVON'S SPIRITS WEBSITE"
              title="A premium landing page wired into the business system"
              description="The website preview shows the hero, brand story, collection, lifestyle, contact, lead capture, and social links working as one connected experience."
              action={
                <Badge variant="outline" className="border-[rgba(17,119,255,0.35)] text-[#8fb8ff]">
                  Visitor → Inquiry → CRM Lead → Follow-Up
                </Badge>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.8rem] border border-[rgba(216,164,58,0.24)] bg-[linear-gradient(180deg,rgba(8,8,10,0.88),rgba(12,12,14,0.92))] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#d8a43a]">{profile.companyName}</p>
                  <h3 className="mt-4 max-w-xl text-3xl font-semibold text-[#f6f0e4] md:text-4xl">
                    Crafted for the Moment. Built for Today. Ready for Legacy.
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d6cec4]">
                    This preview represents the premium landing page experience. The demo site can capture interest, route inquiries into the CRM, and keep analytics in sync.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {profile.websiteSections.map((section) => (
                      <div
                        key={section}
                        className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[#f6f0e4]"
                      >
                        {section}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-3 text-sm text-[#a9a39a]">
                    <p className="uppercase tracking-[0.22em] text-[#1177ff]">Powered by WISE²</p>
                    <p className="mt-2 leading-7">{profile.socialProof}</p>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-[rgba(17,119,255,0.22)] bg-[rgba(17,119,255,0.06)] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#8fb8ff]">Lead Capture</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[#f6f0e4]">Inquiry form</h3>
                  <p className="mt-2 text-sm leading-7 text-[#b5aea6]">
                    A visitor submits an inquiry, WISE² captures the record, assigns the source, and queues the follow-up.
                  </p>
                  <div className="mt-5 space-y-3">
                    <Input
                      value={leadForm.name}
                      onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Name"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                    <Input
                      value={leadForm.email}
                      onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email"
                      type="email"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                    <Input
                      value={leadForm.phone}
                      onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Phone"
                      type="tel"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                    <Input
                      value={leadForm.interest}
                      onChange={(event) => setLeadForm((current) => ({ ...current, interest: event.target.value }))}
                      placeholder="Interest"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                    <Textarea
                      value={leadForm.message}
                      onChange={(event) => setLeadForm((current) => ({ ...current, message: event.target.value }))}
                      placeholder="Message"
                      className="min-h-24 border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                    <Input
                      value={leadForm.source}
                      onChange={(event) => setLeadForm((current) => ({ ...current, source: event.target.value }))}
                      placeholder="Source"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4] placeholder:text-[#756f66]"
                    />
                  </div>
                  <Button
                    className="mt-4 w-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
                    onClick={handleLeadSubmit}
                  >
                    Submit demo inquiry
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#d8a43a]">
                    {profile.disclaimer}
                  </p>
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="lead-capture"
              eyebrow="3. LEAD CAPTURE"
              title="The inquiry becomes a CRM record"
              description="Lead capture is isolated to DEMO_MODE. A new inquiry creates a safe demo record, updates the dashboard, and alerts the assistant."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">DEMO DATA</Badge>}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Recent demo inquiries</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      Every record is isolated and fully labeled as demo content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">
                        <tr>
                          <th className="px-3 py-3">Lead</th>
                          <th className="px-3 py-3">Interest</th>
                          <th className="px-3 py-3">Source</th>
                          <th className="px-3 py-3">Stage</th>
                          <th className="px-3 py-3">Follow-up</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.leads.map((lead) => (
                          <tr
                            key={lead.id}
                            className={cn(
                              "border-t border-[rgba(255,255,255,0.06)] transition",
                              lead.id === state.selectedLeadId && "bg-[rgba(216,164,58,0.08)]"
                            )}
                            onClick={() => dispatch({ type: "lead-select", leadId: lead.id })}
                          >
                            <td className="px-3 py-4">
                              <div className="font-medium text-[#f6f0e4]">{lead.name}</div>
                              <div className="text-xs text-[#a9a39a]">{lead.email}</div>
                            </td>
                            <td className="px-3 py-4 text-[#d6cec4]">{lead.interest}</td>
                            <td className="px-3 py-4 text-[#d6cec4]">{lead.source}</td>
                            <td className="px-3 py-4">
                              <Badge
                                variant="outline"
                                className="border-[rgba(17,119,255,0.28)] text-[#8fb8ff]"
                              >
                                {lead.statusLabel}
                              </Badge>
                            </td>
                            <td className="px-3 py-4 text-[#d6cec4]">{new Date(lead.followUpAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Assistant response</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      The assistant sees the new lead instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4 text-sm leading-7 text-[#d6cec4]">
                      That lead just entered your system automatically. You didn&apos;t have to copy anything into a spreadsheet or remember to follow up later.
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-[linear-gradient(135deg,#1177ff,#7ab2ff)] text-[#07101f]"
                        onClick={() => scrollToSection("crm")}
                      >
                        Open CRM
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-[rgba(255,255,255,0.1)] bg-transparent text-[#f6f0e4]"
                        onClick={() => dispatch({ type: "assistant-user", text: "Write a follow-up for the newest lead.", route })}
                      >
                        Ask AI for a follow-up
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="crm"
              eyebrow="4. CRM"
              title="Pipeline management that stays in the demo safely"
              description="Move a lead through the pipeline, add notes, and see the next step. Outbound actions remain simulated unless explicit demo destinations are configured."
              action={<Badge variant="outline" className="border-[rgba(17,119,255,0.3)] text-[#8fb8ff]">NEW LEAD → CONTACTED → INTERESTED → QUALIFIED → CUSTOMER</Badge>}
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {stages.map((stage) => {
                    const items = state.leads.filter((lead) => lead.stage === stage);
                    return (
                      <div
                        key={stage}
                        className="rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs uppercase tracking-[0.22em] text-[#d8a43a]">
                            {stage.replace("_", " ")}
                          </h3>
                          <span className="text-xs text-[#8fb8ff]">{items.length}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {items.map((lead) => (
                            <button
                              key={lead.id}
                              className={cn(
                                "w-full rounded-2xl border px-3 py-3 text-left transition hover:border-[rgba(216,164,58,0.28)]",
                                lead.id === state.selectedLeadId
                                  ? "border-[rgba(216,164,58,0.28)] bg-[rgba(216,164,58,0.08)]"
                                  : "border-[rgba(255,255,255,0.08)] bg-black/20"
                              )}
                              onClick={() => dispatch({ type: "lead-select", leadId: lead.id })}
                            >
                              <div className="text-sm font-medium text-[#f6f0e4]">{lead.name}</div>
                              <div className="mt-1 text-xs text-[#a9a39a]">{lead.interest}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                    <CardHeader>
                      <CardTitle className="text-[#f6f0e4]">Lead detail</CardTitle>
                      <CardDescription className="text-[#a9a39a]">
                        Open a lead, add a note, and shift the stage.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4">
                        <div className="text-lg font-medium text-[#f6f0e4]">{currentLead?.name}</div>
                        <div className="mt-1 text-sm text-[#a9a39a]">{currentLead?.email}</div>
                        <div className="mt-3 text-sm leading-7 text-[#d6cec4]">{currentLead?.message}</div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {stages.map((stage) => (
                          <Button
                            key={stage}
                            variant="outline"
                            className="border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]"
                            onClick={() => currentLead && dispatch({ type: "lead-stage", leadId: currentLead.id, stage })}
                          >
                            Move to {stage.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                      <Textarea
                        placeholder="Add a note to the lead..."
                        className="min-h-24 border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
                        onBlur={(event) => {
                          if (!currentLead || !event.target.value.trim()) return;
                          dispatch({
                            type: "lead-note",
                            leadId: currentLead.id,
                            note: event.target.value.trim(),
                          });
                          event.target.value = "";
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-[#f6f0e4]">AI next step</CardTitle>
                      <CardDescription className="text-[#a9a39a]">
                        The assistant recommends follow-up in plain language.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4 text-sm leading-7 text-[#d6cec4]">
                        This customer expressed interest but hasn&apos;t been contacted yet. I recommend following up today.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="assistant"
              eyebrow="5. AI BUSINESS ASSISTANT"
              title="Ask the assistant to run the business with you"
              description="The assistant understands the demo context, the current page, the active lead, and the guided tour stage."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">Context-aware fallback ready</Badge>}
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Suggestion chips</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      Ask the assistant to create, analyze, or explain the business.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {[
                      "Create a social post",
                      "Write a follow-up",
                      "Analyze my leads",
                      "Give me today's priorities",
                      "Create a promotion",
                      "Explain my dashboard",
                      "Build a 30-day marketing plan",
                    ].map((chip) => (
                      <button
                        key={chip}
                        className="rounded-full border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-2 text-sm text-[#f6f0e4] transition hover:border-[rgba(216,164,58,0.3)]"
                        onClick={() => handleAssistantQuestion(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Assistant context</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      The prompt is structured instead of dumping the whole app into the model.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                    <p>Prospect: {profile.prospectName}</p>
                    <p>Company: {profile.companyName}</p>
                    <p>Route: /demo/{slug}</p>
                    <p>Tour step: {currentTourStep?.title ?? "None"}</p>
                    <p>Modules: {profile.modules.join(", ")}</p>
                    <p>Pricing: {formatCurrency(profile.pricing.setupFee)} setup / {formatCurrency(profile.pricing.monthlyPrice)} monthly</p>
                    <Separator className="my-3 bg-[rgba(255,255,255,0.08)]" />
                    <p className="text-[#8fb8ff]">{profile.assistantWelcome}</p>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="content-studio"
              eyebrow="6. CONTENT STUDIO"
              title="Generate coordinated content in your brand voice"
              description={`Brand voice: ${profile.brandVoice}. The demo can create social, email, SMS, and website copy without publishing anything automatically.`}
              action={<Badge variant="outline" className="border-[rgba(17,119,255,0.3)] text-[#8fb8ff]">DEMO MODE</Badge>}
            >
              <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Campaign brief</CardTitle>
                    <CardDescription className="text-[#a9a39a]">Create a campaign around the brand moment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={state.contentTheme}
                      onChange={(event) => {
                        const value = event.target.value;
                        dispatch({
                          type: "assistant-user",
                          text: `Set content theme to ${value}.`,
                          route,
                        });
                      }}
                      placeholder="Campaign name"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
                    />
                    <Button
                      className="w-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
                      onClick={() => dispatch({ type: "content-generate" })}
                    >
                      Generate campaign assets
                    </Button>
                    <p className="text-xs leading-6 text-[#a9a39a]">
                      The system will generate coordinated assets for Instagram, Facebook, TikTok, email, SMS, and the website banner.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(state.contentAssets.length ? state.contentAssets : createContentAssets(profile, profile.brandTagline)).map((asset) => (
                    <Card key={asset.channel} className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                      <CardHeader>
                        <CardTitle className="text-[#f6f0e4]">{asset.channel}</CardTitle>
                        <CardDescription className="text-[#a9a39a]">{asset.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-7 text-[#d6cec4]">{asset.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="automation"
              eyebrow="7. AUTOMATION"
              title="Lead capture becomes workflow execution"
              description="A new website lead can save the record, classify the inquiry, assign a stage, create a follow-up task, notify the dashboard, and update analytics."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">This is where WISE² gives you your time back</Badge>}
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <div className="rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <Badge className="bg-[rgba(17,119,255,0.12)] text-[#8fb8ff]">NEW WEBSITE LEAD</Badge>
                    <Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-[#f6f0e4]">
                      Save Lead
                    </Badge>
                    <Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-[#f6f0e4]">
                      AI Classifies Interest
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-stretch gap-3">
                    {profile.workflowNodes.map((node, index) => (
                      <div key={node.id} className="flex flex-1 min-w-[150px] items-center gap-3">
                        <FlowDot
                          label={node.label}
                          active={state.workflowProgress.includes(node.id)}
                          blue={index % 2 === 1}
                        />
                        {index < profile.workflowNodes.length - 1 ? (
                          <ArrowRight className="h-5 w-5 shrink-0 text-[#d8a43a]" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)] px-4 py-3 text-sm leading-7 text-[#d6cec4]">
                    This workflow can be triggered by the demo lead form and then safely stop before any real outbound action.
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      className="bg-[linear-gradient(135deg,#1177ff,#7ab2ff)] text-[#07101f]"
                      onClick={handleWorkflowRun}
                    >
                      Run demo workflow
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]"
                      onClick={() => dispatch({ type: "assistant-user", text: "This is where WISE² starts giving you your time back.", route })}
                    >
                      Ask AI to explain
                    </Button>
                  </div>
                </div>
                <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Execution log</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      The workflow animates node by node in demo mode.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {profile.workflowNodes.map((node) => (
                      <div
                        key={node.id}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm transition",
                          state.workflowProgress.includes(node.id)
                            ? "border-[rgba(216,164,58,0.3)] bg-[rgba(216,164,58,0.08)] text-[#f6f0e4]"
                            : "border-[rgba(255,255,255,0.08)] bg-black/20 text-[#a9a39a]"
                        )}
                      >
                        <div className="font-medium">{node.label}</div>
                        <div className="mt-1 text-xs">{node.detail}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="journey"
              eyebrow="8. CUSTOMER JOURNEY"
              title="Discover, visit, inquire, follow up, convert, retain, refer"
              description="The demo maps the customer journey so you can see how WISE² tracks the business from the first impression through referral."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">One operating system</Badge>}
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <div className="rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
                    {profile.customerJourney.map((step, index) => (
                      <div key={step} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-5 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(216,164,58,0.28)] bg-[rgba(216,164,58,0.08)] text-sm font-semibold text-[#d8a43a]">
                          {index + 1}
                        </div>
                        <div className="mt-3 text-sm font-medium text-[#f6f0e4]">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Why it matters</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      The business can see where the relationship moves forward and where it gets stuck.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                    <p>WISE² keeps the brand moment premium while still operationally useful.</p>
                    <p>Every touchpoint is visible so the business can build momentum, retain attention, and earn referrals.</p>
                    <p className="text-[#8fb8ff]">Customer journey data and demo workflows remain isolated from live customer records.</p>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="analytics"
              eyebrow="9. ANALYTICS"
              title="A polished dashboard with seeded demo insights"
              description="The reporting view is visually rich, responsive, and clearly marked as demo data so it never gets confused with actual performance."
              action={<Badge variant="outline" className="border-[rgba(17,119,255,0.3)] text-[#8fb8ff]">DEMO DATA - NOT ACTUAL BUSINESS PERFORMANCE</Badge>}
            >
              <div className="space-y-4">
                <InsightsChart profile={profile} state={state} />
                <div className="grid gap-4 md:grid-cols-3">
                  {profile.insights.map((insight) => (
                    <Card key={insight.title} className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                      <CardHeader>
                        <CardTitle className="text-[#f6f0e4]">{insight.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-7 text-[#d6cec4]">{insight.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="mobile"
              eyebrow="10. MOBILE COMMAND CENTER"
              title="The business follows you onto your phone"
              description="This responsive preview shows the experience on a smaller screen without breaking the premium presentation."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">Responsive on desktop, tablet, and mobile</Badge>}
            >
              <div className="grid gap-5 xl:grid-cols-[350px_1fr]">
                <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-[rgba(255,255,255,0.08)] bg-black p-3 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                  <div className="overflow-hidden rounded-[2rem] border border-[rgba(216,164,58,0.18)] bg-[linear-gradient(180deg,rgba(10,10,12,0.98),rgba(7,7,8,0.98))] p-4">
                    <div className="flex items-center justify-between text-[11px] text-[#a9a39a]">
                      <span>9:41</span>
                      <span>{profile.companyName}</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-[rgba(216,164,58,0.26)] bg-[rgba(216,164,58,0.08)] p-4 text-center">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#d8a43a]">{profile.heroTitle}</p>
                      <p className="mt-2 text-lg font-medium text-[#f6f0e4]">{profile.prospectName}</p>
                      <p className="mt-1 text-[11px] leading-6 text-[#b5aea6]">{profile.mobileCallout}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">Leads</div>
                        <div className="mt-2 text-2xl font-semibold text-[#f6f0e4]">{metrics.leads}</div>
                      </div>
                      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-[#b5aea6]">Conversion</div>
                        <div className="mt-2 text-2xl font-semibold text-[#8fb8ff]">{metrics.conversionRate}%</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button className="w-full rounded-2xl border border-[rgba(216,164,58,0.26)] bg-[rgba(216,164,58,0.08)] px-4 py-3 text-sm text-[#f6f0e4]">
                        {profile.primaryCta}
                      </button>
                      <button className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-3 text-sm text-[#d6cec4]">
                        {profile.secondaryCta}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                    <CardHeader>
                      <CardTitle className="text-[#f6f0e4]">What works on mobile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                      <p>Review leads.</p>
                      <p>Check performance.</p>
                      <p>Respond to inquiries.</p>
                      <p>Use the assistant anywhere.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-[#f6f0e4]">Mobile-ready assistant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                      <p>You don&apos;t have to be sitting at a computer to check the business.</p>
                      <p>WISE² stays premium and usable on phones and tablets.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="pricing"
              eyebrow="11. WISE² STARTER PLAN"
              title="A clean handoff into the starter plan"
              description="The conversion path is deliberate. DEMO_MODE stops before any real charge and requires a confirmation step before checkout or activation."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">Activation handoff only</Badge>}
            >
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-[rgba(216,164,58,0.22)] bg-[rgba(216,164,58,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">{profile.starterPlanName}</CardTitle>
                    <CardDescription className="text-[#b5aea6]">{profile.starterPlanSubtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-5xl font-semibold text-[#d8a43a]">{formatCurrency(profile.pricing.setupFee)}</div>
                    <p className="max-w-2xl text-sm leading-7 text-[#d6cec4]">{profile.offerDescription}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {profile.modules.map((module) => (
                        <div
                          key={module}
                          className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-3 text-sm text-[#f6f0e4]"
                        >
                          <Check className="h-4 w-4 text-[#1177ff]" />
                          {module}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8fb8ff]">{profile.pricingHandoff}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
                        onClick={() => {
                          dispatch({ type: "pricing-open" });
                        }}
                      >
                        I&apos;m ready to get started
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]"
                        onClick={() => scrollToSection("command-center")}
                      >
                        Replay tour
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Pricing confirmation</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      Demo-only activation gate with a clear confirmation step.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 text-[#d6cec4]">
                    <p>Real checkout is never triggered unless an authorized production flow is intentionally connected later.</p>
                    <p>Any button that looks like checkout still remains inside the demo guardrail.</p>
                    <p className="text-[#8fb8ff]">This keeps the handoff polished without risking a charge, SMS, or outbound email from the demo.</p>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="legacy"
              eyebrow="12. TRANSFORMATION"
              title="Javon, this is your business on WISE²"
              description="The tour ends by connecting the brand, website, customers, marketing, automations, analytics, and AI assistant into one operating system."
              action={<Badge variant="outline" className="border-[rgba(216,164,58,0.3)] text-[#d8a43a]">One operating system</Badge>}
            >
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-[1.9rem] border border-[rgba(216,164,58,0.25)] bg-[linear-gradient(180deg,rgba(12,12,14,0.95),rgba(7,7,8,0.98))] p-6">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {["Your Brand", "Your Website", "Your Customers", "Your Marketing", "Your Automations", "Your Analytics", "Your AI Assistant"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-4 text-sm font-medium text-[#f6f0e4]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)] px-4 py-4 text-sm leading-7 text-[#d6cec4]">
                    <p className="text-[#8fb8ff]">JAVON&apos;S SPIRITS × WISE²</p>
                    <p className="mt-2 text-lg text-[#f6f0e4]">Crafted for the Moment. Powered for the Future.</p>
                    <p className="mt-2">The demo is designed to feel like a working business system, not an engineering dashboard.</p>
                  </div>
                </div>
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Next steps</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      Keep exploring, replay the tour, or activate the starter plan handoff.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]" onClick={() => dispatch({ type: "pricing-open" })}>
                      Activate my WISE² starter plan
                    </Button>
                    <Button variant="outline" className="w-full border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]" onClick={() => dispatch({ type: "tour-start" })}>
                      Replay tour
                    </Button>
                    <Button variant="ghost" className="w-full text-[#f6f0e4]" onClick={() => scrollToSection("command-center")}>
                      Explore dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>

            <SectionShell
              id="admin"
              eyebrow="Admin Demo Control"
              title="Internal configuration"
              description="This unlock panel lets internal operators configure the demo profile in a safe browser session."
              action={<Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-[#f6f0e4]">Internal</Badge>}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.72)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Unlock code</CardTitle>
                    <CardDescription className="text-[#a9a39a]">
                      Admin controls stay hidden until the session is explicitly unlocked.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={adminCode}
                      onChange={(event) => setAdminCode(event.target.value)}
                      placeholder="Enter admin code"
                      className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
                    />
                    <Button
                      className="bg-[linear-gradient(135deg,#1177ff,#7ab2ff)] text-[#07101f]"
                      onClick={() => dispatch({ type: "admin-unlock", code: adminCode || DEMO_ADMIN_CODE })}
                    >
                      Unlock internal controls
                    </Button>
                    <p className="text-sm text-[#a9a39a]">{state.adminMessage}</p>
                  </CardContent>
                </Card>
                <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-[#f6f0e4]">Configurable fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                    <p>Demo slug, prospect name, company, logo, colors, industry, offer, pricing, modules, tour steps, greeting, CTA, expiration, and active state.</p>
                    <p>Future demos like /demo/craig, /demo/lexi, and /demo/christian can reuse the same route and profile system.</p>
                    <p className="text-[#8fb8ff]">Unauthorized admin access stays blocked by the unlock gate above.</p>
                  </CardContent>
                </Card>
              </div>
            </SectionShell>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-28 border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.74)]">
              <CardHeader>
                <CardTitle className="text-[#f6f0e4]">Demo control room</CardTitle>
                <CardDescription className="text-[#a9a39a]">Move around the experience without losing context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Command Center", "command-center"],
                  ["Website", "website"],
                  ["Lead Capture", "lead-capture"],
                  ["CRM", "crm"],
                  ["Assistant", "assistant"],
                  ["Content Studio", "content-studio"],
                  ["Automation", "automation"],
                  ["Journey", "journey"],
                  ["Analytics", "analytics"],
                  ["Mobile", "mobile"],
                  ["Pricing", "pricing"],
                ].map(([label, sectionId]) => (
                  <Button
                    key={sectionId}
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]",
                      state.currentSection === sectionId && "border-[rgba(216,164,58,0.35)] bg-[rgba(216,164,58,0.08)]"
                    )}
                    onClick={() => scrollToSection(sectionId as DemoSectionId)}
                  >
                    {label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.74)]">
              <CardHeader>
                <CardTitle className="text-[#f6f0e4]">Session summary</CardTitle>
                <CardDescription className="text-[#a9a39a]">What the assistant knows right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-[#d6cec4]">
                <p>Current route: /demo/{slug}</p>
                <p>Current section: {sectionLabel(state.currentSection)}</p>
                <p>Tour started: {state.tourStarted ? "Yes" : "No"}</p>
                <p>Tour finished: {state.tourFinished ? "Yes" : "No"}</p>
                <p>Leads captured: {state.leads.length}</p>
                <p>Pricing acknowledged: {state.pricingAcknowledged ? "Yes" : "No"}</p>
                <p>Admin unlocked: {state.adminUnlocked ? "Yes" : "No"}</p>
                <Separator className="my-3 bg-[rgba(255,255,255,0.08)]" />
                <p className="text-[#8fb8ff]">{profile.legacyLine}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <TourOverlay
        profile={profile}
        state={state}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onSkip={() => dispatch({ type: "tour-skip" })}
        onFinish={() => dispatch({ type: "tour-finish" })}
      />

      <AssistantPanel
        profile={profile}
        state={state}
        route={route}
        onToggle={() => dispatch({ type: "assistant-toggle" })}
        onOpenPricing={() => {
          dispatch({ type: "pricing-open" });
          scrollToSection("pricing");
        }}
        onLaunchTour={() => {
          dispatch({ type: "tour-start" });
          scrollToSection("command-center");
        }}
        onQuestion={handleAssistantQuestion}
      />

      <Dialog open={state.pricingAckOpen} onOpenChange={(open) => dispatch({ type: open ? "pricing-open" : "pricing-close" })}>
        <DialogContent className="max-w-2xl border border-[rgba(216,164,58,0.28)] bg-[rgba(8,8,10,0.98)] text-[#f6f0e4]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm your starter plan handoff</DialogTitle>
            <DialogDescription className="text-[#b5aea6]">
              DEMO_MODE prevents real checkout, card charging, SMS, or email sends until an explicit production flow is connected and confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-7 text-[#d6cec4]">
            <p>{profile.offerTitle}</p>
            <p>{formatCurrency(profile.pricing.setupFee)} setup and {formatCurrency(profile.pricing.monthlyPrice)} per month.</p>
            <p>Would you like to continue to the safe demo handoff and review the offer details?</p>
          </div>
          <DialogFooter className="border-t border-[rgba(255,255,255,0.08)] bg-transparent">
            <Button variant="outline" className="border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]" onClick={() => dispatch({ type: "pricing-close" })}>
              Keep exploring
            </Button>
            <Button
              className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
              onClick={() => dispatch({ type: "pricing-confirm" })}
            >
              Continue in demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
