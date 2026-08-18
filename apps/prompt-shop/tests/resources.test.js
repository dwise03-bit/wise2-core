import test from "node:test";
import assert from "node:assert/strict";
import { LEARNING_RESOURCES, normalizeProgress, progressPercent, toggleResourceComplete } from "../src/features/resources/resources.js";

test("learning progress drops unknown records and de-duplicates modules", () => {
  const id = LEARNING_RESOURCES[0].id;
  assert.deepEqual(normalizeProgress({ completedIds: [id, "missing", id] }).completedIds, [id]);
});

test("learning completion toggles and calculates certification progress", () => {
  const next = toggleResourceComplete({}, LEARNING_RESOURCES[0].id);
  assert.equal(progressPercent(next), Math.round(100 / LEARNING_RESOURCES.length));
  assert.deepEqual(toggleResourceComplete(next, LEARNING_RESOURCES[0].id).completedIds, []);
});
