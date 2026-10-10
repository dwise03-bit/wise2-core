import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PREFERENCES, applyPreferences, normalizePreferences } from "../src/features/account/preferences.js";

test("workspace preferences reject unsupported display values", () => {
  assert.deepEqual(normalizePreferences({ density: "tiny", motion: "spin" }), DEFAULT_PREFERENCES);
});

test("workspace preferences apply real root data attributes", () => {
  const root = { dataset: {} };
  const result = applyPreferences({ density: "compact", motion: "reduced", promptAutosave: false, foremanTips: false }, root);
  assert.equal(root.dataset.wtDensity, "compact");
  assert.equal(root.dataset.wtMotion, "reduced");
  assert.equal(result.promptAutosave, false);
});
