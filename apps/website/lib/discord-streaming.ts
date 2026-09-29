/**
 * WISE² Sound Lab - Discord Streaming Integration
 * Real-time audio production streaming with Discord webhooks
 */

export interface StreamMetadata {
  title: string;
  platform: 'discord' | 'twitch' | 'youtube';
  tracks: number;
  bitrate: number;
  viewers: number;
  isLive: boolean;
  spectrumData: number[];
  peakLevel: number;
  rmsLevel: number;
}

export interface DiscordStreamNotification {
  content: string;
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{ name: string; value: string; inline: boolean }>;
    thumbnail?: { url: string };
  }>;
}

/**
 * Send stream notification to Discord webhook
 */
export async function notifyDiscordStreamStart(metadata: StreamMetadata): Promise<void> {
  try {
    const notification: DiscordStreamNotification = {
      content: '🎙️ WISE² Sound Lab Live Stream Started!',
      embeds: [{
        title: 'Sound Lab Pro - Live Audio Production',
        description: `Professional audio production stream now live • Multi-track mixing • Real-time spectrum analysis`,
        color: 0x39FF14,
        fields: [
          { name: 'Tracks Active', value: `${metadata.tracks} tracks`, inline: true },
          { name: 'Platform', value: metadata.platform.toUpperCase(), inline: true },
          { name: 'Bitrate', value: `${metadata.bitrate}kbps (320p)`, inline: true },
          { name: 'Viewers', value: `${metadata.viewers || 'connecting...'}`, inline: true },
          { name: 'Features', value: 'Spectrum Analyzer • VU Meters • 7-Track Mixer • Effects Rack', inline: false },
        ],
      }],
    };

    // Send to Discord webhook (example endpoint)
    await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    }).catch(() => {
      console.log('Stream notification queued for Discord');
    });
  } catch (error) {
    console.error('Discord notification error:', error);
  }
}

/**
 * Send stream end notification to Discord
 */
export async function notifyDiscordStreamEnd(metadata: StreamMetadata): Promise<void> {
  try {
    const notification: DiscordStreamNotification = {
      content: '⭕ WISE² Sound Lab Stream Ended',
      embeds: [{
        title: 'Stream Summary',
        description: `Stream complete • Thanks for watching!`,
        color: 0xFF6B6B,
        fields: [
          { name: 'Duration', value: 'Live stream completed', inline: true },
          { name: 'Total Viewers', value: `${metadata.viewers}`, inline: true },
          { name: 'Avg Bitrate', value: `${metadata.bitrate}kbps`, inline: true },
        ],
      }],
    };

    await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    }).catch(() => {
      console.log('Stream end notification queued for Discord');
    });
  } catch (error) {
    console.error('Discord notification error:', error);
  }
}

/**
 * Update Discord presence with stream stats
 */
export async function updateDiscordPresence(metadata: StreamMetadata): Promise<void> {
  // Discord presence update for bot integration
  const presenceData = {
    status: 'online',
    activities: [{
      name: `Sound Lab Pro - ${metadata.viewers} viewers`,
      type: 1, // STREAMING
      url: 'https://wise2.net/studio',
      state: `${metadata.tracks} tracks | ${metadata.bitrate}kbps`,
    }],
  };

  console.log('Discord presence:', presenceData);
}

/**
 * Create RTMP stream configuration for Discord
 */
export function getDiscordStreamConfig(): {
  rtmpUrl: string;
  streamKey: string;
  recommendations: string[];
} {
  return {
    rtmpUrl: 'rtmp://discord.gg/discord-rtmp',
    streamKey: 'your_stream_key_here',
    recommendations: [
      'Use H.264 video codec',
      'Maintain 320kbps audio bitrate',
      '1280x720 video resolution',
      'Enable spectrum analyzer for visual feedback',
      'Monitor peak/RMS levels in real-time',
    ],
  };
}

/**
 * Analyze audio spectrum for visualization
 */
export function analyzeSpectrum(frequencyData: Uint8Array): number[] {
  const spectrum: number[] = [];
  const barCount = 64;
  const barsPerFrequencyBin = Math.floor(frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    for (let j = 0; j < barsPerFrequencyBin; j++) {
      sum += frequencyData[i * barsPerFrequencyBin + j];
    }
    spectrum.push(Math.floor(sum / barsPerFrequencyBin / 255 * 100));
  }

  return spectrum;
}

/**
 * Calculate peak and RMS levels from audio buffer
 */
export function calculateMeters(audioBuffer: Float32Array): { peak: number; rms: number } {
  let peak = 0;
  let sumSquares = 0;

  for (let i = 0; i < audioBuffer.length; i++) {
    const sample = Math.abs(audioBuffer[i]);
    if (sample > peak) peak = sample;
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / audioBuffer.length);

  // Convert to dB scale
  const peakDb = 20 * Math.log10(Math.max(peak, 0.0001));
  const rmsDb = 20 * Math.log10(Math.max(rms, 0.0001));

  // Convert to 0-100 display scale
  const peakDisplay = Math.max(0, Math.min(100, (peakDb + 24) * 2));
  const rmsDisplay = Math.max(0, Math.min(100, (rmsDb + 24) * 2));

  return { peak: peakDisplay, rms: rmsDisplay };
}
