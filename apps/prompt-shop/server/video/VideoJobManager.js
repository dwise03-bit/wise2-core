import { randomUUID } from "node:crypto";

export class VideoJobManager {
  constructor(registry, { maxJobs = 500, retentionMs = 86_400_000, onProviderFailure = async () => {} } = {}) { this.registry = registry; this.jobs = new Map(); this.maxJobs = maxJobs; this.retentionMs = retentionMs; this.onProviderFailure = onProviderFailure; }
  prune() { const cutoff = Date.now() - this.retentionMs; for (const [id, job] of this.jobs) if (new Date(job.updatedAt).getTime() < cutoff) this.jobs.delete(id); while (this.jobs.size >= this.maxJobs) this.jobs.delete(this.jobs.keys().next().value); }
  submit({ providerId, prompt, options = {}, userId = null, reservedCostUsd = 0 }) {
    this.prune();
    const cheapest = providerId === "lowest-cost" ? this.registry.lowestCost(options) : null;
    const adapter = cheapest?.adapter || this.registry.get(providerId);
    if (providerId === "lowest-cost" && !cheapest) throw Object.assign(new Error("No configured video provider has current pricing metadata."), { status: 503, code: "NO_PRICED_PROVIDER" });
    if (!adapter) throw Object.assign(new Error("Unknown video provider."), { status: 400, code: "UNKNOWN_PROVIDER" });
    if (!adapter.isConfigured()) throw Object.assign(new Error("Video provider is not configured."), { status: 503, code: "PROVIDER_NOT_CONFIGURED" });
    if (typeof prompt !== "string" || !prompt.trim()) throw Object.assign(new Error("Video prompt is required."), { status: 400, code: "INVALID_VIDEO_PROMPT" });
    const estimatedCostUsd = adapter.estimateCost(options);
    if (Number.isFinite(Number(options.maxCostUsd)) && Number.isFinite(estimatedCostUsd) && estimatedCostUsd > Number(options.maxCostUsd)) throw Object.assign(new Error(`Estimated video cost $${estimatedCostUsd.toFixed(2)} exceeds the $${Number(options.maxCostUsd).toFixed(2)} build limit.`), { status: 422, code: "COST_LIMIT_EXCEEDED" });
    const job = { id: randomUUID(), userId, providerId: adapter.id, requestedProviderId: providerId, estimatedCostUsd, reservedCostUsd, creditRefunded: false, status: "queued", prompt: prompt.trim(), options, providerJobId: null, assetUrl: null, error: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.jobs.set(job.id, job);
    queueMicrotask(() => this.start(job.id));
    return { ...job };
  }
  async start(id) {
    const job = this.jobs.get(id); if (!job) return;
    const adapter = this.registry.get(job.providerId);
    Object.assign(job, { status: "submitting", updatedAt: new Date().toISOString() });
    try {
      const result = await adapter.submit({ prompt: job.prompt, options: job.options });
      Object.assign(job, { status: result.status || "processing", providerJobId: result.providerJobId, assetUrl: result.assetUrl || null, error: result.error || null, updatedAt: new Date().toISOString() });
    } catch (error) {
      Object.assign(job, { status: "failed", error: error.message || "Provider submission failed.", updatedAt: new Date().toISOString() });
      await this.refundFailedJob(job);
    }
  }
  async refresh(id) {
    const job = this.jobs.get(id);
    if (!job) return null;
    if (!["queued", "submitting", "processing"].includes(job.status) || !job.providerJobId) return { ...job };
    const adapter = this.registry.get(job.providerId);
    try {
      const result = await adapter.getStatus(job.providerJobId);
      Object.assign(job, { status: result.status || job.status, assetUrl: result.assetUrl || job.assetUrl, error: result.error || null, updatedAt: new Date().toISOString() });
      if (job.status === "failed") await this.refundFailedJob(job);
    } catch (error) {
      Object.assign(job, { error: error.message || "Provider status refresh failed.", updatedAt: new Date().toISOString() });
    }
    return { ...job };
  }
  get(id) { const job = this.jobs.get(id); return job ? { ...job } : null; }
  list() { return [...this.jobs.values()].map((job) => ({ ...job })); }
  async refundFailedJob(job) { if (!job.userId || !job.reservedCostUsd || job.creditRefunded) return; job.creditRefunded = true; await this.onProviderFailure(job); }
}
