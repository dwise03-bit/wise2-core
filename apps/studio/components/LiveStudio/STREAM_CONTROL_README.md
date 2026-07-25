# StreamControl Component

Professional OBS-style streaming control panel with multi-platform support, advanced encoder configuration, and real-time monitoring.

**File**: `/apps/studio/components/LiveStudio/StreamControl.tsx`  
**Export**: `StreamControl`, `StreamConfig`, `StreamStats`

## Quick Start

```tsx
import { StreamControl } from '@/components/LiveStudio';

export default function LiveStream() {
  return (
    <StreamControl
      onStartStream={async (config) => {
        console.log('Start streaming with:', config);
        // Send to OBS or backend
      }}
      onStopStream={async () => {
        console.log('Stop streaming');
      }}
    />
  );
}
```

## Features at a Glance

| Feature | Support | Details |
|---------|---------|---------|
| **Platforms** | ✅ Twitch, YouTube, Facebook, Custom RTMP | With OAuth auth |
| **Resolutions** | ✅ 480p - 4K (2160p) | 5 preset options |
| **Frame Rates** | ✅ 24, 30, 48, 50, 60 fps | Platform-adaptive |
| **Encoders** | ✅ x264, NVENC, AMD, Intel | 4 major options |
| **Advanced** | ✅ Preset, keyframe, B-frames, profile, level | Full H.264 control |
| **Bitrate** | ✅ Auto + Custom (500-51000 kbps) | Per-resolution presets |
| **Controls** | ✅ Test, Start, Pause, Stop | Full stream lifecycle |
| **Monitoring** | ✅ Viewers, uptime, bitrate | Real-time stats |
| **Auth** | ✅ OAuth flow integration | Platform-specific |

## Component Structure

```
StreamControl
├─ Status Display
│  ├─ Connection Status (Idle, Live, Paused, Error, etc.)
│  └─ Real-time Stats (viewers, uptime, bitrate)
├─ Platform Selection
│  ├─ Platform Buttons
│  └─ OAuth Authentication
├─ Stream Configuration
│  ├─ Stream Key Management (masked input, copy, reset)
│  ├─ Resolution & FPS Selection
│  ├─ Bitrate Control (auto vs custom)
│  └─ Encoder Selection
├─ Advanced Settings (Collapsible)
│  ├─ Encoder Preset Slider
│  ├─ Keyframe Interval
│  ├─ B-Frames Control
│  ├─ Profile Selection
│  └─ Level Selection
├─ Error Display
└─ Control Buttons
   ├─ Test Stream
   ├─ Start Stream
   ├─ Pause Stream (when live)
   └─ Stop Stream (when live)
```

## Props API

### StreamControlProps

```typescript
interface StreamControlProps {
  // State
  isStreaming?: boolean;

  // Handlers
  onStartStream?: (config: StreamConfig) => void | Promise<void>;
  onStopStream?: () => void | Promise<void>;
  onPauseStream?: () => void | Promise<void>;
  onTestStream?: (config: StreamConfig) => void | Promise<void>;
  onAuthPlatform?: (platform: Platform) => void | Promise<void>;

  // Data
  stats?: StreamStats;
  platformAuth?: Partial<Record<Platform, AuthStatus>>;
}
```

### Type Definitions

```typescript
type Platform = 'twitch' | 'youtube' | 'facebook' | 'custom';
type Resolution = '480p' | '720p' | '1080p' | '1440p' | '2160p';
type FPS = 24 | 30 | 48 | 50 | 60;
type Encoder = 'x264' | 'nvenc' | 'amd' | 'intel';

interface StreamConfig {
  platform: Platform;
  resolution: Resolution;
  fps: FPS;
  bitrate: number;
  encoder: Encoder;
  streamKey: string;
  encoderPreset?: string;
  keyframeInterval?: number;
  bFrames?: number;
  profile?: 'baseline' | 'main' | 'high';
  level?: string;
}

interface StreamStats {
  viewers?: number;
  uptime?: number;
  currentBitrate?: number;
}
```

## Usage Examples

### Basic Integration

