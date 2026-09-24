import { canMarkComplete, nextCompletionChain, parseWojiChain, type WojiCommand, type WojiProjectState } from "./index";
import { createCheckpoint, restoreCheckpoint } from "./checkpoints";
import { recordWojiEvent } from "./events";
import { isAuthorized, requiresHumanGate, type WojiRole } from "./permissions";
import { lockConflict, type WojiLockLevel, type WojiProjectRecord } from "./state";

export interface WojiExecutionStep { command:WojiCommand; status:"ready"|"blocked"; reason?:string; }
export interface WojiExecutionPlan { normalized:string; steps:WojiExecutionStep[]; stop:boolean; completionRun:boolean; }

export function planWojiExecution(raw:string,role:WojiRole,state:WojiProjectState,humanApproved=false):WojiExecutionPlan {
 const parsed=parseWojiChain(raw);
 const steps:WojiExecutionStep[]=[];
 let stopped=false;
 for(const command of parsed.commands){
   let reason:string|undefined;
   if(!isAuthorized(role,command.authority)) reason="permission_denied";
   else if(requiresHumanGate(command.authority)&&!humanApproved) reason="human_gate_required";
   else if(command.name==="verified_complete"&&(state.progress!==100||state.missing.length||state.blockers.length||!state.tests.length||state.tests.some(t=>!t.passed))) reason="completion_gate_failed";
   const status=reason?"blocked":"ready";
   steps.push({command,status,reason});
   if(reason){ stopped=true; break; }
 }
 return {normalized:parsed.normalized,steps,stop:stopped,completionRun:parsed.completionRun};
}

export type WojiResultCode = "✅" | "🛡️❌" | "⚠️🔒" | "🧪❌" | "⏹️";

export interface WojiExecutionOutcome {
  command: WojiCommand;
  code: WojiResultCode;
  result: string;
  route?: WojiCommand["route"];
}

export interface WojiExecutionOptions {
  actor?: string;
  humanApproved?: boolean;
  lockDecision?: string;
  lockLevel?: WojiLockLevel;
  now?: string;
  protectedCheckpoint?: boolean;
  scope?: string;
  target?: string;
  workItem?: string;
}

export interface WojiExecutionResult {
  record: WojiProjectRecord;
  plan: WojiExecutionPlan;
  outcomes: WojiExecutionOutcome[];
  unknown: string[];
}

const conflictingCommands = new Set(["revise", "build", "fix", "reject"]);
const checkpointedCommands = new Set(["build", "deploy", "finish", "reject", "verified_complete"]);

export function executeWojiChain(
  source: WojiProjectRecord,
  raw: string,
  role: WojiRole,
  options: WojiExecutionOptions = {},
): WojiExecutionResult {
  const parsed = parseWojiChain(raw);
  const humanApproved = options.humanApproved ?? false;
  const plan = planWojiExecution(raw, role, source, humanApproved);
  const outcomes: WojiExecutionOutcome[] = [];
  let record = structuredClone(source);
  const now = options.now ?? new Date().toISOString();
  const actor = options.actor ?? role;
  const scope = options.scope ?? record.target ?? "project";

  for (const command of parsed.commands) {
    if (!isAuthorized(role, command.authority)) {
      outcomes.push({ command, code: "🛡️❌", result: "permission_denied", route: command.route });
      break;
    }
    if (command.name === "lock" && options.lockLevel === 3 && role !== "owner") {
      outcomes.push({ command, code: "🛡️❌", result: "permanent_lock_requires_owner", route: command.route });
      break;
    }
    if (requiresHumanGate(command.authority) && !humanApproved) {
      outcomes.push({ command, code: "🛡️❌", result: "human_gate_required", route: command.route });
      break;
    }
    if (command.name === "verified_complete" && !canMarkComplete(record)) {
      outcomes.push({ command, code: "🧪❌", result: "completion_gate_failed", route: command.route });
      break;
    }
    if (conflictingCommands.has(command.name) && lockConflict(record, scope).length > 0) {
      outcomes.push({ command, code: "⚠️🔒", result: "lock_conflict", route: command.route });
      break;
    }

    if (checkpointedCommands.has(command.name)) {
      record = createCheckpoint(record, `Before ${command.name}`, true, now);
    }

    const effect = applyCommand(record, command, role, options, scope, now);
    if (effect.code !== "✅") {
      outcomes.push({ command, ...effect, route: command.route });
      break;
    }

    record = recordWojiEvent(effect.record, {
      at: now,
      actor,
      woji: command.token,
      action: command.name,
      result: effect.result,
      checkpointId: effect.checkpointId,
    });
    outcomes.push({ command, code: effect.code, result: effect.result, route: command.route });
    if (command.name === "stop") break;
  }

  return { record, plan, outcomes, unknown: parsed.unknown };
}

