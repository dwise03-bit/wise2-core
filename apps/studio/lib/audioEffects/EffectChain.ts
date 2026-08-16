/**
 * EffectChain
 *
 * Professional effect chain manager for per-track processing.
 * Supports up to 8 effect slots, drag-to-reorder, enable/disable,
 * automation, and wet/dry control.
 *
 * @module audioEffects/EffectChain
 */

import { BaseEffect, EffectAutomation } from './BaseEffect';
import { EqualizerEffect } from './EqualizerEffect';
import { ReverbEffect } from './ReverbEffect';
import { CompressorEffect } from './CompressorEffect';
import { DistortionEffect } from './DistortionEffect';
import { DelayEffect } from './DelayEffect';
import { ChorusEffect } from './ChorusEffect';
import { AnalyzerEffect } from './AnalyzerEffect';

export type EffectType =
  | 'eq'
  | 'reverb'
  | 'compressor'
  | 'distortion'
  | 'delay'
  | 'chorus'
  | 'analyzer';

export interface EffectSlot {
  id: string;
  type: EffectType;
  effect: BaseEffect;
  enabled: boolean;
  position: number;
  automation: Map<string, EffectAutomation>;
}

export interface ChainState {
  slots: EffectSlot[];
  mastermix: number; // overall chain wet/dry
  bypass: boolean;
}

/**
 * Effect factory
 */
function createEffect(type: EffectType, audioContext: AudioContext): BaseEffect {
  switch (type) {
    case 'eq':
      return new EqualizerEffect(audioContext);
    case 'reverb':
      return new ReverbEffect(audioContext);
    case 'compressor':
      return new CompressorEffect(audioContext);
    case 'distortion':
      return new DistortionEffect(audioContext);
    case 'delay':
      return new DelayEffect(audioContext);
    case 'chorus':
      return new ChorusEffect(audioContext);
    case 'analyzer':
      return new AnalyzerEffect(audioContext);
    default:
      throw new Error(`Unknown effect type: ${type}`);
  }
}

/**
 * EffectChain - Professional effect rack
 */
export class EffectChain {
  private audioContext: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private masterMix: GainNode;
  private slots: EffectSlot[] = [];
  private maxSlots: number = 8;
  private slotCounter: number = 0;
  private bypass: boolean = false;
  private listeners: Set<(state: ChainState) => void> = new Set();

  constructor(audioContext: AudioContext, maxSlots: number = 8) {
    this.audioContext = audioContext;
    this.maxSlots = maxSlots;

    // Create I/O
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.masterMix = audioContext.createGain();

    // Connect input through effect chain to master mix
    this.input.connect(this.masterMix);
    this.masterMix.connect(this.output);
  }

  /**
   * Get input node for source connection
   */
  getInput(): GainNode {
    return this.input;
  }

  /**
   * Get output node for destination connection
   */
  getOutput(): GainNode {
    return this.output;
  }

  /**
   * Add an effect to the chain
   */
  addEffect(type: EffectType, position?: number): EffectSlot {
    if (this.slots.length >= this.maxSlots) {
      throw new Error(`Maximum of ${this.maxSlots} effects reached`);
    }

    const effect = createEffect(type, this.audioContext);
    const slot: EffectSlot = {
      id: `effect-${this.slotCounter++}`,
      type,
      effect,
      enabled: true,
      position: position ?? this.slots.length,
      automation: new Map(),
    };

    // Insert at position or push to end
    if (position !== undefined && position < this.slots.length) {
      this.slots.splice(position, 0, slot);
      // Update positions
      this.slots.forEach((s, i) => {
        s.position = i;
      });
    } else {
      this.slots.push(slot);
      slot.position = this.slots.length - 1;
    }

    // Reconnect chain
    this.reconnectChain();
    this.notifyListeners();

    return slot;
  }

  /**
   * Remove an effect from the chain
   */
  removeEffect(id: string): boolean {
    const index = this.slots.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const slot = this.slots[index];
    slot.effect.disconnect();
    slot.effect.dispose();

    this.slots.splice(index, 1);
    // Update positions
    this.slots.forEach((s, i) => {
      s.position = i;
    });

    this.reconnectChain();
    this.notifyListeners();

    return true;
  }

  /**
   * Get effect by ID
   */
  getEffect(id: string): BaseEffect | undefined {
    return this.slots.find((s) => s.id === id)?.effect;
  }

  /**
   * Get all effects
   */
  getEffects(): EffectSlot[] {
    return [...this.slots];
  }

  /**
   * Move effect to new position
   */
  moveEffect(id: string, newPosition: number): boolean {
    const index = this.slots.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const newPos = Math.max(0, Math.min(this.slots.length - 1, newPosition));
    const [slot] = this.slots.splice(index, 1);
    this.slots.splice(newPos, 0, slot);

    // Update positions
    this.slots.forEach((s, i) => {
      s.position = i;
    });

    this.reconnectChain();
    this.notifyListeners();

    return true;
  }

