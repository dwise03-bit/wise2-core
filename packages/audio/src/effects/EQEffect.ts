/**
 * 3-band parametric EQ effect
 * Low, Mid, High bands with gain control
 */

import { EffectBase } from './EffectBase';
import { EffectConfig } from '../types';

export class EQEffect extends EffectBase {
  private lowFilter: BiquadFilterNode;
  private midFilter: BiquadFilterNode;
  private highFilter: BiquadFilterNode;

  constructor(config: EffectConfig) {
    super(config);

    // Create three filters for low/mid/high
    this.lowFilter = this.audioContext.createBiquadFilter();
    this.midFilter = this.audioContext.createBiquadFilter();
    this.highFilter = this.audioContext.createBiquadFilter();

    // Configure filter types
    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.value = 200; // Hz
    this.lowFilter.gain.value = 0; // dB

    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000; // Hz
    this.midFilter.Q.value = 1;
    this.midFilter.gain.value = 0; // dB

    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.value = 5000; // Hz
    this.highFilter.gain.value = 0; // dB

    this.setupRouting();
  }

  protected setupRouting(): void {
    this.inputNode.disconnect();
    this.inputNode.connect(this.lowFilter);
    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);
    this.highFilter.connect(this.outputNode);
  }

  setParameter(param: string, value: number): void {
    this.config.parameters[param] = value;

    switch (param) {
      case 'lowGain':
        this.lowFilter.gain.value = Math.max(-12, Math.min(12, value));
        break;
      case 'lowFreq':
        this.lowFilter.frequency.value = Math.max(20, Math.min(500, value));
        break;
      case 'midGain':
        this.midFilter.gain.value = Math.max(-12, Math.min(12, value));
        break;
      case 'midFreq':
        this.midFilter.frequency.value = Math.max(200, Math.min(5000, value));
        break;
      case 'midQ':
        this.midFilter.Q.value = Math.max(0.1, Math.min(10, value));
        break;
      case 'highGain':
        this.highFilter.gain.value = Math.max(-12, Math.min(12, value));
        break;
      case 'highFreq':
        this.highFilter.frequency.value = Math.max(2000, Math.min(20000, value));
        break;
    }
  }

  getParameter(param: string): number {
    return this.config.parameters[param] || 0;
  }
}
