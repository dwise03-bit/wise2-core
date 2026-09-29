/**
 * Codecs.ts
 *
 * Audio codec definitions and configuration for supported export formats.
 * Includes MP3, WAV, FLAC, ALAC, Opus, OGG Vorbis, and AAC with
 * configurable quality/bitrate options.
 *
 * @module audioExport/Codecs
 */

export type AudioCodec = 'mp3' | 'wav' | 'flac' | 'alac' | 'opus' | 'ogg' | 'aac';

export type BitDepth = 16 | 24 | 32;
export type SampleRate = 44100 | 48000 | 88200 | 96000 | 192000;

export interface CodecConfig {
  codec: AudioCodec;
  mimeType: string;
  extension: string;
  description: string;
  lossless: boolean;
  defaultBitrate: number; // kbps, 0 for lossless
  bitrateRange?: {
    min: number;
    max: number;
  };
  supportedBitDepths?: BitDepth[];
  supportedSampleRates?: SampleRate[];
}

export interface ExportFormat {
  codec: AudioCodec;
  bitrate?: number; // kbps for lossy
  quality?: number; // 0-100 quality scale
  bitDepth?: BitDepth; // for WAV/FLAC
  sampleRate?: SampleRate;
  normalize?: boolean;
  normalizationTarget?: number; // LUFS
}

export interface QualityPreset {
  label: string;
  description: string;
  bitrate: number; // kbps
  quality: number; // 0-100
}

/**
 * Codec configurations for all supported formats
 */
export const CODEC_CONFIGS: Record<AudioCodec, CodecConfig> = {
  mp3: {
    codec: 'mp3',
    mimeType: 'audio/mpeg',
    extension: '.mp3',
    description: 'MP3 (MPEG-1 Audio Layer III)',
    lossless: false,
    defaultBitrate: 192,
    bitrateRange: { min: 128, max: 320 },
  },
  wav: {
    codec: 'wav',
    mimeType: 'audio/wav',
    extension: '.wav',
    description: 'Waveform Audio File Format',
    lossless: true,
    defaultBitrate: 0,
    supportedBitDepths: [16, 24, 32],
    supportedSampleRates: [44100, 48000, 88200, 96000, 192000],
  },
  flac: {
    codec: 'flac',
    mimeType: 'audio/flac',
    extension: '.flac',
    description: 'Free Lossless Audio Codec',
    lossless: true,
    defaultBitrate: 0,
    supportedBitDepths: [16, 24],
    supportedSampleRates: [44100, 48000, 88200, 96000, 192000],
  },
  alac: {
    codec: 'alac',
    mimeType: 'audio/alac',
    extension: '.m4a',
    description: 'Apple Lossless Audio Codec',
    lossless: true,
    defaultBitrate: 0,
    supportedBitDepths: [16, 24],
    supportedSampleRates: [44100, 48000, 88200, 96000],
  },
  opus: {
    codec: 'opus',
    mimeType: 'audio/opus',
    extension: '.opus',
    description: 'Opus Interactive Audio',
    lossless: false,
    defaultBitrate: 128,
    bitrateRange: { min: 16, max: 510 },
  },
  ogg: {
    codec: 'ogg',
    mimeType: 'audio/ogg',
    extension: '.ogg',
    description: 'OGG Vorbis',
    lossless: false,
    defaultBitrate: 192,
    bitrateRange: { min: 45, max: 320 },
  },
  aac: {
    codec: 'aac',
    mimeType: 'audio/aac',
    extension: '.m4a',
    description: 'Advanced Audio Coding (iTunes)',
    lossless: false,
    defaultBitrate: 192,
    bitrateRange: { min: 32, max: 320 },
  },
};

/**
 * Quality presets for lossy formats
 */
export const QUALITY_PRESETS: Record<AudioCodec, QualityPreset[]> = {
  mp3: [
    {
      label: 'Low',
      description: 'Mobile streaming',
      bitrate: 128,
      quality: 30,
    },
    {
      label: 'Medium',
      description: 'General playback',
      bitrate: 192,
      quality: 60,
    },
    {
      label: 'High',
      description: 'Quality listening',
      bitrate: 256,
      quality: 85,
    },
    {
      label: 'Very High',
      description: 'Professional archival',
      bitrate: 320,
      quality: 100,
    },
  ],
  opus: [
    {
      label: 'Low',
      description: 'Streaming',
      bitrate: 32,
      quality: 25,
    },
    {
      label: 'Medium',
      description: 'General playback',
      bitrate: 96,
      quality: 60,
    },
    {
      label: 'High',
      description: 'Quality listening',
      bitrate: 192,
      quality: 85,
    },
    {
      label: 'Very High',
      description: 'Near lossless',
      bitrate: 320,
      quality: 100,
    },
  ],
  ogg: [
    {
      label: 'Low',
      description: 'Streaming',
      bitrate: 96,
      quality: 30,
    },
    {
      label: 'Medium',
      description: 'General playback',
      bitrate: 192,
      quality: 60,
    },
    {
      label: 'High',
      description: 'Quality listening',
      bitrate: 256,
      quality: 85,
    },
    {
      label: 'Very High',
      description: 'Excellent quality',
      bitrate: 320,
      quality: 100,
    },
  ],
  aac: [
    {
      label: 'Low',
      description: 'Mobile streaming',
      bitrate: 96,
      quality: 30,
    },
    {
      label: 'Medium',
      description: 'General playback',
      bitrate: 192,
      quality: 60,
    },
    {
      label: 'High',
      description: 'Quality listening',
      bitrate: 256,
      quality: 85,
    },
    {
      label: 'Very High',
      description: 'iTunes quality',
      bitrate: 320,
      quality: 100,
    },
  ],
  wav: [
    {
      label: '16-bit 44.1kHz',
      description: 'CD quality',
      bitrate: 0,
      quality: 85,
    },
    {
      label: '24-bit 48kHz',
      description: 'Professional standard',
      bitrate: 0,
      quality: 95,
    },
    {
      label: '32-bit 96kHz',
      description: 'Mastering quality',
      bitrate: 0,
      quality: 100,
    },
  ],
  flac: [
    {
      label: '16-bit 44.1kHz',
      description: 'CD quality lossless',
      bitrate: 0,
      quality: 85,
    },
    {
      label: '24-bit 48kHz',
      description: 'Professional lossless',
      bitrate: 0,
      quality: 95,
    },
    {
      label: '24-bit 96kHz',
      description: 'Hi-res lossless',
      bitrate: 0,
      quality: 100,
    },
  ],
  alac: [
    {
      label: '16-bit 44.1kHz',
      description: 'CD quality (iTunes)',
      bitrate: 0,
      quality: 85,
    },
    {
      label: '24-bit 48kHz',
      description: 'Professional (iTunes)',
      bitrate: 0,
      quality: 95,
    },
    {
      label: '24-bit 96kHz',
      description: 'Hi-res (iTunes)',
      bitrate: 0,
      quality: 100,
    },
  ],
};

