/**
 * Reverb effect using ConvolverNode
 * Simulates room acoustics
 */

import { EffectBase } from './EffectBase';
import { EffectConfig } from '../types';

export class ReverbEffect extends EffectBase {
  private convolver: ConvolverNode;
  private wetNode: GainNode;
  private dryNode: GainNode;
  private roomSize: number = 0.5;
  private width: number = 1;

  constructor(config: EffectConfig) {
    super(config);

    this.convolver = this.audioContext.createConvolver();

    // Create wet/dry split
    this.dryNode = this.audioContext.createGain();
    this.wetNode = this.audioContext.createGain();

    // Generate simple impulse response (room simulation)
    this.generateImpulseResponse();

    this.setParameter('mix', 0.5); // Default 50% wet
    this.setupRouting();
  }

  protected setupRouting(): void {
    this.inputNode.disconnect();

    // Split signal: part dry, part through convolver
    this.inputNode.connect(this.dryNode);
    this.inputNode.connect(this.convolver);

    // Merge wet and dry signals
    this.dryNode.connect(this.outputNode);
    this.convolver.connect(this.wetNode);
    this.wetNode.connect(this.outputNode);
  }

  /**
   * Generate a simple impulse response for reverb
   */
  private generateImpulseResponse(): void {
    const rate = this.audioContext.sampleRate;
    const length = rate * 2; // 2 second impulse response
    const impulse = this.audioContext.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      // Simple exponential decay with some randomness
      const decay = Math.exp(-i / (rate * 0.5)); // Decay time
      left[i] = (Math.random() - 0.5) * decay;
      right[i] = (Math.random() - 0.5) * decay;
    }

    this.convolver.buffer = impulse;
  }

  setParameter(param: string, value: number): void {
    this.config.parameters[param] = value;

    switch (param) {
      case 'mix':
        // Mix: 0 = dry, 1 = wet
        const mix = Math.max(0, Math.min(1, value));
        this.dryNode.gain.value = 1 - mix;
        this.wetNode.gain.value = mix;
        break;
      case 'roomSize':
        this.roomSize = Math.max(0, Math.min(1, value));
        // Regenerate impulse with new room size
        this.generateImpulseResponse();
        break;
      case 'width':
        this.width = Math.max(0, Math.min(1, value));
        break;
    }
  }

  getParameter(param: string): number {
    return this.config.parameters[param] || 0;
  }
}
