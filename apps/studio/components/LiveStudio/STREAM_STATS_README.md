# StreamStats Component - OBS-Style Streaming Analytics Dashboard

A professional real-time streaming statistics dashboard component for monitoring live broadcast quality, performance metrics, and stream health. Designed for OBS integration and compatible with Twitch, YouTube, Facebook, and custom streaming platforms.

## Features

### 1. Key Metrics Display (Top Row)
- **Viewers**: Current viewer count with peak tracking
- **Bitrate**: Current bitrate (kbps) with trend indicator (↑ rising, ↓ dropping, → stable)
- **FPS**: Current vs target FPS (e.g., "60/60") with frame drop counter
- **Network Lag**: Real-time network latency to streaming platform (ms)

### 2. Real-Time Charts (Last 60 Seconds)
Four interactive SVG-based charts with auto-scaling:
- **Bitrate Chart**: Green line showing bitrate trend over time
- **Frame Rate Chart**: Shows current FPS with red indicators for frame drops
- **CPU Usage Chart**: Area chart showing CPU utilization
- **Network Latency Chart**: Spiky line chart showing network latency variations

All charts update every 500ms by default and maintain 60-point rolling history.

### 3. Detailed Metrics Section
Grid display of critical metrics with color-coded status indicators:
- **Encoding Lag**: Time to encode frame (ms) - Good/Moderate/High
- **Network Lag**: Latency to platform (ms) - Good/Okay/Poor
- **Rendering Lag**: Canvas rendering time (ms)
- **CPU Usage**: Processor utilization with progress bar
- **GPU Usage**: GPU utilization with progress bar
- **Bandwidth**: Download/Upload speeds (MB/s)

### 4. Health Indicator
Animated circular health status indicator with three levels:
- **Good** (Green): <3% drops, <50ms lag, <70% CPU
- **Okay** (Yellow): 1-3% drops, 30-50ms lag, 70-80% CPU
- **Poor** (Red): >3% drops, >50ms lag, >80% CPU

Hover to see status breakdown and recommendations.

### 5. Reconnection Management
Automatic reconnection flow with visual feedback:
- "Reconnecting" status with attempt counter (e.g., "Attempt 2/5")
- Countdown timer showing seconds until next retry
- Progress bar showing retry countdown
- Manual "Reconnect Now" button for immediate retry
- Automatic status update when max attempts reached

### 6. Stream History (Expandable)
Collapsible history panel showing last 5 streaming sessions:
- **Date & Time**: When stream started
- **Platform**: Twitch, YouTube, Facebook, or custom
- **Duration**: Total streaming time
- **Avg Viewers**: Average concurrent viewers
- **Peak Viewers**: Highest concurrent viewers
- **Peak Bitrate**: Maximum bitrate achieved

## Usage

### Basic Implementation

```tsx
import { StreamStats } from '@/components/LiveStudio';

export function MyStreamDashboard() {
  const [stats, setStats] = useState<StreamStatsSnapshot>({
    timestamp: Date.now(),
    viewers: 1234,
    bitrate: 5200,
    fps: 60,
    droppedFrames: 2,
    encodingLag: 45,
    networkLag: 30,
    renderingLag: 5,
    cpuUsage: 45,
    gpuUsage: 65,
    downBandwidth: 0.5,
    upBandwidth: 5.2,
  });

  return (
    <StreamStats
      isLive={true}
      stats={stats}
      sessionHistory={previousSessions}
    />
  );
}
```

### With Real-Time Updates

```tsx
import { StreamStats, type StreamStatsSnapshot } from '@/components/LiveStudio';

export function LiveStreamDashboard() {
  const [stats, setStats] = useState<StreamStatsSnapshot | undefined>();
  const [isLive, setIsLive] = useState(false);

  // Subscribe to stats updates (e.g., from WebSocket)
  useEffect(() => {
    if (!isLive) return;

    const unsubscribe = subscribeToStreamStats((newStats) => {
      setStats(newStats);
    });

    return unsubscribe;
  }, [isLive]);

  return (
    <StreamStats
      isLive={isLive}
      stats={stats}
      sessionHistory={sessions}
      autoUpdate={false} // Manual updates via subscription
    />
  );
}
```

### With Reconnection Handling

```tsx
const [isReconnecting, setIsReconnecting] = useState(false);
const [reconnectAttempts, setReconnectAttempts] = useState(0);
const [reconnectCountdown, setReconnectCountdown] = useState(5);

const handleReconnect = async () => {
  setReconnectAttempts(prev => Math.min(prev + 1, 5));
  setReconnectCountdown(5);
  
  try {
    await api.reconnectStream();
    setIsReconnecting(false);
    setIsLive(true);
  } catch (error) {
    if (reconnectAttempts >= 4) {
      setIsReconnecting(false);
      handleStreamError(error);
    }
  }
};

<StreamStats
  isLive={isLive}
  stats={currentStats}
  isReconnecting={isReconnecting}
  reconnectAttempts={reconnectAttempts}
  reconnectCountdown={reconnectCountdown}
  onReconnect={handleReconnect}
  sessionHistory={sessions}
/>
```

## Props Reference

### StreamStatsProps

