/**
 * Recording export utilities
 * Handles export operations for different audio formats
 */

export type ExportFormat = 'wav' | 'mp3' | 'aac';

export interface ExportOptions {
  format: ExportFormat;
  bitrate?: number; // for lossy formats, in kbps
  quality?: number; // 0-100, alternative to bitrate
}

export interface ExportResult {
  id: string;
  title: string;
  format: ExportFormat;
  size: number; // bytes
  duration: number;
  mimeType: string;
}

/**
 * Get MIME type for audio format
 */
export function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',
  };
  return mimeTypes[format] || 'audio/wav';
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    wav: '.wav',
    mp3: '.mp3',
    aac: '.aac',
  };
  return extensions[format] || '.wav';
}

/**
 * Create download filename with timestamp
 */
export function createDownloadFilename(
  title: string,
  format: ExportFormat,
  timestamp?: Date
): string {
  const ts = timestamp || new Date();
  const dateStr = ts.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = ts.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

  // Sanitize title
  const sanitized = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return `${sanitized}_${dateStr}_${timeStr}${getFileExtension(format)}`;
}

/**
 * Get recommended bitrate for format and quality
 */
export function getRecommendedBitrate(format: ExportFormat, quality: number = 80): number {
  // Quality: 0-100, map to bitrates
  if (format === 'wav') return 0; // lossless, no bitrate

  const qualityMap = {
    low: 64,
    medium: 128,
    high: 192,
    veryHigh: 256,
  };

  if (quality <= 30) return qualityMap.low;
  if (quality <= 60) return qualityMap.medium;
  if (quality <= 85) return qualityMap.high;
  return qualityMap.veryHigh;
}

/**
 * Simulate audio export - creates a blob with metadata
 * In production, this would use Web Audio API or FFmpeg
 */
export function simulateAudioExport(
  duration: number,
  trackCount: number,
  format: ExportFormat,
  options?: ExportOptions
): Blob {
  // Simulate different file sizes based on format
  const durationMs = duration * 1000;

  let size: number;
  switch (format) {
    case 'wav': {
      // 44.1kHz, 16-bit, stereo per track
      const bytesPerSecond = (44100 * 16 * 2 * trackCount) / 8;
      size = bytesPerSecond * duration + 44;
      break;
    }
    case 'mp3': {
      const bitrate = options?.bitrate || 192;
      size = Math.round((bitrate * 1000 * duration) / 8);
      break;
    }
    case 'aac': {
      const bitrate = options?.bitrate || 128;
      size = Math.round((bitrate * 1000 * duration) / 8);
      break;
    }
  }

  // Create a blob with the appropriate MIME type and size
  const mimeType = getMimeType(format);
  const data = new ArrayBuffer(size);
  return new Blob([data], { type: mimeType });
}

/**
 * Create download link and trigger download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export recording with given format
 */
export async function exportRecording(
  recordingId: string,
  title: string,
  duration: number,
  trackCount: number,
  format: ExportFormat,
  options?: ExportOptions
): Promise<ExportResult> {
  const blob = simulateAudioExport(duration, trackCount, format, options);
  const filename = createDownloadFilename(title, format);

  // In production, you might want to upload to server or cloud storage
  // For now, we'll just create the download
  downloadBlob(blob, filename);

  return {
    id: recordingId,
    title,
    format,
    size: blob.size,
    duration,
    mimeType: getMimeType(format),
  };
}

/**
 * Get export format descriptions
 */
export function getFormatDescription(format: ExportFormat): string {
  const descriptions: Record<ExportFormat, string> = {
    wav: 'Uncompressed audio, highest quality, larger file size',
    mp3: 'Compressed audio, widely compatible, good quality at 192 kbps',
    aac: 'Modern compressed format, better quality at lower bitrates',
  };
  return descriptions[format];
}

/**
 * Get export format recommendations
 */
export function getFormatRecommendation(format: ExportFormat): string {
  const recommendations: Record<ExportFormat, string> = {
    wav: 'Best for archival and professional editing',
    mp3: 'Best for sharing and playback on most devices',
    aac: 'Best for Apple ecosystem and streaming',
  };
  return recommendations[format];
}
