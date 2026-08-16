# Multistream Broadcasting Module

Professional simultaneous broadcasting to multiple platforms (Twitch, YouTube, Facebook, LinkedIn, Custom RTMP).

## Features

### Core Broadcasting

- **Multi-Platform Broadcasting** - Encode once, send to 3+ platforms simultaneously
- **Platform Support**
  - Twitch (RTMP)
  - YouTube Live (RTMPS)
  - Facebook Live (RTMPS)
  - LinkedIn Live (RTMPS)
  - Custom RTMP endpoints
- **Seamless Failover** - Automatic reconnection if platform connection fails
- **Independent Platform Control** - Enable/disable individual platforms mid-stream

### Quality & Performance

- **Adaptive Bitrate Control** - Adjust quality based on CPU/network
- **Hardware Acceleration** - Support for NVENC, QSV, VideoToolbox
- **Configurable Encoding** - Multiple presets (ultrafast → slow)
- **Resolution Options** - 720p, 1080p, 1440p, 2160p (4K)
- **Frame Rate Control** - 30 FPS or 60 FPS

### Monitoring & Analytics

- **Real-Time Metrics** - FPS, bitrate, CPU, memory usage
- **Per-Platform Stats** - Viewers, bitrate, latency, frame drops
- **Health Status** - Excellent/Good/Fair/Poor/Critical
- **Historical Tracking** - Session recordings with detailed stats
- **Network Quality Indicators** - Buffer health, frame drop tracking

### User Interface

- **Stream Key Management** - Secure storage and input for platform keys
- **Live Status Display** - Real-time platform connection status
- **Viewer Counts** - Live viewer statistics per platform
- **Settings Controls** - Bitrate, resolution, FPS, encoding preset sliders
- **Quick Toggle** - Enable/disable multistream with single switch

## Architecture

```
┌─────────────────────────────────────────┐
│   MultistreamControl.tsx (UI Layer)    │
│  - Platform selection                   │
│  - Stream key management                │
│  - Settings adjustment                  │
│  - Status display                       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   MultistreamEngine (Core Layer)       │
│  - Connection management                │
│  - Encoded frame distribution           │
│  - Failover/recovery                    │
│  - Metrics collection                   │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────────────────────┐
      │                             │
   ┌──▼───┐  ┌──────┐  ┌──────┐  ┌──▼──┐
   │Twitch│  │YouTube│  │Face-│  │Other│
   │ RTMP │  │ RTMPS │  │book  │  │RTMP │
   └──────┘  └──────┘  └──────┘  └─────┘
```

## Usage

### Basic Setup

```typescript
import { MultistreamControl } from '@/lib/obs/multistream';

export default function LiveStudio() {
  const handleStatusChange = (status) => {
    console.log('Stream status:', status);
  };

  const handleError = (error) => {
    console.error('Streaming error:', error);
  };

  return (
    <MultistreamControl
      enabled={false}
      onStatusChange={handleStatusChange}
      onError={handleError}
    />
  );
}
```

### Programmatic Control

```typescript
import { MultistreamEngine, type MultistreamConfig } from '@/lib/obs/multistream';

// Create engine
const engine = new MultistreamEngine();

// Configure
const config: MultistreamConfig = {
  id: 'config-1',
  name: 'My Broadcast',
  platforms: [
    {
      id: 'twitch',
      platform: 'twitch',
      name: 'Twitch',
      streamKey: 'xxx_your_key_xxx',
      isEnabled: true,
      isConnected: false,
      status: 'idle',
      settings: {
        autoReconnect: true,
        latencyMode: 'low',
      },
    },
    {
      id: 'youtube',
      platform: 'youtube',
      name: 'YouTube Live',
      streamKey: 'your_youtube_key',
      isEnabled: true,
      isConnected: false,
      status: 'idle',
      settings: {
        autoReconnect: true,
      },
    },
  ],
  encodingPreset: 'fast',
  videoBitrate: 4500,
  audioBitrate: 128,
  resolution: '1080p',
  fps: 60,
  enableFailover: true,
  failoverDelay: 5000,
  enableMetrics: true,
  metricsInterval: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Initialize
await engine.initialize(config);

// Listen for events
engine.on('started', (event) => {
  console.log('Multistream started:', event);
});

engine.on('platform-connected', (event) => {
  console.log(`Connected to ${event.platform}`);
});

engine.on('metrics-update', (event) => {
  console.log('Metrics:', event.status);
});

engine.on('platform-error', (event) => {
  console.log(`Error on ${event.platform}: ${event.error}`);
});

// Start streaming
await engine.start();

// Get current status
const status = engine.getStatus();
console.log('Active platforms:', engine.getActivePlatforms());

// Toggle platform mid-stream
await engine.togglePlatform('facebook', false); // Disable Facebook

// Stop streaming
const session = await engine.stop();
console.log('Session stats:', session.platformStats);
```

## Configuration

### MultistreamConfig

