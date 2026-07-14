/**
 * Type definitions for Mixer components and audio configuration
 */

/**
 * dB level range constants
 */
export const DB_CONSTANTS = {
  MIN: -60,           // Minimum display level
  MAX: 6,             // Maximum display level
  YELLOW_START: -6,   // Yellow zone start
  YELLOW_END: -3,     // Yellow zone end (red zone start)
  RED_START: -3,      // Red zone start
} as const;

/**
 * Audio channel configuration
 */
export interface AudioChannel {
  id: string;
  name: string;
  label: string;
  volume: number;           // Current volume in dB (-60 to +6)
  peakLevel: number;        // Current peak level in dB
  peakHold?: number;        // Peak hold value (if tracking manually)
  isMuted: boolean;         // Mute state
  isSolo: boolean;          // Solo state
  isArmed?: boolean;        // Record armed state
}

/**
 * Mixer state for managing multiple channels
 */
export interface MixerState {
  channels: AudioChannel[];
  masterVolume: number;
  masterPeakLevel: number;
  isMasterMuted?: boolean;
}

/**
 * Peak level statistics
 */
export interface PeakLevelStats {
  current: number;          // Current level
  peak: number;             // Maximum peak held
  average: number;          // Average level
  rms: number;              // RMS value
  timestamp: number;        // When measurement was taken
}

/**
 * VU meter display configuration
 */
export interface VUMeterConfig {
  dbMin: number;
  dbMax: number;
  showPeakHold: boolean;
  peakHoldDuration: number;
  attackFactor: number;      // Attack rate (0-1)
  releaseFactor: number;     // Release rate (0-1)
  colorZones: {
    green: string;
    yellow: string;
    red: string;
  };
}

/**
 * Canvas rendering context with scaling
 */
export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;               // Device pixel ratio
  padding: number;
}

/**
 * Audio processing options
 */
export interface AudioProcessingOptions {
  fftSize: number;
  updateInterval: number;    // ms between updates
  smoothing: number;         // 0-1, applies to analyser smoothing
  minDecibels: number;
  maxDecibels: number;
}

/**
 * Channel volume change event
 */
export interface VolumeChangeEvent {
  channelId: string;
  previousVolume: number;
  newVolume: number;
  timestamp: number;
}

/**
 * Meter update event
 */
export interface MeterUpdateEvent {
  channelId: string;
  peakLevel: number;
  timestamp: number;
}

/**
 * Meter zone type
 */
export type MeterZone = 'safe' | 'caution' | 'clipping';

/**
 * Get meter zone from dB level
 */
export function getMeterZone(db: number): MeterZone {
  if (db >= DB_CONSTANTS.RED_START) return 'clipping';
  if (db >= DB_CONSTANTS.YELLOW_START) return 'caution';
  return 'safe';
}

/**
 * Convert dB to percentage (0-100)
 */
export function dbToPercentage(db: number, min: number = DB_CONSTANTS.MIN, max: number = DB_CONSTANTS.MAX): number {
  const range = max - min;
  return Math.max(0, Math.min(100, ((db - min) / range) * 100));
}

/**
 * Convert percentage to dB
 */
export function percentageToDb(percentage: number, min: number = DB_CONSTANTS.MIN, max: number = DB_CONSTANTS.MAX): number {
  const range = max - min;
  return min + (percentage / 100) * range;
}

/**
 * Normalize dB value to 0-1 range
 */
export function normalizeDb(db: number, min: number = DB_CONSTANTS.MIN, max: number = DB_CONSTANTS.MAX): number {
  return Math.max(0, Math.min(1, (db - min) / (max - min)));
}

/**
 * Get RGB color for dB level
 */
export function getColorForLevel(db: number): string {
  const zone = getMeterZone(db);
  switch (zone) {
    case 'clipping':
      return '#EF4444'; // Red
    case 'caution':
      return '#FBBF24'; // Yellow
    case 'safe':
    default:
      return '#22C55E'; // Green
  }
}

/**
 * Format dB value for display
 */
export function formatDb(db: number, decimals: number = 1): string {
  if (db === -Infinity) return '-∞';
  return db.toFixed(decimals);
}

/**
 * Smooth audio level transition
 */
export function smoothLevel(
  current: number,
  target: number,
  attackFactor: number = 0.3,
  releaseFactor: number = 0.05
): number {
  const diff = target - current;
  const factor = diff > 0 ? attackFactor : releaseFactor;
  return current + diff * factor;
}

/**
 * Calculate RMS from audio data
 */
export function calculateRMS(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(sum / audioData.length);
  return rms > 0 ? 20 * Math.log10(rms) : -Infinity;
}

/**
 * Calculate peak from audio data
 */
export function calculatePeak(audioData: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < audioData.length; i++) {
    peak = Math.max(peak, Math.abs(audioData[i]));
  }
  return peak > 0 ? 20 * Math.log10(peak) : -Infinity;
}

/**
 * Analyser node peak level
 */
export function getAnalyserPeak(analyser: AnalyserNode): number {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  let max = 0;
  for (let i = 0; i < dataArray.length; i++) {
    max = Math.max(max, dataArray[i]);
  }

  return max > 0 ? 20 * Math.log10(max / 255) : -Infinity;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
