# Multistreaming UI Component

Professional multi-platform live streaming control center for WISE² Studio.

## Overview

The `Multistreaming` component enables simultaneous broadcasting to multiple platforms with synchronized encoding, per-platform monitoring, and intelligent failover protection.

### Supported Platforms

- **Twitch** (OAuth, latency: ~5s)
- **YouTube** (OAuth, latency: ~10s)
- **Facebook Live** (OAuth, latency: ~7s)
- **Custom RTMP** (Manual configuration)

## Features

### 1. Multi-Platform Selector
- Checkbox-based platform selection
- Real-time connection status per platform
- Quick enable/disable without losing configuration

```typescript
// Platform states
- Idle (not selected)
- Disconnected (selected but not connected)
- Connected (actively streaming)
- Error (connection failed)
```

### 2. Synchronized Encoding
- Single encoding profile for all platforms
- Shared resolution (480p, 720p, 1080p, 1440p, 2160p)
- Shared frame rate (24, 30, 48, 50, 60 FPS)
- Baseline bitrate setting (applied per-platform with optimization)

#### Bitrate Optimization
Each platform receives optimized bitrate based on:
1. Platform capabilities
2. Resolution selected
3. Baseline bitrate setting
4. Available bandwidth

```typescript
// Example: 720p baseline 3500 kbps
Twitch:    2500-6000 kbps (3500 recommended)
YouTube:   1500-8000 kbps (3500 recommended)
Facebook:  1000-4000 kbps (3500 recommended)
Custom:    3500 kbps (as configured)
```

### 3. Per-Platform Real-Time Monitoring

Each connected platform displays:

| Metric | Description |
|--------|-------------|
| **Status** | Connected, Disconnected, Error |
| **Viewers** | Live viewer count (when connected) |
| **Bitrate** | Current/Target bitrate in kbps |
| **Latency** | Platform-specific latency compensation |
| **Reconnect Attempts** | Number of reconnection tries |

Status indicators:
- 🟢 **Green**: Connected, all metrics normal
- 🟡 **Amber**: Connected but degraded (bitrate, latency issues)
- 🔴 **Red**: Disconnected or error

### 4. Dashboard Overview

Four-card header showing aggregate metrics:

1. **Connected Platforms**: `X / Y` platforms active
2. **Total Viewers**: Aggregated viewer count across all platforms
3. **Average Bitrate**: Mean bitrate across all platforms
4. **Status**: Overall health (Ready, Errors, Idle)

### 5. Failover & Resilience

#### Failover Settings

```typescript
interface FailoverSettings {
  enableFailover: boolean;           // Enable automatic recovery
  continueOnDisconnect: boolean;     // Keep streaming if one platform fails
  maxReconnectAttempts: number;      // Max retry count (1-10)
}
```

#### Failover Behavior

When enabled and a platform disconnects:

1. System detects connection loss
2. Initiates automatic reconnection (up to `maxReconnectAttempts`)
3. If `continueOnDisconnect` is true, other platforms keep streaming
4. Exponential backoff: 2s, 4s, 8s, etc. between attempts
5. User notified via error indicator and count badge

#### Example: 3 Platforms, 1 Fails

```
Before:  Twitch ✓  YouTube ✓  Facebook ✓
Failure: Twitch ✗  YouTube ✓  Facebook ✓
Result:  Streaming continues to YouTube & Facebook
         Twitch reconnect in progress (1/5 attempts)
         User can disable Twitch or wait for auto-recovery
```

### 6. Platform-Specific Settings

Each platform supports customization via modal:

- **Latency Delay** (0-30000 ms)
  - YouTube: +10000 ms (10s built-in latency)
  - Twitch: +3000-5000 ms
  - Facebook: +7000 ms
  - Custom: 0 ms (network-dependent)

- **Ingest Server Selection** (platform-dependent)
  - Twitch: 6 regional servers (US East, US West, EU, AP)
  - YouTube: 3 backup servers
  - Facebook: 1 primary server
  - Custom: User-specified

## API & Props

### Component Props

```typescript
interface MultistreamsProps {
  // Callback when platforms connected
  onConnect?: (platforms: StreamingPlatform[]) => void;

  // Callback when platform disconnected
  onDisconnect?: (platform: StreamingPlatform) => void;

  // Callback when encoding settings changed
  onEncodingChange?: (settings: EncodingSettings) => void;

  // Callback when failover settings changed
  onSettingsChange?: (settings: FailoverSettings) => void;
}
```

### Data Types

#### EncodingSettings
```typescript
interface EncodingSettings {
  resolution: '480p' | '720p' | '1080p' | '1440p' | '2160p';
  fps: 24 | 30 | 48 | 50 | 60;
  baselineBitrate: number; // kbps
}
```

