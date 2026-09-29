# Stream Pipeline - Quick Start Example

Get a streaming session running in 5 minutes.

## Installation

```bash
cd apps/studio
npm install
# FFmpeg needed for production encoding
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
# Windows: choco install ffmpeg
```

## Complete Example: Live Stream to Twitch

```typescript
import { initStreamPipeline } from '@wise2/studio/lib/obs';

async function startTwitchStream() {
  // 1. Create pipeline configuration
  const config = {
    // Video
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitrate: 6000, // 6 Mbps recommended for Twitch
    videoCodec: 'h264' as const,

    // Audio
    sampleRate: 48000,
    channels: 2,
    audioBitrate: 128,
    audioCodec: 'aac' as const,

    // Hardware acceleration (macOS)
    hwAcceleration: 'videotoolbox' as const,
    preset: 'fast' as const,

    // RTMP to Twitch
    rtmpUrl: 'rtmp://live-iad.twitch.tv/live',
    streamKey: 'your-twitch-stream-key', // From Twitch Dashboard

    // Recording
    recordingPath: './recordings',
    autoRecord: true,

    // Adaptive bitrate
    enableQualityAdaptation: true,
    minBitrate: 500,
    maxBitrate: 25000,
    targetCpuUsage: 80,
  };

  // 2. Initialize pipeline
  const pipeline = initStreamPipeline(config);

  // 3. Setup event listeners
  pipeline.on('started', () => {
    console.log('🔴 LIVE - Stream started');
  });

  pipeline.on('metrics:updated', (metrics) => {
    // Update UI every frame
    console.log(`
      FPS: ${metrics.fps.toFixed(1)}
      Video: ${metrics.videoBitrate} kbps
      Audio: ${metrics.audioBitrate} kbps
      CPU: ${metrics.cpuUsage.toFixed(1)}%
      Dropped: ${metrics.framesDropped}
    `);
  });

  pipeline.on('quality:changed', (profile) => {
    console.log(`Quality changed to ${profile.profile} (${profile.width}x${profile.height}@${profile.fps}fps)`);
  });

  pipeline.on('recording:started', ({filename}) => {
    console.log(`Recording to: ${filename}`);
  });

  pipeline.on('recording:stopped', ({filename, duration}) => {
    console.log(`Saved recording: ${filename} (${duration}ms)`);
  });

  pipeline.on('error', ({error, stage}) => {
    console.error(`Error at ${stage}:`, error);
  });

  // 4. Start streaming
  try {
    await pipeline.start();
    console.log('Pipeline started, waiting for sources...');
  } catch (error) {
    console.error('Failed to start pipeline:', error);
    return;
  }

  // 5. Add microphone audio
  try {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });

    pipeline.addAudioSource({
      id: 'microphone',
      type: 'microphone',
      stream: micStream,
      volume: 0.8,
      isMuted: false,
      effects: [
        {
          type: 'compression',
          params: {
            threshold: -24,
            knee: 30,
            ratio: 4,
            attack: 0.003,
            release: 0.25,
          },
        },
      ],
    });

    console.log('✓ Microphone added');
  } catch (error) {
    console.error('Microphone access denied:', error);
  }

  // 6. Add desktop audio
  try {
    const desktopStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    pipeline.addAudioSource({
      id: 'desktop',
      type: 'desktop',
      stream: desktopStream,
      volume: 0.6,
      isMuted: false,
    });

    console.log('✓ Desktop audio added');

    // Also add screen capture as video
    const videoTrack = desktopStream.getVideoTracks()[0];
    const video = new HTMLVideoElement();
    video.srcObject = desktopStream;
    video.play();

    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext('2d')!;

    // Draw video to canvas continuously
    function drawVideo() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawVideo);
    }
    drawVideo();

    pipeline.addVideoSource({
      id: 'screen-share',
      type: 'screen',
      data: ctx,
      position: { x: 0, y: 0 },
      size: { width: config.width, height: config.height },
      rotation: 0,
      opacity: 1,
      zIndex: 1,
    });

    console.log('✓ Screen capture added');
  } catch (error) {
    console.error('Screen capture denied:', error);
  }

  // 7. Add webcam as picture-in-picture
  try {
    const webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
    });

    const video = new HTMLVideoElement();
    video.srcObject = webcamStream;
    video.play();

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    function drawWebcam() {
      ctx.drawImage(video, 0, 0, 400, 300);
      requestAnimationFrame(drawWebcam);
    }
    drawWebcam();

    pipeline.addVideoSource({
      id: 'webcam-pip',
      type: 'webcam',
      data: ctx,
      position: { x: 1500, y: 750 }, // Bottom right
      size: { width: 400, height: 300 },
      rotation: 0,
      opacity: 1,
      zIndex: 2, // On top of screen
    });

    console.log('✓ Webcam added as PiP');
  } catch (error) {
    console.error('Webcam access denied:', error);
  }

  // 8. Stream is now live!
  // User is streaming with all sources: screen + webcam + mic + desktop audio

  // 9. Handling user controls
  return {
    // Pause/Resume
    pause: () => pipeline.pause(),
    resume: () => pipeline.resume(),

    // Volume controls
    setMicVolume: (volume: number) => pipeline.setAudioSourceVolume('microphone', volume),
    setDesktopVolume: (volume: number) => pipeline.setAudioSourceVolume('desktop', volume),

    // Quality control
    setQuality: (profile: 'ultra' | 'high' | 'medium' | 'low' | 'mobile') => 
      pipeline.setQualityProfile(profile),

    // Stop streaming
    stop: async () => {
      await pipeline.stop();
      console.log('Stream stopped');
    },

    // Get current status
    getStatus: () => ({
      isStreaming: pipeline.isStreaming(),
      isRecording: pipeline.isRecording(),
      metrics: pipeline.getMetrics(),
      quality: pipeline.getQualityProfile(),
    }),
  };
}

// Usage
const controls = await startTwitchStream();

// Change volume during stream
setTimeout(() => {
  controls.setMicVolume(0.9);
}, 5000);

// Stop after 1 hour
setTimeout(() => {
  controls.stop();
}, 3600000);
```

