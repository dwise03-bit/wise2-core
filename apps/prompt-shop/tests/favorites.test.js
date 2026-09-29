import test from "node:test";
import assert from "node:assert/strict";

import { SYSTEMS } from "../src/data/catalog.js";
import { buildHybrid } from "../src/features/hybrid/hybrid.js";
import {
  FAVORITES_STORAGE_KEY,
  emptyFavorites,
  hasFavorite,
  hybridFavorite,
  loadFavorites,
  parseFavorites,
  persistFavorites,
  promptFavorite,
  toggleFavorite,
} from "../src/features/favorites/favorites.js";

test("existing System-name favorites migrate to the versioned store", () => {
  const migrated = parseFavorites(JSON.stringify([SYSTEMS[0].name]), SYSTEMS);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.items[0], { type: "system", id: SYSTEMS[0].id, name: SYSTEMS[0].name });
});

test("favorites toggle independently by type and id", () => {
  const systemItem = { type: "system", id: SYSTEMS[0].id, name: SYSTEMS[0].name };
  const subsystemItem = { type: "subsystem", id: "subsystem:test", name: "TEST™" };
  let state = toggleFavorite(emptyFavorites(), systemItem);
  state = toggleFavorite(state, subsystemItem);
  assert.equal(hasFavorite(state, "system", systemItem.id), true);
  assert.equal(hasFavorite(state, "subsystem", subsystemItem.id), true);
  state = toggleFavorite(state, systemItem);
  assert.equal(hasFavorite(state, "system", systemItem.id), false);
  assert.equal(state.items.length, 1);
});

test("Prompt and Hybrid favorites carry reusable prompt payloads", () => {
  const prompt = promptFavorite("production prompt", SYSTEMS[0].id, "Main prompt");
  const hybridRecord = buildHybrid([
    { source: SYSTEMS[0], weight: 60 },
    { source: SYSTEMS[1], weight: 40 },
  ]);
  const hybrid = hybridFavorite(hybridRecord, "hybrid prompt");
  assert.equal(prompt.payload.text, "production prompt");
  assert.equal(hybrid.payload.prompt, "hybrid prompt");
  assert.match(hybrid.id, /^hybrid:/);
});

test("favorites persist through the existing storage key", () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const expected = toggleFavorite(emptyFavorites(), { type: "system", id: SYSTEMS[0].id, name: SYSTEMS[0].name });
  persistFavorites(storage, expected);
  assert.ok(memory.has(FAVORITES_STORAGE_KEY));
  assert.deepEqual(loadFavorites(storage, SYSTEMS), expected);
});
