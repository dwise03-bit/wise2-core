/**
 * Audio Effects Library - Export Index
 *
 * Sound Lab professional effects suite:
 * - Equalization (3-band, 10-band graphic, parametric)
 * - Reverb (Room, Hall, Cathedral, Plate, Spring)
 * - Compression (Dynamic range processing with metering)
 * - Distortion (Soft clip, Hard clip, Fuzz, Sine, Tanh)
 * - Delay (Time-synced, Stereo, Feedback)
 * - Chorus (Chorus, Flanger, Phaser, Vibrato)
 * - Analysis (Spectrum analyzer, Loudness metering, Peak meters)
 * - Effect Chain Manager (8-slot chain with automation)
 *
 * @module audioEffects
 */

// Base classes
export { BaseEffect, type EffectParameter, type AutomationPoint, type EffectAutomation } from './BaseEffect';

// Effects
export { EqualizerEffect, type EQMode, type EQPreset } from './EqualizerEffect';
export { ReverbEffect, type ReverbPreset } from './ReverbEffect';
export { CompressorEffect } from './CompressorEffect';
export { DistortionEffect, type DistortionType } from './DistortionEffect';
export { DelayEffect, type DelayTimeUnit } from './DelayEffect';
export { ChorusEffect, type ModulationType } from './ChorusEffect';
export {
  AnalyzerEffect,
  type SpectrumData,
  type LoudnessData,
} from './AnalyzerEffect';

// Chain manager
export {
  EffectChain,
  type EffectType,
  type EffectSlot,
  type ChainState,
} from './EffectChain';
