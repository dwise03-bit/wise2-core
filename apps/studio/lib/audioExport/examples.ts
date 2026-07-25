/**
 * examples.ts
 *
 * Usage examples for the audio export system.
 * Demonstrates common workflows and best practices.
 *
 * @module audioExport/examples
 */

import { ExportEngine, AudioTrack } from './ExportEngine';
import {
  AudioCodec,
  ExportFormat,
  CODEC_CONFIGS,
  QUALITY_PRESETS,
  estimateFileSize,
  getRecommendedCodec,
} from './Codecs';
import {
  analyzeLoudness,
  normalizeToTarget,
  generateLoudnessReport,
  LOUDNESS_STANDARDS,
} from './Loudness';

/**
 * Example 1: Basic single-track export to WAV
 */
export async function example1_basicExport(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  title: string
) {
  const exportEngine = new ExportEngine(audioContext);

  const tracks: AudioTrack[] = [
    {
      id: 'main',
      name: 'Main Track',
      buffer: audioBuffer,
      volume: 1.0,
      pan: 0,
      muted: false,
      startTime: 0,
      enabled: true,
    },
  ];

  const result = await exportEngine.export(
    tracks,
    audioBuffer.duration,
    { codec: 'wav', bitDepth: 24, sampleRate: 48000 },
    undefined,
    `${title}.wav`
  );

  if (result.success && result.blob) {
    exportEngine.downloadBlob(result.blob, result.filename);
  }

  return result;
}

/**
 * Example 2: Multi-track mix with volume and panning
 */
export async function example2_multiTrackMix(
  audioContext: AudioContext,
  vocalBuffer: AudioBuffer,
  beatsBuffer: AudioBuffer,
  bassBuffer: AudioBuffer
) {
  const exportEngine = new ExportEngine(audioContext);

  const duration = Math.max(
    vocalBuffer.duration,
    beatsBuffer.duration,
    bassBuffer.duration
  );

  const tracks: AudioTrack[] = [
    {
      id: 'vocal',
      name: 'Vocal',
      buffer: vocalBuffer,
      volume: 0.8,
      pan: -0.1, // Slightly left
      muted: false,
      startTime: 0,
      enabled: true,
    },
    {
      id: 'beats',
      name: 'Drums',
      buffer: beatsBuffer,
      volume: 0.9,
      pan: 0, // Center
      muted: false,
      startTime: 0,
      enabled: true,
    },
    {
      id: 'bass',
      name: 'Bass',
      buffer: bassBuffer,
      volume: 0.7,
      pan: 0.1, // Slightly right
      muted: false,
      startTime: 0.5, // Starts 0.5 seconds in
      enabled: true,
    },
  ];

  // Setup progress tracking
  const taskId = 'multi-track-export';
  exportEngine.onProgress(taskId, (progress) => {
    console.log(`[${progress.status}] ${progress.progress}% - Track ${progress.currentTrack}/${progress.totalTracks}`);
  });

  const result = await exportEngine.export(
    tracks,
    duration,
    { codec: 'mp3', bitrate: 192 },
    { targetLoudness: -14 }, // Spotify standard
    'multi-track-mix.mp3'
  );

  if (result.success && result.blob) {
    exportEngine.downloadBlob(result.blob, result.filename);
  }

  return result;
}

/**
 * Example 3: Loudness analysis and normalization
 */
export async function example3_loudnessAnalysis(audioBuffer: AudioBuffer) {
  // Measure loudness
  const measurement = analyzeLoudness(audioBuffer);

  console.log('Loudness Analysis:');
  console.log(`  Integrated Loudness: ${measurement.integratedLoudness.toFixed(2)} LUFS`);
  console.log(`  True Peak: ${measurement.truePeak.toFixed(2)} dBFS`);
  console.log(`  Loudness Range: ${measurement.loudnessRange.toFixed(2)} LRA`);

  // Generate detailed report
  const report = generateLoudnessReport(measurement);
  console.log('\n' + report);

  // Normalize to Spotify standard
  const normalized = normalizeToTarget(audioBuffer, {
    targetLoudness: -14, // Spotify
    maxTruePeak: -1,
  });

  console.log(
    `\nApplied gain: ${normalized.gain.toFixed(2)} dB to reach -14 LUFS`
  );

  return normalized;
}