interface AppliedCommand {
  record: WojiProjectRecord;
  code: WojiResultCode;
  result: string;
  checkpointId?: string;
}

function applyCommand(
  record: WojiProjectRecord,
  command: WojiCommand,
  role: WojiRole,
  options: WojiExecutionOptions,
  scope: string,
  now: string,
): AppliedCommand {
  if (command.name === "checkpoint") {
    const checkpointed = createCheckpoint(record, options.workItem ?? "Manual checkpoint", options.protectedCheckpoint ?? false, now);
    return { record: checkpointed, code: "✅", result: "checkpoint_created", checkpointId: checkpointed.checkpoints.at(-1)?.id };
  }
  if (command.name === "restore" || command.name === "resume") {
    if (record.checkpoints.length === 0) {
      return { record, code: "🧪❌", result: "checkpoint_not_found" };
    }
    const restored = restoreCheckpoint(record);
    return { record: restored, code: "✅", result: command.name === "resume" ? "context_resumed" : "checkpoint_restored" };
  }
  if (command.name === "lock") {
    const level = options.lockLevel ?? 1;
    const decision = options.lockDecision ?? record.target ?? "Approved decision";
    const lock = {
      id: `${record.projectId}:lock:${record.locksDetailed.length + 1}`,
      decision,
      reason: "Approved through WOJI Control Engine",
      scope,
      level,
      source: role,
      createdAt: now,
    };
    return {
      record: {
        ...record,
        locks: record.locks.includes(decision) ? record.locks : [...record.locks, decision],
        locksDetailed: [...record.locksDetailed, lock],
      },
      code: "✅",
      result: level === 3 ? "permanent_lock_created" : "decision_locked",
    };
  }
  if (command.name === "target" && options.target) {
    return { record: { ...record, target: options.target }, code: "✅", result: "target_updated" };
  }
  if (["build", "fix", "run"].includes(command.name)) {
    const workItem = options.workItem ?? command.intent;
    const activeWork = record.activeWork.includes(workItem) ? record.activeWork : [...record.activeWork, workItem];
    return { record: { ...record, activeWork }, code: "✅", result: "work_activated" };
  }
  if (command.name === "package") {
    const verified = canMarkComplete(record);
    return {
      record: {
        ...record,
        handoffReady: verified,
        nextAction: verified ? "Deliver verified handoff" : nextCompletionChain(record),
      },
      code: "✅",
      result: verified ? "handoff_packaged" : "handoff_not_ready",
    };
  }
  if (command.name === "verified_complete") {
    return { record: { ...record, nextAction: "Package verified handoff" }, code: "✅", result: "verified_complete" };
  }
  if (command.name === "pause" || command.name === "stop") {
    return {
      record: { ...record, activeWork: [], nextAction: command.name === "stop" ? "Await operator command" : "Resume approved work" },
      code: command.name === "stop" ? "⏹️" : "✅",
      result: command.name === "stop" ? "autopilot_stopped" : "workflow_paused",
    };
  }
  return { record, code: "✅", result: command.intent };
}
