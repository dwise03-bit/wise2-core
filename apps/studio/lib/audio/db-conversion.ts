/**
 * Audio dB Conversion Utilities
 *
 * Production-ready utilities for converting between decibel scales, linear ratios,
 * and display formats for audio metering, visualization, and level management.
 *
 * @module audio/db-conversion
 */

/**
 * Convert decibels (dB) to linear ratio
 *
 * Uses the standard formula: linear = 10^(dB/20)
 * Handles edge cases including -Infinity (silence)
 *
 * @param db - Decibel value
 * @returns Linear ratio (0 to ~3.16+ for typical audio range)
 *
 * @example
 * dbToLinear(0)   // → 1 (unity gain)
 * dbToLinear(-6)  // → 0.5 (half amplitude)
 * dbToLinear(-Infinity) // → 0 (silence)
 * dbToLinear(20)  // → 10 (10x amplitude)
 */
export const dbToLinear = (db: number): number => {
  // Handle infinity (silence)
  if (!Number.isFinite(db)) {
    return db === -Infinity ? 0 : Number.POSITIVE_INFINITY;
  }

  // Use standard dB to linear formula
  return Math.pow(10, db / 20);
};

/**
 * Convert linear ratio to decibels (dB)
 *
 * Uses the standard formula: dB = 20 * log10(linear)
 * Handles edge cases including 0 (silence) and negative values
 *
 * @param linear - Linear ratio (must be >= 0)
 * @returns Decibel value, or -Infinity for zero/negative input
 *
 * @example
 * linearToDb(1)     // → 0 (unity gain)
 * linearToDb(0.5)   // → -6.02 (half amplitude)
 * linearToDb(0)     // → -Infinity (silence)
 * linearToDb(10)    // → 20 (10x amplitude)
 */
export const linearToDb = (linear: number): number => {
  // Handle zero and negative values (silence/invalid)
  if (linear <= 0) {
    return -Infinity;
  }

  // Use standard linear to dB formula
  return 20 * Math.log10(linear);
};

/**
 * Normalize dB value to percentage (0-1 range)
 *
 * Maps a dB value within a specified range to a normalized 0-1 value.
 * Useful for scaling meter displays, progress indicators, and fader positions.
 * Result is clamped to [0, 1].
 *
 * @param db - Current dB value
 * @param minDb - Minimum dB (maps to 0)
 * @param maxDb - Maximum dB (maps to 1)
 * @returns Normalized value clamped to [0, 1]
 *
 * @example
 * normalizeLevel(-60, -60, 6)  // → 0 (at minimum)
 * normalizeLevel(6, -60, 6)    // → 1 (at maximum)
 * normalizeLevel(-30, -60, 6)  // → 0.5 (at midpoint)
 * normalizeLevel(-100, -60, 6) // → 0 (clamped to minimum)
 */
export const normalizeLevel = (db: number, minDb: number, maxDb: number): number => {
  // Guard against invalid range
  if (minDb >= maxDb) {
    return 0;
  }

  // Handle infinity
  if (!Number.isFinite(db)) {
    return db === -Infinity ? 0 : 1;
  }

  // Calculate normalized value
  const normalized = (db - minDb) / (maxDb - minDb);

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, normalized));
};

/**
 * Determine the color zone for a given dB level
 *
 * Maps dB ranges to color zones for visual feedback in meters and displays:
 * - GREEN: -60 to -12 dB (safe, plenty of headroom)
 * - LIME: -12 to -6 dB (normal operating range)
 * - AMBER: -6 to -3 dB (caution, less headroom)
 * - ORANGE: -3 to 0 dB (hot, very close to clipping)
 * - RED: 0 to +6 dB (clipping, distortion)
 *
 * @param db - Decibel value to evaluate
 * @returns Color zone identifier
 *
 * @example
 * getColorZone(-30)  // → 'green'
 * getColorZone(-9)   // → 'lime'
 * getColorZone(-5)   // → 'amber'
 * getColorZone(-1)   // → 'orange'
 * getColorZone(2)    // → 'red'
 */
export const getColorZone = (db: number): 'green' | 'lime' | 'amber' | 'orange' | 'red' => {
  // Handle infinity
  if (!Number.isFinite(db)) {
    return db === -Infinity ? 'green' : 'red';
  }

  if (db < -12) return 'green';
  if (db < -6) return 'lime';
  if (db < -3) return 'amber';
  if (db < 0) return 'orange';
  return 'red';
};

/**
 * Format dB value for display
 *
 * Produces a human-readable string representation of a dB value.
 * Handles edge cases like infinity and NaN gracefully.
 *
 * @param db - Decibel value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "-4.3 dB" or "∞" for -Infinity
 *
 * @example
 * formatDbLabel(-4.256)     // → "-4.3 dB"
 * formatDbLabel(0)          // → "0.0 dB"
 * formatDbLabel(-Infinity)  // → "∞"
 * formatDbLabel(-4, 2)      // → "-4.00 dB"
 * formatDbLabel(NaN)        // → "— dB"
 */
export const formatDbLabel = (db: number, decimals: number = 1): string => {
  // Handle NaN
  if (Number.isNaN(db)) {
    return '— dB';
  }

  // Handle infinity (silence)
  if (db === -Infinity) {
    return '∞';
  }

  // Handle positive infinity (shouldn't occur, but handle gracefully)
  if (db === Infinity) {
    return '+∞';
  }

  // Format to specified decimal places
  const formatted = db.toFixed(decimals);
  return `${formatted} dB`;
};

