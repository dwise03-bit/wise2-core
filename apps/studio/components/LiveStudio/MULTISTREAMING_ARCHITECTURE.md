# Multistreaming Component Architecture

## Component Structure

```
Multistreaming (Main Component)
├── State Management
│   ├── enabledPlatforms: Set<StreamingPlatform>
│   ├── platformStats: Map<StreamingPlatform, PlatformStreamStatus>
│   ├── encoding: EncodingSettings
│   ├── failoverSettings: FailoverSettings
│   ├── UI State (showEncodingSettings, showAdvancedSettings, etc.)
│   └── Platform-specific Settings Modal State
│
├── Event Handlers
│   ├── handlePlatformToggle()
│   ├── handleDisconnectPlatform()
│   ├── handleEncodingChange()
│   ├── handleFailoverSettingsChange()
│   ├── handleLatencyChange()
│   └── Platform-specific handlers
│
├── Computed Values (useMemo)
│   ├── totalViewers
│   ├── averageBitrate
│   ├── hasErrors
│   └── connectedCount
│
└── Rendered Sections
    ├── Header Overview (4 stat cards)
    ├── Platform Selector (checkbox grid)
    ├── Shared Encoding Settings (collapsible)
    ├── Failover & Resilience (collapsible)
    └── Platform Settings Modal
```

## Data Flow Diagram

```
User Interaction
    ↓
Event Handler (handlePlatformToggle, etc.)
    ↓
State Update (setPlatformStats, setEncoding, etc.)
    ↓
Computed Values Update (useMemo)
    ↓
Component Re-render
    ↓
UI Callback Prop Fires (onConnect, onDisconnect, onEncodingChange, onSettingsChange)
    ↓
Parent Component Handles (Stream initiation, encoding updates, etc.)
```

## State Management Architecture

### enabledPlatforms
```typescript
Set<StreamingPlatform>
├── 'twitch'
├── 'youtube'
├── 'facebook'
└── 'custom-rtmp'
```

### platformStats
```typescript
Map<StreamingPlatform, PlatformStreamStatus>
├── 'twitch' → {
│   ├── isEnabled: boolean
│   ├── isConnected: boolean
│   ├── viewerCount: number
│   ├── bitrateCurrent: number
│   ├── bitrateTarget: number
│   ├── error?: string
│   ├── latencyDelay: number
│   └── reconnectAttempts: number
├── 'youtube' → { ... }
├── 'facebook' → { ... }
└── 'custom-rtmp' → { ... }
```

### encoding
```typescript
EncodingSettings
├── resolution: '720p'
├── fps: 30
└── baselineBitrate: 3500
```

### failoverSettings
```typescript
FailoverSettings
├── enableFailover: true
├── continueOnDisconnect: true
└── maxReconnectAttempts: 5
```

## Component Sections

### 1. Header Overview (4 Cards)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Connected       │ Total Viewers   │ Avg Bitrate     │ Status          │
│ 2 / 4           │ 3500            │ 3500 kbps       │ Ready           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Computed from:
- enabledPlatforms.size (denominator)
- platformStats filtered by isConnected (numerator)
- sum of viewerCount for all enabled platforms
- average of bitrateCurrent for all enabled platforms
- presence of errors and connection status
```

### 2. Platform Selector

```
Streaming Platforms
┌─────────────────────┬─────────────────────┐
│ ☑ Twitch            │ ☐ YouTube           │
│ Status: Connected   │ Status: Disconnected│
│ Viewers: 1500       │ Viewers: 0          │
│ Bitrate: 3500 kbps  │ Latency: 10000ms    │
│ Latency: 5000ms     │ [Settings] [Disable]│
│ [Settings] [Disable]│                     │
├─────────────────────┼─────────────────────┤
│ ☑ Facebook          │ ☐ Custom RTMP       │
│ Status: Error       │ Status: Idle        │
│ Error: Timeout      │                     │
│ [Settings] [Disable]│                     │
└─────────────────────┴─────────────────────┘

