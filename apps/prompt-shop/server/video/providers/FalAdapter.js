import { VideoProviderAdapter } from "../VideoProviderAdapter.js";

const QUEUE_ROOT = "https://queue.fal.run";
const parsePrice = (value) => String(value ?? "").trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;

export function findFalVideoUrl(value) {
  if (typeof value === "string" && /^https?:\/\//i.test(value) && /\.(mp4|webm|mov)(\?|$)/i.test(value)) return value;
  if (Array.isArray(value)) { for (const item of value) { const found = findFalVideoUrl(item); if (found) return found; } }
  if (value && typeof value === "object") { for (const item of Object.values(value)) { const found = findFalVideoUrl(item); if (found) return found; } }
  return null;
}

export class FalAdapter extends VideoProviderAdapter {
  constructor({ key = "", model = "", perSecondUsd, flatUsd, fetchImpl = globalThis.fetch } = {}) {
    super({ id: "fal", name: "fal.ai", capabilities: { asynchronous: true, textToVideo: true, durations: [5, 10], aspectRatios: ["16:9", "9:16", "1:1"] }, pricing: { perSecondUsd: parsePrice(perSecondUsd), flatUsd: parsePrice(flatUsd), source: "operator-configured" } });
    this.key = key.trim(); this.model = model.replace(/^\/+|\/+$/g, ""); this.fetchImpl = fetchImpl;
  }
  isConfigured() { return Boolean(this.key && this.model); }
  async request(url, options = {}) { const response = await this.fetchImpl(url, { ...options, headers: { Authorization: `Key ${this.key}`, "Content-Type": "application/json", ...(options.headers || {}) } }); const payload = await response.json().catch(()=>({})); if (!response.ok) throw new Error(payload.detail || payload.error || `fal request failed (${response.status}).`); return payload; }
  async submit({ prompt, options = {} }) {
    const input = { prompt };
    if (options.aspectRatio) input.aspect_ratio = options.aspectRatio;
    if (Number.isFinite(Number(options.duration))) input.duration = Number(options.duration);
    const payload = await this.request(`${QUEUE_ROOT}/${this.model}`, { method:"POST", body:JSON.stringify(input) });
    return { providerJobId: payload.request_id, status: "queued", assetUrl: null, error: null };
  }
  async getStatus(providerJobId) {
    const base = `${QUEUE_ROOT}/${this.model}/requests/${encodeURIComponent(providerJobId)}`;
    const status = await this.request(`${base}/status`);
    if (status.status === "IN_QUEUE") return { providerJobId, status:"queued" };
    if (status.status === "IN_PROGRESS") return { providerJobId, status:"processing" };
    if (status.status !== "COMPLETED") return { providerJobId, status:"failed", error:status.error || `Unexpected fal status: ${status.status}` };
    if (status.error) return { providerJobId, status:"failed", error:status.error };
    const result = await this.request(base);
    return { providerJobId, status:"completed", assetUrl:findFalVideoUrl(result), error:null };
  }
}
