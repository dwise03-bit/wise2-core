/**
 * Waveform Generator
 * Convert AudioBuffer to pixel data for canvas rendering
 * Optimized for real-time display
 */

export interface WaveformOptions {
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  channelMode?: 'stereo' | 'mono';
}

export interface WaveformData {
  pixelData: Uint8ClampedArray;
  width: number;
  height: number;
  peaks: number[];
}

/**
 * Generate waveform visualization from AudioBuffer
 */
export function generateWaveform(
  audioBuffer: AudioBuffer,
  options: WaveformOptions
): WaveformData {
  const { width, height, color = '#00D9FF', backgroundColor = '#1a1a1a', channelMode = 'mono' } = options;

  // Create canvas for drawing
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw waveform
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  const samplesPerPixel = Math.ceil((duration * sampleRate) / width);

  // Get center line position
  const centerY = height / 2;

  // Process each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    if (channelMode === 'mono' && channel > 0) break;

    const channelData = audioBuffer.getChannelData(channel);
    const yOffset = channelMode === 'stereo' ? (channel === 0 ? height / 4 : (height * 3) / 4) : centerY;
    const yScale = channelMode === 'stereo' ? height / 4 : height / 2;

    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      const sampleIndex = i * samplesPerPixel;
      const sampleEnd = Math.min(sampleIndex + samplesPerPixel, channelData.length);

      // Find peak in this range
      let peak = 0;
      for (let j = sampleIndex; j < sampleEnd; j++) {
        const sample = Math.abs(channelData[j]);
        if (sample > peak) peak = sample;
      }

      const y = yOffset - peak * yScale;

      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }

    ctx.stroke();

    // Draw negative half
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      const sampleIndex = i * samplesPerPixel;
      const sampleEnd = Math.min(sampleIndex + samplesPerPixel, channelData.length);

      let peak = 0;
      for (let j = sampleIndex; j < sampleEnd; j++) {
        const sample = Math.abs(channelData[j]);
        if (sample > peak) peak = sample;
      }

      const y = yOffset + peak * yScale;

      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }

    ctx.stroke();
  }

  // Extract pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixelData = imageData.data;

  // Calculate peaks for fast visualization
  const peaks = calculatePeaks(audioBuffer, width);

  return {
    pixelData,
    width,
    height,
    peaks,
  };
}

/**
 * Calculate peak levels for each pixel column
 * Used for waveform meter display
 */
function calculatePeaks(audioBuffer: AudioBuffer, pixelCount: number): number[] {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const peaks: number[] = new Array(pixelCount).fill(0);

  const samplesPerPixel = Math.ceil(channelData.length / pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const sampleStart = i * samplesPerPixel;
    const sampleEnd = Math.min(sampleStart + samplesPerPixel, channelData.length);

    let peak = 0;
    for (let j = sampleStart; j < sampleEnd; j++) {
      const sample = Math.abs(channelData[j]);
      if (sample > peak) peak = sample;
    }

    peaks[i] = peak;
  }

  return peaks;
}

/**
 * Draw waveform to canvas element (for rendering in DOM)
 */
export function drawWaveformToCanvas(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  options: WaveformOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const waveform = generateWaveform(audioBuffer, {
    ...options,
    width: canvas.width,
    height: canvas.height,
  });

  const imageData = ctx.createImageData(waveform.width, waveform.height);
  imageData.data.set(waveform.pixelData);
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Generate waveform with custom resolution
 * Trade-off between accuracy and performance
 */
export function generateWaveformFast(
  audioBuffer: AudioBuffer,
  options: WaveformOptions & { quality?: 'low' | 'medium' | 'high' }
): WaveformData {
  const { quality = 'medium' } = options;

  // Reduce sample resolution for faster processing
  const qualityMap = {
    low: 4,      // 1 in 4 samples
    medium: 2,   // 1 in 2 samples
    high: 1,     // All samples
  };

  const step = qualityMap[quality];
  const resampledBuffer = resampleBuffer(audioBuffer, step);

  return generateWaveform(resampledBuffer, options);
}

/**
 * Resample audio buffer by taking every Nth sample
 */
function resampleBuffer(audioBuffer: AudioBuffer, step: number): AudioBuffer {
  const ctx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.length / step),
    audioBuffer.sampleRate
  );

  const resampledBuffer = ctx.createBuffer(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.length / step),
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = resampledBuffer.getChannelData(channel);

    let outputIndex = 0;
    for (let i = 0; i < inputData.length; i += step) {
      outputData[outputIndex++] = inputData[i];
    }
  }

  return resampledBuffer;
}

/**
 * Draw trimmed waveform (showing only the displayed portion)
 */
export function drawTrimmedWaveform(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  trimStart: number, // seconds
  trimEnd: number,   // seconds
  options: WaveformOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(trimStart * sampleRate);
  const endSample = Math.floor(trimEnd * sampleRate);

  // Create trimmed buffer
  const trimmedBuffer = audioBuffer.getContext().createBuffer(
    audioBuffer.numberOfChannels,
    endSample - startSample,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const source = audioBuffer.getChannelData(channel);
    const dest = trimmedBuffer.getChannelData(channel);
    dest.set(source.subarray(startSample, endSample));
  }

  drawWaveformToCanvas(canvas, trimmedBuffer, options);
}
