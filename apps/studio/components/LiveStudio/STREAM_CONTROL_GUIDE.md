# StreamControl Component Guide

## Overview

The `StreamControl` component provides a professional streaming control panel for managing OBS-style streaming configurations. It supports multiple streaming platforms (Twitch, YouTube, Facebook, Custom RTMP), full encoder configuration, real-time statistics, and advanced streaming controls.

**Location**: `/apps/studio/components/LiveStudio/StreamControl.tsx`

## Features

### 1. Platform Management
- Platform selector (Twitch, YouTube, Facebook, Custom RTMP)
- OAuth-based authentication flow for platforms
- Platform-specific configuration
- Username display after authentication

### 2. Stream Key Management
- Masked input field (password-protected by default)
- Show/hide toggle for security
- Copy to clipboard functionality
- Reset stream key with confirmation dialog
- Input validation

### 3. Resolution & FPS Control
- Resolution options: 480p, 720p, 1080p, 1440p, 2160p (4K)
- FPS options: 24, 30, 48, 50, 60
- Automatic bitrate recommendations based on resolution & FPS
- Quality preview display

### 4. Bitrate Control
- Auto mode: Uses platform-optimal presets
- Custom mode: Manual slider (500-51000 kbps range)
- Adaptive bitrate based on resolution/FPS combination
- Smart recommendations with min/max guidance

### 5. Encoder Selection
- x264 (Software encoding)
- NVIDIA NVENC (GPU acceleration)
- AMD VCE (GPU acceleration)
- Intel QSV (GPU acceleration)

### 6. Advanced Encoder Settings
- **Preset**: Ultrafast → Slower (quality vs CPU tradeoff)
- **Keyframe Interval**: 0s (auto) to 10s
- **B-Frames**: 0 to 4
- **Profile**: Baseline, Main, High
- **Level**: Auto or H.264-specific levels (3.0 - 5.0)

### 7. Streaming Controls
- **Test Stream**: Validates connection before going live
- **Start Stream**: Begins streaming to selected platform
- **Pause Stream**: Temporarily pauses stream (max 30s)
- **Stop Stream**: Ends current stream session

### 8. Status Display
- Connection status (Idle, Connecting, Live, Paused, Reconnecting, Error)
- Viewer count (platform-provided)
- Uptime tracking (HH:MM:SS format)
- Real-time bitrate monitoring

## Usage

### Basic Usage

```tsx
import { StreamControl } from '@/components/LiveStudio';

export default function StreamPage() {
  const handleStartStream = async (config) => {
    console.log('Starting stream with config:', config);
    // Send to OBS or streaming backend
  };

  const handleStopStream = async () => {
    console.log('Stopping stream');
    // Stop streaming backend
  };

  return (
    <StreamControl
      isStreaming={false}
      onStartStream={handleStartStream}
      onStopStream={handleStopStream}
    />
  );
}
```

### With Full Props

```tsx
<StreamControl
  isStreaming={isLive}
  onStartStream={handleStartStream}
  onStopStream={handleStopStream}
  onPauseStream={handlePauseStream}
  onTestStream={handleTestStream}
  onAuthPlatform={handleAuthPlatform}
  stats={{
    viewers: 1234,
    uptime: 3600, // seconds
    currentBitrate: 5200, // kbps
  }}
  platformAuth={{
    twitch: { authenticated: true, username: 'dwise' },
    youtube: { authenticated: false },
    facebook: { authenticated: false },
    custom: { authenticated: true },
  }}
/>
```

## Props

### StreamControlProps

```typescript
interface StreamControlProps {
  // Streaming state
  isStreaming?: boolean;

  // Event handlers
  onStartStream?: (config: StreamConfig) => void | Promise<void>;
  onStopStream?: () => void | Promise<void>;
  onPauseStream?: () => void | Promise<void>;
  onTestStream?: (config: StreamConfig) => void | Promise<void>;
  onAuthPlatform?: (platform: Platform) => void | Promise<void>;

  // Real-time stats
  stats?: StreamStats;

  // Platform authentication state
  platformAuth?: Partial<Record<Platform, { authenticated: boolean; username?: string }>>;
}
```

