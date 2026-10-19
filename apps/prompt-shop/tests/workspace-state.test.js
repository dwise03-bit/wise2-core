import test from "node:test";
import assert from "node:assert/strict";

import {
  HISTORY_LIMIT,
  applyGeneratedPrompt,
  blendStatus,
  canGenerate,
  completeGeneration,
  createProject,
  editPrompt,
  failGeneration,
  markSaved,
  rebalanceBlend,
  restoreProject,
  resetPromptOverride,
  selectResult,
  selectSubsystem,
  selectSystem,
  serializeProject,
  setBlendSlots,
  setBlendWeight,
  setDna,
  setSource,
  startGeneration,
  updateSettings,
} from "../src/features/workspace/projectState.js";

const slot = (sourceId, weight, extra = {}) => ({ sourceId, sourceType: "system", weight, ...extra });
const ready = (project = createProject()) => editPrompt(setBlendSlots(project, [slot("sys:a", 65), slot("sys:b", 35)]), "a neon street portrait");
const result = (id, extra = {}) => ({ id, assetUrl: `/generated/${id}.png`, watermarked: true, width: 512, height: 512, ...extra });

/* ---------------------------------------------------------- blend rules */

test("Blend: empty blend is valid and single-source generation stays allowed", () => {
  const status = blendStatus([]);
  assert.equal(status.valid, true);
  assert.equal(status.total, 0);
});

test("Blend: 65 + 35 totals exactly 100 and is valid", () => {
  const status = blendStatus([slot("a", 65), slot("b", 35)]);
  assert.deepEqual({ valid: status.valid, total: status.total, remaining: status.remaining }, { valid: true, total: 100, remaining: 0 });
});

test("Blend: 65 + 30 is invalid and reports 5% still unassigned", () => {
  const status = blendStatus([slot("a", 65), slot("b", 30)]);
  assert.equal(status.valid, false);
  assert.equal(status.remaining, 5);
  assert.match(status.reason, /5% still unassigned/);
});

test("Blend: over-assignment reports the excess", () => {
  const status = blendStatus([slot("a", 60), slot("b", 50)]);
  assert.equal(status.valid, false);
  assert.equal(status.remaining, -10);
  assert.match(status.reason, /10% over/);
});

test("Blend: zero-weight slots do not count toward the total", () => {
  assert.equal(blendStatus([slot("a", 100), slot("b", 0)]).valid, true);
});

test("Blend: setBlendWeight rejects non-integers and out-of-range weights", () => {
  const project = setBlendSlots(createProject(), [slot("a", 50), slot("b", 50)]);
  assert.throws(() => setBlendWeight(project, 0, 12.5), RangeError);
  assert.throws(() => setBlendWeight(project, 0, 101), RangeError);
  assert.throws(() => setBlendWeight(project, 5, 10), RangeError);
});

test("Blend: rebalance is explicit and makes weights total exactly 100", () => {
  const project = setBlendSlots(createProject(), [slot("a", 65), slot("b", 30)]);
  assert.equal(canGenerate(project).allowed, false);
  const balanced = rebalanceBlend(project);
  const weights = balanced.blendSlots.map((item) => item.weight);
  assert.equal(weights.reduce((sum, value) => sum + value, 0), 100);
  assert.deepEqual(weights, [68, 32]);
  assert.equal(blendStatus(balanced.blendSlots).valid, true);
});

test("Blend: three-way rebalance uses largest remainder so 33/33/33 becomes 34/33/33", () => {
  const project = setBlendSlots(createProject(), [slot("a", 33), slot("b", 33), slot("c", 33)]);
  assert.deepEqual(rebalanceBlend(project).blendSlots.map((item) => item.weight), [34, 33, 33]);
});

test("Blend: rebalance keeps zero-weight slots at zero and returns the same project when already valid", () => {
  const valid = setBlendSlots(createProject(), [slot("a", 70), slot("b", 30), slot("c", 0)]);
  assert.equal(rebalanceBlend(valid), valid);
  const withZero = setBlendSlots(createProject(), [slot("a", 30), slot("b", 30), slot("c", 0)]);
  assert.deepEqual(rebalanceBlend(withZero).blendSlots.map((item) => item.weight), [50, 50, 0]);
});

/* ------------------------------------------------- generation gate */

