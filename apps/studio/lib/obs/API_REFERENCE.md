# OBS Backend API Reference

Quick reference for all public APIs in the OBS backend.

## RTMP Server

### `RtmpServer` Class

```typescript
class RtmpServer extends EventEmitter {
  // Initialization
  constructor(config: RtmpServerConfig)
  async start(): Promise<void>
  async stop(): Promise<void>

  // Stream Management
  async handleStreamStart(streamKey: string, userId: string): Promise<RtmpStream>
  async updateStreamStats(streamKey: string, stats: StreamStats): Promise<void>
  async endStream(streamKey: string): Promise<void>

  // Validators
  setStreamValidator(validator: (key: string, userId: string) => Promise<boolean>): void

  // Queries
  getStream(streamKey: string): RtmpStream | undefined
  getActiveStreams(): RtmpStream[]
  getUserStream(userId: string): RtmpStream | undefined
  isServerRunning(): boolean
  getStatus(): ServerStatus
}

// Singleton functions
function initRtmpServer(config?: Partial<RtmpServerConfig>): RtmpServer
function getRtmpServer(): RtmpServer
```

**Events:**
- `started` - Server started
- `stopped` - Server stopped
- `stream:start` - Stream began
- `stream:end` - Stream ended
- `stream:stats` - Stats updated

## Platform Integration

### `PlatformIntegration` Class

```typescript
class PlatformIntegration extends EventEmitter {
  // OAuth Flow
  async initiateOAuth(platform: PlatformType): Promise<{ authUrl: string }>
  async handleOAuthCallback(platform: PlatformType, code: string): Promise<PlatformCredentials>

  // Custom RTMP
  setCustomRtmp(rtmpUrl: string, streamKey: string, label?: string): PlatformCredentials

  // Credentials
  getCredentials(platform: PlatformType): PlatformCredentials | undefined
  getConfiguredPlatforms(): PlatformType[]
  async refreshCredentials(platform: PlatformType): Promise<PlatformCredentials>
  async disconnectPlatform(platform: PlatformType): Promise<void>

  // Broadcasting
  async startBroadcast(platform: PlatformType, config: PlatformStreamConfig): Promise<PlatformStreamStatus>
  async stopBroadcast(platform: PlatformType): Promise<PlatformStreamStatus>
  async getBroadcastStatus(platform: PlatformType): Promise<PlatformStreamStatus>
}

// Singleton functions
function initPlatformIntegration(): PlatformIntegration
function getPlatformIntegration(): PlatformIntegration
```

**Supported Platforms:**
- `'twitch'`
- `'youtube'`
- `'facebook'`
- `'custom'`
- `'twitter_x'`

**Events:**
- `credentials:updated`
- `credentials:refreshed`
- `broadcast:starting`
- `broadcast:stopping`
- `platform:disconnected`

## Stream Session Management

### `StreamSession` Class

```typescript
class StreamSession extends EventEmitter {
  // Lifecycle
  async start(): Promise<{ sessionId: string; success: boolean }>
  async stop(): Promise<void>
  async pause(): Promise<void>
  async resume(): Promise<void>

  // Metrics
  updateMetrics(metrics: Partial<StreamMetrics>): void
  getMetrics(): StreamMetrics
  getHealth(): StreamHealth

  // Status
  getSessionId(): string
  getStatus(): StreamSessionStatus
  getSessionInfo(): SessionInfo

  // Error Handling
  async handleError(error: Error): Promise<void>
  cancelReconnect(): void

  // Cleanup
  async cleanup(): Promise<void>
}

// Manager class
class StreamSessionManager {
  createSession(config: StreamSessionConfig): StreamSession
  getSession(sessionId: string): StreamSession | undefined
  getUserSessions(userId: string): StreamSession[]
  getActiveSessions(): StreamSession[]
  async removeSession(sessionId: string): Promise<void>
  getStatus(): ManagerStatus
}

// Singleton functions
function initStreamSessionManager(): StreamSessionManager
function getStreamSessionManager(): StreamSessionManager
```

