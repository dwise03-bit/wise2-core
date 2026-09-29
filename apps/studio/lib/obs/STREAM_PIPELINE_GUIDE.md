# Stream Pipeline Implementation Guide

Complete guide to WISE² Studio's streaming pipeline for real-time video composition, audio mixing, encoding, and streaming to RTMP servers with simultaneous disk recording.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Video Composition](#video-composition)
6. [Audio Mixing](#audio-mixing)
7. [Encoding & Muxing](#encoding--muxing)
8. [RTMP Streaming](#rtmp-streaming)
9. [Recording to Disk](#recording-to-disk)
10. [Quality Adaptation](#quality-adaptation)
11. [Metrics & Monitoring](#metrics--monitoring)
12. [Error Handling](#error-handling)
13. [Production Deployment](#production-deployment)

## Architecture Overview

The streaming pipeline is built on a modular architecture with specialized engines for each stage:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Stream Pipeline                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Scene Sources    │  │  Audio Sources  │  │  Source Capture  │ │
│  │  (video, text,   │  │  (mic, desktop, │  │  (canvas, media, │ │
│  │   browser)       │  │   files, Suno)  │  │   streams)       │ │
│  └────────┬─────────┘  └────────┬────────┘  └────────┬─────────┘ │
│           │                     │                    │            │
│           └─────────────────────┼────────────────────┘            │
│                                 │                                 │
│                    ┌────────────▼──────────────┐                  │
│                    │  Video Composition       │                  │
│                    │  (layer by z-order,      │                  │
│                    │   apply transforms)      │                  │
│                    └────────────┬──────────────┘                  │
│                                 │                                 │
│              ┌──────────────────┼──────────────────┐              │
│              │                  │                  │              │
│    ┌─────────▼──────┐  ┌───────▼────────┐  ┌─────▼───────────┐  │
│    │ Video Encoder  │  │ Audio Encoder  │  │  Audio Mixing   │  │
│    │  (H.264/H.265) │  │   (AAC/Opus)   │  │ (volume, EQ,    │  │
│    │  via FFmpeg    │  │  via FFmpeg    │  │  compression)   │  │
│    └────────┬───────┘  └───────┬────────┘  └─────────────────┘  │
│             │                  │                                 │
│             └──────────────────┼─────────────────┐               │
│                                │                 │               │
│                        ┌───────▼────────┐  ┌────▼─────────┐     │
│                        │  MP4 Muxer     │  │ RTMP Streamer│     │
│                        │ (container     │  │ (send to     │     │
│                        │  format)       │  │  server)     │     │
│                        └───────┬────────┘  └────┬─────────┘     │
│                                │                │                │
│                    ┌───────────▼────────────────▼────┐           │
│                    │ Quality Adaptation Manager      │           │
│                    │ (monitor CPU, buffer, bitrate;  │           │
│                    │  auto-adjust resolution/fps)    │           │
│                    └────────────────────────────────┘            │
│                                                                   │
│  ┌──────────────────────────┐      ┌──────────────────────┐     │
│  │ Output: RTMP Stream      │      │ Output: Disk Recording│     │
│  │ (rtmp://server/stream)   │      │ (.mp4 file)          │     │
│  └──────────────────────────┘      └──────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. VideoCompositionEngine

Handles real-time compositing of multiple video sources with transforms (position, scale, rotation, opacity).

**Features:**
- Supports multiple source types (canvas, images, text, video)
- Z-order layering
- Per-source transforms (position, size, rotation, opacity)
- Hardware acceleration via OffscreenCanvas

**Methods:**
```typescript
composite(sources: VideoSource[]): ImageData
  // Composite all sources, return composed frame
  
renderSource(source: VideoSource): void
  // Render individual source with transforms
  
resize(width: number, height: number): void
  // Resize canvas (for quality changes)
```

### 2. AudioMixingEngine

Real-time audio mixing from multiple sources with effects processing.

**Features:**
- Multiple audio inputs (microphone, desktop, files, generated)
- Per-source volume control
- Audio effects (compression, EQ, filters)
- Web Audio API based

**Methods:**
```typescript
addSource(sourceId: string, stream: MediaStream | AudioBuffer, volume: number): void
  // Add audio source with volume
  
removeSource(sourceId: string): void
  // Remove audio source
  
setSourceVolume(sourceId: string, volume: number): void
  // Adjust source volume (0-1)
  
applyEffect(sourceId: string, effect: AudioEffect): void
  // Apply effect (compression, EQ, etc)
```

### 3. VideoEncoder

Encodes composed frames to H.264 (or H.265/VP9) video stream.

**Features:**
- H.264, H.265, VP9 codec support
- Hardware acceleration (NVENC, QSV, VideoToolbox on Mac)
- Quality profiles (ultra, high, medium, low, mobile)
- Real-time bitrate monitoring

**Methods:**
```typescript
async encodeFrame(imageData: ImageData, timestamp: number): Promise<Buffer>
  // Encode frame to H.264 bytes
  
getStats(): {framesEncoded, actualFps, droppedFrames, bitrate}
  // Get encoder statistics
```

### 4. AudioEncoder

Encodes mixed audio to AAC (or Opus/MP3).

**Features:**
- AAC, Opus, MP3 codec support
- Configurable sample rate (44.1kHz, 48kHz)
- Mono/Stereo support
- Frame-based encoding

**Methods:**
```typescript
async encodeFrame(audioData: Float32Array[], timestamp: number): Promise<Buffer>
  // Encode audio frame to AAC bytes
  
getStats(): {framesEncoded, bitrate, sampleRate, channels}
  // Get encoder statistics
```

### 5. Mp4Muxer

Combines video and audio streams into MP4 container format.

**Features:**
- ISO Base Media File Format (BMFF) compliant
- Simultaneous video and audio track support
- Timestamp synchronization
- Progressive file writing (for disk recording)

**Methods:**
```typescript
addVideoFrame(data: Buffer, timestamp: number): void
  // Add encoded video frame
  
addAudioFrame(data: Buffer, timestamp: number): void
  // Add encoded audio frame
  
async writeToDisk(): Promise<string>
  // Write complete MP4 file to disk
  
getFrameCount(): {video, audio}
  // Get current frame counts
```

### 6. RtmpStreamer

Sends encoded stream to RTMP server (Nginx, Wowza, custom).

**Features:**
- RTMP protocol handshake
- Chunk-based streaming
- Connection state management
- Bandwidth monitoring

**Methods:**
```typescript
async connect(): Promise<void>
  // Connect to RTMP server
  
async sendChunk(data: Buffer, type: 'video' | 'audio', timestamp: number): Promise<void>
  // Send data chunk to server
  
async disconnect(): Promise<void>
  // Gracefully close connection
  
isOnline(): boolean
  // Check connection status
```

### 7. QualityAdaptationManager

Automatically adjusts quality based on system load, network conditions, and buffer health.

**Quality Profiles:**
- **Ultra**: 3840x2160 @ 60fps, 25 Mbps
- **High**: 1920x1080 @ 60fps, 8 Mbps
- **Medium**: 1280x720 @ 30fps, 3 Mbps
- **Low**: 854x480 @ 24fps, 1 Mbps
- **Mobile**: 426x240 @ 15fps, 500 Kbps

**Methods:**
```typescript
updateMetrics(metrics: {cpuUsage, bufferHealth, networkLatency, droppedFrames}): QualityProfile | null
  // Update metrics, return new profile if needed
  
getCurrentProfile(): QualityProfile
  // Get currently active profile
  
setProfile(profile: 'ultra' | 'high' | 'medium' | 'low' | 'mobile'): void
  // Manually override profile
```

## Quick Start

```typescript
import { initStreamPipeline } from '@wise2/studio/lib/obs';

// Initialize with config
const pipeline = initStreamPipeline({
  // Video
  width: 1920,
  height: 1080,
  fps: 30,
  videoBitrate: 3000, // kbps
  videoCodec: 'h264',

  // Audio
  sampleRate: 48000,
  channels: 2,
  audioBitrate: 128, // kbps
  audioCodec: 'aac',

  // Encoding
  hwAcceleration: 'videotoolbox', // Mac
  preset: 'fast',

  // RTMP
  rtmpUrl: 'rtmp://localhost:1935/live',
  streamKey: 'my-stream-key',

  // Recording
  recordingPath: './recordings',
  autoRecord: true,

  // Quality adaptation
  enableQualityAdaptation: true,
  minBitrate: 500,
  maxBitrate: 25000,
  targetCpuUsage: 80,
});

// Start streaming
await pipeline.start();

// Add audio source
pipeline.addAudioSource({
  id: 'microphone',
  type: 'microphone',
  stream: micStream,
  volume: 0.8,
  isMuted: false,
  effects: [
    { type: 'compression', params: { threshold: -24, ratio: 4 } },
  ],
});

// Add video source
pipeline.addVideoSource({
  id: 'webcam',
  type: 'webcam',
  data: canvasContext,
  position: { x: 0, y: 0 },
  size: { width: 1920, height: 1080 },
  rotation: 0,
  opacity: 1,
  zIndex: 1,
});

// Monitor metrics
pipeline.on('metrics:updated', (metrics) => {
  console.log(`FPS: ${metrics.fps}, Bitrate: ${metrics.videoBitrate}kbps`);
});

// Listen for quality changes
pipeline.on('quality:changed', (profile) => {
  console.log(`Quality changed to ${profile.profile}`);
});

// Stop streaming
await pipeline.stop();
```

## Configuration

### StreamPipelineConfig

```typescript
interface StreamPipelineConfig {
  // Video encoding
  width: number;                      // Output width (1920, 1280, 854, 426)
  height: number;                     // Output height (1080, 720, 480, 240)
  fps: number;                        // Frames per second (60, 30, 24, 15)
  videoBitrate: number;               // Target bitrate in kbps
  videoCodec: 'h264' | 'h265' | 'vp9'; // Codec (h264 recommended for compatibility)

  // Audio encoding
  sampleRate: number;                 // 44100 or 48000 Hz
  channels: number;                   // 1 (mono) or 2 (stereo)
  audioBitrate: number;               // Target bitrate in kbps (128-256 typical)
  audioCodec: 'aac' | 'opus' | 'mp3'; // Codec (AAC most compatible)

  // Hardware acceleration
  hwAcceleration?: 'none' | 'nvenc' | 'qsv' | 'videotoolbox';
    // NVENC: NVIDIA GPUs
    // QSZ: Intel QuickSync
    // videotoolbox: macOS (recommended)
    // none: software encoding (fallback)
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
    // ultrafast: lowest quality, lowest CPU
    // slow: highest quality, highest CPU

  // RTMP streaming
  rtmpUrl: string;                    // e.g., rtmp://twitch.tv/live
  streamKey: string;                  // Stream key from platform

  // Recording to disk
  recordingPath: string;              // Directory for MP4 files
  autoRecord: boolean;                // Start recording immediately

  // Quality adaptation
  enableQualityAdaptation: boolean;   // Auto-adjust for network/CPU
  minBitrate: number;                 // Minimum bitrate (kbps)
  maxBitrate: number;                 // Maximum bitrate (kbps)
  targetCpuUsage: number;             // Target CPU usage (0-100)
}
```

### Platform-Specific Configs

#### Twitch

```typescript
{
  rtmpUrl: 'rtmp://live-iad.twitch.tv/live',
  streamKey: 'your-stream-key-from-dashboard',
  videoBitrate: 6000, // Twitch recommends 4500-6000 for 1080p60
  fps: 60,
}
```

#### YouTube Live

```typescript
{
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  streamKey: 'your-rtmps-key',
  videoBitrate: 5000, // YouTube recommends 4500-6000 for 1080p60
  fps: 60,
}
```

#### Facebook Live

```typescript
{
  rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
  streamKey: 'your-stream-key',
  videoBitrate: 4000,
  fps: 30,
}
```

#### OBS (local Nginx)

```typescript
{
  rtmpUrl: 'rtmp://192.168.1.100:1935/live',
  streamKey: 'mystream',
  videoBitrate: 8000, // Local network, higher quality
  fps: 60,
  enableQualityAdaptation: false, // Local, no adaptation needed
}
```

## Video Composition

### Adding Video Sources

```typescript
// Screen capture
pipeline.addVideoSource({
  id: 'screen-share',
  type: 'screen',
  data: screenCaptureContext, // CanvasRenderingContext2D
  position: { x: 0, y: 0 },
  size: { width: 1920, height: 1080 },
  rotation: 0,
  opacity: 1,
  zIndex: 1,
});

// Webcam (picture-in-picture)
pipeline.addVideoSource({
  id: 'webcam-pip',
  type: 'webcam',
  data: webcamCanvasContext,
  position: { x: 1500, y: 800 }, // Bottom right
  size: { width: 400, height: 300 },
  rotation: 0,
  opacity: 1,
  zIndex: 2, // On top
});

// Text overlay
pipeline.addVideoSource({
  id: 'title-text',
  type: 'text',
  data: 'LIVE STREAMING', // Text content
  position: { x: 100, y: 50 },
  size: { width: 800, height: 100 },
  rotation: 0,
  opacity: 1,
  zIndex: 3,
});

// Static image
pipeline.addVideoSource({
  id: 'logo',
  type: 'image',
  data: '/images/logo.png', // Image URL
  position: { x: 1700, y: 50 },
  size: { width: 200, height: 200 },
  rotation: 0,
  opacity: 0.8,
  zIndex: 2,
});
```

### Z-Order (Layering)

Sources are rendered bottom-to-top by z-index. Lower z-index = rendered first (appears behind).

```
zIndex 3: Text overlay (top)
zIndex 2: Webcam PiP & Logo
zIndex 1: Screen share (bottom/background)
```

### Transforms

```typescript
// Position (x, y) = top-left corner
position: { x: 100, y: 200 }

// Size (width, height)
size: { width: 1920, height: 1080 }

// Rotation in degrees (0-360)
rotation: 45 // 45-degree rotation

// Opacity (0-1, where 1 is fully visible)
opacity: 0.5 // 50% transparent

// Z-index for layering
zIndex: 1 // Lower numbers render first
```

## Audio Mixing

### Adding Audio Sources

```typescript
// Microphone
const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

// Desktop audio
const desktopStream = await navigator.mediaDevices.getDisplayMedia({
  audio: true,
});
pipeline.addAudioSource({
  id: 'desktop-audio',
  type: 'desktop',
  stream: desktopStream,
  volume: 0.6,
  isMuted: false,
  effects: [],
});

// Audio file (Suno track)
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
pipeline.addAudioSource({
  id: 'background-music',
  type: 'file',
  buffer: audioBuffer,
  volume: 0.3,
  isMuted: false,
  effects: [],
});
```

### Audio Effects

#### Compression

Reduces dynamic range (quiet parts louder, loud parts quieter).

```typescript
{
  type: 'compression',
  params: {
    threshold: -24,    // dB below which compression starts
    knee: 30,          // dB range for soft knee
    ratio: 4,          // 4:1 compression ratio
    attack: 0.003,     // seconds to reach full compression
    release: 0.25,     // seconds to stop compressing
  }
}
```

#### EQ (Equalization)

Boost or cut specific frequencies.

```typescript
{
  type: 'eq',
  params: {
    frequency: 1000,   // Hz (center frequency)
    type: 'peaking',   // 'peaking', 'lowpass', 'highpass'
    gain: 6,           // dB (positive = boost, negative = cut)
    Q: 1,              // bandwidth (higher = narrower)
  }
}
```

#### Low-Pass Filter

Remove high frequencies.

```typescript
{
  type: 'lowpass',
  params: {
    frequency: 8000,   // Hz (cutoff frequency)
    Q: 1,              // resonance
  }
}
```

#### High-Pass Filter

Remove low frequencies.

```typescript
{
  type: 'highpass',
  params: {
    frequency: 100,    // Hz (cutoff frequency)
    Q: 1,              // resonance
  }
}
```

### Volume Control

```typescript
// Set individual source volume (0-1)
pipeline.setAudioSourceVolume('microphone', 0.8);

// Mute/unmute
pipeline.addAudioSource({
  id: 'music',
  type: 'file',
  buffer: audioBuffer,
  volume: 1.0,
  isMuted: true, // Start muted
});

// Adjust during stream
pipeline.setAudioSourceVolume('music', 0); // Mute
pipeline.setAudioSourceVolume('music', 0.5); // Unmute to 50%

// Remove source
pipeline.removeAudioSource('microphone');
```

## Encoding & Muxing

### Video Encoding Settings

```typescript
// High quality (1080p60 to Twitch)
{
  width: 1920,
  height: 1080,
  fps: 60,
  videoBitrate: 6000,
  videoCodec: 'h264',
  hwAcceleration: 'videotoolbox', // Mac
  preset: 'fast',
}

// Medium quality (720p30 to YouTube)
{
  width: 1280,
  height: 720,
  fps: 30,
  videoBitrate: 3000,
  videoCodec: 'h264',
  hwAcceleration: 'videotoolbox',
  preset: 'medium',
}

// Mobile (480p)
{
  width: 854,
  height: 480,
  fps: 24,
  videoBitrate: 1000,
  videoCodec: 'h264',
  hwAcceleration: 'none',
  preset: 'ultrafast',
}
```

### Hardware Acceleration

| Platform | Technology | Support |
|----------|-----------|---------|
| macOS    | VideoToolbox | ✅ Recommended |
| Windows  | NVENC (NVIDIA) | ✅ If GPU present |
| Windows  | QuickSync (Intel) | ✅ If Intel GPU |
| Linux    | NVENC | ✅ If NVIDIA GPU |
| Linux    | VAAPI | ✅ If Intel/AMD GPU |

### Preset Quality Trade-off

| Preset | Speed | Quality | CPU |
|--------|-------|---------|-----|
| ultrafast | Fast | Lower | Low |
| fast | Medium | Medium | Medium |
| medium | Slower | Good | High |
| slow | Slowest | Best | Highest |

## RTMP Streaming

### Connection Lifecycle

```typescript
// 1. Initialize pipeline (creates RtmpStreamer)
const pipeline = initStreamPipeline({
  rtmpUrl: 'rtmp://server:1935/live',
  streamKey: 'my-key',
  // ... other config
});

// 2. Start pipeline (connects to server)
await pipeline.start(); // Internally calls rtmpStreamer.connect()

// 3. Video/audio frames automatically sent during streaming

// 4. Stop pipeline (disconnects)
await pipeline.stop(); // Internally calls rtmpStreamer.disconnect()
```

### Platform Integration

The `PlatformIntegration` module (separate) handles:
- Stream key management
- Platform API calls
- Stream metadata (title, description)
- Viewer management
- Chat integration

```typescript
// In your platform integration code
const platforms = getPlatformIntegration();

// Configure Twitch
await platforms.configurePlatform('twitch', {
  clientId: 'your-client-id',
  oauthToken: 'your-oauth-token',
});

// Start stream on Twitch
await platforms.startStream('twitch', {
  title: 'My Live Stream',
  description: 'Playing games',
});

// The StreamPipeline automatically sends RTMP to the configured servers
```

### Troubleshooting RTMP

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection refused | Server down or wrong URL | Check server status, verify RTMP URL |
| Auth failed | Invalid stream key | Regenerate key from platform |
| Frames dropped | Network bandwidth | Reduce bitrate or check network |
| Latency high | Network congestion | Use lower bitrate profile |

## Recording to Disk

### Auto-Recording

```typescript
const pipeline = initStreamPipeline({
  recordingPath: './recordings',
  autoRecord: true, // Start recording when pipeline starts
  // ... other config
});

await pipeline.start(); // Recording starts automatically
```

### Manual Recording Control

```typescript
// Start recording
pipeline.startRecording();

// Stop and save
const filename = await pipeline.stopRecording();
console.log(`Recording saved to: ${filename}`);

// File format: YYYY-MM-DD_HH-mm-ss_platform.mp4
// Example: 2024-01-15_14-30-45_generic.mp4
```

### Recording Format

- **Container**: MP4 (ISOM Base Media File Format)
- **Video**: H.264 (same as stream)
- **Audio**: AAC (same as stream)
- **Location**: `config.recordingPath`
- **Naming**: `{timestamp}_{platform}.mp4`

### Simultaneous Streaming & Recording

Recording happens in parallel with streaming—no performance impact since both use pre-encoded frames.

```typescript
// Start everything
await pipeline.start(); // Streams to RTMP and records to disk

// Check status
console.log(pipeline.isStreaming()); // true
console.log(pipeline.isRecording()); // true

// Stop
await pipeline.stop(); // Stops both stream and recording
```

## Quality Adaptation

### Automatic Adaptation

The `QualityAdaptationManager` monitors system metrics and adjusts quality.

```typescript
const pipeline = initStreamPipeline({
  enableQualityAdaptation: true,
  targetCpuUsage: 80,      // Don't exceed 80% CPU
  minBitrate: 500,         // Floor: 500 kbps
  maxBitrate: 25000,       // Ceiling: 25 Mbps
  // ... other config
});

// Adaptation happens automatically
pipeline.on('quality:changed', (profile) => {
  console.log(`Switched to ${profile.profile}`);
  console.log(`Resolution: ${profile.width}x${profile.height}`);
  console.log(`FPS: ${profile.fps}`);
  console.log(`Bitrate: ${profile.videoBitrate} kbps`);
});
```

### Adaptation Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU usage | > 90% | Downgrade |
| Dropped frames | > 10% | Downgrade |
| Buffer empty | < 0.2 | Downgrade |
| CPU usage | < 40% | Upgrade |
| Buffer full | > 0.8 | Upgrade |

### Quality Profiles

```
Ultra (4K):     3840x2160 @ 60fps, 25 Mbps
  ↓ (downgrade on high load)
High (1080p):   1920x1080 @ 60fps, 8 Mbps
  ↓
Medium (720p):  1280x720 @ 30fps, 3 Mbps
  ↓
Low (480p):     854x480 @ 24fps, 1 Mbps
  ↓
Mobile (240p):  426x240 @ 15fps, 500 Kbps
```

### Manual Override

```typescript
// Force specific profile
pipeline.setQualityProfile('high'); // 1080p60
pipeline.setQualityProfile('low');  // 480p24

// Get current profile
const profile = pipeline.getQualityProfile();
console.log(`${profile.width}x${profile.height} @ ${profile.fps}fps`);
```

## Metrics & Monitoring

### Metrics Object

```typescript
interface StreamMetrics {
  timestamp: number;           // Unix timestamp
  framesCaptured: number;      // Total frames captured
  framesEncoded: number;       // Total frames encoded
  framesDropped: number;       // Frames dropped due to load
  fps: number;                 // Actual FPS
  videoBitrate: number;        // Actual video bitrate (kbps)
  audioBitrate: number;        // Actual audio bitrate (kbps)
  cpuUsage: number;            // CPU percentage (0-100)
  memoryUsage: number;         // Memory usage (MB)
  networkLatency: number;      // Network latency (ms)
  bufferHealth: number;        // Buffer health (0-1, 1 = full)
  videoLatency: number;        // Video encoding latency (ms)
  audioLatency: number;        // Audio encoding latency (ms)
}
```

### Monitoring

```typescript
// Listen for metrics updates (emitted every frame)
pipeline.on('metrics:updated', (metrics) => {
  console.log(`FPS: ${metrics.fps.toFixed(1)}`);
  console.log(`Video: ${metrics.videoBitrate} kbps`);
  console.log(`Audio: ${metrics.audioBitrate} kbps`);
  console.log(`CPU: ${metrics.cpuUsage.toFixed(1)}%`);
  console.log(`Memory: ${metrics.memoryUsage.toFixed(0)} MB`);
  console.log(`Dropped: ${metrics.framesDropped}`);
  console.log(`Latency: ${metrics.networkLatency.toFixed(0)} ms`);
});

// Get current metrics
const metrics = pipeline.getMetrics();
```

### Dashboard Integration

```typescript
// Update dashboard with metrics
function updateStreamingDashboard(metrics: StreamMetrics) {
  const qualityProfile = pipeline.getQualityProfile();

  return {
    status: pipeline.isStreaming() ? 'LIVE' : 'STOPPED',
    recording: pipeline.isRecording(),
    
    video: {
      resolution: `${qualityProfile.width}x${qualityProfile.height}`,
      fps: metrics.fps.toFixed(1),
      bitrate: `${metrics.videoBitrate} kbps`,
    },
    
    audio: {
      channels: 2,
      bitrate: `${metrics.audioBitrate} kbps`,
    },
    
    system: {
      cpu: metrics.cpuUsage.toFixed(1),
      memory: metrics.memoryUsage.toFixed(0),
    },
    
    network: {
      latency: `${metrics.networkLatency.toFixed(0)} ms`,
      buffer: (metrics.bufferHealth * 100).toFixed(0),
      quality: qualityProfile.profile.toUpperCase(),
    },
    
    health: {
      droppedFrames: metrics.framesDropped,
      healthScore: (metrics.bufferHealth * 100).toFixed(0),
    },
  };
}
```

## Error Handling

### Error Events

```typescript
pipeline.on('error', (error) => {
  console.error('Pipeline error:', error.error);
  console.error('Stage:', error.stage); // 'capture', 'encode', 'stream', etc
  
  // Handle based on type
  if (error.error.code === 'RTMP_ERROR') {
    // Reconnect to RTMP server
  } else if (error.error.code === 'ENCODING_ERROR') {
    // Reduce quality
    pipeline.setQualityProfile('low');
  }
});
```

### Recovery Strategies

```typescript
// Auto-reconnect on RTMP failure
let reconnectAttempts = 0;
const maxAttempts = 5;

pipeline.on('error', async (error) => {
  if (error.error.code === 'RTMP_ERROR') {
    if (reconnectAttempts < maxAttempts) {
      reconnectAttempts++;
      await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
      await pipeline.start(); // Reconnect
    }
  }
});

// Pause on high frame drop
pipeline.on('metrics:updated', (metrics) => {
  if (metrics.framesDropped / metrics.framesEncoded > 0.1) {
    // > 10% frame drop
    pipeline.pause();
    // Show warning to user
  }
});
```

## Production Deployment

### Server Setup (Nginx with RTMP Module)

```nginx
# /etc/nginx/nginx.conf

rtmp {
  server {
    listen 1935;
    chunk_size 4096;
    
    application live {
      live on;
      record off;
      
      # Allow specific stream keys
      on_publish http://api.wise2.net/rtmp/auth;
      
      # Push to multiple platforms
      push rtmp://live-iad.twitch.tv/live/<stream-key>;
      push rtmp://a.rtmp.youtube.com/live2/<stream-key>;
    }
  }
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy studio app
COPY apps/studio .

# Install dependencies
RUN npm ci

# Install FFmpeg for encoding
RUN apk add --no-cache ffmpeg

# Build
RUN npm run build

# Expose ports
EXPOSE 3005 1935

# Start
CMD ["npm", "start"]
```

### Environment Variables

```bash
# .env.production
RTMP_URL=rtmp://nginx.wise2.net:1935/live
STREAM_KEY=secure-stream-key-from-vault
RECORDING_PATH=/var/recordings
MAX_BITRATE=25000
TARGET_CPU=80
ENABLE_QUALITY_ADAPTATION=true
HW_ACCELERATION=videotoolbox # or nvenc, qsv
```

### Monitoring & Alerts

```typescript
// Monitor health
pipeline.on('metrics:updated', (metrics) => {
  // Alert on high CPU
  if (metrics.cpuUsage > 95) {
    alerting.warning(`High CPU: ${metrics.cpuUsage.toFixed(1)}%`);
  }
  
  // Alert on frame drops
  if (metrics.framesDropped > 100) {
    alerting.warning(`Frames dropped: ${metrics.framesDropped}`);
  }
  
  // Alert on low buffer
  if (metrics.bufferHealth < 0.2) {
    alerting.critical('Buffer underrun risk');
  }
});

// Log metrics for analysis
setInterval(() => {
  const metrics = pipeline.getMetrics();
  logger.info('stream_metrics', metrics);
}, 10000); // Every 10 seconds
```

### Scaling

For multiple concurrent streams, run separate pipeline instances:

```typescript
// Instance 1: Main stream to Twitch
const twitch = initStreamPipeline({
  rtmpUrl: 'rtmp://twitch.tv/live',
  streamKey: process.env.TWITCH_KEY,
  recordingPath: '/recordings/twitch',
});

// Instance 2: Backup stream to YouTube
const youtube = initStreamPipeline({
  rtmpUrl: 'rtmp://youtube.com/live2',
  streamKey: process.env.YOUTUBE_KEY,
  recordingPath: '/recordings/youtube',
});

// Start both
await Promise.all([twitch.start(), youtube.start()]);
```

## Integration with Scene Manager

```typescript
import { getSceneManager } from '@wise2/studio/lib/obs';

const sceneManager = getSceneManager();
const pipeline = initStreamPipeline(config);

// When scene changes, update pipeline composition
sceneManager.on('scene:switched', (event) => {
  const scene = sceneManager.getScene(event.currentSceneId);
  if (!scene) return;
  
  // Clear old sources
  pipeline.videoSources = [];
  
  // Add sources from new scene
  for (const source of scene.sources) {
    if (source.enabled && source.visible) {
      pipeline.addVideoSource({
        id: source.id,
        type: source.type as any,
        data: getSourceCanvas(source),
        position: source.position || { x: 0, y: 0 },
        size: source.size || { width: 1920, height: 1080 },
        rotation: source.rotation || 0,
        opacity: source.opacity ?? 1,
        zIndex: source.order,
      });
    }
  }
});
```

---

## Summary

The Stream Pipeline provides a complete, production-ready streaming solution for WISE² Studio:

✅ **Flexible Composition**: Layer multiple video sources with transforms  
✅ **Professional Audio**: Mix and process audio from multiple sources  
✅ **High-Quality Encoding**: Hardware-accelerated H.264 encoding  
✅ **Reliable Streaming**: RTMP protocol to any platform  
✅ **Simultaneous Recording**: Save streams while broadcasting  
✅ **Auto Quality**: Adapt to network/system conditions  
✅ **Real-Time Monitoring**: Detailed metrics and health tracking  

For questions or issues, see the main [README.md](./README.md) and [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).