/**
 * Calculate peak dB from a peak linear value
 *
 * Converts a peak linear amplitude value (from 0 to 1+ for digital audio)
 * to dB Full Scale (dBFS). Useful for peak meters and signal analysis.
 *
 * @param peakLinear - Peak linear value (typically 0-1 for non-clipped audio)
 * @returns Peak dBFS value
 *
 * @example
 * calculatePeakDb(1.0)    // → 0 dBFS (0 dB relative to full scale)
 * calculatePeakDb(0.5)    // → -6.02 dBFS (half amplitude)
 * calculatePeakDb(0.1)    // → -20 dBFS
 * calculatePeakDb(1.5)    // → +3.52 dBFS (clipping/overdrive)
 */
export const calculatePeakDb = (peakLinear: number): number => {
  return linearToDb(peakLinear);
};

/**
 * Convert dBFS (dB Full Scale) to percentage (0-100)
 *
 * Maps the typical audio range of -60 to +6 dBFS to a 0-100% scale.
 * Useful for displaying meter values as percentages in UI.
 * Output is clamped to [0, 100].
 *
 * @param dbfs - dBFS value (typically -60 to +6)
 * @returns Percentage from 0-100
 *
 * @example
 * dbfsToPercent(-60)  // → 0 (minimum level)
 * dbfsToPercent(6)    // → 100 (maximum level)
 * dbfsToPercent(-30)  // → 50 (midpoint)
 * dbfsToPercent(-3)   // → ~95 (close to maximum)
 */
export const dbfsToPercent = (dbfs: number): number => {
  const MIN_DBFS = -60;
  const MAX_DBFS = 6;

  // Handle infinity
  if (!Number.isFinite(dbfs)) {
    return dbfs === -Infinity ? 0 : 100;
  }

  // Normalize to 0-1, then scale to 0-100
  const normalized = normalizeLevel(dbfs, MIN_DBFS, MAX_DBFS);
  return normalized * 100;
};

/**
 * Convert dBu to dBFS
 *
 * Converts dBu (decibels relative to 0.775V, used in analog audio)
 * to dBFS (decibels relative to full scale in digital audio).
 * Standard conversion: dBFS = dBu - 2.218
 *
 * @param dbu - dBu value
 * @returns dBFS value
 *
 * @example
 * dbuToDbfs(0)   // → -2.218 dBFS (0 dBu is below digital full scale)
 * dbuToDbfs(4)   // → 1.782 dBFS
 */
export const dbuToDbfs = (dbu: number): number => {
  const DBU_TO_DBFS_OFFSET = 2.218;
  return dbu - DBU_TO_DBFS_OFFSET;
};

/**
 * Convert dBFS to dBu
 *
 * Converts dBFS (decibels relative to full scale in digital audio)
 * to dBu (decibels relative to 0.775V in analog audio).
 * Standard conversion: dBu = dBFS + 2.218
 *
 * @param dbfs - dBFS value
 * @returns dBu value
 *
 * @example
 * dbfsToDBu(0)   // → 2.218 dBu (digital full scale)
 * dbfsToDBu(-20) // → -17.782 dBu
 */
export const dbfsToDBu = (dbfs: number): number => {
  const DBU_TO_DBFS_OFFSET = 2.218;
  return dbfs + DBU_TO_DBFS_OFFSET;
};

/**
 * Smooth dB transitions using RMS averaging
 *
 * Reduces meter flutter and visual noise by averaging dB values over time.
 * Useful for real-time metering and peak-hold displays.
 *
 * @param currentDb - Current dB value
 * @param previousDb - Previous dB value (for smoothing)
 * @param smoothingFactor - Smoothing coefficient (0-1, default: 0.3)
 *                          Higher = more smoothing, 0 = no smoothing, 1 = no update
 * @returns Smoothed dB value
 *
 * @example
 * smoothDb(-10, -5, 0.3)  // → Weighted average with previous value
 * smoothDb(-10, -10, 0.3) // → -10 (no change)
 */
export const smoothDb = (currentDb: number, previousDb: number, smoothingFactor: number = 0.3): number => {
  // Guard against invalid smoothing factor
  const factor = Math.max(0, Math.min(1, smoothingFactor));

  // Handle infinity cases
  if (!Number.isFinite(currentDb)) {
    return currentDb;
  }
  if (!Number.isFinite(previousDb)) {
    return currentDb;
  }

  // Exponential moving average
  return previousDb * factor + currentDb * (1 - factor);
};

/**
 * Calculate RMS (Root Mean Square) level in dB
 *
 * Converts an array of audio samples to dB using RMS calculation.
 * More accurate for loudness perception than simple peak detection.
 *
 * @param samples - Array of audio samples (typically -1 to 1)
 * @returns RMS level in dB, or -Infinity if empty array
 *
 * @example
 * calculateRmsDb([0.1, 0.2, -0.15])  // → ~-14.5 dB
 * calculateRmsDb([0, 0, 0])          // → -Infinity (silence)
 * calculateRmsDb([])                 // → -Infinity (empty)
 */
export const calculateRmsDb = (samples: number[]): number => {
  if (samples.length === 0) {
    return -Infinity;
  }

  // Calculate sum of squares
  let sumOfSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    sumOfSquares += sample * sample;
  }

  // Calculate RMS
  const rms = Math.sqrt(sumOfSquares / samples.length);

  // Convert to dB
  return linearToDb(rms);
};