  /**
   * Enable/disable an effect
   */
  setEffectEnabled(id: string, enabled: boolean): boolean {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return false;

    slot.enabled = enabled;
    slot.effect.setEnabled(enabled);
    this.notifyListeners();

    return true;
  }

  /**
   * Bypass effect (doesn't remove it, just passes audio through)
   */
  setEffectBypassed(id: string, bypassed: boolean): boolean {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return false;

    slot.effect.setBypass(bypassed);
    this.notifyListeners();

    return true;
  }

  /**
   * Set effect parameter value
   */
  setEffectParameter(id: string, paramName: string, value: number): boolean {
    const effect = this.getEffect(id);
    if (!effect) return false;

    effect.setParameter(paramName, value);
    return true;
  }

  /**
   * Get effect parameter value
   */
  getEffectParameter(id: string, paramName: string): number | undefined {
    const effect = this.getEffect(id);
    return effect?.getParameter(paramName);
  }

  /**
   * Get all effect parameters
   */
  getEffectParameters(id: string) {
    const effect = this.getEffect(id);
    return effect?.getParameters() ?? [];
  }

  /**
   * Set automation for an effect parameter
   */
  setAutomation(
    id: string,
    paramName: string,
    automation: EffectAutomation
  ): boolean {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return false;

    slot.effect.setAutomation(paramName, automation);
    slot.automation.set(paramName, automation);
    return true;
  }

  /**
   * Remove automation for an effect parameter
   */
  removeAutomation(id: string, paramName: string): boolean {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return false;

    slot.effect.removeAutomation(paramName);
    slot.automation.delete(paramName);
    return true;
  }

  /**
   * Update all automation (call from playback loop)
   */
  updateAutomation(currentTime: number): void {
    this.slots.forEach((slot) => {
      slot.effect.updateAutomation(currentTime);
    });
  }

  /**
   * Set master chain bypass
   */
  setBypass(bypass: boolean): void {
    this.bypass = bypass;
    if (bypass) {
      this.input.disconnect();
      this.input.connect(this.output);
    } else {
      this.reconnectChain();
    }
    this.notifyListeners();
  }

  /**
   * Check if chain is bypassed
   */
  isBypassed(): boolean {
    return this.bypass;
  }

  /**
   * Set master mix (overall chain wet/dry)
   */
  setMasterMix(percent: number): void {
    const mix = Math.max(0, Math.min(100, percent)) / 100;
    this.masterMix.gain.value = mix;
  }

  /**
   * Reconnect effect chain signal flow
   */
  private reconnectChain(): void {
    // Disconnect all
    this.input.disconnect();
    this.slots.forEach((slot) => {
      slot.effect.disconnect();
    });

    if (this.slots.length === 0) {
      // No effects, direct connection
      this.input.connect(this.masterMix);
      return;
    }

    // Connect input to first effect
    this.input.connect(this.slots[0].effect.getInput());

    // Connect effects in series
    for (let i = 0; i < this.slots.length - 1; i++) {
      this.slots[i].effect.connect(this.slots[i + 1].effect.getInput());
    }

    // Connect last effect to master mix
    this.slots[this.slots.length - 1].effect.connect(this.masterMix);
  }

  /**
   * Get current chain state (for serialization)
   */
  getState(): ChainState {
    return {
      slots: this.slots.map((slot) => ({
        ...slot,
        automation: new Map(slot.automation),
      })),
      mastermix: this.masterMix.gain.value * 100,
      bypass: this.bypass,
    };
  }

  /**
   * Restore chain state
   */
  setState(state: ChainState): void {
    // Clear existing chain
    this.slots.forEach((slot) => {
      slot.effect.dispose();
    });
    this.slots = [];

    // Restore effects
    state.slots.forEach((slotState) => {
      const slot = this.addEffect(slotState.type, slotState.position);

      // Restore parameters
      if (slotState.type !== 'analyzer') {
        // Restore all parameter values
        const params = slot.effect.getParameters();
        params.forEach((param) => {
          // Would need to serialize/restore parameter values
          // This is simplified; full implementation would store all values
        });
      }

      // Restore enabled state
      slot.effect.setEnabled(slotState.enabled);

      // Restore automation
      slotState.automation.forEach((automation, paramName) => {
        slot.effect.setAutomation(paramName, automation);
      });
    });

    this.setMasterMix(state.mastermix);
    if (state.bypass) {
      this.setBypass(true);
    }
  }

  /**
   * Add state change listener
   */
  addListener(listener: (state: ChainState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove state change listener
   */
  removeListener(listener: (state: ChainState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.slots.forEach((slot) => {
      slot.effect.disconnect();
      slot.effect.dispose();
    });
    this.slots = [];
    this.input.disconnect();
    this.output.disconnect();
    this.masterMix.disconnect();
    this.listeners.clear();
  }
}