Logic:
- Checkbox toggles platform in enabledPlatforms
- Display stats only if enabled
- Color changes based on connection status
- Error shown if platform has error
```

### 3. Shared Encoding Settings (Collapsible)

```
Shared Encoding Settings ▼
┌──────────────────────────────────────────────┐
│ Resolution      │ Frame Rate      │ Baseline │
│ [720p ▼]        │ [30 FPS ▼]      │ [3500 ]  │
│ Applied to all  │ Universal FPS   │ kbps     │
│ platforms       │ for all streams │ Optimized│
│                 │                 │ per plat │
│ Note: These settings apply to all selected  │
│ platforms. Individual platform bitrates are │
│ automatically optimized...                  │
└──────────────────────────────────────────────┘

Handlers:
- handleEncodingChange() on any field change
- Updates encoding state
- Fires onEncodingChange() callback
- Recalculates bitrate targets based on resolution
```

### 4. Failover & Resilience (Collapsible)

```
Failover & Resilience ▼
┌──────────────────────────────────────────────┐
│ ☑ Enable Failover Protection                │
│   Automatically detect and recover...       │
│                                              │
│ ☑ Continue Stream on Single Platform        │
│   Keep streaming to other platforms...      │
│                                              │
│ Max Reconnect Attempts: [5] attempts         │
│   Number of times to retry connecting...    │
│                                              │
│ Failover Strategy: If a platform fails,     │
│ the system will attempt to reconnect        │
│ while continuing to stream to other...      │
└──────────────────────────────────────────────┘

Handlers:
- handleFailoverSettingsChange() on any update
- Fires onSettingsChange() callback
```

### 5. Platform Settings Modal

```
┌─────────────────────────────────────┐
│ Twitch Settings              [X]    │
├─────────────────────────────────────┤
│ Latency Delay (ms)                  │
│ [5000             ]                 │
│                                     │
│ Platform Info:                      │
│ Recommended Bitrate: 2500-6000 kbps │
│ Supported FPS: 30, 60               │
├─────────────────────────────────────┤
│ [Close]                    [Save]   │
└─────────────────────────────────────┘

Data:
- Latency for specific platform
- Platform config from PLATFORM_CONFIGS
- Uses PlatformSettings.tsx for detailed config
```

## Event Flow

### Platform Toggle Flow
```
User Clicks Checkbox
    ↓
handlePlatformToggle(platform)
    ↓
setEnabledPlatforms() update
    ↓
setPlatformStats() - set isEnabled flag
    ↓
onDisconnect callback if disabling
    ↓
Component re-renders
    ↓
Stats display updated, header metrics recalculated
```

### Encoding Change Flow
```
User Changes Resolution/FPS/Bitrate
    ↓
handleEncodingChange(updates)
    ↓
setEncoding() update
    ↓
onEncodingChange() callback (fires immediately)
    ↓
Recalculate platformBitrate from BITRATE_PRESETS
    ↓
setPlatformStats() - update bitrateTarget for all platforms
    ↓
Component re-renders with new targets
```

### Failover Settings Change Flow
```
User Enables/Disables Failover or Changes Settings
    ↓
handleFailoverSettingsChange(updates)
    ↓
setFailoverSettings() update
    ↓
onSettingsChange() callback (fires immediately)
    ↓
Parent component updates server-side failover policy
    ↓
Component remains stateful (no additional re-render needed)
```

## Integration Points

### Parent Component Responsibilities

```typescript
// 1. Stream Initialization (on onConnect)
async function initiateStream(platforms: StreamingPlatform[]) {
  for (const platform of platforms) {
    // Get credentials for platform
    const credentials = await getStreamCredentials(platform);
    
    // Start encoding to this platform
    await startStreamToRTMP(
      platform,
      credentials.streamUrl,
      encoding.resolution,
      encoding.fps,
      platformStats.get(platform).bitrateTarget
    );
  }
}

// 2. Stream Termination (on onDisconnect)
async function terminateStream(platform: StreamingPlatform) {
  await stopStreamToRTMP(platform);
  await cleanupResources(platform);
}

// 3. Encoding Update (on onEncodingChange)
async function updateEncoding(settings: EncodingSettings) {
  // Update encoder configuration
  // Apply to all active streams
  // Recalculate per-platform bitrates
}

// 4. Failover Policy Update (on onSettingsChange)
async function updateFailoverPolicy(settings: FailoverSettings) {
  // Update server-side reconnection strategy
  // Configure reconnect attempts
  // Set continue-on-failure behavior
}
```

### Backend Stream Management

```typescript
// Pseudo-code for backend streaming service
class MultiStreamingService {
  // Platform-specific streams
  private streams: Map<StreamingPlatform, StreamProcess> = new Map();
  
