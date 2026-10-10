import test from "node:test";
import assert from "node:assert/strict";

import { SYSTEMS, SUBSYSTEMS } from "../src/data/catalog.js";
import { hasAdvancedSearch, searchCatalog } from "../src/features/search/searchCatalog.js";

test("WT Search distinguishes Systems and Subsystems", () => {
  const results = searchCatalog({ systems: SYSTEMS, subsystems: SUBSYSTEMS, query: "mecha" });
  assert.ok(results.some((result) => result.type === "system"));
  assert.ok(results.some((result) => result.type === "subsystem"));
});

test("WT Search covers descriptions, Core DNA, Visual DNA, and Use Cases", () => {
  assert.ok(searchCatalog({ systems: SYSTEMS, subsystems: SUBSYSTEMS, query: "tokusatsu" }).length > 0);
  assert.ok(searchCatalog({ systems: SYSTEMS, subsystems: SUBSYSTEMS, query: "movie-like atmosphere" }).length > 0);

  const systems = [{ ...SYSTEMS[0], useCases: ["album launch campaign"] }];
  assert.equal(searchCatalog({ systems, subsystems: [], query: "album launch" }).length, 1);
});

test("WT Search applies category and readiness filters", () => {
  const results = searchCatalog({
    systems: SYSTEMS,
    subsystems: SUBSYSTEMS,
    filters: { category: "Cyberpunk", hybridReady: true, promptReady: true },
  });
  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.record.category === "Cyberpunk"));
});

test("WT Search applies flagship, documentation, and favorite filters without fabricating matches", () => {
  assert.deepEqual(searchCatalog({ systems: SYSTEMS, subsystems: SUBSYSTEMS, filters: { flagship: true } }), []);
  assert.deepEqual(searchCatalog({ systems: SYSTEMS, subsystems: SUBSYSTEMS, filters: { fullyDocumented: true } }), []);

  const favorite = SYSTEMS[0];
  const results = searchCatalog({
    systems: SYSTEMS,
    subsystems: SUBSYSTEMS,
    filters: { favorites: true },
    favoriteIds: [favorite.id],
  });
  assert.deepEqual(results.map((result) => result.id), [favorite.id]);
  assert.equal(hasAdvancedSearch({ favorites: true }), true);
});