test("Generate: blocked for an empty prompt, invalid blend, or a running build", () => {
  const noPrompt = setBlendSlots(createProject(), [slot("a", 65), slot("b", 35)]);
  assert.equal(canGenerate(noPrompt).allowed, false);
  assert.match(canGenerate(noPrompt).reasons.join(" "), /prompt/);

  const invalid = editPrompt(setBlendSlots(createProject(), [slot("a", 65), slot("b", 30)]), "text");
  assert.equal(canGenerate(invalid).allowed, false);
  assert.throws(() => startGeneration(invalid), /5% still unassigned/);

  const running = startGeneration(ready());
  assert.equal(canGenerate(running).allowed, false);
});

test("Generate: 65/35 with a prompt is allowed and enters loading", () => {
  const started = startGeneration(ready());
  assert.equal(started.generation.status, "loading");
});

/* ---------------------------------------------------- subsystem scoping */

test("Subsystem: must belong to the currently selected parent system", () => {
  const project = selectSystem(createProject(), "sys:a");
  assert.throws(() => selectSubsystem(project, { id: "sub:x", parentId: "sys:b" }), /parent system/);
  const scoped = selectSubsystem(project, { id: "sub:x", parentId: "sys:a" });
  assert.deepEqual(scoped.subsystem, { id: "sub:x", parentId: "sys:a" });
});

test("Subsystem: changing the parent clears a subsystem from the old parent only", () => {
  const scoped = selectSubsystem(selectSystem(createProject(), "sys:a"), { id: "sub:x", parentId: "sys:a" });
  assert.equal(selectSystem(scoped, "sys:a").subsystem.id, "sub:x");
  assert.equal(selectSystem(scoped, "sys:b").subsystem, null);
});

/* -------------------------------------------- prompt and manual overrides */

test("Prompt: generated text never overwrites a manual edit unless forced", () => {
  const edited = editPrompt(createProject(), "my own words");
  assert.equal(edited.prompt.manualOverride, true);
  assert.equal(applyGeneratedPrompt(edited, "engine text").prompt.draft, "my own words");
  const forced = applyGeneratedPrompt(edited, "engine text", { force: true });
  assert.equal(forced.prompt.draft, "engine text");
  assert.equal(forced.prompt.manualOverride, false);
});

test("Prompt: generated text applies freely when the person has not edited", () => {
  assert.equal(applyGeneratedPrompt(createProject(), "engine text").prompt.draft, "engine text");
});

test("Prompt: resetPromptOverride is the explicit way back to generated text", () => {
  const reset = resetPromptOverride(editPrompt(createProject(), "mine"), "generated");
  assert.equal(reset.prompt.draft, "generated");
  assert.equal(reset.prompt.manualOverride, false);
});

/* ------------------------------------------- preserving state across builds */

test("Build: a finished result keeps blend, DNA and settings intact", () => {
  let project = ready();
  project = setDna(project, "lighting", "Neon Rim");
  project = updateSettings(project, { aspectRatio: "16:9", steps: 22 });
  project = completeGeneration(startGeneration(project), result("r1"));
  assert.equal(project.blendSlots[0].weight, 65);
  assert.equal(project.dna.lighting, "Neon Rim");
  assert.equal(project.settings.aspectRatio, "16:9");
  assert.equal(project.settings.steps, 22);
  assert.equal(project.generation.status, "success");
});

test("History: earlier results stay selectable, newest is selected", () => {
  let project = completeGeneration(startGeneration(ready()), result("r1"));
  project = completeGeneration(startGeneration(project), result("r2"));
  assert.deepEqual(project.history.map((item) => item.id), ["r2", "r1"]);
  assert.equal(project.selectedResultId, "r2");
  assert.equal(selectResult(project, "r1").selectedResultId, "r1");
});

test("History: a repeated result id is not duplicated and history is capped", () => {
  let project = completeGeneration(startGeneration(ready()), result("dup"));
  project = completeGeneration(project, result("dup"));
  assert.equal(project.history.length, 1);
  for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
    project = completeGeneration(project, result(`r${index}`));
  }
  assert.equal(project.history.length, HISTORY_LIMIT);
});

test("Build: a failed build keeps the last good result and blend", () => {
  const good = completeGeneration(startGeneration(ready()), result("r1"));
  const failed = failGeneration(startGeneration(good), "Local image service unavailable.");
  assert.equal(failed.generation.status, "error");
  assert.equal(failed.selectedResultId, "r1");
  assert.equal(failed.blendSlots[1].weight, 35);
});

