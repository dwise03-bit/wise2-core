# OBS Backend - Professional Streaming Solution

Complete backend implementation for Open Broadcaster Software (OBS) integration with RTMP server, platform routing, scene management, and source capture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     OBS Backend System                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              RTMP Server (Port 1935)                     │ │
│  │  • Accept RTMP streams                                  │ │
│  │  • Validate stream keys                                 │ │
│  │  • Route to platforms                                   │ │
│  └──────────────┬──────────────────────────────────────────┘ │
│                 │                                             │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │         Platform Integration Layer                     │   │
│  │  • Twitch OAuth & RTMP                                │   │
│  │  • YouTube OAuth & RTMP                               │   │
│  │  • Facebook OAuth & RTMP                              │   │
│  │  • Custom RTMP Endpoints                              │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │         Stream Session Management                      │   │
│  │  • Session lifecycle (start/stop/pause/resume)        │   │
│  │  • Real-time metrics (fps, bitrate, drops)            │   │
│  │  • Health monitoring & reconnection                   │   │
│  │  • Recording management                               │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │            Scene & Source Management                   │   │
│  │  • Scene CRUD operations                              │   │
│  │  • Source composition & layering                       │   │
│  │  • Transition effects                                 │   │
│  │  • Source ordering & visibility                       │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │         Source Capture & Composition                   │   │
│  │  • Screen capture (Display Capture API)               │   │
│  │  • Webcam capture (getUserMedia)                      │   │
│  │  • Browser window capture                             │   │
│  │  • Audio mixing (Web Audio API)                       │   │
│  │  • Multi-source composition                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Modules

### 1. RTMP Server (`rtmpServer.ts`)

Manages RTMP stream ingestion and platform routing.

**Key Features:**
- RTMP stream validation and authentication
- Stream metrics collection
- Bandwidth monitoring
- Recording support
- Multi-user concurrent streaming

**Usage:**
```typescript
import { initRtmpServer, getRtmpServer } from '@/lib/obs';

const rtmpServer = initRtmpServer({
  port: 1935,
  enableRecording: true,
  recordingPath: './recordings',
  bandwidthLimit: 10000, // kbps
});

// Set custom stream validator
rtmpServer.setStreamValidator(async (streamKey, userId) => {
  // Validate against database
  return await db.streams.validate(streamKey, userId);
});

await rtmpServer.start();

// Listen to events
rtmpServer.on('stream:start', (stream) => {
  console.log(`Stream started: ${stream.id}`);
});

rtmpServer.on('stream:stats', (stream) => {
  console.log(`FPS: ${stream.fps}, Bitrate: ${stream.bitrate} kbps`);
});
```

**Stream Lifecycle:**
1. `handleStreamStart(streamKey, userId)` - Validate and start stream
2. `updateStreamStats(streamKey, stats)` - Receive metrics
3. `endStream(streamKey)` - Finalize stream

### 2. Platform Integration (`platformIntegration.ts`)

OAuth and RTMP routing to multiple platforms.

**Supported Platforms:**
- Twitch (OAuth + RTMP)
- YouTube (OAuth + RTMP)
- Facebook (OAuth + RTMP)
- Custom RTMP endpoints

**Usage:**
```typescript
import { initPlatformIntegration } from '@/lib/obs';

const platforms = initPlatformIntegration();

// Start OAuth flow for Twitch
const { authUrl } = await platforms.initiateOAuth('twitch');
// Redirect user to authUrl

// Handle callback
const credentials = await platforms.handleOAuthCallback('twitch', code);

// Start broadcast
const status = await platforms.startBroadcast('twitch', {
  title: 'Live Stream',
  description: 'My stream description',
  visibility: 'public',
});

// Or set custom RTMP
platforms.setCustomRtmp('rtmp://example.com/live', 'my-stream-key', 'Custom Server');
```

**Platform Flow:**
1. `initiateOAuth(platform)` - Get auth URL
2. `handleOAuthCallback(platform, code)` - Exchange code for credentials
3. `startBroadcast(platform, config)` - Begin streaming
4. `getBroadcastStatus(platform)` - Poll status
5. `stopBroadcast(platform)` - End stream
6. `refreshCredentials(platform)` - Refresh tokens

