export class ProviderRegistry {
  constructor(adapters = []) { this.adapters = new Map(adapters.map((adapter) => [adapter.id, adapter])); }
  register(adapter) { this.adapters.set(adapter.id, adapter); return this; }
  remove(id) { return this.adapters.delete(id); }
  get(id) { return this.adapters.get(id); }
  list(options = {}) {
    return [...this.adapters.values()].map((adapter) => ({ id: adapter.id, name: adapter.name, configured: adapter.isConfigured(), capabilities: adapter.capabilities, pricing: adapter.pricing, estimatedCostUsd: adapter.estimateCost(options) }));
  }
  lowestCost(options = {}) {
    return [...this.adapters.values()].filter((adapter) => adapter.isConfigured()).map((adapter) => ({ adapter, estimate: adapter.estimateCost(options) })).filter((item) => Number.isFinite(item.estimate)).sort((a, b) => a.estimate - b.estimate)[0] || null;
  }
}

export const plannedProviders = [
  { id: "runway", name: "Runway" }, { id: "kling", name: "Kling" }, { id: "luma", name: "Luma" },
  { id: "pika", name: "Pika" }, { id: "replicate", name: "Replicate" }, { id: "fal", name: "fal.ai" },
];
