import { canMarkComplete, nextCompletionChain, parseWojiChain, type WojiProjectState } from "./index";
import { planWojiExecution } from "./orchestrator";

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

describe("WOJI control engine", () => {
  test("normalizes the fast-forward alias", () => {
    expect(parseWojiChain("👌🔒⏩").normalized).toBe("👌🔒⏭️");
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
});
