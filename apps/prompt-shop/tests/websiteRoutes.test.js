import test from "node:test";
import assert from "node:assert/strict";
import { TAB_PATHS, WEBSITE_TABS, pathFromTab, tabFromPath } from "../src/routes/websiteRoutes.js";

test("every website screen has a unique shareable path", () => {
  assert.deepEqual(Object.keys(TAB_PATHS), WEBSITE_TABS);
  assert.equal(new Set(Object.values(TAB_PATHS)).size, WEBSITE_TABS.length);
});

test("website paths resolve in both directions and fall back safely", () => {
  for (const tab of WEBSITE_TABS) assert.equal(tabFromPath(pathFromTab(tab)), tab);
  assert.equal(tabFromPath("/resources/"), "resources");
  assert.equal(tabFromPath("/not-a-screen"), "dashboard");
  assert.equal(pathFromTab("not-a-screen"), "/");
});
