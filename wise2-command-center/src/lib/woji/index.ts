export const WOJI_CONTRACT_VERSION = "WOJI-CONTRACT/1.0" as const;

export type WojiAuthority = "read" | "plan" | "write" | "execute" | "deploy" | "complete";
export type WojiRoute = "chat" | "code" | "visual" | "video" | "web-app" | "docs" | "qa" | "handoff" | "integration";

export interface WojiCommand {
  token: string;
  name: string;
  intent: string;
  authority: WojiAuthority;
  route?: WojiRoute;
  locked?: boolean;
}

export const WOJI_COMMANDS: readonly WojiCommand[] = [
  { token: "👌", name: "approve", intent: "Approve current result", authority: "write", locked: true },
  { token: "🔒", name: "lock", intent: "Preserve approved decision", authority: "write", locked: true },
  { token: "💚", name: "prefer", intent: "Mark preferred direction", authority: "write", locked: true },
  { token: "🔄", name: "revise", intent: "Revise current result", authority: "write", locked: true },
  { token: "👀", name: "inspect", intent: "Inspect or show another option", authority: "read", locked: true },
  { token: "🎨", name: "visual", intent: "Create or review visual work", authority: "write", route: "visual", locked: true },
  { token: "🛠️", name: "build", intent: "Implement approved work", authority: "write", route: "code", locked: true },
  { token: "📦", name: "package", intent: "Package handoff", authority: "execute", route: "handoff", locked: true },
  { token: "🧪", name: "test", intent: "Run QA and verification", authority: "execute", route: "qa", locked: true },
  { token: "🚀", name: "deploy", intent: "Deploy or publish", authority: "deploy", locked: true },
  { token: "⏭️", name: "next", intent: "Advance to next approved action", authority: "execute", locked: true },
  { token: "⏩", name: "next_alias", intent: "Advance to next approved action", authority: "execute" },
  { token: "⏸️", name: "pause", intent: "Pause current workflow", authority: "execute", locked: true },
  { token: "⏹️", name: "stop", intent: "Stop autopilot immediately", authority: "execute" },
  { token: "❌", name: "reject", intent: "Reject or remove current item", authority: "write", locked: true },
  { token: "💡", name: "idea", intent: "Explore an idea", authority: "plan", locked: true },
  { token: "📋", name: "breakdown", intent: "Produce full breakdown", authority: "plan", locked: true },
  { token: "📝", name: "easy_copy", intent: "Produce easy-copy handoff text", authority: "plan", locked: true },
  { token: "🎯", name: "target", intent: "Set current priority", authority: "plan" },
  { token: "🩺", name: "health", intent: "Audit project health", authority: "read" },
  { token: "🧩", name: "gap", intent: "Identify missing piece", authority: "read" },
  { token: "🚧", name: "blocked", intent: "Mark blocked state", authority: "write" },
  { token: "🔧", name: "fix", intent: "Repair current problem", authority: "write", route: "code" },
  { token: "💯", name: "verified_complete", intent: "Mark complete only after acceptance criteria pass", authority: "complete" },
  { token: "♻️", name: "resume", intent: "Restore latest verified project context", authority: "execute" },
  { token: "💾", name: "checkpoint", intent: "Create recovery checkpoint", authority: "write" },
  { token: "↩️", name: "restore", intent: "Restore safe checkpoint", authority: "write" },
  { token: "📡", name: "event_log", intent: "Read activity log", authority: "read" },
  { token: "☁️", name: "sync", intent: "Synchronize project state", authority: "execute" },
  { token: "💻", name: "code", intent: "Route to code workflow", authority: "write", route: "code" },
  { token: "🎬", name: "video", intent: "Route to video workflow", authority: "write", route: "video" },
  { token: "🌐", name: "web_app", intent: "Route to website/app workflow", authority: "write", route: "web-app" },
  { token: "🧾", name: "docs", intent: "Route to documentation workflow", authority: "plan", route: "docs" },
  { token: "🔗", name: "integration", intent: "Route to integration workflow", authority: "write", route: "integration" },
  { token: "🏃", name: "run", intent: "Execute approved current task", authority: "execute" },
  { token: "🏁", name: "finish", intent: "Advance toward verified completion", authority: "complete" }
] as const;

const byToken = new Map(WOJI_COMMANDS.map((command) => [command.token, command]));

export interface ParsedWojiChain {
  raw: string;
  normalized: string;
  commands: WojiCommand[];
  unknown: string[];
  completionRun: boolean;
}

export function parseWojiChain(raw: string): ParsedWojiChain {
  const normalized = raw.replaceAll("⏩", "⏭️").trim();
  const commands: WojiCommand[] = [];
  let remaining = normalized;

  const tokens = [...WOJI_COMMANDS]
    .map((command) => command.token)
    .filter((token, index, all) => all.indexOf(token) === index)
    .sort((a, b) => b.length - a.length);

  while (remaining.length) {
    const whitespace = remaining.match(/^\s+/u)?.[0];
    if (whitespace) {
      remaining = remaining.slice(whitespace.length);
      continue;
    }
    const token = tokens.find((candidate) => remaining.startsWith(candidate));
    if (token) {
      const command = byToken.get(token);
      if (command) commands.push(command);
      remaining = remaining.slice(token.length);
      continue;
    }
    const [unknown] = Array.from(remaining);
    remaining = remaining.slice(unknown.length);
    commands.push();
  }

  const recognizedText = commands.map((command) => command?.token ?? "").join("");
  const unknown = Array.from(normalized.replace(recognizedText, "").replace(/\s/gu, ""));
  return {
    raw,
    normalized,
    commands: commands.filter(Boolean),
    unknown,
    completionRun: normalized.includes("🏃🏁📦")
  };
}

export interface WojiProjectState {
  projectId: string;
  progress: number;
  locks: string[];
  missing: string[];
  blockers: string[];
  activeWork: string[];
  tests: { name: string; passed: boolean }[];
  handoffReady: boolean;
  nextAction?: string;
}

export function canMarkComplete(state: WojiProjectState): boolean {
  return state.progress === 100 &&
    state.missing.length === 0 &&
    state.blockers.length === 0 &&
    state.tests.length > 0 &&
    state.tests.every((test) => test.passed);
}

export function nextCompletionChain(state: WojiProjectState): string {
  if (state.blockers.length) return "🚧🩺";
  if (state.missing.length) return "🧩🔧🧪";
  if (!state.tests.length || state.tests.some((test) => !test.passed)) return "🧪🔧🧪";
  if (!canMarkComplete(state)) return "🩺🎯⏭️";
  return state.handoffReady ? "💯🔒" : "💯🔒📦";
}
