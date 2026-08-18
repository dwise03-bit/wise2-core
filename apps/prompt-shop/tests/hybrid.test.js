import test from "node:test";
import assert from "node:assert/strict";

import { SUBSYSTEMS, SYSTEMS } from "../src/data/catalog.js";
import { buildHybrid, buildHybridPrompt, validateHybrid } from "../src/features/hybrid/hybrid.js";

const pair = (first, second) => [
  { sourceType: first.id.startsWith("subsystem:") ? "subsystem" : "system", source: first, weight: 60 },
  { sourceType: second.id.startsWith("subsystem:") ? "subsystem" : "system", source: second, weight: 40 },
];

test("Hybrid supports System + System", () => {
  const hybrid = buildHybrid(pair(SYSTEMS[0], SYSTEMS[1]));
  assert.equal(hybrid.valid, true);
  assert.deepEqual(hybrid.parents.map((parent) => parent.type), ["system", "system"]);
});

test("Hybrid supports System + Subsystem", () => {
  const hybrid = buildHybrid(pair(SYSTEMS[0], SUBSYSTEMS[0]));
  assert.deepEqual(hybrid.parents.map((parent) => parent.type), ["system", "subsystem"]);
  assert.ok(hybrid.promptFoundation.includes(SUBSYSTEMS[0].description));
});

test("Hybrid supports Subsystem + Subsystem", () => {
  const hybrid = buildHybrid(pair(SUBSYSTEMS[0], SUBSYSTEMS[1]));
  assert.deepEqual(hybrid.parents.map((parent) => parent.type), ["subsystem", "subsystem"]);
  assert.ok(hybrid.hybridDNA.length > 0);
});

test("Hybrid validation requires two sources and exactly 100%", () => {
  assert.equal(validateHybrid([{ source: SYSTEMS[0], weight: 100 }]).valid, false);
  assert.equal(validateHybrid(pair(SYSTEMS[0], SYSTEMS[1])).valid, true);
  assert.equal(validateHybrid([{ source: SYSTEMS[0], weight: 70 }, { source: SYSTEMS[1], weight: 20 }]).valid, false);
});

test("Hybrid prompt includes names, parent types, DNA, and compatibility", () => {
  const prompt = buildHybridPrompt(pair(SYSTEMS[0], SUBSYSTEMS[0]));
  assert.match(prompt, /HYBRID NAME:/);
  assert.match(prompt, /\[SYSTEM\]/);
  assert.match(prompt, /\[SUBSYSTEM\]/);
  assert.match(prompt, /HYBRID DNA:/);
  assert.match(prompt, /COMPATIBILITY:/);
});
