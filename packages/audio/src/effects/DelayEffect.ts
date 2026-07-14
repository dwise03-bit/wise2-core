/**
 * Delay effect with feedback
 * Time, feedback, and wet/dry mix controls
 */

import { EffectBase } from './EffectBase';
import { EffectConfig } from '../types';

export class DelayEffect extends EffectBase {
  private delayNode: DelayNode;
  private feedbackNode: GainNode;
  private wetNode: GainNode;
  private dryNode: GainNode;
  private mergeNode: GainNode;

  constructor(config: EffectConfig, maxDelayTime: number = 5) {
    super(config);

    this.delayNode = this.audioContext.createDelay(maxDelayTime);
    this.feedbackNode = this.audioContext.createGain();
    this.wetNode = this.audioContext.createGain();
    this.dryNode = this.audioContext.createGain();
    this.mergeNode = this.audioContext.createGain();

    // Default values
    this.delayNode.delayTime.value = 0.5; // 500ms
    this.feedbackNode.gain.value = 0.5; // 50% feedback

    this.setupRouting();
  }

  protected setupRouting(): void {
    this.inputNode.disconnect();

    // Dry signal path
    this.inputNode.connect(this.dryNode);
    this.dryNode.connect(this.mergeNode);

    // Wet signal path (delayed with feedback)
    this.inputNode.connect(this.delayNode);
    this.delayNode.connect(this.wetNode);
    this.wetNode.connect(this.mergeNode);

    // Feedback loop
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);

    // Output
    this.mergeNode.connect(this.outputNode);
  }

  setParameter(param: string, value: number): void {
    this.config.parameters[param] = value;

    switch (param) {
      case 'time':
        // Delay time in milliseconds, range: 1-5000ms
        const timeSeconds = Math.max(0.001, Math.min(5, value / 1000));
        this.delayNode.delayTime.value = timeSeconds;
        break;
      case 'feedback':
        // Feedback amount, range: 0-0.95 (prevent infinite feedback)
        this.feedbackNode.gain.value = Math.max(0, Math.min(0.95, value));
        break;
      case 'mix':
        // Wet/dry mix
        const mix = Math.max(0, Math.min(1, value));
        this.dryNode.gain.value = 1 - mix;
        this.wetNode.gain.value = mix;
        break;
    }
  }

  getParameter(param: string): number {
    switch (param) {
      case 'time':
        return this.delayNode.delayTime.value * 1000;
      case 'feedback':
        return this.feedbackNode.gain.value;
      default:
        return this.config.parameters[param] || 0;
    }
  }
}