/**
 * Example 4: Batch export to multiple formats
 */
export async function example4_batchExport(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  title: string
) {
  const exportEngine = new ExportEngine(audioContext);

  const tracks: AudioTrack[] = [
    {
      id: 'main',
      name: 'Main',
      buffer: audioBuffer,
      volume: 1.0,
      pan: 0,
      muted: false,
      startTime: 0,
      enabled: true,
    },
  ];

  // Define export formats
  const formats: ExportFormat[] = [
    { codec: 'wav', bitDepth: 24, sampleRate: 48000 }, // Professional archival
    { codec: 'mp3', bitrate: 192 }, // Web distribution
    { codec: 'aac', bitrate: 256 }, // iTunes/Apple
    { codec: 'flac', bitDepth: 24, sampleRate: 48000 }, // Lossless backup
  ];

  // Batch export
  const results = await exportEngine.batchExport(
    tracks,
    audioBuffer.duration,
    formats,
    title,
    { targetLoudness: -14 }
  );

  // Download all results
  for (const result of results) {
    if (result.success && result.blob) {
      console.log(
        `✓ Exported ${result.filename} (${(result.fileSize / 1024 / 1024).toFixed(2)} MB)`
      );
      exportEngine.downloadBlob(result.blob, result.filename);
    }
  }

  return results;
}

/**
 * Example 5: Quality preset selection
 */
export async function example5_qualityPresets(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer
) {
  const exportEngine = new ExportEngine(audioContext);

  const tracks: AudioTrack[] = [
    {
      id: 'main',
      name: 'Main',
      buffer: audioBuffer,
      volume: 1.0,
      pan: 0,
      muted: false,
      startTime: 0,
      enabled: true,
    },
  ];

  // Use MP3 quality presets
  const mp3Presets = QUALITY_PRESETS.mp3;

  console.log('MP3 Quality Presets:');
  mp3Presets.forEach((preset, idx) => {
    const estimatedSize = estimateFileSize(
      { codec: 'mp3', bitrate: preset.bitrate },
      audioBuffer.duration
    );
    console.log(
      `${idx + 1}. ${preset.label}: ${preset.bitrate} kbps (${(estimatedSize / 1024 / 1024).toFixed(2)} MB)`
    );
  });

  // Export with "High" quality preset
  const highQualityPreset = mp3Presets[2]; // "High"
  const result = await exportEngine.export(
    tracks,
    audioBuffer.duration,
    { codec: 'mp3', bitrate: highQualityPreset.bitrate },
    { targetLoudness: -14 },
    'export-high-quality.mp3'
  );

  return result;
}

/**
 * Example 6: Different loudness standards
 */
export async function example6_loudnessStandards(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer
) {
  const exportEngine = new ExportEngine(audioContext);

  const tracks: AudioTrack[] = [
    {
      id: 'main',
      name: 'Main',
      buffer: audioBuffer,
      volume: 1.0,
      pan: 0,
      muted: false,
      startTime: 0,
      enabled: true,
    },
  ];

  const results: Record<string, any> = {};

  // Export for different streaming platforms
  for (const [key, standard] of Object.entries(LOUDNESS_STANDARDS)) {
    console.log(`Exporting for ${standard.name} (${standard.targetLoudness} LUFS)...`);

    const result = await exportEngine.export(
      tracks,
      audioBuffer.duration,
      { codec: 'mp3', bitrate: 192 },
      { targetLoudness: standard.targetLoudness },
      `export-${key}.mp3`
    );

    results[key] = {
      standard: standard.name,
      targetLoudness: standard.targetLoudness,
      actualLoudness: result.measurement?.integratedLoudness,
      gain: result.measurement?.normalizedGain,
    };

    if (result.success && result.blob) {
      exportEngine.downloadBlob(result.blob, result.filename);
    }
  }

  console.log('\nExport Summary:');
  for (const [key, data] of Object.entries(results)) {
    console.log(`${data.standard}:`);
    console.log(`  Target: ${data.targetLoudness} LUFS`);
    console.log(
      `  Actual: ${data.actualLoudness?.toFixed(2) || 'N/A'} LUFS`
    );
    console.log(`  Gain Applied: ${data.gain?.toFixed(2) || 'N/A'} dB`);
  }

  return results;
}

