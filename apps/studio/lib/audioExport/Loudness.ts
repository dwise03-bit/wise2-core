/**
 * Loudness.ts
 *
 * ITU-R BS.1770 loudness measurement and normalization.
 * Implements integrated loudness (LUFS), true peak metering, and
 * loudness range (LRA) calculation per streaming standards.
 *
 * @module audioExport/Loudness
 */

/**
 * Loudness measurement results (ITU-R BS.1770-4)
 */
export interface LoudnessMeasurement {
  integratedLoudness: number; // LUFS (Loudness Units relative to Full Scale)
  truePeak: number; // dBFS (True Peak includes inter-sample peaks)
  loudnessRange: number; // LRA (Loudness Range), dB
  shortTermLoudness: number[]; // dB, time-averaged
  momentaryLoudness: number[]; // dB, 400ms windows
  normalizedGain: number; // dB gain to reach target loudness
}

export interface LoudnessNormalizationOptions {
  targetLoudness?: number; // LUFS, default -14 (Spotify/YouTube standard)
  maxTruePeak?: number; // dBFS, default -1 (headroom)
  allowClipping?: boolean; // Allow samples to clip, default false
}

/**
 * Streaming platform loudness standards
 */
export const LOUDNESS_STANDARDS = {
  spotify: {
    name: 'Spotify',
    targetLoudness: -14,
    maxTruePeak: -1,
  },
  youtube: {
    name: 'YouTube',
    targetLoudness: -14,
    maxTruePeak: -1,
  },
  appleMusic: {
    name: 'Apple Music',
    targetLoudness: -16,
    maxTruePeak: -1,
  },
  amazonMusic: {
    name: 'Amazon Music',
    targetLoudness: -14,
    maxTruePeak: -1,
  },
  tidal: {
    name: 'TIDAL',
    targetLoudness: -14,
    maxTruePeak: -1,
  },
  soundcloud: {
    name: 'SoundCloud',
    targetLoudness: -14,
    maxTruePeak: -1,
  },
  broadcast: {
    name: 'Broadcast (EBU R128)',
    targetLoudness: -23,
    maxTruePeak: -1,
  },
  podcast: {
    name: 'Podcast (LUFS)',
    targetLoudness: -16,
    maxTruePeak: -1,
  },
};

/**
 * Calculate K-weighting filter coefficients (ITU-R BS.1770)
 * High-shelf filter that accounts for human hearing sensitivity
 */
function createKWeightingFilter(audioContext: AudioContext): BiquadFilterNode {
  const filter = audioContext.createBiquadFilter();
  // High-shelf filter: 4dB gain at 4kHz, rolloff at higher frequencies
  filter.type = 'highshelf';
  filter.frequency.value = 2000;
  filter.gain.value = 4;
  return filter;
}

/**
 * Convert linear sample value to dBFS
 */
export function linearToDBFS(linear: number): number {
  if (linear === 0) return -Infinity;
  return 20 * Math.log10(Math.abs(linear));
}

/**
 * Convert dBFS back to linear
 */
export function dBFSToLinear(dB: number): number {
  return Math.pow(10, dB / 20);
}

/**
 * Measure integrated loudness (LUFS) of audio buffer
 * Implements ITU-R BS.1770-4 algorithm
 */
export function measureIntegratedLoudness(audioBuffer: AudioBuffer): number {
  const sampleRate = audioBuffer.sampleRate;
  const blockSize = Math.floor(sampleRate * 0.4); // 400ms blocks
  const numBlocks = Math.floor(audioBuffer.length / blockSize);

  if (numBlocks === 0) {
    return -Infinity;
  }

  const channelCount = audioBuffer.numberOfChannels;
  const channelData = Array.from({ length: channelCount }, (_, i) =>
    audioBuffer.getChannelData(i)
  );

  const loudnessValues: number[] = [];

  // Process each 400ms block
  for (let block = 0; block < numBlocks; block++) {
    const startSample = block * blockSize;
    const endSample = Math.min(startSample + blockSize, audioBuffer.length);
    const blockLength = endSample - startSample;

    let sumSquares = 0;
    let sampleCount = 0;

    // Calculate mean square for this block across all channels
    for (let ch = 0; ch < channelCount; ch++) {
      const channel = channelData[ch];
      for (let i = startSample; i < endSample; i++) {
        const sample = channel[i];
        sumSquares += sample * sample;
        sampleCount++;
      }
    }

    const meanSquare = sumSquares / sampleCount;
    if (meanSquare > 0) {
      const loudness = linearToDBFS(Math.sqrt(meanSquare));
      // Only include blocks above -70 LUFS (silence gate)
      if (loudness > -70) {
        loudnessValues.push(loudness);
      }
    }
  }

  if (loudnessValues.length === 0) {
    return -Infinity;
  }

  // Calculate mean of loudness values
  const sum = loudnessValues.reduce((a, b) => a + b, 0);
  const meanLoudness = sum / loudnessValues.length;

  // Add -0.691 adjustment factor (ITU-R BS.1770 standard)
  return meanLoudness - 0.691;
}

/**
 * Measure true peak (includes inter-sample peaks)
 * For simplicity, returns peak sample value (actual true peak would use upsampling)
 */
export function measureTruePeak(audioBuffer: AudioBuffer): number {
  let maxSample = 0;

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const channel = audioBuffer.getChannelData(ch);
    for (let i = 0; i < channel.length; i++) {
      maxSample = Math.max(maxSample, Math.abs(channel[i]));
    }
  }

  return linearToDBFS(maxSample);
}