```tsx
function StreamPage() {
  const [isLive, setIsLive] = useState(false);

  return (
    <StreamControl
      isStreaming={isLive}
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

### With Real-time Stats

```tsx
function StreamWithStats() {
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState<StreamStats>();

  // Poll stats every second when streaming
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      const res = await fetch('/api/stream/stats');
      setStats(await res.json());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  return <StreamControl isStreaming={isLive} stats={stats} />;
}
```

### With Platform Authentication

```tsx
function StreamWithAuth() {
  const [auth, setAuth] = useState({});

  const handleAuth = async (platform) => {
    const result = await oauthFlow(platform);
    setAuth(prev => ({
      ...prev,
      [platform]: { 
        authenticated: true, 
        username: result.username 
      }
    }));
  };

  return (
    <StreamControl
      onAuthPlatform={handleAuth}
      platformAuth={auth}
    />
  );
}
```

### Full-Featured Example

See `StreamControlExample.tsx` for a complete implementation with:
- Backend API integration
- Stats polling
- OAuth authentication flow
- Error handling
- Debug panel

## Bitrate Recommendations

Auto-mode uses these bitrate presets (in kbps):

| Res | 24fps | 30fps | 48fps | 50fps | 60fps |
|-----|-------|-------|-------|-------|-------|
| 480p | 800 | 1000 | 1200 | 1300 | 1500 |
| 720p | 2000 | 2500 | 3000 | 3200 | 5000 |
| 1080p | 4000 | 6000 | 7000 | 7500 | 12000 |
| 1440p | 6000 | 10000 | 12000 | 13000 | 18000 |
| 2160p | 12000 | 20000 | 24000 | 25000 | 35000 |

Custom mode allows 500-51000 kbps.

## Encoder Selection Guide

### x264 (Software)
- **When to use**: No dedicated GPU, strong CPU
- **Pros**: Universal compatibility, fine-tuned quality
- **Cons**: High CPU usage (30-50%)
- **Best for**: Desktop streaming with powerful CPU

### NVIDIA NVENC
- **When to use**: NVIDIA RTX GPU available
- **Pros**: Low CPU (<5%), high quality, real-time capable
- **Cons**: Requires NVIDIA GPU
- **Best for**: NVIDIA GPU owners (RTX 2000+, RTX 3000+)

### AMD VCE
- **When to use**: AMD RDNA GPU available
- **Pros**: Low CPU usage, good efficiency
- **Cons**: Limited to AMD RDNA architecture
- **Best for**: AMD RDNA GPU owners (RX 6000+)

### Intel QSW
- **When to use**: Intel Arc GPU or modern iGPU
- **Pros**: Integrated solution, low power
- **Cons**: Newer, fewer system support
- **Best for**: Intel Arc or 12th gen+ iGPU owners

## Encoder Preset Trade-offs

**CPU Cost → Quality →**

- **Ultrafast**: Minimal quality, real-time speed
- **Superfast**: Low quality, very fast
- **Veryfast**: Fair quality, good speed
- **Faster**: Good balance (recommended for 1080p@60)
- **Fast**: Better quality, moderate CPU (default)
- **Medium**: High quality, significant CPU
- **Slow**: Very high quality, heavy CPU
- **Slower**: Maximum quality, maximum CPU

**For streaming**: Use "Fast" or "Faster" preset.

## Stream Key Security

- Keys are **masked by default** (password input)
- Show/hide toggle for visibility control
- Copy button for quick clipboard
- Reset button with confirmation dialog
- Keys never logged to console in production

## Status Indicators

### Connection Status States

- **Idle** (gray): Not streaming
- **Connecting** (yellow, pulse): Attempting to connect
- **Live** (red, blink): Currently streaming (🔴 LIVE)
- **Paused** (orange): Stream paused (max 30s)
- **Reconnecting** (blue, pulse): Lost connection, retrying
- **Error** (red): Connection failed

### Stats Display

When streaming, shows in real-time:
- **Viewers**: Live viewer count from platform
- **Uptime**: HH:MM:SS format
- **Bitrate**: Current encoding bitrate (kbps)

## Event Handlers

All handlers accept `async` functions and errors are caught by the component.

### onStartStream

```typescript
onStartStream: async (config: StreamConfig) => {
  // config contains all streaming parameters
  // Validate, connect to OBS, update status
  // Errors are caught and displayed as "Connection Error"
}
```

### onStopStream

```typescript
onStopStream: async () => {
  // Stop the backend streaming process
  // Close platform connection
  // Errors shown as "Failed to stop stream"
}
```

### onPauseStream

```typescript
onPauseStream: async () => {
  // Pause without stopping
  // Max 30 seconds pause duration
  // Shows pause status in UI
}
```

### onTestStream

```typescript
onTestStream: async (config: StreamConfig) => {
  // Test connection without broadcasting
  // Validate stream key and encoder settings
  // Don't actually start stream
}
```

### onAuthPlatform

```typescript
onAuthPlatform: async (platform: Platform) => {
  // Trigger OAuth flow for platform
  // Get stream key from user account
  // Return authentication data
  // Component updates platformAuth state
}
```

## Styling & Customization

### Design System Integration

Uses WISE² design tokens via Tailwind:

```
studio-bg       // Dark background
studio-panel    // Slightly lighter panel
studio-raised   // Card/raised surfaces
studio-input    // Input field background
studio-line     // Border color
wise-primary    // Interactive elements
wise-accent     // Accent highlights
```

### Theme Support

Component respects `prefers-color-scheme` and works in:
- Light mode (via CSS media query)
- Dark mode (optimized, default)

### No CSS Required

All styling is inline Tailwind + Framer Motion. No external CSS files.

## Performance

- **Re-renders**: Minimal, only state changes
- **Animations**: GPU-accelerated via Framer Motion
- **Bundle size**: ~40KB minified (with framer-motion)
- **Dependencies**: React, Framer Motion, Lucide Icons

## Accessibility

✅ **WCAG AA Compliant**

- Semantic HTML (`<button>`, `<input>`, `<select>`)
- Focus indicators (blue outline)
- Disabled state management
- Keyboard navigation (Tab, Enter, Space)
- Screen reader labels
- Contrast ratio 4.5:1 minimum

## Troubleshooting

### Stream won't start
1. Check stream key is entered and valid
2. Ensure platform is authenticated
3. Use "Test Stream" button to validate
4. Check backend API response in console

### High CPU usage
1. Reduce FPS (60 → 30 or 48)
2. Switch encoder (x264 → NVENC/AMD/Intel)
3. Lower resolution (1080p → 720p)
4. Change preset (Medium → Faster)

### Poor video quality
1. Increase bitrate (use "Custom" mode)
2. Change preset (Faster → Slow)
3. Verify internet connection speed
4. Check platform limits

### Connection drops
1. Monitor real-time bitrate
2. Check network stability
3. Try lower resolution/FPS
4. Enable reconnecting status tracking

## Backend Requirements

Your backend should implement these endpoints:

```
POST /api/stream/validate          # Validate stream key
POST /api/stream/start             # Start streaming
POST /api/stream/stop              # Stop streaming
POST /api/stream/pause             # Pause stream
POST /api/stream/test              # Test connection
GET  /api/stream/stats             # Get live stats
POST /api/auth/[platform]/start    # OAuth start
GET  /api/auth/[platform]/status   # OAuth status
```

See `StreamControlExample.tsx` for implementation reference.

## Advanced Configuration

### Custom Encoder Presets

To support platform-specific encoders or presets, extend the types and add custom logic in your `onStartStream` handler:

```typescript
// Extend to support more encoders
type Encoder = 'x264' | 'nvenc' | 'amd' | 'intel' | 'custom';