```typescript
interface MultistreamConfig {
  id: string;
  name: string;
  description?: string;

  // Enabled platforms
  platforms: PlatformConfig[];

  // Global settings
  encodingPreset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  videoBitrate: number; // kbps
  audioBitrate: number; // kbps
  resolution: '720p' | '1080p' | '1440p' | '2160p';
  fps: number; // 30, 60

  // Failover/Recovery
  enableFailover: boolean;
  failoverDelay: number; // ms

  // Monitoring
  enableMetrics: boolean;
  metricsInterval: number; // ms
}
```

### PlatformConfig

```typescript
interface PlatformConfig {
  id: string;
  platform: 'twitch' | 'youtube' | 'facebook' | 'linkedin' | 'custom-rtmp';
  name: string;
  streamKey: string;
  rtmpUrl?: string; // For custom RTMP
  isEnabled: boolean;
  isConnected: boolean;
  status: PlatformStatus;

  settings: {
    latencyMode?: 'normal' | 'low' | 'ultra-low';
    bitrate?: number;
    maxDelay?: number;
    autoReconnect?: boolean;
  };
}
```

## Events

The MultistreamEngine emits EventEmitter events:

### started
```typescript
engine.on('started', (event: {
  sessionId: string;
  platforms: MultistreamPlatform[];
}) => {});
```

### stopped
```typescript
engine.on('stopped', (event: {
  sessionId: string;
  duration: number;
}) => {});
```

### platform-connected
```typescript
engine.on('platform-connected', (event: {
  platform: MultistreamPlatform;
  streamId: string;
}) => {});
```

### platform-disconnected
```typescript
engine.on('platform-disconnected', (event: {
  platform: MultistreamPlatform;
  uptime: number;
}) => {});
```

### platform-error
```typescript
engine.on('platform-error', (event: {
  platform: MultistreamPlatform;
  error: string;
}) => {});
```

### failover
```typescript
engine.on('failover', (event: {
  platform: MultistreamPlatform;
  type: 'reconnected' | 'failed';
}) => {});
```

### metrics-update
```typescript
engine.on('metrics-update', (event: {
  status: MultistreamStatus;
}) => {});
```

## Platform-Specific Settings

### Twitch
- **Max Bitrate**: 51 Mbps
- **Latency Modes**: low (5-20s), normal (10-30s)
- **Recommended**: Fast preset, 1080p60, 5500 kbps video + 128 kbps audio

### YouTube Live
- **Max Bitrate**: 51 Mbps
- **Latency**: +10 seconds (inherent)
- **Stream Types**: Go Live (public), Scheduled, Private
- **Recommended**: Fast preset, 1080p60, 5500 kbps video

### Facebook Live
- **Max Bitrate**: 8 Mbps
- **Recommended**: Fast preset, 1080p30, 4000 kbps video + 128 kbps audio

### LinkedIn Live
- **Max Bitrate**: 8 Mbps
- **Audience**: 1st degree only, company followers (depending on settings)
- **Recommended**: Medium preset, 720p30, 3000 kbps video

### Custom RTMP
- **Flexible bitrate and settings**
- **Support for**: Open Broadcast Studio (OBS), Wowza, Nimble Streamer, etc.

## Failover & Recovery

When a platform connection fails:

1. **Detection**: Connection error is caught and platform marked as failed
2. **Notification**: `platform-error` event emitted
3. **Failover** (if enabled):
   - Wait `failoverDelay` milliseconds (default: 5000ms)
   - Attempt reconnection
   - If successful: `failover` event with `type: 'reconnected'`
   - Other platforms continue streaming unaffected

```typescript
// Configure failover
const config = {
  enableFailover: true,
  failoverDelay: 5000, // 5 seconds
  // ... rest of config
};

engine.on('failover', (event) => {
  if (event.type === 'reconnected') {
    console.log(`Reconnected to ${event.platform}`);
  }
});
```

## Monitoring & Analytics

### Real-Time Metrics

```typescript
engine.on('metrics-update', (event) => {
  const { status } = event;
  console.log({
    fps: status.fps,
    videoBitrate: status.videoBitrate,
    cpuUsage: status.cpuUsage,
    memoryUsage: status.memoryUsage,
    healthStatus: status.healthStatus,
  });
});
```

### Platform-Specific Stats

```typescript
const status = engine.getStatus();

Object.entries(status.platforms).forEach(([platform, stats]) => {
  console.log(`${platform}:`, {
    status: stats.status,
    viewers: stats.viewerCount,
    bitrate: stats.bitrate,
    latency: stats.latency,
    frameDrops: stats.frameDrops,
    networkQuality: stats.networkQuality,
  });
});
```

### Session Analysis

```typescript
const session = await engine.stop();

session.platformStats.forEach((stats) => {
  console.log(`${stats.platform} session:`, {
    duration: stats.streamDuration,
    peakViewers: stats.peakViewers,
    uptime: stats.uptime,
    frameDropPercentage: stats.frameDropPercentage,
    reconnectCount: stats.reconnectCount,
  });
});
```