  // Shared encoder
  private encoder: FFmpegEncoder;
  
  // Per-platform state
  private platformState: Map<StreamingPlatform, StreamState> = new Map();
  
  async startStream(platforms: StreamingPlatform[], encoding: EncodingSettings) {
    // 1. Initialize single encoder with encoding settings
    this.encoder = new FFmpegEncoder(encoding);
    
    // 2. For each platform, create RTMP stream
    for (const platform of platforms) {
      const rtmpUrl = await this.getRTMPUrl(platform);
      const bitrate = this.getOptimizedBitrate(platform, encoding);
      
      const stream = this.encoder.pipe(
        rtmpUrl,
        { bitrate, latency: this.getLatency(platform) }
      );
      
      this.streams.set(platform, stream);
      this.startMonitoring(platform);
    }
  }
  
  // Per-platform monitoring
  private startMonitoring(platform: StreamingPlatform) {
    setInterval(() => {
      const stats = this.getStreamStats(platform);
      this.broadcastStats(platform, stats);
      
      // Failover logic
      if (!this.isConnected(platform) && this.failoverEnabled) {
        this.attemptReconnect(platform);
      }
    }, 1000);
  }
}
```

## CSS Styling Structure

```css
/* Main Container */
.multistreaming-container {
  space-y: 1.5rem;  /* gap between sections */
}

/* Header Overview */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: slate-800;
  border: 1px solid slate-700;
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Platform Selector */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.platform-card {
  border: 1px solid slate-700;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.platform-card.enabled {
  background: slate-800;
  border-color: amber-500/50;
}

/* Collapsible Sections */
.collapsible-section {
  border: 1px solid slate-700;
  border-radius: 0.5rem;
  overflow: hidden;
}

.collapsible-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
}

.collapsible-header:hover {
  background: slate-800/50;
}

.collapsible-content {
  padding: 1.5rem;
  border-top: 1px solid slate-700;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: black/50;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: slate-900;
  border: 1px solid slate-700;
  border-radius: 0.5rem;
  max-width: 28rem;
  width: 100%;
}
```

## Performance Optimization

### Memoization Strategy
```typescript
// 1. Computed values use useMemo
const totalViewers = useMemo(() => { ... }, [enabledPlatforms, platformStats]);
const averageBitrate = useMemo(() => { ... }, [enabledPlatforms, platformStats]);

// 2. Callbacks use useCallback
const handlePlatformToggle = useCallback(() => { ... }, [onDisconnect]);
const handleEncodingChange = useCallback(() => { ... }, [encoding, onEncodingChange]);

// 3. Lists use stable keys (platform name)
platforms.map((platform) => (
  <PlatformCard key={platform} platform={platform} />
))
```

### Re-render Prevention
```typescript
// Only re-render when these deps change:
// - enabledPlatforms (add/remove platform)
// - platformStats (update viewer count, status, etc.)
// - UI state (show/hide settings)

// Stats updates (frequent) don't cause full re-render if memoized properly
```

## Error Handling Strategy

```
Platform Error
    ↓
Caught by listener (WebSocket, API, etc.)
    ↓
setPlatformStats() - update error field and isConnected = false
    ↓
If failoverSettings.enableFailover:
    ├─→ Attempt reconnect (1/5)
    ├─→ Show "Reconnecting..." state
    └─→ If continueOnDisconnect:
        └─→ Keep other platforms streaming
    └─→ If maxReconnectAttempts reached:
        └─→ Show error, allow manual retry
    ↓
Component displays error indicator
    ↓
User can:
- Wait for auto-reconnect
- Disable platform
- Adjust settings and retry
- View error details
```

## Testing Strategy

### Unit Tests
- Props validation
- State management
- Callback firing
- Computation correctness

### Integration Tests
- Multi-platform scenarios
- Failover behavior
- Settings changes
- Error handling

### E2E Tests
- Full streaming flow
- Platform enable/disable
- Encoding changes
- Failover recovery

## Future Architecture Enhancements

```
Potential:
├── State Management Library (Redux, Zustand)
├── Custom Hook Extraction (useMultistreaming)
├── Separate Modal Component (PlatformSettingsModal)
├── Platform Card Sub-component
├── Stats Service (WebSocket/API abstraction)
├── Analytics Integration
└── Configuration Persistence (localStorage/DB)
```