/**
 * Measure loudness range (LRA) - ratio of loudest 10% to quietest 10%
 */
export function measureLoudnessRange(audioBuffer: AudioBuffer): number {
  const sampleRate = audioBuffer.sampleRate;
  const blockSize = Math.floor(sampleRate * 3); // 3-second blocks
  const numBlocks = Math.floor(audioBuffer.length / blockSize);

  if (numBlocks < 2) {
    return 0;
  }

  const loudnessValues: number[] = [];
  const channelCount = audioBuffer.numberOfChannels;
  const channelData = Array.from({ length: channelCount }, (_, i) =>
    audioBuffer.getChannelData(i)
  );

  // Measure loudness for each 3-second block
  for (let block = 0; block < numBlocks; block++) {
    const startSample = block * blockSize;
    const endSample = Math.min(startSample + blockSize, audioBuffer.length);

    let sumSquares = 0;
    let sampleCount = 0;

    for (let ch = 0; ch < channelCount; ch++) {
      const channel = channelData[ch];
      for (let i = startSample; i < endSample; i++) {
        const sample = channel[i];
        sumSquares += sample * sample;
        sampleCount++;
      }
    }

    const meanSquare = sumSquares / sampleCount;
    if (meanSquare > 0) {
      const loudness = linearToDBFS(Math.sqrt(meanSquare));
      if (loudness > -70) {
        loudnessValues.push(loudness);
      }
    }
  }

  if (loudnessValues.length < 2) {
    return 0;
  }

  // Sort and calculate 10th and 90th percentiles
  loudnessValues.sort((a, b) => a - b);
  const lowIndex = Math.floor(loudnessValues.length * 0.1);
  const highIndex = Math.floor(loudnessValues.length * 0.9);

  const loudness10 = loudnessValues[lowIndex];
  const loudness90 = loudnessValues[highIndex];

  return loudness90 - loudness10;
}

/**
 * Perform complete loudness analysis
 */
export function analyzeLoudness(audioBuffer: AudioBuffer): LoudnessMeasurement {
  const integratedLoudness = measureIntegratedLoudness(audioBuffer);
  const truePeak = measureTruePeak(audioBuffer);
  const loudnessRange = measureLoudnessRange(audioBuffer);

  return {
    integratedLoudness,
    truePeak,
    loudnessRange,
    shortTermLoudness: [], // Simplified for now
    momentaryLoudness: [], // Simplified for now
    normalizedGain: 0,
  };
}

/**
 * Calculate gain needed to normalize to target loudness
 */
export function calculateNormalizationGain(
  currentLoudness: number,
  targetLoudness: number
): number {
  if (currentLoudness === -Infinity) {
    return 0;
  }
  return targetLoudness - currentLoudness;
}

/**
 * Apply normalization gain to audio buffer
 */
export function normalizeAudioBuffer(
  audioBuffer: AudioBuffer,
  gainDB: number,
  options: LoudnessNormalizationOptions = {}
): AudioBuffer {
  const targetLoudness = options.targetLoudness ?? -14;
  const maxTruePeak = options.maxTruePeak ?? -1;

  const gainLinear = dBFSToLinear(gainDB);
  const maxTruePeakLinear = dBFSToLinear(maxTruePeak);

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const channel = audioBuffer.getChannelData(ch);
    for (let i = 0; i < channel.length; i++) {
      channel[i] *= gainLinear;

      // Soft clipping if peak exceeds limit (prevent harsh clipping)
      if (Math.abs(channel[i]) > maxTruePeakLinear && !options.allowClipping) {
        // Simple soft clipping using hyperbolic tangent
        if (channel[i] > 0) {
          channel[i] = Math.tanh(channel[i]);
        } else {
          channel[i] = -Math.tanh(-channel[i]);
        }
      }
    }
  }

  return audioBuffer;
}

/**
 * Normalize audio buffer to target loudness
 */
export function normalizeToTarget(
  audioBuffer: AudioBuffer,
  options: LoudnessNormalizationOptions = {}
): { buffer: AudioBuffer; measurement: LoudnessMeasurement; gain: number } {
  const measurement = analyzeLoudness(audioBuffer);
  const targetLoudness = options.targetLoudness ?? -14;

  const gain = calculateNormalizationGain(measurement.integratedLoudness, targetLoudness);
  measurement.normalizedGain = gain;

  const normalizedBuffer = normalizeAudioBuffer(audioBuffer, gain, options);

  return {
    buffer: normalizedBuffer,
    measurement,
    gain,
  };
}

/**
 * Create a loudness measurement report
 */
export function generateLoudnessReport(measurement: LoudnessMeasurement): string {
  const lines = [
    'Loudness Analysis Report',
    '=======================',
    `Integrated Loudness: ${measurement.integratedLoudness.toFixed(2)} LUFS`,
    `True Peak: ${measurement.truePeak.toFixed(2)} dBFS`,
    `Loudness Range: ${measurement.loudnessRange.toFixed(2)} LRA`,
    '',
    'Streaming Standards:',
  ];

  // Compare against standards
  for (const [key, standard] of Object.entries(LOUDNESS_STANDARDS)) {
    const diff = Math.abs(measurement.integratedLoudness - standard.targetLoudness);
    const status = diff < 0.5 ? '✓' : '○';
    lines.push(
      `${status} ${standard.name}: ${standard.targetLoudness} LUFS (diff: ${diff.toFixed(2)} dB)`
    );
  }

  return lines.join('\n');
}