```typescript
interface StreamStatsProps {
  // Required
  isLive: boolean;
  
  // Stats data (uses default mock if not provided)
  stats?: StreamStatsSnapshot;
  
  // Callbacks
  onReconnect?: () => void | Promise<void>;
  
  // History
  sessionHistory?: StreamSession[];
  
  // Reconnection state
  reconnectAttempts?: number;           // Current attempt (1-5)
  reconnectCountdown?: number;          // Seconds until next retry
  isReconnecting?: boolean;
  
  // Behavior
  autoUpdate?: boolean;                 // Auto-generate mock updates
  updateInterval?: number;              // Update frequency in ms
}
```

### StreamStatsSnapshot

```typescript
interface StreamStatsSnapshot {
  timestamp: number;
  viewers: number;
  bitrate: number;              // kbps
  fps: number;
  droppedFrames: number;
  encodingLag: number;          // ms
  networkLag: number;           // ms
  renderingLag: number;         // ms
  cpuUsage: number;             // %
  gpuUsage: number;             // %
  downBandwidth: number;        // MB/s
  upBandwidth: number;          // MB/s
}
```

### StreamSession

```typescript
interface StreamSession {
  id: string;
  platform: 'twitch' | 'youtube' | 'facebook' | 'custom';
  startTime: Date;
  endTime?: Date;
  duration: number;             // seconds
  avgViewers: number;
  peakViewers: number;
  peakBitrate: number;          // kbps
}
```

## Styling & Customization

### Dark Theme
The component uses Tailwind CSS with a dark theme optimized for streaming dashboards:
- Background: Slate gray (gray-800, gray-900)
- Accent colors: Blue, purple, green, orange, red, pink
- Text: White primary, gray secondary
- Borders: Subtle gray with colored variants

### Color-Coded Status Indicators
- **Green**: Healthy metrics (<3% drops, <30ms lag, <60% CPU)
- **Yellow**: Warning zone (1-3% drops, 30-50ms lag, 60-80% CPU)
- **Red**: Critical state (>3% drops, >50ms lag, >80% CPU)

### Animations
Uses Framer Motion for:
- Smooth metric card entrance
- Health indicator pulsing
- Chart data updates
- Reconnection progress
- History expansion/collapse

### Responsive Layout
- Mobile (< 640px): 2-column metric grid, single-column charts
- Tablet (640px - 1024px): 3-column metric grid, 2-column charts
- Desktop (> 1024px): 4-column metric grid, 2-column charts

## Integration Examples

### With OBS WebSocket
```tsx
import { OBSWebSocket } from 'obs-websocket-js';

const obs = new OBSWebSocket();

useEffect(() => {
  obs.on('StreamStateChanged', (event) => {
    if (event.outputActive) {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  });
}, []);

// Poll OBS for stats
useInterval(() => {
  const stats = obs.call('GetStreamStatus');
  setStats(convertObsToStreamStats(stats));
}, 500);
```

### With Custom API
```tsx
// Fetch stats from your backend API
useEffect(() => {
  if (!isLive) return;
  
  const interval = setInterval(async () => {
    const response = await fetch('/api/stream/stats');
    const data = await response.json();
    setStats(data);
  }, 500);

  return () => clearInterval(interval);
}, [isLive]);
```

### With WebSocket
```tsx
const ws = new WebSocket('ws://your-server/stream-stats');

ws.onmessage = (event) => {
  const stats = JSON.parse(event.data);
  setStats(stats);
};
```

## Performance Considerations

1. **Chart Rendering**: SVG charts re-render every 500ms by default. For heavy-duty streaming with 1000+ concurrent users, consider:
   - Increasing `updateInterval` to 1000ms
   - Using Canvas-based charts for larger datasets
   - Memoizing chart components

2. **History Display**: Only shows last 5 sessions by default to reduce DOM nodes. Increase if needed:
   ```tsx
   {sessionHistory.slice(0, 10).map(...)} // Show last 10 instead
   ```

3. **Memory Usage**: Stats history maintains 60-point rolling buffer (~60KB per metric). For extended monitoring, consider:
   - Archiving old data
   - Downsampling historical data
   - External time-series database

## Browser Support

- Modern browsers with ES2020+ support
- Requires React 18+
- Framer Motion and Tailwind CSS required

## Accessibility

- Semantic HTML with proper heading hierarchy
- Color-coded indicators include text labels (not color-only)
- Icons from lucide-react with readable labels
- Keyboard-accessible buttons and controls
- ARIA labels for health indicator tooltips

## Dependencies

- `react`: ^18.3.1
- `framer-motion`: ^11.0.3 (animations)
- `lucide-react`: ^0.312.0 (icons)
- `tailwindcss`: (styling)

## Example Component

See `StreamStatsExample.tsx` for a complete working example with:
- Mock data generation
- Live/offline toggle
- Simulated disconnection flow
- Reconnection handling
- Session history display

Run with:
```bash
npm run dev # Start dev server
# Navigate to the example component route
```

## Future Enhancements

Potential additions:
- Bitrate/quality presets with auto-adjustment
- Frame drop recovery recommendations
- Bandwidth prediction/forecasting
- Integration with streaming platform analytics
- Custom metric tracking
- Data export (CSV, JSON)
- Historical trend analysis
- Alert thresholds and notifications
- Multi-platform simultaneous streaming stats

## License

Part of WISE² Creative Studio. See LICENSE file.

## Support

For issues, feature requests, or questions:
1. Check `StreamStatsExample.tsx` for common patterns
2. Review the `StreamStatsSnapshot` interface for data format
3. Consult Framer Motion docs for animation customization
4. Reference Tailwind CSS for styling modifications