test("Build: a result without id or assetUrl is rejected rather than shown as success", () => {
  assert.throws(() => completeGeneration(ready(), { id: "x" }), TypeError);
  assert.throws(() => completeGeneration(ready(), null), TypeError);
});

test("History: selecting an unknown result is refused", () => {
  assert.throws(() => selectResult(ready(), "missing"), RangeError);
});

/* ---------------------------------------------------------- settings */

test("Settings: steps and strength are clamped to the server-safe range", () => {
  const project = updateSettings(createProject(), { steps: 500, strength: 3 });
  assert.equal(project.settings.steps, 30);
  assert.equal(project.settings.strength, 0.9);
  assert.equal(updateSettings(createProject(), { steps: 1 }).settings.steps, 8);
});

test("Settings: unsupported aspect ratio is refused", () => {
  assert.throws(() => updateSettings(createProject(), { aspectRatio: "4:3" }), RangeError);
});

test("DNA: unknown controls are refused", () => {
  assert.throws(() => setDna(createProject(), "bogus", 1), RangeError);
});

/* ----------------------------------------------------- save and restore */

test("Save: edits mark the project unsaved; markSaved clears it", () => {
  const edited = setSource(createProject(), { name: "portrait.png", type: "image/png", size: 2048 });
  assert.equal(edited.saveState, "unsaved");
  assert.equal(markSaved(edited).saveState, "saved");
});

test("Save: source is stored as plain metadata, never a File object", () => {
  const project = setSource(createProject(), { name: "portrait.png", type: "image/png", size: 2048 });
  assert.equal(project.source.name, "portrait.png");
  assert.throws(() => setSource(createProject(), "not-an-object"), TypeError);
});

test("Save: serialize then restore round-trips everything the UI needs", () => {
  let project = selectSubsystem(selectSystem(ready(), "sys:a"), { id: "sub:x", parentId: "sys:a" });
  project = setDna(project, "palette", "Teal Shadow");
  project = applyGeneratedPrompt(project, "ignored because manual");
  project = completeGeneration(startGeneration(project), result("r1"));
  const stored = JSON.parse(JSON.stringify(serializeProject(project)));
  const restored = restoreProject(stored);

  assert.deepEqual(restored.blendSlots, project.blendSlots);
  assert.deepEqual(restored.subsystem, { id: "sub:x", parentId: "sys:a" });
  assert.equal(restored.dna.palette, "Teal Shadow");
  assert.equal(restored.prompt.draft, "a neon street portrait");
  assert.equal(restored.prompt.manualOverride, true);
  assert.equal(restored.selectedResultId, "r1");
  assert.equal(restored.generation.status, "idle");
  assert.equal(restored.saveState, "saved");
});

test("Save: serialized snapshot drops transient loading state", () => {
  const snapshot = serializeProject(startGeneration(ready()));
  assert.deepEqual(snapshot.generation, { status: "idle", message: "" });
});

test("Restore: unknown versions and garbage fall back to a clean project", () => {
  assert.equal(restoreProject(null).history.length, 0);
  assert.equal(restoreProject({ version: 999, prompt: { draft: "x" } }).prompt.draft, "");
  assert.equal(restoreProject("not an object").blendSlots.length, 0);
});

test("Restore: a subsystem whose parent no longer matches is dropped", () => {
  const restored = restoreProject({ version: 1, systemId: "sys:b", subsystem: { id: "sub:x", parentId: "sys:a" } });
  assert.equal(restored.subsystem, null);
});

test("Restore: malformed blend slots and history entries are skipped, not fatal", () => {
  const restored = restoreProject({
    version: 1,
    blendSlots: [{ sourceId: "a", weight: 65 }, { sourceId: "b", weight: 500 }, null],
    history: [{ id: "ok", assetUrl: "/generated/ok.png" }, { id: 7 }],
  });
  assert.deepEqual(restored.blendSlots.map((item) => item.sourceId), ["a"]);
  assert.deepEqual(restored.history.map((item) => item.id), ["ok"]);
});

test("Restore: one bad setting keeps the other valid settings", () => {
  const restored = restoreProject({ version: 1, settings: { aspectRatio: "4:3", steps: 22, strength: 0.4 } });
  assert.equal(restored.settings.aspectRatio, "1:1");
  assert.equal(restored.settings.steps, 22);
  assert.equal(restored.settings.strength, 0.4);
});