// Handle platform-specific setup in handler
onStartStream: async (config) => {
  if (config.platform === 'twitch' && config.encoder === 'custom') {
    // Custom Twitch-specific encoding
  }
}
```

### Platform-Specific Defaults

Set different defaults per platform:

```typescript
const getDefaultConfig = (platform) => {
  switch (platform) {
    case 'twitch':
      return { resolution: '1080p', fps: 60, encoder: 'nvenc' };
    case 'youtube':
      return { resolution: '720p', fps: 30, encoder: 'x264' };
    default:
      return { resolution: '1080p', fps: 60, encoder: 'x264' };
  }
};
```

## Future Enhancements

Potential additions (not yet implemented):

- [ ] Scene/source selection UI
- [ ] Stream key presets & history
- [ ] Platform-specific optimizations
- [ ] Bandwidth throttling simulation
- [ ] Stream recording archive
- [ ] Advanced audio controls
- [ ] Network statistics graph
- [ ] Custom RTMP validation

## Migration from OBSStreamControl

If upgrading from the older `OBSStreamControl` component:

**Breaking Changes**:
- `resolution` prop renamed to `Resolution` type (480p-2160p)
- `fps` prop expanded (24, 30, 48, 50, 60)
- `bitrate` auto/custom logic changed
- `encoder` now has 4 options instead of 2
- New required props: `stats`, `platformAuth`

**New Features**:
- Advanced encoder settings
- Pause stream capability
- Platform authentication
- Real-time statistics
- Uptime tracking

**Migration Path**:
1. Replace imports: `OBSStreamControl` → `StreamControl`
2. Add handler functions for new events
3. Implement stats polling
4. Add authentication handler

See `StreamControlExample.tsx` for complete migration.

## Code Quality

- ✅ TypeScript strict mode
- ✅ React best practices (hooks, memoization)
- ✅ Proper error handling
- ✅ No external API calls (parent-controlled)
- ✅ 910 lines, well-commented
- ✅ Follows WISE² code conventions

## Support & Questions

- See `STREAM_CONTROL_GUIDE.md` for detailed documentation
- See `StreamControlExample.tsx` for usage examples
- Check component JSDoc comments for inline help
- Review bitrate/encoder tables in this README

---

**Version**: 1.0.0  
**Created**: 2026-07-24  
**Last Updated**: 2026-07-24