## Database Schema

Add to `packages/db/prisma/schema.prisma`:

```prisma
// Multistream configuration
model MultistreamConfig {
  id        String   @id @default(cuid())
  userId    String?  @unique
  
  name      String
  description String? @db.Text
  
  // Platform configurations (stored as JSON)
  platforms Json     // Array of PlatformConfig
  
  // Settings
  encodingPreset String @default("fast")
  videoBitrate   Int    @default(4500)
  audioBitrate   Int    @default(128)
  resolution     String @default("1080p")
  fps            Int    @default(30)
  
  enableFailover Boolean @default(true)
  failoverDelay  Int     @default(5000)
  
  enableMetrics  Boolean @default(true)
  metricsInterval Int    @default(1000)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sessions MultistreamSession[]
  
  @@index([userId])
}

// Multistream session (historical record)
model MultistreamSession {
  id       String @id @default(cuid())
  configId String
  config   MultistreamConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  startedAt DateTime
  stoppedAt DateTime?
  duration  Int?     // seconds
  
  platforms String[] // Array of platform names used
  totalViewers Int @default(0)
  totalChatMessages Int? @default(0)
  
  // Platform stats (stored as JSON)
  platformStats Json
  
  createdAt DateTime @default(now())
  
  @@index([configId])
  @@index([startedAt])
}
```

## Stream Key Security

Stream keys should be:

1. **Never hardcoded** in source files
2. **Stored in environment variables** or secure vault
3. **Never logged** or exposed in console
4. **Encrypted** in database if stored
5. **Masked** in UI (shown as `•••`)
6. **Updated regularly** on platforms

```typescript
// Load from environment
const platforms = [
  {
    platform: 'twitch',
    streamKey: process.env.TWITCH_STREAM_KEY,
  },
  {
    platform: 'youtube',
    streamKey: process.env.YOUTUBE_STREAM_KEY,
  },
];

// Never do this:
// const streamKey = "live_12345_abc..."; // ❌ WRONG
```

## Common Issues

### Connection Failed
- Verify stream keys are correct
- Check firewall/network connectivity
- Ensure RTMP/RTMPS ports are not blocked (1935, 443)
- Verify platform credentials are active

### High Frame Drops
- Reduce bitrate
- Lower resolution
- Disable other CPU-intensive processes
- Check network bandwidth

### High Latency
- Latency is platform-specific (YouTube +10s)
- Use low-latency mode if platform supports
- Ensure stable network connection
- Consider reducing resolution

### Connection Drops
- Enable automatic failover
- Check network stability
- Reduce encoding preset (ultrafast)
- Monitor CPU/memory usage

## Performance Tips

1. **Encoding Preset**
   - `ultrafast`: Low quality, minimal CPU (for weak systems)
   - `fast`: Good quality, reasonable CPU (recommended)
   - `medium`: Better quality, higher CPU
   - `slow`: Best quality, high CPU

2. **Bitrate Strategy**
   - Twitch: 5000-6000 kbps for 1080p60
   - YouTube: 4500-5500 kbps for 1080p30
   - Facebook: 3000-4000 kbps for 720p30
   - LinkedIn: 3000-4000 kbps for 720p30

3. **Hardware Acceleration**
   - Enable for better performance
   - Options: NVENC (Nvidia), QSV (Intel), VideoToolbox (Mac)

4. **Monitoring**
   - Watch CPU usage during stream
   - Monitor network bandwidth
   - Check frame drops in real-time
   - Adjust quality if needed

## API Reference

### MultistreamEngine

```typescript
class MultistreamEngine extends EventEmitter {
  // Initialize with configuration
  async initialize(config: MultistreamConfig): Promise<void>
  
  // Start streaming
  async start(): Promise<void>
  
  // Stop streaming
  async stop(): Promise<MultistreamSession>
  
  // Send encoded frame/chunk
  async sendEncodedChunk(
    encodedData: Buffer,
    isKeyFrame: boolean,
    timestamp: number
  ): Promise<void>
  
  // Toggle platform mid-stream
  async togglePlatform(
    platform: MultistreamPlatform,
    enabled: boolean
  ): Promise<void>
  
  // Get current status
  getStatus(): MultistreamStatus
  
  // Get session stats (only after stopped)
  getSessionStats(): MultistreamSession | null
  
  // Get active platforms
  getActivePlatforms(): MultistreamPlatform[]
}
```

## Future Enhancements

- [ ] Recording to file during multistream
- [ ] Chat aggregation from all platforms
- [ ] Analytics dashboard with metrics
- [ ] Auto-quality adjustment based on network
- [ ] Scheduled broadcast support
- [ ] Restream API integration
- [ ] Custom overlay per platform
- [ ] Platform-specific bitrate optimization
- [ ] Health alerts and notifications
- [ ] Viewer sync across platforms

## Support

For issues or feature requests, see the main [OBS module README](../README.md).
