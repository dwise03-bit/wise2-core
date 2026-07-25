# Live Studio - Streaming Control System

Professional streaming control system for the WISE² Creative Studio. Provides multi-platform streaming, real-time statistics monitoring, and advanced encoding configuration.

## Features

### 1. **StreamingControl.tsx**
Main streaming control interface with:
- Platform selector (Twitch, YouTube, Facebook, Custom RTMP)
- Stream key management (masked display, copy, reset)
- Resolution selector (480p - 2160p)
- FPS selection (24, 30, 48, 50, 60)
- Bitrate control (auto or custom 2500-6000 kbps)
- Encoder selection (x264, NVIDIA NVENC, AMD VCE, Intel QSV)
- Preset configuration (ultrafast to slower)
- Advanced settings (keyframe interval, B-frames, profile, level)
- Test stream functionality
- Start/Stop streaming buttons
- Real-time status badge

### 2. **PlatformSettings.tsx**
Platform configuration modal with:
- OAuth login per platform
- Stream key validation
- Secure credential storage
- Ingest server selection (multi-region)
- Platform-specific settings
- Stream key reset capability
- Recommended bitrate display

### 3. **StreamStats.tsx**
Real-time statistics dashboard showing:
- Viewer count
- Current/average bitrate
- Frame rate (current vs target)
- Dropped frames (count + percentage)
- Encoding lag
- Network latency
- CPU/GPU usage
- Uptime counter
- Reconnection counter
- Health status indicator (Good/Okay/Poor)
- FPS and bitrate graphs (60-second history)
- Performance issue alerts

### 4. **StreamTransport.tsx**
Transport controls including:
- Play/Pause buttons (pause up to 30s with auto-resume)
- Pause countdown timer
- Mute audio output (local-only, not on stream)
- Screenshot capture
- Disconnect button
- Status indicator
- Keyboard shortcut hints

### 5. **useStreamingState.ts**
Custom React hook managing:
- Stream state (idle, connecting, live, paused, error)
- Settings management
- Credential storage
- Statistics simulation
- Stream lifecycle (start, stop, pause, resume)
- Test stream validation
- Screenshot capture

### 6. **streamingTypes.ts**
TypeScript type definitions for:
- Platform configurations
- Stream settings and statistics
- Resolution and encoding options
- Health status tracking
- State management types
- Context API types

### 7. **streamingConstants.ts**
Configuration constants including:
- Platform RTMP servers (multi-region)
- Resolution presets
- FPS options
- Bitrate presets
- Encoder capabilities
- Health thresholds
- Error/success messages
- UI constants

## Usage

### Basic Integration

```tsx
import LiveStudio from '@/components/LiveStudio';

export default function StudioPage() {
  return (
    <div className="container mx-auto p-6">
      <LiveStudio />
    </div>
  );
}
```

### Using Individual Components

```tsx
import {
  StreamingControl,
  StreamStats,
  StreamTransport,
} from '@/components/LiveStudio';
import { useStreamingState } from '@/components/LiveStudio/useStreamingState';

export default function CustomStream() {
  const { state, startStream, stopStream, pauseStream } = useStreamingState();

  return (
    <>
      <StreamingControl
        isLive={state.status === 'live'}
        onStreamStart={startStream}
        onStreamStop={stopStream}
      />
      {state.status === 'live' && (
        <>
          <StreamStats stats={state.stats} isLive={true} />
          <StreamTransport
            isLive={true}
            isPaused={state.isPaused}
            onPause={pauseStream}
          />
        </>
      )}
    </>
  );
}
```

## API Reference

### useStreamingState Hook

```typescript
const {
  state,                 // Current StreamState
  updateSettings,        // (partial: Partial<StreamSettings>) => void
  updateCredentials,     // (credentials: PlatformCredentials) => void
  startStream,          // () => Promise<void>
  stopStream,           // () => void
  pauseStream,          // () => Promise<void>
  resumeStream,         // () => Promise<void>
  testStream,           // () => Promise<boolean>
  resetStreamKey,       // () => Promise<string>
  captureScreenshot,    // () => Promise<Blob | null>
} = useStreamingState();
```

### StreamState Interface

```typescript
interface StreamState {
  status: 'idle' | 'connecting' | 'live' | 'reconnecting' | 'error' | 'paused';
  settings: StreamSettings;
  credentials: PlatformCredentials | null;
  stats: StreamStats;
  health: 'good' | 'okay' | 'poor';
  isPaused: boolean;
  lastError?: string;
}
```

### StreamSettings Interface

```typescript
interface StreamSettings {
  platform: 'twitch' | 'youtube' | 'facebook' | 'custom-rtmp';
  resolution: ResolutionSettings;
  fps: 24 | 30 | 48 | 50 | 60;
  bitrate: BitrateSettings;
  encoder: EncoderSettings;
}
```

## Platform Support

### Twitch
- OAuth required
- Recommended bitrate: 2500-6000 kbps
- Supported resolutions: 480p, 720p, 1080p
- Multiple regional ingest servers

### YouTube
- OAuth required
- Recommended bitrate: 1500-8000 kbps
- Supported resolutions: 480p, 720p, 1080p, 1440p, 2160p
- All FPS options supported

### Facebook
- OAuth required
- Recommended bitrate: 1000-4000 kbps
- Supported resolutions: 480p, 720p, 1080p
- Fixed 30 FPS

### Custom RTMP
- Manual configuration
- Any bitrate/resolution
- Suitable for custom streaming servers

## Health Monitoring

The system automatically categorizes stream health based on:

**Good Status:**
- Dropped frames: < 2%
- CPU usage: < 70%
- GPU usage: < 80%
- Network latency: < 100ms
- Encoding lag: < 50ms

**Okay Status:**
- Dropped frames: 2-5%
- CPU usage: 70-85%
- GPU usage: 80-90%
- Network latency: 100-200ms
- Encoding lag: 50-100ms

**Poor Status:**
- Any metric exceeds "Okay" thresholds

## Styling

All components use Tailwind CSS with dark theme:
- Background: `from-slate-900 to-slate-800`
- Borders: `border-slate-700`
- Text: `text-white` / `text-gray-300`
- Accent: `text-amber-400` / `bg-amber-600`
- Success: `text-green-400` / `bg-green-600`
- Alert: `text-red-400` / `bg-red-600`

## Performance Optimization

- Stats updates throttled to 1-second intervals
- Graph data limited to 60-second history
- Efficient state management with React hooks
- Memoized callbacks to prevent unnecessary re-renders
- Lazy component loading supported

## Browser Compatibility

- Modern browsers with Web APIs support
- Canvas API for screenshot capture
- Fetch API for credential management
- LocalStorage for credential caching (optional)

## Future Enhancements

- [ ] WebRTC preview stream
- [ ] Scene switching integration
- [ ] Multi-streaming to multiple platforms
- [ ] Advanced bitrate adapting
- [ ] Stream recording with segments
- [ ] Live chat integration
- [ ] Stream scheduling
- [ ] Analytics dashboard
- [ ] Custom alerts and notifications

## Security Considerations

- Stream keys encrypted in transit
- OAuth tokens stored securely
- HTTPS required for production
- No credentials in URL parameters
- Secure credential storage recommended
- Rate limiting on API calls

## Development

### Testing

```bash
# Run tests
npm test -- components/LiveStudio

# Type checking
npm run type-check

# Storybook preview
npm run storybook
```

### Building

The components are part of the main Studio app build process:

```bash
npm run build
```

## License

Part of WISE² Genesis - Proprietary
