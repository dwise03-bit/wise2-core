/**
 * File size calculator for audio recordings
 * Calculates estimated file sizes based on recording parameters
 */

export interface AudioParameters {
  duration: number; // seconds
  trackCount: number;
  sampleRate?: number; // Hz (default: 44100)
  bitDepth?: number; // bits (default: 16)
  channels?: number; // per track (default: 2 for stereo)
}

/**
 * Calculate uncompressed WAV file size
 * Formula: (sampleRate * bitDepth * channels * trackCount * duration) / 8
 */
export function calculateWavFileSize(params: AudioParameters): number {
  const {
    duration,
    trackCount,
    sampleRate = 44100,
    bitDepth = 16,
    channels = 2,
  } = params;

  // Calculate bytes per second per track
  const bytesPerSecondPerTrack = (sampleRate * bitDepth * channels) / 8;

  // Total size including WAV header (~44 bytes)
  const totalBytes = bytesPerSecondPerTrack * trackCount * duration + 44;

  return Math.round(totalBytes);
}

/**
 * Calculate MP3 file size with compression
 * MP3 uses variable bitrate (VBR), average ~128-192 kbps for good quality
 */
export function calculateMp3FileSize(params: AudioParameters, bitrate: number = 128): number {
  const { duration, trackCount } = params;

  // Bitrate is in kbps (kilobits per second)
  // Convert to bytes: kbps * 1000 / 8 = bytes per second
  const bytesPerSecond = (bitrate * 1000) / 8;
  const totalBytes = bytesPerSecond * duration * trackCount;

  return Math.round(totalBytes);
}

/**
 * Calculate AAC file size with compression
 * AAC typically uses lower bitrates than MP3 for similar quality (~96-128 kbps)
 */
export function calculateAacFileSize(params: AudioParameters, bitrate: number = 128): number {
  const { duration, trackCount } = params;

  // Similar calculation to MP3
  const bytesPerSecond = (bitrate * 1000) / 8;
  const totalBytes = bytesPerSecond * duration * trackCount;

  return Math.round(totalBytes);
}

/**
 * Calculate file size for any format
 */
export function calculateFileSize(
  params: AudioParameters,
  format: 'wav' | 'mp3' | 'aac' = 'wav',
  bitrate?: number
): number {
  switch (format) {
    case 'mp3':
      return calculateMp3FileSize(params, bitrate || 192);
    case 'aac':
      return calculateAacFileSize(params, bitrate || 128);
    case 'wav':
    default:
      return calculateWavFileSize(params);
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format bytes to number in MB
 */
export function formatFileSizeMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Estimate file size reduction when converting formats
 */
export function estimateSizeReduction(
  originalSize: number,
  originalFormat: 'wav' | 'mp3' | 'aac',
  newFormat: 'wav' | 'mp3' | 'aac'
): {
  originalSize: number;
  newSize: number;
  reduction: number;
  reductionPercent: number;
} {
  // For estimation purposes, use typical file size ratios
  const formats = {
    wav: 1, // baseline
    mp3: 0.08, // ~8% of WAV size (128 kbps)
    aac: 0.06, // ~6% of WAV size (128 kbps)
  };

  const ratio = formats[newFormat] / formats[originalFormat];
  const newSize = Math.round(originalSize * ratio);
  const reduction = originalSize - newSize;
  const reductionPercent = ((reduction / originalSize) * 100);

  return {
    originalSize,
    newSize,
    reduction,
    reductionPercent: Math.round(reductionPercent),
  };
}