### 3. Stream Session Management (`streamSession.ts`)

Manages individual stream sessions with metrics and health monitoring.

**Features:**
- Session lifecycle management
- Real-time metrics (fps, bitrate, bandwidth, drops)
- Health scoring and degradation alerts
- Automatic reconnection with exponential backoff
- Multi-session management per user

**Usage:**
```typescript
import { initStreamSessionManager } from '@/lib/obs';

const sessions = initStreamSessionManager();

// Create session
const session = sessions.createSession({
  userId: 'user-123',
  streamKey: 'secret-key',
  resolution: { width: 1920, height: 1080 },
  frameRate: 30,
  bitrate: 2500,
  platforms: ['twitch', 'youtube'],
});

await session.start();

// Listen to metrics
session.on('metrics:updated', (metrics) => {
  console.log(`
    FPS: ${metrics.fps}
    Bitrate: ${metrics.bitrate} kbps
    Dropped: ${metrics.droppedFrames}
    Health: ${session.getHealth().score}/100
  `);
});

// Handle errors with auto-reconnect
session.on('reconnecting', ({ attempt, maxAttempts, delay }) => {
  console.log(`Reconnecting... attempt ${attempt}/${maxAttempts} in ${delay}ms`);
});

session.on('health:degraded', (health) => {
  console.warn('Stream health degraded:', health.issues);
});

await session.stop();
```

**Session Status:**
- `INITIALIZING` - Setting up
- `ACTIVE` - Running
- `RECONNECTING` - Attempting recovery
- `PAUSED` - Temporarily paused
- `STOPPING` - Shutting down
- `STOPPED` - Finished
- `ERROR` - Unrecoverable error

### 4. Scene Manager (`sceneManager.ts`)

Scene and source management with transitions.

**Features:**
- Scene CRUD operations
- Multi-source scene composition
- Transition effects (fade, slide, wipe, cut)
- Source reordering and layering
- Scene import/export
- Scene duplication

**Usage:**
```typescript
import { initSceneManager } from '@/lib/obs';

const scenes = initSceneManager();

// Create scene
const scene = scenes.createScene({
  name: 'Gaming Layout',
  description: 'Game + webcam + chat',
});

// Add sources
scenes.addSource(scene.id, {
  name: 'Game Window',
  type: 'screen',
  enabled: true,
  visible: true,
  order: 0,
  position: { x: 0, y: 0 },
  size: { width: 1600, height: 1080 },
});

scenes.addSource(scene.id, {
  name: 'Webcam',
  type: 'camera',
  enabled: true,
  visible: true,
  order: 1,
  position: { x: 1600, y: 800 },
  size: { width: 320, height: 280 },
});

// Set transition
scenes.setTransition(scene.id, {
  type: 'fade',
  duration: 500,
  easing: 'easeInOut',
});

// Switch to scene
await scenes.switchScene(scene.id);

// Reorder sources
scenes.reorderSources(scene.id, [sourceId2, sourceId1]);

// Export/Import
const exported = scenes.exportScene(scene.id);
const imported = scenes.importScene(exported);
```

**Transition Effects:**
- `fade` - Crossfade between scenes
- `slide` - Slide in direction (left/right/up/down)
- `wipe` - Directional wipe
- `cut` - Instant switch
- `stingers` - Video stinger clips

### 5. Source Capture (`sourceCapture.ts`)

Capture and composition of audio/video sources.

**Capture Types:**

#### Screen Capture
```typescript
import { ScreenCaptureSource } from '@/lib/obs';

const screen = new ScreenCaptureSource({
  cursor: 'motion',
  audioCapture: true,
});

const stream = await screen.start();
// ...
await screen.stop();
```

#### Webcam Capture
```typescript
import { WebcamCaptureSource } from '@/lib/obs';

// List available webcams
const devices = await WebcamCaptureSource.listDevices();

const webcam = new WebcamCaptureSource({
  deviceId: devices[0].deviceId,
  width: 1280,
  height: 720,
  frameRate: 30,
  mirror: true,
});

const stream = await webcam.start();
```

#### Browser Source
```typescript
import { BrowserSourceCapture } from '@/lib/obs';

const browser = new BrowserSourceCapture({
  url: 'http://localhost:3000/stream-overlay',
  width: 1920,
  height: 1080,
  fps: 30,
});

const canvas = await browser.start();
```