/**
 * Estimate output file size based on format and duration
 */
export function estimateFileSize(
  format: ExportFormat,
  durationSeconds: number,
  trackCount: number = 1
): number {
  const config = CODEC_CONFIGS[format.codec];

  if (config.lossless) {
    // For lossless: sample rate × bit depth × channels × duration
    const sampleRate = format.sampleRate || 48000;
    const bitDepth = format.bitDepth || 24;
    const channels = 2; // Assume stereo for export
    const bytesPerSecond = (sampleRate * bitDepth * channels) / 8;
    return Math.round(bytesPerSecond * durationSeconds) + 4096; // WAV header
  } else {
    // For lossy: bitrate × duration
    const bitrate = format.bitrate || config.defaultBitrate;
    return Math.round((bitrate * 1000 * durationSeconds) / 8);
  }
}

/**
 * Get browser support for audio codec
 */
export function getCodecBrowserSupport(codec: AudioCodec): {
  supported: boolean;
  webAudioSupport: boolean;
  mediaSourceSupport: boolean;
  notes: string[];
} {
  const audio = new Audio();
  const notes: string[] = [];

  const support = {
    mp3: {
      webAudio: true,
      media: audio.canPlayType('audio/mpeg') !== '',
    },
    wav: {
      webAudio: true,
      media: audio.canPlayType('audio/wav') !== '',
    },
    flac: {
      webAudio: true,
      media: audio.canPlayType('audio/flac') !== '',
    },
    alac: {
      webAudio: false,
      media: audio.canPlayType('audio/alac') !== '',
      note: 'ALAC export requires external encoder',
    },
    opus: {
      webAudio: true,
      media: audio.canPlayType('audio/opus') !== '',
    },
    ogg: {
      webAudio: true,
      media: audio.canPlayType('audio/ogg') !== '',
    },
    aac: {
      webAudio: false,
      media: audio.canPlayType('audio/aac') !== '',
      note: 'AAC export requires external encoder',
    },
  };

  const result = support[codec];
  const supported = result.webAudio && result.media;

  if (!supported) {
    if (!result.webAudio) {
      notes.push('No Web Audio API support');
    }
    if (!result.media) {
      notes.push('Limited browser playback support');
    }
  }
  if ('note' in result) {
    notes.push(result.note);
  }

  return {
    supported,
    webAudioSupport: result.webAudio,
    mediaSourceSupport: result.media,
    notes,
  };
}

/**
 * Get recommended codec for use case
 */
export function getRecommendedCodec(useCase: 'streaming' | 'archival' | 'broadcast' | 'social'): AudioCodec {
  switch (useCase) {
    case 'streaming':
      return 'aac'; // iTunes/Spotify standard
    case 'archival':
      return 'flac'; // Lossless, universal
    case 'broadcast':
      return 'wav'; // Professional standard
    case 'social':
      return 'mp3'; // Maximum compatibility
    default:
      return 'mp3';
  }
}

/**
 * Calculate bitrate from quality (0-100) for given codec
 */
export function qualityToBitrate(codec: AudioCodec, quality: number): number {
  const quality0to100 = Math.max(0, Math.min(100, quality));
  const config = CODEC_CONFIGS[codec];

  if (config.lossless) {
    return 0;
  }

  if (!config.bitrateRange) {
    return config.defaultBitrate;
  }

  const { min, max } = config.bitrateRange;
  return Math.round(min + ((max - min) * quality0to100) / 100);
}

/**
 * Calculate quality (0-100) from bitrate for given codec
 */
export function bitrateToQuality(codec: AudioCodec, bitrate: number): number {
  const config = CODEC_CONFIGS[codec];

  if (config.lossless) {
    return 100;
  }

  if (!config.bitrateRange) {
    return 60;
  }

  const { min, max } = config.bitrateRange;
  return Math.round(((bitrate - min) / (max - min)) * 100);
}
