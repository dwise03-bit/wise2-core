import test from "node:test";
import assert from "node:assert/strict";
import { ProviderRegistry } from "../server/video/ProviderRegistry.js";
import { VideoJobManager } from "../server/video/VideoJobManager.js";
import { VideoProviderAdapter } from "../server/video/VideoProviderAdapter.js";
import { ReplicateAdapter, findAssetUrl } from "../server/video/providers/ReplicateAdapter.js";
import { FalAdapter, findFalVideoUrl } from "../server/video/providers/FalAdapter.js";

class FakeAdapter extends VideoProviderAdapter {
  constructor(pricing = {}) { super({ id: "fake", name: "Fake", capabilities: { durations: [5] }, pricing }); }
  isConfigured() { return true; }
  async submit() { return { providerJobId: "provider-1", status: "processing" }; }
}

test("provider registry adds and removes adapters without job-manager changes", () => {
  const registry = new ProviderRegistry(); const adapter = new FakeAdapter(); registry.register(adapter);
  assert.equal(registry.get("fake"), adapter); assert.equal(registry.list()[0].configured, true); assert.equal(registry.remove("fake"), true);
});

test("video jobs submit asynchronously through the selected adapter", async () => {
  const registry = new ProviderRegistry([new FakeAdapter()]); const jobs = new VideoJobManager(registry);
  const queued = jobs.submit({ providerId: "fake", prompt: "cinematic motion" }); assert.equal(queued.status, "queued");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(jobs.get(queued.id).status, "processing"); assert.equal(jobs.get(queued.id).providerJobId, "provider-1");
});

test("video jobs reject unknown and unconfigured providers safely", () => {
  const jobs = new VideoJobManager(new ProviderRegistry()); assert.throws(() => jobs.submit({ providerId: "missing", prompt: "x" }), /Unknown/);
  class Off extends FakeAdapter { isConfigured() { return false; } }
  assert.throws(() => new VideoJobManager(new ProviderRegistry([new Off()])).submit({ providerId: "fake", prompt: "x" }), /not configured/);
});

test("Replicate adapter submits official models with server-side bearer auth", async () => {
  const calls = [];
  const adapter = new ReplicateAdapter({
    token: "secret-token", model: "wise/video-model",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ id: "prediction-1", status: "starting" }), { status: 201, headers: { "Content-Type": "application/json" } });
    },
  });
  const result = await adapter.submit({ prompt: "cinematic motion", options: { aspectRatio: "16:9", duration: 5 } });
  assert.equal(result.providerJobId, "prediction-1");
  assert.equal(result.status, "queued");
  assert.equal(calls[0].url, "https://api.replicate.com/v1/models/wise/video-model/predictions");
  assert.equal(calls[0].options.headers.Authorization, "Bearer secret-token");
  assert.deepEqual(JSON.parse(calls[0].options.body), { input: { prompt: "cinematic motion", aspect_ratio: "16:9", duration: 5 } });
});

test("Replicate polling normalizes completion and nested output assets", async () => {
  const adapter = new ReplicateAdapter({
    token: "secret-token", version: "version-hash",
    fetchImpl: async () => new Response(JSON.stringify({ id: "prediction-2", status: "succeeded", output: { video: ["https://cdn.example/render.mp4"] } }), { status: 200, headers: { "Content-Type": "application/json" } }),
  });
  const result = await adapter.getStatus("prediction-2");
  assert.equal(result.status, "completed");
  assert.equal(result.assetUrl, "https://cdn.example/render.mp4");
  assert.equal(findAssetUrl({ ignored: null, result: ["https://cdn.example/video.mp4"] }), "https://cdn.example/video.mp4");
});

test("video job refresh completes an asynchronous provider job", async () => {
  class CompletingAdapter extends FakeAdapter {
    async getStatus() { return { providerJobId: "provider-1", status: "completed", assetUrl: "https://cdn.example/final.mp4" }; }
  }
  const jobs = new VideoJobManager(new ProviderRegistry([new CompletingAdapter()]));
  const queued = jobs.submit({ providerId: "fake", prompt: "cinematic motion" });
  await new Promise((resolve) => setTimeout(resolve, 0));
  const completed = await jobs.refresh(queued.id);
  assert.equal(completed.status, "completed");
  assert.equal(completed.assetUrl, "https://cdn.example/final.mp4");
});

test("video job retention bounds in-memory growth", async () => {
  const jobs = new VideoJobManager(new ProviderRegistry([new FakeAdapter()]), { maxJobs: 2, retentionMs: 60_000 });
  jobs.submit({ providerId: "fake", prompt: "one" }); jobs.submit({ providerId: "fake", prompt: "two" }); jobs.submit({ providerId: "fake", prompt: "three" });
  assert.equal(jobs.list().length, 2);
});

test("lowest-cost routing selects a priced provider and enforces spend limits", () => {
  const expensive = new FakeAdapter({ perSecondUsd: 0.2 }); expensive.id = "expensive";
  const cheap = new FakeAdapter({ perSecondUsd: 0.05 }); cheap.id = "cheap";
  const registry = new ProviderRegistry([expensive, cheap]);
  const jobs = new VideoJobManager(registry);
  const job = jobs.submit({ providerId: "lowest-cost", prompt: "budget motion", options: { duration: 5, maxCostUsd: 0.3 } });
  assert.equal(job.providerId, "cheap");
  assert.equal(job.estimatedCostUsd, 0.25);
  assert.throws(() => jobs.submit({ providerId: "lowest-cost", prompt: "too expensive", options: { duration: 10, maxCostUsd: 0.2 } }), /exceeds/);
});

test("fal adapter submits to the durable queue with server-side key auth", async () => {
  const calls = [];
  const adapter = new FalAdapter({ key:"fal-secret", model:"fal-ai/budget-video", perSecondUsd:0.04, fetchImpl:async(url,options)=>{ calls.push({url,options}); return new Response(JSON.stringify({request_id:"fal-request-1"}),{status:200,headers:{"Content-Type":"application/json"}}); } });
  const result = await adapter.submit({ prompt:"city in motion", options:{duration:5,aspectRatio:"16:9"} });
  assert.equal(result.providerJobId,"fal-request-1");
  assert.equal(calls[0].url,"https://queue.fal.run/fal-ai/budget-video");
  assert.equal(calls[0].options.headers.Authorization,"Key fal-secret");
  assert.deepEqual(JSON.parse(calls[0].options.body),{prompt:"city in motion",aspect_ratio:"16:9",duration:5});
});

test("fal adapter polls status then resolves nested video output", async () => {
  const responses = [
    new Response(JSON.stringify({status:"COMPLETED"}),{status:200,headers:{"Content-Type":"application/json"}}),
    new Response(JSON.stringify({video:{url:"https://fal.media/final.mp4"}}),{status:200,headers:{"Content-Type":"application/json"}}),
  ];
  const adapter = new FalAdapter({ key:"fal-secret", model:"fal-ai/budget-video", fetchImpl:async()=>responses.shift() });
  const result = await adapter.getStatus("fal-request-2");
  assert.equal(result.status,"completed");
  assert.equal(result.assetUrl,"https://fal.media/final.mp4");
  assert.equal(findFalVideoUrl({output:[{file:"https://fal.media/test.webm"}]}),"https://fal.media/test.webm");
});