### StreamConfig

```typescript
interface StreamConfig {
  platform: 'twitch' | 'youtube' | 'facebook' | 'custom';
  resolution: '480p' | '720p' | '1080p' | '1440p' | '2160p';
  fps: 24 | 30 | 48 | 50 | 60;
  bitrate: number; // kbps
  encoder: 'x264' | 'nvenc' | 'amd' | 'intel';
  streamKey: string;
  encoderPreset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower';
  keyframeInterval?: number; // seconds
  bFrames?: number;
  profile?: 'baseline' | 'main' | 'high';
  level?: string;
}
```

### StreamStats

```typescript
interface StreamStats {
  viewers?: number;
  uptime?: number; // seconds
  currentBitrate?: number; // kbps
}
```

## Bitrate Recommendations

### By Resolution & FPS

| Resolution | 24fps | 30fps | 48fps | 50fps | 60fps |
|-----------|-------|-------|-------|-------|-------|
| 480p      | 800   | 1000  | 1200  | 1300  | 1500  |
| 720p      | 2000  | 2500  | 3000  | 3200  | 5000  |
| 1080p     | 4000  | 6000  | 7000  | 7500  | 12000 |
| 1440p     | 6000  | 10000 | 12000 | 13000 | 18000 |
| 2160p (4K)| 12000 | 20000 | 24000 | 25000 | 35000 |

Values shown are **auto-mode recommendations**. Custom mode allows 500-51000 kbps.

## Encoder Selection Guide

### x264 (Software)
- Best for: CPU-rich systems without dedicated GPU
- Pros: Universal compatibility, fine control
- Cons: High CPU usage, slower encoding
- Use when: GPU unavailable or system has powerful CPU

### NVIDIA NVENC
- Best for: NVIDIA GPU owners (RTX series recommended)
- Pros: Low CPU usage, excellent quality
- Cons: Requires NVIDIA GPU with NVENC support
- Use when: NVIDIA GPU available

### AMD VCE
- Best for: AMD GPU owners
- Pros: Low CPU usage, good efficiency
- Cons: Requires AMD RDNA GPU
- Use when: AMD RDNA GPU available

### Intel QSV
- Best for: Intel Arc GPU or modern iGPU owners
- Pros: Low power consumption, integrated solution
- Cons: Newer technology, fewer system support
- Use when: Intel Arc GPU or 12th gen+ CPU with Arc

## Encoder Preset Guide

- **Ultrafast**: Lowest quality, highest speed (not recommended for streaming)
- **Superfast**: Very fast, lower quality
- **Veryfast**: Fast encoding, acceptable quality
- **Faster**: Good balance (good for 1080p@60)
- **Fast**: Better quality, slightly higher CPU (recommended default)
- **Medium**: Good quality, moderate CPU usage
- **Slow**: High quality, significant CPU usage
- **Slower**: Highest quality (rarely needed for streaming)

## State Management

The component is **stateful** and manages its own state for:
- Platform selection
- Stream configuration (resolution, FPS, bitrate)
- Encoder settings
- Streaming status and errors

**Stateless aspects** (controlled by parent):
- `isStreaming` (optional, can manage own state)
- `stats` (should be updated by parent from backend)
- `platformAuth` (should be updated by parent from auth service)

## Event Handling

### onStartStream

Called when user clicks "START STREAM". Receives full `StreamConfig`:

```typescript
onStartStream: async (config: StreamConfig) => {
  // 1. Validate stream key on platform
  // 2. Send config to OBS backend
  // 3. Update streaming status
  // 4. Start stats polling
}
```

### onStopStream

Called when user clicks "STOP STREAM":

```typescript
onStopStream: async () => {
  // 1. Stop streaming backend
  // 2. Close platform connection
  // 3. Stop stats polling
}
```

### onPauseStream

Called when user clicks "PAUSE STREAM" (only visible while live):

```typescript
onPauseStream: async () => {
  // 1. Pause the stream
  // 2. Timer shows max 30s pause
  // 3. Auto-resume or manual stop
}
```

