import { canMarkComplete, nextCompletionChain, parseWojiChain, type WojiProjectState } from "../index";
import { createCheckpoint, restoreCheckpoint } from "../checkpoints";
import { executeWojiChain, planWojiExecution } from "../orchestrator";
import { setQaResult, type WojiProjectRecord } from "../state";

const state = (patch: Partial<WojiProjectState> = {}): WojiProjectState => ({
  projectId: "test",
  progress: 75,
  locks: [],
  missing: ["qa"],
  blockers: [],
  activeWork: [],
  tests: [],
  handoffReady: false,
  ...patch,
});

const record = (patch: Partial<WojiProjectRecord> = {}): WojiProjectRecord => ({
  ...state(),
  name: "WOJI test project",
  contractVersion: "WOJI-CONTRACT/1.0",
  locksDetailed: [],
  events: [],
  checkpoints: [],
  updatedAt: "2026-09-24T12:00:00.000Z",
  ...patch,
});

const now = "2026-09-24T12:30:00.000Z";

describe("WOJI control engine", () => {
  test("normalizes the fast-forward alias", () => {
    expect(parseWojiChain("👌🔒⏩").normalized).toBe("👌🔒⏭️");
  });

  test("captures unknown tokens without corrupting recognized commands", () => {
    const parsed = parseWojiChain("👌x🔒");
    expect(parsed.commands.map((command) => command.token)).toEqual(["👌", "🔒"]);
    expect(parsed.unknown).toEqual(["x"]);
  });

  test("does not fake completion", () => {
    expect(canMarkComplete(state())).toBe(false);
    expect(nextCompletionChain(state())).toBe("🧩🔧🧪");
  });

  test("allows verified completion only after gates pass", () => {
    const done = state({ progress: 100, missing: [], tests: [{ name: "qa", passed: true }] });
    expect(canMarkComplete(done)).toBe(true);
    expect(nextCompletionChain(done)).toBe("💯🔒📦");
  });

  test("blocks deploy for non-owner", () => {
    const plan = planWojiExecution("🚀", "operator", state(), true);
    expect(plan.stop).toBe(true);
    expect(plan.steps[0]?.reason).toBe("permission_denied");
  });

  test("requires human gate for owner deploy", () => {
    const plan = planWojiExecution("🚀", "owner", state(), false);
    expect(plan.steps[0]?.reason).toBe("human_gate_required");
  });

  test.each([
    "👌🔒⏭️",
    "♻️🩺⏭️",
    "💾🛠️🧪",
    "🏃🏁📦",
  ])("parses representative chain %s", (chain) => {
    expect(parseWojiChain(chain).commands.length).toBeGreaterThan(0);
    expect(parseWojiChain(chain).unknown).toEqual([]);
  });

  test("does not mutate project state after permission denial", () => {
    const source = record();
    const result = executeWojiChain(source, "🚀⏭️", "operator", { humanApproved: true, now });
    expect(result.outcomes).toHaveLength(1);
    expect(result.outcomes[0]?.code).toBe("🛡️❌");
    expect(result.record).toEqual(source);
  });

  test("rejects incomplete verified completion without mutation", () => {
    const source = record();
    const result = executeWojiChain(source, "💯", "owner", { humanApproved: true, now });
    expect(result.outcomes[0]?.result).toBe("completion_gate_failed");
    expect(result.record).toEqual(source);
  });

  test("creates and restores a protected checkpoint", () => {
    const checkpointed = createCheckpoint(record({ target: "Engine QA" }), "Before build", true, now);
    const changed = { ...checkpointed, target: "Unsafe replacement", progress: 99 };
    const restored = restoreCheckpoint(changed);
    expect(restored.target).toBe("Engine QA");
    expect(restored.progress).toBe(75);
    expect(restored.checkpoints[0]?.protected).toBe(true);
  });

  test("blocks conflicting work against a locked scope", () => {
    const source = record({
      target: "Architecture",
      locksDetailed: [{
        id: "lock-1",
        decision: "Approved architecture",
        reason: "Locked",
        scope: "architecture",
        level: 2,
        source: "owner",
        createdAt: now,
      }],
    });
    const result = executeWojiChain(source, "🛠️", "owner", { scope: "architecture", now });
    expect(result.outcomes[0]?.code).toBe("⚠️🔒");
    expect(result.record).toEqual(source);
  });

  test("moves from failing QA to a verified retest without faking completion", () => {
    const failing = record({ progress: 100, missing: [], tests: [{ name: "integration", passed: false }] });
    expect(nextCompletionChain(failing)).toBe("🧪🔧🧪");
    const repaired = setQaResult(failing, "integration", true);
    expect(canMarkComplete(repaired)).toBe(true);
    expect(nextCompletionChain(repaired)).toBe("💯🔒📦");
  });

  test("executes checkpoint, build, and test through the real engine", () => {
    const result = executeWojiChain(record(), "💾🛠️🧪", "builder", { now, workItem: "Control Deck" });
    expect(result.outcomes.map((outcome) => outcome.code)).toEqual(["✅", "✅", "✅"]);
    expect(result.record.checkpoints.length).toBe(2);
    expect(result.record.activeWork).toContain("Control Deck");
    expect(result.record.events).toHaveLength(3);
  });

  test("packages the autopilot chain only from a verified state", () => {
    const source = record({ progress: 100, missing: [], tests: [{ name: "integration", passed: true }] });
    const result = executeWojiChain(source, "🏃🏁📦", "owner", { humanApproved: true, now });
    expect(result.outcomes.map((outcome) => outcome.code)).toEqual(["✅", "✅", "✅"]);
    expect(result.record.handoffReady).toBe(true);
  });
});