**Session Status:**
- `'initializing'`
- `'active'`
- `'reconnecting'`
- `'paused'`
- `'stopping'`
- `'stopped'`
- `'error'`

**Events:**
- `started` - Session started
- `stopped` - Session stopped
- `metrics:updated` - Metrics changed
- `metrics:poll` - Metrics poll time
- `reconnecting` - Attempting reconnect
- `reconnected` - Reconnected
- `health:degraded` - Health issues
- `error` - Fatal error

## Scene Manager

### `SceneManager` Class

```typescript
class SceneManager extends EventEmitter {
  // Scene CRUD
  createScene(config: SceneConfig): Scene
  getScene(sceneId: string): Scene | undefined
  getSceneByName(name: string): Scene | undefined
  getScenes(): Scene[]
  updateScene(sceneId: string, updates: Partial<SceneConfig>): Scene
  deleteScene(sceneId: string): void

  // Scene Switching
  async switchScene(sceneId: string, transition?: TransitionEffect): Promise<SwitchResult>
  getActiveScene(): Scene | undefined

  // Source Management
  addSource(sceneId: string, source: SourceInput): SceneSource
  getSource(sceneId: string, sourceId: string): SceneSource | undefined
  updateSource(sceneId: string, sourceId: string, updates: SourceUpdates): SceneSource
  removeSource(sceneId: string, sourceId: string): void
  reorderSources(sceneId: string, sourceIds: string[]): SceneSource[]

  // Transitions
  setTransition(sceneId: string, transition: TransitionEffect): Scene
  setDefaultTransition(transition: TransitionEffect): void

  // Scene Operations
  duplicateScene(sceneId: string, newName?: string): Scene
  exportScene(sceneId: string): string
  importScene(data: string): Scene

  // Stats
  getStats(): SceneStats
}

// Singleton functions
function initSceneManager(): SceneManager
function getSceneManager(): SceneManager
```

**Transition Types:**
- `'fade'` - Crossfade
- `'slide'` - Slide in direction
- `'wipe'` - Directional wipe
- `'cut'` - Instant switch
- `'stingers'` - Video stinger

**Events:**
- `scene:created`
- `scene:updated`
- `scene:deleted`
- `scene:switched`
- `source:added`
- `source:updated`
- `source:removed`
- `sources:reordered`
- `transition:updated`

## Source Capture

### Screen Capture

```typescript
class ScreenCaptureSource extends EventEmitter {
  constructor(options?: ScreenCaptureOptions)
  async start(): Promise<MediaStream>
  async stop(): Promise<void>
  getStream(): MediaStream | null
  isActive(): boolean
}
```

### Webcam Capture

```typescript
class WebcamCaptureSource extends EventEmitter {
  constructor(options?: WebcamCaptureOptions)
  async start(): Promise<MediaStream>
  async stop(): Promise<void>
  getStream(): MediaStream | null
  isActive(): boolean
  static async listDevices(): Promise<MediaDeviceInfo[]>
}
```

### Browser Source

```typescript
class BrowserSourceCapture extends EventEmitter {
  constructor(options?: BrowserSourceOptions)
  async start(): Promise<HTMLCanvasElement>
  async stop(): Promise<void>
  getCanvas(): HTMLCanvasElement | null
  isActive(): boolean
}
```

### Audio Mixer

```typescript
class AudioMixer extends EventEmitter {
  constructor(options?: AudioMixOptions)
  async initialize(): Promise<void>
  addSource(sourceId: string, stream: MediaStream, volume?: number): void
  removeSource(sourceId: string): void
  setSourceVolume(sourceId: string, volume: number): void
  setMasterVolume(volume: number): void
  getAudioStream(): MediaStream | null
  async stop(): Promise<void>
  isActive(): boolean
}
```

### Source Composition

```typescript
class SourceComposition extends EventEmitter {
  constructor(width?: number, height?: number)
  async initialize(): Promise<void>
  addVideoSource(sourceId: string, stream: MediaStream, visible?: boolean): void
  addAudioSource(sourceId: string, stream: MediaStream, volume?: number): void
  async start(): Promise<MediaStream>
  async stop(): Promise<void>
  getStream(): MediaStream | null
  isActive(): boolean
}
```

