import { Router } from "express";
import { authMiddleware } from "../auth/auth.js";

export function createVideoRouter(runtime, { authRuntime, enabled = false, globalMaxCostUsd = 2 } = {}) {
  const router = Router();
  const requireAuth = authMiddleware(authRuntime.service);
  router.get("/providers", (request, response) => { const options = { duration: Number(request.query.duration || 5) }; const lowest = runtime.registry.lowestCost(options); response.json({ ok: true, providers: runtime.registry.list(options), lowestCostProviderId: lowest?.adapter.id || null }); });
  router.get("/credits", requireAuth, async (request, response) => response.json({ ok: true, balanceUsd: await authRuntime.repository.getVideoCredits(request.user.id), purchasingEnabled: false, generationEnabled: enabled }));
  router.get("/jobs", requireAuth, (request, response) => response.json({ ok: true, jobs: runtime.jobs.list().filter((job) => job.userId === request.user.id) }));
  router.get("/jobs/:id", requireAuth, async (request, response) => { const existing = runtime.jobs.get(request.params.id); if (!existing || existing.userId !== request.user.id) return response.status(404).json({ ok: false, error: { code: "JOB_NOT_FOUND", message: "Video job was not found." } }); const job = await runtime.jobs.refresh(request.params.id); return response.json({ ok: true, job }); });
  router.post("/jobs", requireAuth, async (request, response) => {
    let reserved = 0;
    try {
      if (!enabled) throw Object.assign(new Error("Paid video generation is disabled until credit purchasing is connected."), { status: 503, code: "VIDEO_PURCHASING_DISABLED" });
      const input = request.body || {}; const options = input.options || {};
      const selected = input.providerId === "lowest-cost" ? runtime.registry.lowestCost(options)?.adapter : runtime.registry.get(input.providerId);
      if (!selected?.isConfigured()) throw Object.assign(new Error("No eligible configured video provider is available."), { status: 503, code: "PROVIDER_NOT_CONFIGURED" });
      const estimate = selected.estimateCost(options);
      if (!Number.isFinite(estimate)) throw Object.assign(new Error("Current pricing metadata is required before video generation."), { status: 503, code: "VIDEO_PRICE_REQUIRED" });
      if (estimate > globalMaxCostUsd) throw Object.assign(new Error(`Estimated video cost exceeds the operator's $${globalMaxCostUsd.toFixed(2)} per-job ceiling.`), { status: 422, code: "GLOBAL_COST_LIMIT" });
      if (estimate > 0) { const balance = await authRuntime.repository.reserveVideoCredits(request.user.id, estimate); if (balance === null) throw Object.assign(new Error("Insufficient prepaid video credits."), { status: 402, code: "INSUFFICIENT_VIDEO_CREDITS" }); reserved = estimate; }
      const job = runtime.jobs.submit({ ...input, userId: request.user.id, reservedCostUsd: reserved });
      return response.status(202).json({ ok: true, job, balanceUsd: await authRuntime.repository.getVideoCredits(request.user.id) });
    }
    catch (error) { if (reserved > 0) await authRuntime.repository.refundVideoCredits(request.user.id, reserved); return response.status(error.status || 500).json({ ok: false, error: { code: error.code || "VIDEO_JOB_ERROR", message: error.message || "Video job submission failed." } }); }
  });
  return router;
}