/**
 * Example 7: Estimated file sizes
 */
export function example7_fileSizeEstimation(duration: number) {
  console.log(`File size estimates for ${duration.toFixed(2)}s audio:\n`);

  const formats: ExportFormat[] = [
    { codec: 'wav', bitDepth: 16, sampleRate: 44100 },
    { codec: 'wav', bitDepth: 24, sampleRate: 48000 },
    { codec: 'mp3', bitrate: 128 },
    { codec: 'mp3', bitrate: 192 },
    { codec: 'mp3', bitrate: 320 },
    { codec: 'aac', bitrate: 128 },
    { codec: 'aac', bitrate: 256 },
    { codec: 'flac', bitDepth: 24, sampleRate: 48000 },
    { codec: 'opus', bitrate: 96 },
  ];

  for (const format of formats) {
    const size = estimateFileSize(format, duration);
    const mb = (size / 1024 / 1024).toFixed(2);
    const config = CODEC_CONFIGS[format.codec];
    const label = format.bitrate ? `${format.bitrate} kbps` : `${format.bitDepth}-bit`;
    console.log(`${config.description} (${label}): ${mb} MB`);
  }
}

/**
 * Example 8: Recommended codec selection
 */
export function example8_recommendedCodecs() {
  const useCases = [
    'streaming' as const,
    'archival' as const,
    'broadcast' as const,
    'social' as const,
  ];

  console.log('Recommended codecs by use case:\n');

  for (const useCase of useCases) {
    const recommended = getRecommendedCodec(useCase);
    const config = CODEC_CONFIGS[recommended];

    console.log(`${useCase.toUpperCase()}:`);
    console.log(`  Codec: ${config.description}`);
    console.log(`  Lossless: ${config.lossless}`);
    console.log(`  Default Bitrate: ${config.defaultBitrate || 'N/A'} kbps\n`);
  }
}

/**
 * Example 9: Progress tracking
 */
export async function example9_progressTracking(
  audioContext: AudioContext,
  tracks: AudioTrack[],
  duration: number
) {
  const exportEngine = new ExportEngine(audioContext);

  // Create custom progress tracker
  const taskId = 'progress-example';
  const progressLog: string[] = [];

  exportEngine.onProgress(taskId, (progress) => {
    const timestamp = new Date().toLocaleTimeString();
    let message = `[${timestamp}] ${progress.status.toUpperCase()}: ${progress.progress}%`;

    if (progress.currentTrack && progress.totalTracks) {
      message += ` (Track ${progress.currentTrack}/${progress.totalTracks})`;
    }

    if (progress.measurement) {
      message += ` [${progress.measurement.integratedLoudness.toFixed(2)} LUFS]`;
    }

    progressLog.push(message);
    console.log(message);
  });

  const result = await exportEngine.export(
    tracks,
    duration,
    { codec: 'mp3', bitrate: 192 },
    { targetLoudness: -14 }
  );

  console.log('\nExport Progress Log:');
  progressLog.forEach((log) => console.log(log));

  return { result, progressLog };
}

/**
 * Example 10: Error handling
 */
export async function example10_errorHandling(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer | null
) {
  const exportEngine = new ExportEngine(audioContext);

  if (!audioBuffer) {
    console.error('Error: No audio buffer provided');
    return;
  }

  try {
    const tracks: AudioTrack[] = [
      {
        id: 'main',
        name: 'Main',
        buffer: audioBuffer,
        volume: 1.0,
        pan: 0,
        muted: false,
        startTime: 0,
        enabled: true,
      },
    ];

    const result = await exportEngine.export(
      tracks,
      audioBuffer.duration,
      { codec: 'mp3', bitrate: 192 }
    );

    if (!result.success) {
      console.error('Export failed:', result.error);
      return;
    }

    if (!result.blob) {
      console.error('Export produced no output blob');
      return;
    }

    exportEngine.downloadBlob(result.blob, result.filename);
  } catch (error) {
    console.error('Unexpected error during export:', error);
  }
}
