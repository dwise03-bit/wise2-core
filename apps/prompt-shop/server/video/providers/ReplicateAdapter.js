import { VideoProviderAdapter } from "../VideoProviderAdapter.js";

const API_ROOT = "https://api.replicate.com/v1";
const parsePrice = (value) => String(value ?? "").trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;

function findAssetUrl(output) {
  if (typeof output === "string" && /^https?:\/\//i.test(output)) return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const match = findAssetUrl(item);
      if (match) return match;
    }
  }
  if (output && typeof output === "object") {
    for (const item of Object.values(output)) {
      const match = findAssetUrl(item);
      if (match) return match;
    }
  }
  return null;
}

function normalizeStatus(prediction) {
  if (prediction.status === "succeeded") return "completed";
  if (prediction.status === "failed" || prediction.status === "canceled") return "failed";
  if (prediction.status === "starting") return "queued";
  return "processing";
}

export class ReplicateAdapter extends VideoProviderAdapter {
  constructor({ token = "", model = "", version = "", perSecondUsd, fetchImpl = globalThis.fetch } = {}) {
    super({
      id: "replicate",
      name: "Replicate",
      capabilities: { asynchronous: true, textToVideo: true, durations: [5, 10], aspectRatios: ["16:9", "9:16", "1:1"] },
      pricing: { perSecondUsd: parsePrice(perSecondUsd), source: "operator-configured" },
    });
    this.token = token.trim();
    this.model = model.trim();
    this.version = version.trim();
    this.fetchImpl = fetchImpl;
  }

  isConfigured() {
    return Boolean(this.token && (this.model || this.version));
  }

  async request(url, options = {}) {
    const response = await this.fetchImpl(url, {
      ...options,
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.detail || payload.error || `Replicate request failed (${response.status}).`;
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }
    return payload;
  }

  async submit({ prompt, options = {} }) {
    const input = { prompt };
    if (options.aspectRatio) input.aspect_ratio = options.aspectRatio;
    if (Number.isFinite(Number(options.duration))) input.duration = Number(options.duration);
    if (options.negativePrompt) input.negative_prompt = options.negativePrompt;

    const modelPath = this.model.split("/").map(encodeURIComponent).join("/");
    const url = this.model ? `${API_ROOT}/models/${modelPath}/predictions` : `${API_ROOT}/predictions`;
    const body = this.model ? { input } : { version: this.version, input };
    const prediction = await this.request(url, { method: "POST", body: JSON.stringify(body) });
    return {
      providerJobId: prediction.id,
      status: normalizeStatus(prediction),
      assetUrl: findAssetUrl(prediction.output),
      error: prediction.error || null,
    };
  }

  async getStatus(providerJobId) {
    const prediction = await this.request(`${API_ROOT}/predictions/${encodeURIComponent(providerJobId)}`);
    return {
      providerJobId: prediction.id || providerJobId,
      status: normalizeStatus(prediction),
      assetUrl: findAssetUrl(prediction.output),
      error: prediction.error || (prediction.status === "canceled" ? "Prediction was canceled." : null),
    };
  }
}

export { findAssetUrl, normalizeStatus };