**Capture Events:**
- `started` - Capture began
- `stopped` - Capture ended
- `source:added` - Source added to mixer
- `source:removed` - Source removed from mixer

## Unified OBS Backend

### `ObsBackend` Class

```typescript
class ObsBackend {
  // Component Access
  getRtmpServer(): RtmpServer
  getPlatformIntegration(): PlatformIntegration
  getSessionManager(): StreamSessionManager
  getSceneManager(): SceneManager

  // System Operations
  async initialize(): Promise<void>
  async shutdown(): Promise<void>

  // Status
  getStatus(): SystemStatus
}

// Singleton functions
function initObsBackend(): ObsBackend
function getObsBackend(): ObsBackend
```

## Type Definitions

### RTMP Server Types

```typescript
interface RtmpServerConfig {
  port: number
  enableRecording?: boolean
  recordingPath?: string
  maxStreamDuration?: number
  bandwidthLimit?: number
  requireAuth?: boolean
  hostname?: string
}

interface RtmpStream {
  id: string
  streamKey: string
  userId: string
  startTime: number
  endTime?: number
  bytesTransferred: number
  droppedFrames: number
  fps: number
  bitrate: number
  resolution?: { width: number; height: number }
  platform?: string
  recordingPath?: string
  isActive: boolean
}
```

### Platform Types

```typescript
type PlatformType = 'twitch' | 'youtube' | 'facebook' | 'custom' | 'twitter_x'

interface PlatformCredentials {
  platform: PlatformType
  accessToken?: string
  refreshToken?: string
  streamKey?: string
  rtmpUrl?: string
  userId?: string
  expiresAt?: number
  metadata?: Record<string, any>
}

interface PlatformStreamConfig {
  platform: PlatformType
  title?: string
  description?: string
  thumbnail?: string
  visibility?: 'public' | 'private' | 'unlisted'
  category?: string
  tags?: string[]
  autoBitrate?: boolean
  targetBitrate?: number
}
```

### Stream Session Types

```typescript
interface StreamSessionConfig {
  userId: string
  streamKey: string
  resolution?: { width: number; height: number }
  frameRate?: number
  bitrate?: number
  enableRecording?: boolean
  recordingPath?: string
  maxDuration?: number
  reconnectAttempts?: number
  reconnectDelay?: number
  platforms?: string[]
}

interface StreamMetrics {
  startTime: number
  endTime?: number
  duration: number
  bitrate: number
  fps: number
  droppedFrames: number
  totalFrames: number
  bandwidth: number
  bytesTransferred: number
  cpuUsage: number
  memoryUsage: number
  networkLatency: number
  bufferHealth: number
}

interface StreamHealth {
  isHealthy: boolean
  issues: string[]
  score: number
  warnings: string[]
}
```

### Scene Types

```typescript
interface SceneConfig {
  name: string
  description?: string
  order?: number
}

interface Scene {
  id: string
  name: string
  description?: string
  order: number
  sources: SceneSource[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  transition?: TransitionEffect
}

interface SceneSource {
  id: string
  sceneId: string
  name: string
  type: 'camera' | 'screen' | 'window' | 'image' | 'text' | 'browser' | 'media' | 'custom'
  enabled: boolean
  visible: boolean
  locked?: boolean
  order: number
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  rotation?: number
  opacity?: number
  properties?: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface TransitionEffect {
  type: 'fade' | 'slide' | 'wipe' | 'cut' | 'stingers'
  duration?: number
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  direction?: 'left' | 'right' | 'up' | 'down'
}
```

### Capture Types

```typescript
interface ScreenCaptureOptions {
  displayId?: string
  cursor?: 'always' | 'motion' | 'never'
  audioCapture?: boolean
}

interface WebcamCaptureOptions {
  deviceId?: string
  width?: number
  height?: number
  frameRate?: number
  mirror?: boolean
}

interface BrowserSourceOptions {
  url: string
  width?: number
  height?: number
  fps?: number
  audioCapture?: boolean
  css?: string
}

interface AudioMixOptions {
  masterVolume?: number
  sampleRate?: number
  channels?: number
}
```

