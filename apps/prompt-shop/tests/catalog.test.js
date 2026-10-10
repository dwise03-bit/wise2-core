import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_SYSTEMS as LEGACY_SYSTEMS } from "../src/data/legacyCatalog.js";
import {
  DEFAULT_SYSTEMS,
  SUBSYSTEMS,
  getSubsystemForSystem,
  slugify,
  validateCatalog,
} from "../src/data/catalog.js";

test("normalization preserves the recovered catalog surface", () => {
  assert.equal(DEFAULT_SYSTEMS.length, LEGACY_SYSTEMS.length);
  assert.deepEqual(
    DEFAULT_SYSTEMS.map(({ name, category, tags, vibe, subsystems }) => ({ name, category, tags, vibe, subsystems })),
    LEGACY_SYSTEMS,
  );
});

test("all Systems and Subsystems have stable unique ids and required documentation fields", () => {
  const result = validateCatalog();
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.stats, { systems: 86, subsystems: 653, categories: 39 });
  assert.equal(new Set(DEFAULT_SYSTEMS.map((system) => system.id)).size, 86);
  assert.equal(new Set(SUBSYSTEMS.map((subsystem) => subsystem.id)).size, 653);

  for (const subsystem of SUBSYSTEMS) {
    assert.ok(subsystem.description);
    assert.ok(Array.isArray(subsystem.visualDNA));
    assert.equal(subsystem.hybridReady, true);
    assert.equal(subsystem.promptReady, true);
  }
});

test("duplicate subsystem names remain distinct through parent-scoped ids", () => {
  const saturdayMorning = SUBSYSTEMS.filter((subsystem) => subsystem.name === "SATURDAY MORNING™");
  const voidJaw = SUBSYSTEMS.filter((subsystem) => subsystem.name === "VOID JAW™");

  assert.equal(saturdayMorning.length, 2);
  assert.equal(voidJaw.length, 2);
  assert.equal(new Set(saturdayMorning.map((subsystem) => subsystem.id)).size, 2);
  assert.equal(new Set(voidJaw.map((subsystem) => subsystem.id)).size, 2);
});

test("subsystem lookup preserves special prompt descriptions", () => {
  const system = DEFAULT_SYSTEMS.find((item) => item.name === "WISE TOUCH FINE ART MASTERS™");
  const subsystem = getSubsystemForSystem(system.id, "MICHELANGELO FORM™");

  assert.match(subsystem.description, /Renaissance anatomy mastery/);
  assert.equal(slugify("WISE TOUCH MECHA RONIN™"), "wise-touch-mecha-ronin");
});

test("every Subsystem has an independently addressable documentation structure", () => {
  for (const subsystem of SUBSYSTEMS) {
    const parent = DEFAULT_SYSTEMS.find((system) => system.id === subsystem.parentSystemId);
    assert.ok(parent, `Missing parent for ${subsystem.id}`);
    assert.equal(getSubsystemForSystem(parent.id, subsystem.name), subsystem);
    assert.equal(typeof subsystem.description, "string");
    assert.ok(subsystem.description.length > subsystem.name.replace("™", "").length);
    assert.ok(Array.isArray(subsystem.useCases));
    assert.ok(Array.isArray(subsystem.relatedSystemIds));
    assert.ok(Array.isArray(subsystem.relatedSubsystemIds));
    assert.equal(typeof subsystem.hybridReady, "boolean");
    assert.equal(typeof subsystem.promptReady, "boolean");
    assert.equal(typeof subsystem.documentationStatus, "string");
  }
});

test("every System exposes the complete WT Docs structure", () => {
  for (const system of DEFAULT_SYSTEMS) {
    assert.ok(system.name);
    assert.ok(system.category);
    assert.ok(system.description);
    assert.ok(system.coreDNA);
    assert.ok(Array.isArray(system.visualDNA));
    assert.ok(system.visualDNA.length > 0);
    assert.ok(Array.isArray(system.useCases));
    assert.ok(Array.isArray(system.subsystemIds));
    assert.equal(system.subsystemIds.length, system.subsystems.length);
    assert.ok(Array.isArray(system.relatedSystemIds));
    assert.equal(typeof system.documentationStatus, "string");
  }
});