## React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { initStreamPipeline } from '@wise2/studio/lib/obs';

export function StreamingDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [quality, setQuality] = useState('high');
  const [pipeline, setPipeline] = useState(null);

  const startStream = async () => {
    const p = initStreamPipeline({
      width: 1920,
      height: 1080,
      fps: 30,
      videoBitrate: 6000,
      videoCodec: 'h264',
      sampleRate: 48000,
      channels: 2,
      audioBitrate: 128,
      audioCodec: 'aac',
      hwAcceleration: 'videotoolbox',
      preset: 'fast',
      rtmpUrl: 'rtmp://live-iad.twitch.tv/live',
      streamKey: process.env.REACT_APP_TWITCH_KEY!,
      recordingPath: './recordings',
      autoRecord: true,
      enableQualityAdaptation: true,
      minBitrate: 500,
      maxBitrate: 25000,
      targetCpuUsage: 80,
    });

    p.on('metrics:updated', setMetrics);
    p.on('quality:changed', (profile) => setQuality(profile.profile));

    await p.start();
    setPipeline(p);
    setIsLive(true);
  };

  const stopStream = async () => {
    if (pipeline) {
      await pipeline.stop();
      setIsLive(false);
      setPipeline(null);
    }
  };

  return (
    <div className="streaming-dashboard">
      <div className="header">
        <h1>{isLive ? '🔴 LIVE' : 'Offline'}</h1>
        {isLive && (
          <button onClick={stopStream} className="danger">
            Stop Stream
          </button>
        )}
        {!isLive && (
          <button onClick={startStream} className="primary">
            Start Stream
          </button>
        )}
      </div>

      {metrics && (
        <div className="metrics">
          <div className="metric">
            <label>FPS</label>
            <value>{metrics.fps.toFixed(1)}</value>
          </div>

          <div className="metric">
            <label>Video Bitrate</label>
            <value>{metrics.videoBitrate} kbps</value>
          </div>

          <div className="metric">
            <label>CPU Usage</label>
            <value className={metrics.cpuUsage > 90 ? 'critical' : ''}>
              {metrics.cpuUsage.toFixed(1)}%
            </value>
          </div>

          <div className="metric">
            <label>Dropped Frames</label>
            <value className={metrics.framesDropped > 10 ? 'warning' : ''}>
              {metrics.framesDropped}
            </value>
          </div>

          <div className="metric">
            <label>Quality</label>
            <value>{quality.toUpperCase()}</value>
          </div>
        </div>
      )}

      <div className="quality-selector">
        <label>Quality:</label>
        {(['ultra', 'high', 'medium', 'low', 'mobile'] as const).map((q) => (
          <button
            key={q}
            onClick={() => pipeline?.setQualityProfile(q)}
            className={quality === q ? 'active' : ''}
          >
            {q.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Simple CLI Example

```typescript
import { initStreamPipeline } from '@wise2/studio/lib/obs';

async function main() {
  console.log('WISE² Studio Streamer CLI');
  console.log('==========================\n');

  const streamKey = process.argv[2];
  if (!streamKey) {
    console.error('Usage: npx ts-node stream.ts <TWITCH_STREAM_KEY>');
    process.exit(1);
  }

  const pipeline = initStreamPipeline({
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitrate: 6000,
    videoCodec: 'h264',
    sampleRate: 48000,
    channels: 2,
    audioBitrate: 128,
    audioCodec: 'aac',
    hwAcceleration: 'videotoolbox',
    preset: 'fast',
    rtmpUrl: 'rtmp://live-iad.twitch.tv/live',
    streamKey,
    recordingPath: './recordings',
    autoRecord: true,
    enableQualityAdaptation: true,
    minBitrate: 500,
    maxBitrate: 25000,
    targetCpuUsage: 80,
  });

  pipeline.on('metrics:updated', (metrics) => {
    process.stdout.write(
      `\r[${new Date().toLocaleTimeString()}] FPS: ${metrics.fps.toFixed(1)} | ` +
      `Video: ${metrics.videoBitrate}kbps | CPU: ${metrics.cpuUsage.toFixed(1)}% | ` +
      `Quality: ${pipeline.getQualityProfile().profile}`
    );
  });

  await pipeline.start();
  console.log('\n✓ Streaming started, press Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nStopping stream...');
    await pipeline.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

## Common Issues & Solutions

### RTMP Connection Refused
**Problem**: Cannot connect to RTMP server
**Solution**: 
```typescript
// Check RTMP URL and stream key
console.log('RTMP URL:', config.rtmpUrl);
console.log('Stream Key:', config.streamKey);

// Verify server is running
// nc -zv live.twitch.tv 1935
```

### High Frame Drop Rate
**Problem**: Frames being dropped, quality degraded
**Solution**:
```typescript
// Check CPU usage
pipeline.on('metrics:updated', (m) => {
  if (m.framesDropped > 10) {
    // Reduce quality automatically
    pipeline.setQualityProfile('medium');
  }
});

// Or disable auto-adaptation and set manually
const config = {..., enableQualityAdaptation: false};
pipeline.setQualityProfile('low');
```

### Audio Sync Issues
**Problem**: Audio/video out of sync
**Solution**:
```typescript
// Ensure both are using same sample rate
{
  sampleRate: 48000, // Must match encoding
  // Audio is synchronized via timestamps in muxer
}
```

### High CPU Usage
**Problem**: Pipeline consuming too much CPU
**Solution**:
```typescript
// Use faster preset
hwAcceleration: 'videotoolbox', // Use GPU
preset: 'ultrafast', // Lower quality

// Reduce resolution
width: 1280, // Instead of 1920
height: 720,  // Instead of 1080

// Reduce FPS
fps: 24, // Instead of 30
```

---

## Next Steps

1. **Production Setup**: Read [STREAMING_PIPELINE_TECHNICAL_SUMMARY.md](./STREAMING_PIPELINE_TECHNICAL_SUMMARY.md)
2. **Full API**: See [API_REFERENCE.md](./API_REFERENCE.md)
3. **Integration**: See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. **Complete Guide**: Read [STREAM_PIPELINE_GUIDE.md](./STREAM_PIPELINE_GUIDE.md)

---

**Happy Streaming!** 🎥