### onTestStream

Called when user clicks "TEST STREAM":

```typescript
onTestStream: async (config: StreamConfig) => {
  // 1. Attempt connection with config
  // 2. Validate stream key
  // 3. Report success/failure
  // 4. Don't actually broadcast
}
```

### onAuthPlatform

Called when user clicks "Authorize with [Platform]":

```typescript
onAuthPlatform: async (platform: Platform) => {
  // 1. Trigger OAuth flow for platform
  // 2. Get stream key from user's account
  // 3. Return with authenticated user data
  // 4. Update platformAuth state in parent
}
```

## Styling

The component uses WISE² design tokens:

- **Colors**: `wise-primary`, `wise-accent`, `wise-text-primary`, `studio-` palette
- **Borders**: `studio-line` (subtle), `studio-input` (active)
- **Backgrounds**: Gradient `studio-bg` → `studio-panel`
- **Animations**: Framer Motion for smooth transitions

All styles are Tailwind-based with no external CSS files required.

## Accessibility

- **WCAG AA compliant**
- Semantic HTML structure
- Focus indicators on interactive elements
- Disabled state management on locked controls
- Keyboard navigation support
- Screen reader friendly labels

## Examples

### Live Stream Monitor

```tsx
function LiveStreamMonitor() {
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState<StreamStats>();

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      const response = await fetch('/api/stream/stats');
      const data = await response.json();
      setStats(data);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <StreamControl
      isStreaming={isLive}
      stats={stats}
      onStartStream={async (config) => {
        await fetch('/api/stream/start', {
          method: 'POST',
          body: JSON.stringify(config),
        });
        setIsLive(true);
      }}
      onStopStream={async () => {
        await fetch('/api/stream/stop', { method: 'POST' });
        setIsLive(false);
      }}
    />
  );
}
```

### Multi-Platform Streaming

```tsx
function MultiPlatformStream() {
  const [auth, setAuth] = useState({});

  const handleAuth = async (platform) => {
    const result = await oauthLogin(platform);
    setAuth(prev => ({
      ...prev,
      [platform]: { authenticated: true, username: result.username }
    }));
  };

  return (
    <StreamControl
      platformAuth={auth}
      onAuthPlatform={handleAuth}
      onStartStream={async (config) => {
        // Route to correct backend based on platform
        await streamToMultiplePlatforms(config);
      }}
    />
  );
}
```

## Migration from OBSStreamControl

If upgrading from `OBSStreamControl`, note these differences:

| Feature | OBSStreamControl | StreamControl |
|---------|------------------|---------------|
| Max Resolution | 1080p | 2160p (4K) |
| Max FPS | 60 | 60 |
| Max Bitrate | 15000 | 51000 |
| Encoder Options | 2 | 4 |
| Advanced Settings | No | Yes |
| Pause Button | No | Yes |
| OAuth Support | No | Yes |
| Uptime Display | No | Yes |
| Viewers Count | No | Yes |

## Troubleshooting

### Stream won't start
- Check stream key is valid for selected platform
- Verify platform authentication is complete
- Test connection with "Test Stream" button first

### High CPU usage
- Reduce FPS (try 30 instead of 60)
- Use NVENC/VCE/QSV instead of x264
- Lower resolution
- Use "Faster" or "Fast" encoder preset

### Poor video quality
- Increase bitrate (use "Custom" mode)
- Use "Slow" or "Slower" encoder preset
- Check internet connection speed
- Consider reducing resolution

### Connection drops
- Check network stability
- Monitor current bitrate (should match target)
- Try lower resolution/FPS combination
- Switch to "Reconnecting" status tracking

## Performance Notes

- Component re-renders minimally (memoized sections)
- Framer Motion animations are GPU-accelerated
- No external API calls except user-triggered actions
- Stats updates handled by parent component
- Supports real-time bitrate monitoring without lag

## Future Enhancements

Potential additions:
- Scene/source selection integrated UI
- Stream key preset management
- Platform-specific optimizations (per-platform encoders)
- Bandwidth throttling simulation
- Stream history and replay integration
- Cloud streaming backend support
