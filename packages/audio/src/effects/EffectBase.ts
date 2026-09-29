/**
 * Base class for all audio effects
 */

import { AudioContextManager } from '../AudioContextManager';
import { EffectConfig } from '../types';

export abstract class EffectBase {
  protected config: EffectConfig;
  protected inputNode: GainNode;
  protected outputNode: GainNode;
  protected audioContext: AudioContext;
  protected bypassGain: GainNode;
  protected wetGain: GainNode;
  protected dryGain: GainNode;

  constructor(config: EffectConfig) {
    this.config = config;
    this.audioContext = AudioContextManager.getInstance().getContext();

    // Create wet/dry mix nodes
    this.inputNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();
    this.bypassGain = this.audioContext.createGain();
    this.wetGain = this.audioContext.createGain();
    this.dryGain = this.audioContext.createGain();

    // Default mix
    this.setParameter('mix', 1.0);

    // Connect bypass
    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);
  }

  /**
   * Get configuration
   */
  getConfig(): EffectConfig {
    return this.config;
  }

  /**
   * Set effect parameter
   */
  abstract setParameter(param: string, value: number): void;

  /**
   * Get effect parameter
   */
  abstract getParameter(param: string): number;

  /**
   * Enable/disable effect
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    // Bypass the effect if disabled
    if (enabled) {
      // Route through effect
      this.inputNode.disconnect(this.bypassGain);
      this.setupRouting();
    } else {
      // Bypass effect
      this.inputNode.connect(this.bypassGain);
    }
  }

  /**
   * Setup audio routing (override in subclasses)
   */
  protected abstract setupRouting(): void;

  /**
   * Get input node
   */
  getInputNode(): GainNode {
    return this.inputNode;
  }

  /**
   * Get output node
   */
  getOutputNode(): GainNode {
    return this.outputNode;
  }

  /**
   * Cleanup
   */
  disconnect(): void {
    this.inputNode.disconnect();
    this.outputNode.disconnect();
    this.bypassGain.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
  }
}
