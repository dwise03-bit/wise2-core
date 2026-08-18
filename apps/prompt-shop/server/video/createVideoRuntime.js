import { ProviderRegistry, plannedProviders } from "./ProviderRegistry.js";
import { VideoJobManager } from "./VideoJobManager.js";
import { VideoProviderAdapter } from "./VideoProviderAdapter.js";
import { ReplicateAdapter } from "./providers/ReplicateAdapter.js";
import { FalAdapter } from "./providers/FalAdapter.js";

class PlannedProviderAdapter extends VideoProviderAdapter {
  constructor(provider) { super({ ...provider, capabilities: { asynchronous: true, durations: [], aspectRatios: [] } }); }
}

function createDefaultAdapters(env = process.env, fetchImpl = globalThis.fetch) {
  return plannedProviders.map((provider) => provider.id === "replicate"
    ? new ReplicateAdapter({ token: env.REPLICATE_API_TOKEN, model: env.REPLICATE_VIDEO_MODEL, version: env.REPLICATE_VIDEO_VERSION, perSecondUsd: env.REPLICATE_VIDEO_COST_PER_SECOND_USD, fetchImpl })
    : provider.id === "fal"
      ? new FalAdapter({ key: env.FAL_KEY, model: env.FAL_VIDEO_MODEL, perSecondUsd: env.FAL_VIDEO_COST_PER_SECOND_USD, flatUsd: env.FAL_VIDEO_FLAT_COST_USD, fetchImpl })
      : new PlannedProviderAdapter(provider));
}

export function createVideoRuntime(adapters = createDefaultAdapters(), options = {}) {
  const registry = new ProviderRegistry(adapters);
  return { registry, jobs: new VideoJobManager(registry, options) };
}

export { createDefaultAdapters };