#### Audio Mixer
```typescript
import { AudioMixer } from '@/lib/obs';

const mixer = new AudioMixer({
  masterVolume: 100,
  sampleRate: 48000,
  channels: 2,
});

await mixer.initialize();

// Add sources
mixer.addSource('microphone', micStream, 100);
mixer.addSource('desktop-audio', desktopStream, 80);

// Control volumes
mixer.setSourceVolume('microphone', 90);
mixer.setMasterVolume(95);

const audioStream = mixer.getAudioStream();
```

#### Source Composition
```typescript
import { SourceComposition } from '@/lib/obs';

const composition = new SourceComposition(1920, 1080);
await composition.initialize();

// Add sources
composition.addVideoSource('game', gameStream, true);
composition.addVideoSource('webcam', webcamStream, true);
composition.addAudioSource('mic', micStream, 100);
composition.addAudioSource('game-audio', gameAudioStream, 80);

const compositeStream = await composition.start();
// Composite stream ready for RTMP transmission
```

## Configuration

### Environment Variables

```bash
# RTMP Server
RTMP_PORT=1935
RECORDING_PATH=./recordings

# Platform OAuth
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# App Settings
APP_URL=https://yourdomain.com
OBS_HOST=localhost
OBS_PORT=4444
OBS_PASSWORD=optional_password
```

### Configuration Files

```typescript
// apps/studio/.env.local
RTMP_PORT=1935
RECORDING_PATH=./recordings
TWITCH_CLIENT_ID=xxx
YOUTUBE_CLIENT_ID=xxx
FACEBOOK_APP_ID=xxx
```

## API Integration

### Stream Control Endpoints

```typescript
// POST /api/streams/start
{
  "userId": "user-123",
  "streamKey": "secret-key",
  "resolution": { "width": 1920, "height": 1080 },
  "platforms": ["twitch", "youtube"],
  "sceneId": "scene_123"
}

// POST /api/streams/:sessionId/pause
// POST /api/streams/:sessionId/resume
// POST /api/streams/:sessionId/stop

// GET /api/streams/:sessionId/stats
// GET /api/streams/:sessionId/health

// POST /api/scenes
// GET /api/scenes
// PUT /api/scenes/:sceneId
// DELETE /api/scenes/:sceneId

// POST /api/scenes/:sceneId/sources
// PUT /api/scenes/:sceneId/sources/:sourceId
// DELETE /api/scenes/:sceneId/sources/:sourceId
```

### Platform Integration Endpoints

```typescript
// POST /api/platforms/:platform/oauth/init
// POST /api/platforms/:platform/oauth/callback?code=xxx

// POST /api/platforms/:platform/broadcast/start
// POST /api/platforms/:platform/broadcast/stop
// GET /api/platforms/:platform/broadcast/status

// POST /api/platforms/custom/rtmp
{
  "rtmpUrl": "rtmp://example.com/live",
  "streamKey": "my-key"
}
```

## Error Handling

All modules use custom error classes with codes:

```typescript
import { RtmpServerError, PlatformError, StreamSessionError, SceneManagerError, SourceCaptureError } from '@/lib/obs';

try {
  await rtmpServer.start();
} catch (error) {
  if (error instanceof RtmpServerError) {
    switch (error.code) {
      case 'INVALID_STREAM_KEY':
        // Handle auth error
        break;
      case 'STREAM_NOT_FOUND':
        // Handle not found
        break;
    }
  }
}
```

**Error Codes:**
- RTMP: `INVALID_STREAM_KEY`, `STREAM_NOT_FOUND`, `CONNECTION_ERROR`
- Platform: `OAUTH_CONFIG_ERROR`, `UNSUPPORTED_PLATFORM`, `PLATFORM_NOT_CONFIGURED`
- Session: `ALREADY_STARTED`, `NOT_ACTIVE`, `START_FAILED`
- Scene: `SCENE_NOT_FOUND`, `SOURCE_NOT_FOUND`, `ACTIVE_SCENE`
- Capture: `CAPTURE_FAILED`, `NOT_INITIALIZED`, `ALREADY_CAPTURING`

## Event System

All managers emit events for monitoring:

