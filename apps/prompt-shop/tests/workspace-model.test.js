import test from "node:test";
import assert from "node:assert/strict";

import { SUBSYSTEMS, SUBSYSTEM_BY_ID, SYSTEMS, SYSTEM_BY_ID, getSubsystemsForSystem } from "../src/data/catalog.js";
import { blendSourceOptions, generationInput, promptForSelection } from "../src/features/workspace/workspaceModel.js";
import { createProject, editPrompt, selectSubsystem, selectSystem, setBlendSlots, setSource, updateSettings } from "../src/features/workspace/projectState.js";

const systemA = SYSTEMS[0];
const systemB = SYSTEMS[1];
const subA = getSubsystemsForSystem(systemA.id).filter(Boolean)[0];
const subB = getSubsystemsForSystem(systemB.id).filter(Boolean)[0];

test("catalog fixtures exist for the tests below", () => {
  assert.ok(SYSTEMS.length >= 2);
  assert.ok(subA && subB, "need at least one subsystem per fixture system");
  assert.equal(subA.parentSystemId, systemA.id);
});

test("prompt: empty selection produces no text, so nothing overwrites the draft", () => {
  assert.equal(promptForSelection(createProject(), SYSTEM_BY_ID, SUBSYSTEM_BY_ID), "");
});

test("prompt: a single system names the system and uses its description", () => {
  const project = selectSystem(createProject(), systemA.id);
  const text = promptForSelection(project, SYSTEM_BY_ID, SUBSYSTEM_BY_ID);
  assert.match(text, new RegExp(systemA.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.ok(text.includes("Preserve the subject"));
});

test("prompt: a selected subsystem is named, scoped to its parent", () => {
  const project = selectSubsystem(selectSystem(createProject(), systemA.id), { id: subA.id, parentId: systemA.id });
  const text = promptForSelection(project, SYSTEM_BY_ID, SUBSYSTEM_BY_ID);
  assert.ok(text.includes(subA.name));
});

test("prompt: a valid two-source blend uses the hybrid prompt with both sources and weights", () => {
  const project = setBlendSlots(createProject(), [
    { sourceId: systemA.id, sourceType: "system", parentId: null, weight: 65 },
    { sourceId: systemB.id, sourceType: "system", parentId: null, weight: 35 },
  ]);
  const text = promptForSelection(project, SYSTEM_BY_ID, SUBSYSTEM_BY_ID);
  assert.ok(text.startsWith("HYBRID WISE TOUCH SYSTEM™"));
  assert.ok(text.includes("TOTAL INFLUENCE: 100%"));
  assert.ok(text.includes("65% influence"));
  assert.ok(text.includes("35% influence"));
});

test("prompt: a blend that does not total 100 falls back to the single-system prompt", () => {
  const project = selectSystem(setBlendSlots(createProject(), [
    { sourceId: systemA.id, sourceType: "system", parentId: null, weight: 65 },
    { sourceId: systemB.id, sourceType: "system", parentId: null, weight: 30 },
  ]), systemA.id);
  const text = promptForSelection(project, SYSTEM_BY_ID, SUBSYSTEM_BY_ID);
  assert.ok(!text.startsWith("HYBRID"));
  assert.ok(text.startsWith(`WISE TOUCH ${systemA.name}`));
});

test("prompt: subsystem blend sources resolve through the subsystem map", () => {
  const project = setBlendSlots(createProject(), [
    { sourceId: subA.id, sourceType: "subsystem", parentId: systemA.id, weight: 50 },
    { sourceId: systemB.id, sourceType: "system", parentId: null, weight: 50 },
  ]);
  const text = promptForSelection(project, SYSTEM_BY_ID, SUBSYSTEM_BY_ID);
  assert.ok(text.includes(`${subA.name}`));
  assert.ok(text.includes("50% influence"));
});

test("blend options: every system plus every subsystem, subsystems labelled with their parent", () => {
  const subsystemOnly = new Map(SUBSYSTEMS.map((sub) => [sub.id, sub]));
  const options = blendSourceOptions(SYSTEMS, subsystemOnly, SYSTEM_BY_ID);
  assert.equal(options.length, SYSTEMS.length + SUBSYSTEMS.length);
  const subOption = options.find((item) => item.id === subA.id);
  assert.equal(subOption.type, "subsystem");
  assert.equal(subOption.parentId, systemA.id);
  assert.ok(subOption.label.startsWith(systemA.name));
});

test("request body: only the five plain settings are sent, with the prompt trimmed", () => {
  let project = editPrompt(createProject(), "  a street portrait  ");
  project = updateSettings(project, { aspectRatio: "9:16", steps: 20, strength: 0.4 });
  const input = generationInput(project);
  assert.deepEqual(Object.keys(input).sort(), ["aspectRatio", "negativePrompt", "prompt", "steps", "strength"]);
  assert.equal(input.prompt, "a street portrait");
  assert.equal(input.aspectRatio, "9:16");
});

test("request body: owner, entitlement, and file data never appear in the body", () => {
  const project = setSource(editPrompt(createProject(), "text"), { name: "me.png", type: "image/png", size: 10 });
  const serialized = JSON.stringify(generationInput(project));
  assert.ok(!/ownerId|entitlement|plan|paid|me\.png/i.test(serialized));
});