#### FailoverSettings
```typescript
interface FailoverSettings {
  enableFailover: boolean;
  continueOnDisconnect: boolean;
  maxReconnectAttempts: number; // 1-10
}
```

#### PlatformStreamStatus
```typescript
interface PlatformStreamStatus {
  platform: StreamingPlatform;
  isEnabled: boolean;
  isConnected: boolean;
  viewerCount: number;
  bitrateCurrent: number;      // kbps
  bitrateTarget: number;       // kbps
  error?: string;
  latencyDelay: number;        // ms
  reconnectAttempts: number;
}
```

## Usage Examples

### Basic Integration

```typescript
import Multistreaming from '@/components/LiveStudio/Multistreaming';

export default function LiveStudio() {
  return (
    <Multistreaming
      onConnect={(platforms) => {
        console.log('Starting streams to:', platforms);
        // Initialize streaming to selected platforms
      }}
      onDisconnect={(platform) => {
        console.log('Stopped streaming to:', platform);
        // Clean up resources for this platform
      }}
      onEncodingChange={(settings) => {
        console.log('Encoding updated:', settings);
        // Update encoder configuration
      }}
      onSettingsChange={(settings) => {
        console.log('Failover settings updated:', settings);
        // Update reconnection policy
      }}
    />
  );
}
```

### With State Management

```typescript
import { useState, useCallback } from 'react';
import Multistreaming from '@/components/LiveStudio/Multistreaming';

export default function StreamControl() {
  const [activeStreams, setActiveStreams] = useState<Set<StreamingPlatform>>(
    new Set()
  );

  const handleConnect = useCallback((platforms: StreamingPlatform[]) => {
    setActiveStreams(new Set(platforms));

    // Initialize streaming API calls
    platforms.forEach((platform) => {
      initiateStream(platform);
    });
  }, []);

  const handleDisconnect = useCallback((platform: StreamingPlatform) => {
    setActiveStreams((prev) => {
      const updated = new Set(prev);
      updated.delete(platform);
      return updated;
    });

    stopStream(platform);
  }, []);

  return (
    <Multistreaming
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
    />
  );
}
```

### With Backend Integration

```typescript
import Multistreaming, {
  EncodingSettings,
  FailoverSettings,
} from '@/components/LiveStudio/Multistreaming';
import { useStreamingAPI } from '@/hooks/useStreamingAPI';

export default function StreamManager() {
  const api = useStreamingAPI();

  const handleEncodingChange = async (settings: EncodingSettings) => {
    // Update encoder on server
    await api.updateEncoding({
      resolution: settings.resolution,
      fps: settings.fps,
      bitrate: settings.baselineBitrate,
    });

    // Reconfigure all active streams
    await api.reconfigureAllStreams();
  };

  const handleFailoverChange = async (settings: FailoverSettings) => {
    // Update failover policy on server
    await api.updateFailoverPolicy(settings);
  };

  return (
    <Multistreaming
      onEncodingChange={handleEncodingChange}
      onSettingsChange={handleFailoverChange}
    />
  );
}
```

## Implementation Guide

### Server-Side Streaming (Recommended)

The component provides UI for configuration. Server handles actual streaming:

```typescript
// Backend (Node.js/NestJS example)
import { FFmpeg } from 'fluent-ffmpeg';

class MultiStreamingService {
  private streams: Map<StreamingPlatform, FFmpegProcess> = new Map();

  async startMultiStream(
    inputSource: string,
    platforms: StreamingPlatform[],
    encoding: EncodingSettings
  ) {
    for (const platform of platforms) {
      const streamUrl = await this.getStreamUrl(platform);
      const rtmpUrl = `${streamUrl}${streamKey}`;

      const process = FFmpeg(inputSource)
        .videoCodec('libx264')
        .videoFilters(`scale=${encoding.resolution}`)
        .fps(encoding.fps)
        .videoBitrate(encoding.baselineBitrate)
        .format('flv')
        .output(rtmpUrl)
        .on('error', (err) => this.handleStreamError(platform, err))
        .on('end', () => this.handleStreamEnd(platform))
        .run();

      this.streams.set(platform, process);
      this.broadcastStats(platform, 'connecting');
    }
  }

  async stopMultiStream(platform?: StreamingPlatform) {
    if (platform) {
      this.streams.get(platform)?.kill();
      this.streams.delete(platform);
    } else {
      this.streams.forEach((stream) => stream.kill());
      this.streams.clear();
    }
  }
}
```

### Client-Side WebSocket Updates