```typescript
// RTMP Server events
rtmpServer.on('started', (info) => {});
rtmpServer.on('stopped', () => {});
rtmpServer.on('stream:start', (stream) => {});
rtmpServer.on('stream:end', (stream) => {});
rtmpServer.on('stream:stats', (stream) => {});

// Session events
session.on('started', (info) => {});
session.on('metrics:updated', (metrics) => {});
session.on('health:degraded', (health) => {});
session.on('reconnecting', (info) => {});
session.on('error', (error) => {});

// Scene events
sceneManager.on('scene:created', (scene) => {});
sceneManager.on('scene:switched', (info) => {});
sceneManager.on('source:added', (source) => {});
sceneManager.on('source:updated', (source) => {});

// Platform events
platforms.on('credentials:updated', (info) => {});
platforms.on('broadcast:starting', (info) => {});
platforms.on('broadcast:stopping', (info) => {});
```

## Performance Considerations

### Bandwidth Optimization
- Adaptive bitrate streaming
- Frame drop detection and reporting
- Bandwidth throttling support
- Buffer health monitoring

### CPU/Memory
- Stream composition uses canvas rendering
- Audio mixing via Web Audio API
- Lazy source initialization
- Automatic cleanup on session end

### Latency
- RTMP low-latency mode support
- FLV protocol option for reduced latency
- Network jitter compensation
- Configurable buffer sizes

## Security

### Stream Authentication
- Stream key validation against database
- OAuth 2.0 for platform integrations
- Secure credential storage
- Token refresh automation

### Data Protection
- RTMP over TLS support
- Secure credential handling
- Audit logging for all operations
- CORS configuration per platform

## Database Schema (Prisma)

```prisma
model StreamSession {
  id            String   @id @default(cuid())
  userId        String
  streamKey     String   @unique
  status        String
  platforms     String[]
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  metrics       Json
  recordingPath String?

  user          User     @relation(fields: [userId], references: [id])
}

model Scene {
  id          String @id @default(cuid())
  userId      String
  name        String
  description String?
  order       Int
  sources     Json[]

  user        User   @relation(fields: [userId], references: [id])
}

model PlatformCredential {
  id           String   @id @default(cuid())
  userId       String
  platform     String
  accessToken  String
  refreshToken String?
  streamKey    String?
  rtmpUrl      String?
  expiresAt    DateTime?

  user         User     @relation(fields: [userId], references: [id])
}
```

## Testing

```typescript
// Mock RTMP stream
import { getRtmpServer } from '@/lib/obs';

describe('Stream Session', () => {
  it('should track metrics correctly', async () => {
    const rtmp = getRtmpServer();
    const session = await rtmp.handleStreamStart('test-key', 'user-1');

    rtmp.updateStreamStats('test-key', {
      bytesReceived: 1000,
      fps: 30,
      bitrate: 2500,
    });

    expect(session.fps).toBe(30);
    expect(session.bitrate).toBe(2500);
  });
});
```

## Deployment

### Docker Composition
```yaml
services:
  rtmp-server:
    image: nginx:latest
    ports:
      - "1935:1935"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./recordings:/recordings

  studio:
    image: studio:latest
    ports:
      - "3000:3000"
    environment:
      RTMP_PORT: 1935
      RECORDING_PATH: /recordings
```

### Scaling
- Horizontal scaling via multiple RTMP instances with load balancing
- Redis for session state sharing
- Database for persistent stream metrics
- CDN for media distribution

## Troubleshooting

### Common Issues

**Stream Connection Failed**
- Check RTMP server is running on correct port
- Verify stream key is valid
- Check network connectivity
- Review firewall rules (port 1935)

**Low Quality/Drops**
- Monitor CPU and memory usage
- Check bandwidth availability
- Reduce resolution or bitrate
- Check network latency

**Platform Authentication**
- Verify OAuth credentials are configured
- Check redirect URI matches configuration
- Refresh expired tokens
- Review platform API rate limits

## Resources

- [RTMP Specification](https://tools.ietf.org/html/rfc7425)
- [Twitch Ingestion Guide](https://dev.twitch.tv/docs/ingestion)
- [YouTube Live Streaming](https://developers.google.com/youtube/v3/live)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## License

Part of WISE² Genesis platform
