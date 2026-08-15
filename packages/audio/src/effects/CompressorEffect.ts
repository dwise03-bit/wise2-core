/**
 * Dynamic range compressor effect
 * Threshold, ratio, attack, release, makeup gain
 */

import { EffectBase } from './EffectBase';
import { EffectConfig } from '../types';

export class CompressorEffect extends EffectBase {
  private compressor: DynamicsCompressorNode;

  constructor(config: EffectConfig) {
    super(config);

    this.compressor = this.audioContext.createDynamicsCompressor();

    // Default values
    this.compressor.threshold.value = -24; // dB
    this.compressor.knee.value = 30; // dB
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003; // seconds
    this.compressor.release.value = 0.25; // seconds

    this.setupRouting();
  }

  protected setupRouting(): void {
    this.inputNode.disconnect();
    this.inputNode.connect(this.compressor);
    this.compressor.connect(this.outputNode);
  }

  setParameter(param: string, value: number): void {
    this.config.parameters[param] = value;

    switch (param) {
      case 'threshold':
        // Range: -100 to 0 dB
        this.compressor.threshold.value = Math.max(-100, Math.min(0, value));
        break;
      case 'ratio':
        // Range: 1 to 20
        this.compressor.ratio.value = Math.max(1, Math.min(20, value));
        break;
      case 'attack':
        // Range: 0 to 1 second
        this.compressor.attack.value = Math.max(0, Math.min(1, value));
        break;
      case 'release':
        // Range: 0 to 1 second
        this.compressor.release.value = Math.max(0, Math.min(1, value));
        break;
      case 'knee':
        // Range: 0 to 40 dB
        this.compressor.knee.value = Math.max(0, Math.min(40, value));
        break;
      case 'makeupGain':
        // Makeup gain is applied after compression
        // This would be implemented in the output chain
        break;
    }
  }

  getParameter(param: string): number {
    switch (param) {
      case 'threshold':
        return this.compressor.threshold.value;
      case 'ratio':
        return this.compressor.ratio.value;
      case 'attack':
        return this.compressor.attack.value;
      case 'release':
        return this.compressor.release.value;
      case 'knee':
        return this.compressor.knee.value;
      default:
        return this.config.parameters[param] || 0;
    }
  }

  /**
   * Get reduction level in dB (for metering)
   */
  getReductionLevel(): number {
    // Note: DynamicsCompressor doesn't expose reduction directly
    // This would need to be calculated from input/output levels
    return 0;
  }
}