```typescript
// Real-time stats updates
useEffect(() => {
  const socket = io('/stream-stats');

  socket.on('platform:stats', (data) => {
    setPlatformStats((prev) => {
      const updated = new Map(prev);
      const stat = updated.get(data.platform);
      if (stat) {
        stat.viewerCount = data.viewers;
        stat.bitrateCurrent = data.bitrate;
        stat.isConnected = data.connected;
      }
      return updated;
    });
  });

  socket.on('platform:error', (data) => {
    setPlatformStats((prev) => {
      const updated = new Map(prev);
      const stat = updated.get(data.platform);
      if (stat) {
        stat.error = data.message;
        stat.isConnected = false;
      }
      return updated;
    });
  });

  return () => socket.disconnect();
}, []);
```

## Styling & Customization

### Design Tokens

Uses WISE² color palette:

```css
/* Primary */
--color-amber-500: #f59e0b;  /* Accents */
--color-amber-600: #d97706;  /* Hover */

/* Secondary */
--color-blue-500: #3b82f6;   /* Info */
--color-green-400: #4ade80;  /* Success */
--color-red-400: #f87171;    /* Error */

/* Background */
--color-slate-900: #0f172a;  /* Dark bg */
--color-slate-800: #1e293b;  /* Card bg */
--color-slate-700: #334155;  /* Borders */
```

### Responsive Breakpoints

- Mobile: Single column (full width)
- Tablet (sm): 2 columns
- Desktop (lg): 4 columns (header), 2 columns (platforms)

### Dark Mode Support

Component uses Tailwind dark mode classes. Automatically adapts to system preference or `prefers-color-scheme`.

## Performance Considerations

### Optimization Tips

1. **Memoization**: Use `useMemo` for computed stats (total viewers, avg bitrate)
2. **Debouncing**: Debounce latency/bitrate changes to prevent excessive re-renders
3. **Virtualization**: For large lists of past streams, use virtualization
4. **Code Splitting**: Lazy load component if not always visible

```typescript
import dynamic from 'next/dynamic';

const Multistreaming = dynamic(
  () => import('@/components/LiveStudio/Multistreaming'),
  { ssr: false } // Client-side only
);
```

### Stats Update Frequency

- **Header metrics**: Update every 1 second
- **Platform stats**: Update every 1 second
- **Reconnection status**: Update every 2 seconds

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid stream key format" | Wrong key for platform | Re-validate key in PlatformSettings |
| "Connection timeout" | Network issue | Check internet, retry connection |
| "Ingest server unreachable" | Wrong server region | Select different ingest server |
| "Encoder not available" | Missing hardware | Fall back to software encoder |
| "Single platform failure" | Platform-specific issue | Other platforms continue (if failover enabled) |

### Error Recovery

Component automatically:
1. Logs error with timestamp
2. Updates platform status to "Error"
3. Initiates reconnection if failover enabled
4. Displays user-friendly error message
5. Suggests remediation steps

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Multistreaming from './Multistreaming';

describe('Multistreaming', () => {
  it('should enable/disable platforms', () => {
    render(<Multistreaming />);
    const twitchCheckbox = screen.getByLabelText('Twitch');
    fireEvent.click(twitchCheckbox);
    expect(twitchCheckbox).toBeChecked();
  });

  it('should update encoding settings', () => {
    const onEncodingChange = jest.fn();
    render(<Multistreaming onEncodingChange={onEncodingChange} />);
    // ... assertions
  });

  it('should show error states', () => {
    render(<Multistreaming />);
    // Simulate error
    // ... assertions
  });
});
```

## Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support (Tab, Enter, Space)
- ✅ Color-blind safe status indicators (icons + text)
- ✅ Screen reader friendly hierarchy
- ✅ Sufficient color contrast (WCAG AA)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Custom encoding presets (Gaming, Talk Show, Music)
- [ ] Audio-only streaming mode
- [ ] Clip recording from each platform
- [ ] Chat aggregation from all platforms
- [ ] Automated video quality optimization
- [ ] Streaming analytics dashboard
- [ ] Recording & archive management
- [ ] Social media posting automation

## Troubleshooting

### Component Not Rendering

```typescript
// Ensure parent has proper theme context
import { ThemeProvider } from '@/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Multistreaming />
    </ThemeProvider>
  );
}
```

### Stats Not Updating

- Check WebSocket connection
- Verify backend is emitting stats events
- Check browser console for errors
- Ensure server is running

### Failover Not Working

- Verify `enableFailover` is true in settings
- Check `maxReconnectAttempts` value (should be 1-10)
- Verify `continueOnDisconnect` is enabled
- Check server logs for reconnection attempts

## References

- [WISE² Design System](./DESIGN_SYSTEM.md)
- [Streaming Types](./streamingTypes.ts)
- [Streaming Constants](./streamingConstants.ts)
- [Platform Configurations](./streamingConstants.ts#L18)
- [Live Studio Guide](./STREAM_CONTROL_README.md)

## License

WISE² Project - Proprietary