## Error Handling

### Error Classes

```typescript
class RtmpServerError extends Error {
  code: string
}

class PlatformError extends Error {
  code: string
}

class StreamSessionError extends Error {
  code: string
}

class SceneManagerError extends Error {
  code: string
}

class SourceCaptureError extends Error {
  code: string
}
```

### Error Codes

**RTMP:**
- `INVALID_STREAM_KEY`
- `STREAM_NOT_FOUND`
- `CONNECTION_ERROR`
- `ALREADY_CAPTURING`

**Platform:**
- `OAUTH_CONFIG_ERROR`
- `UNSUPPORTED_PLATFORM`
- `PLATFORM_NOT_CONFIGURED`
- `TWITCH_OAUTH_ERROR`
- `YOUTUBE_OAUTH_ERROR`
- `FACEBOOK_OAUTH_ERROR`

**Session:**
- `ALREADY_STARTED`
- `NOT_ACTIVE`
- `NOT_PAUSED`
- `START_FAILED`
- `STOP_FAILED`

**Scene:**
- `SCENE_NOT_FOUND`
- `SOURCE_NOT_FOUND`
- `ACTIVE_SCENE`
- `IMPORT_FAILED`

**Capture:**
- `CAPTURE_FAILED`
- `NOT_INITIALIZED`
- `ALREADY_CAPTURING`
- `DEVICE_ENUM_FAILED`

## Usage Patterns

### Create and Start Stream

```typescript
const manager = initStreamSessionManager();
const session = manager.createSession({
  userId: 'user-1',
  streamKey: 'key-123',
  platforms: ['twitch'],
});

await session.start();
// Stream is live
```

### Create Scene with Sources

```typescript
const scenes = initSceneManager();
const scene = scenes.createScene({ name: 'Gaming' });

scenes.addSource(scene.id, {
  name: 'Game',
  type: 'screen',
  enabled: true,
  visible: true,
  order: 0,
});

scenes.addSource(scene.id, {
  name: 'Webcam',
  type: 'camera',
  enabled: true,
  visible: true,
  order: 1,
});

await scenes.switchScene(scene.id);
```

### Connect Platform and Start Broadcast

```typescript
const platforms = initPlatformIntegration();

// Start OAuth
const { authUrl } = await platforms.initiateOAuth('twitch');
// Redirect user...

// Handle callback
const creds = await platforms.handleOAuthCallback('twitch', code);

// Start broadcast
const status = await platforms.startBroadcast('twitch', {
  title: 'Live Now',
  visibility: 'public',
});
```

### Capture and Compose Sources

```typescript
const composition = new SourceComposition(1920, 1080);
await composition.initialize();

const screen = new ScreenCaptureSource();
const screenStream = await screen.start();
composition.addVideoSource('screen', screenStream);

const webcam = new WebcamCaptureSource();
const webcamStream = await webcam.start();
composition.addVideoSource('webcam', webcamStream);

const compositeStream = await composition.start();
// Ready for RTMP transmission
```

## Common Patterns

### Monitor Stream Health

```typescript
session.on('health:degraded', (health) => {
  if (health.score < 50) {
    console.warn('Critical issues:', health.issues);
    // Notify user or take action
  }
});
```

### Handle Reconnection

```typescript
session.on('reconnecting', ({ attempt, maxAttempts }) => {
  console.log(`Reconnect ${attempt}/${maxAttempts}`);
});

session.on('reconnected', () => {
  console.log('Reconnected successfully');
});
```

### Manage Multiple Platforms

```typescript
const platforms = initPlatformIntegration();
const activePlatforms = platforms.getConfiguredPlatforms();

for (const platform of activePlatforms) {
  await platforms.startBroadcast(platform, { title: 'Stream' });
}
```

### Dynamic Scene Management

```typescript
const scenes = initSceneManager();

// Export current setup
const config = scenes.exportScene(activeSceneId);
localStorage.setItem('scene-backup', config);

// Restore later
const restored = scenes.importScene(localStorage.getItem('scene-backup'));
```

---

For detailed examples, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

For architecture details, see [README.md](./README.md)
