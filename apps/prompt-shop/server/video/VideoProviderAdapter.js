export class VideoProviderAdapter {
  constructor({ id, name, capabilities = {}, pricing = {} }) {
    if (!id || !name) throw new Error("Video providers require id and name.");
    this.id = id;
    this.name = name;
    this.capabilities = capabilities;
    this.pricing = pricing;
  }
  estimateCost(options = {}) {
    if (Number.isFinite(this.pricing.flatUsd)) return this.pricing.flatUsd;
    if (Number.isFinite(this.pricing.perSecondUsd)) return this.pricing.perSecondUsd * Number(options.duration || 0);
    return null;
  }
  isConfigured() { return false; }
  async submit() { throw new Error(`${this.id} submit() is not implemented.`); }
  async getStatus() { throw new Error(`${this.id} getStatus() is not implemented.`); }
}
