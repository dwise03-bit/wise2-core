import test from "node:test";
import assert from "node:assert/strict";
import { ASSETS_STORAGE_KEY, assetFromVideoJob, emptyAssetLibrary, filterAssets, loadAssets, persistAssets, removeAsset, upsertAsset } from "../src/features/assets/assets.js";

function completedJob(overrides = {}) {
  return { id: "job-1", status: "completed", assetUrl: "https://cdn.example/video.mp4", providerId: "replicate", providerJobId: "prediction-1", prompt: "chrome ronin in motion", options: { aspectRatio: "16:9", duration: 5 }, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:01:00.000Z", ...overrides };
}

test("completed video jobs become durable asset metadata records", () => {
  const asset = assetFromVideoJob(completedJob(), { systemId: "mecha", systemName: "MECHA RONIN", subsystemName: "CHROME SHOGUN" });
  assert.equal(asset.id, "video:job-1");
  assert.equal(asset.type, "video");
  assert.equal(asset.providerId, "replicate");
  assert.equal(asset.aspectRatio, "16:9");
  assert.equal(asset.systemName, "MECHA RONIN");
});

test("asset conversion rejects incomplete jobs", () => {
  assert.throws(() => assetFromVideoJob(completedJob({ status: "processing" })), /completed video job/);
  assert.throws(() => assetFromVideoJob(completedJob({ assetUrl: null })), /asset URL/);
});

test("asset library upserts, searches, filters, and removes records", () => {
  const video = assetFromVideoJob(completedJob(), { systemName: "MECHA RONIN", subsystemName: "CHROME SHOGUN" });
  const image = { ...video, id: "image:2", type: "image", providerId: "fal", name: "Noir Cover" };
  let library = upsertAsset(emptyAssetLibrary(), video);
  library = upsertAsset(library, image);
  library = upsertAsset(library, { ...video, name: "Updated Video" });
  assert.equal(library.items.length, 2);
  assert.deepEqual(filterAssets(library, { query: "chrome" }).map((item) => item.id).sort(), ["image:2", "video:job-1"]);
  assert.deepEqual(filterAssets(library, { type: "video", providerId: "replicate" }).map((item) => item.id), ["video:job-1"]);
  assert.equal(removeAsset(library, "image:2").items.length, 1);
});

test("asset library persists under its versioned storage key", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const library = upsertAsset(emptyAssetLibrary(), assetFromVideoJob(completedJob()));
  persistAssets(storage, library);
  assert.equal(values.has(ASSETS_STORAGE_KEY), true);
  assert.deepEqual(loadAssets(storage), library);
});
