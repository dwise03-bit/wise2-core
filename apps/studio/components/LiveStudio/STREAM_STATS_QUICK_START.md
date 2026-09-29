# StreamStats Component - Quick Start Guide

## Installation

```bash
# Already included in apps/studio/components/LiveStudio/StreamStats.tsx
# Just import and use:

import { StreamStats, type StreamStatsSnapshot } from '@/components/LiveStudio';
```

## 30-Second Example

```tsx
import { StreamStats } from '@/components/LiveStudio';

export function Dashboard() {
  return (
    <StreamStats
      isLive={true}
      stats={{
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
      }}
    />
  );
}
```

## Core Concepts

### StreamStatsSnapshot
Your main data type - all metrics in one object:
```typescript
{
  viewers: 1234,           // Current viewer count
  bitrate: 5200,          // kbps
  fps: 60,                // Frames per second
  droppedFrames: 2,       // Count of dropped frames
  encodingLag: 45,        // ms
  networkLag: 30,         // ms (latency)
  renderingLag: 5,        // ms
  cpuUsage: 45,           // 0-100%
  gpuUsage: 65,           // 0-100%
  downBandwidth: 0.5,     // MB/s
  upBandwidth: 5.2,       // MB/s
}
```

### Key Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `isLive` | boolean | required | Show live indicator and controls |
| `stats` | StreamStatsSnapshot | mock data | Current metrics snapshot |
| `sessionHistory` | StreamSession[] | [] | List of past sessions |
| `isReconnecting` | boolean | false | Show reconnection UI |
| `reconnectAttempts` | number | 0 | Current attempt (1-5) |
| `reconnectCountdown` | number | 0 | Seconds to next retry |
| `onReconnect` | function | undefined | Called when user clicks reconnect |

## Common Patterns

### Pattern 1: Static Display (Demo/Testing)

```tsx
<StreamStats
  isLive={true}
  stats={currentSnapshot}
/>
```

### Pattern 2: Live Updates (WebSocket)

```tsx
const [stats, setStats] = useState<StreamStatsSnapshot>();

useEffect(() => {
  const ws = new WebSocket('ws://your-api/stats');
  ws.onmessage = (e) => setStats(JSON.parse(e.data));
  return () => ws.close();
}, []);

<StreamStats isLive={true} stats={stats} />
```

### Pattern 3: With Reconnection

```tsx
const [isReconnecting, setIsReconnecting] = useState(false);
const [attempts, setAttempts] = useState(0);
const [countdown, setCountdown] = useState(5);

const handleReconnect = async () => {
  setAttempts(a => Math.min(a + 1, 5));
  setCountdown(5);
  
  try {
    await api.reconnect();
    setIsReconnecting(false);
  } catch (error) {
    if (attempts >= 4) setIsReconnecting(false);
  }
};

<StreamStats
  isLive={isLive}
  stats={stats}
  isReconnecting={isReconnecting}
  reconnectAttempts={attempts}
  reconnectCountdown={countdown}
  onReconnect={handleReconnect}
/>
```

### Pattern 4: With Session History

```tsx
const sessions: StreamSession[] = [
  {
    id: '1',
    platform: 'twitch',
    startTime: new Date(),
    duration: 3600,
    avgViewers: 850,
    peakViewers: 1200,
    peakBitrate: 5800,
  },
  // ... more sessions
];

<StreamStats
  isLive={true}
  stats={stats}
  sessionHistory={sessions}
/>
```

## What You Get Out of the Box

1. **4 Real-Time Charts**
   - Bitrate trend
   - Frame rate with drop indicators
   - CPU usage
   - Network latency

2. **Health Indicator** 
   - Animated circle (green/yellow/red)
   - Hover tooltip with status

3. **Key Metrics Row**
   - Viewers + peak
   - Bitrate + trend
   - FPS + drops
   - Network lag

4. **Detailed Metrics**
   - All 11 metrics displayed
   - Color-coded status
   - Progress bars for resources

5. **Reconnection Flow**
   - Visual status
   - Attempt counter
   - Countdown timer
   - Manual reconnect button

6. **Stream History**
   - Last 5 sessions
   - Expandable panel
   - Searchable/sortable

## Styling

All styling is built-in with Tailwind CSS. Component uses:
- Dark gray background (gray-800/900)
- Color-coded metrics (blue, purple, green, orange, red)
- Responsive grid (2/3/4 columns based on screen size)
- Smooth animations via Framer Motion

No additional CSS needed!

## Real Data Integration

### From OBS WebSocket

```tsx
import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

const getStatsFromOBS = async () => {
  const stats = await obs.call('GetStreamStatus');
  return {
    timestamp: Date.now(),
    viewers: stats.outputActive ? 1000 : 0,
    bitrate: stats.outputSkippedFrames,
    fps: 60,
    droppedFrames: stats.outputSkippedFrames,
    encodingLag: stats.outputCongestion,
    networkLag: 30,
    renderingLag: 5,
    cpuUsage: 45,
    gpuUsage: 65,
    downBandwidth: 0.5,
    upBandwidth: stats.outputTotalFrames * 0.001,
  };
};
```

### From Your API

```tsx
const fetchStats = async () => {
  const res = await fetch('/api/stream/stats');
  return res.json(); // Must match StreamStatsSnapshot shape
};

useEffect(() => {
  const interval = setInterval(fetchStats, 500);
  return () => clearInterval(interval);
}, []);
```

## Troubleshooting

**Charts not showing?**
- Ensure `stats` prop is provided with all required fields
- Check that numbers are valid (not NaN or Infinity)
- Verify Tailwind CSS is properly configured

**Reconnection UI not appearing?**
- Set `isReconnecting={true}`
- Provide `reconnectAttempts` and `reconnectCountdown`
- Implement `onReconnect` callback

**Performance issues?**
- If updating > 1000 times/second, throttle updates
- Consider increasing `updateInterval`
- For many concurrent viewers, use backend aggregation

**Styles look wrong?**
- Verify Tailwind CSS is imported
- Check dark mode is enabled in tailwind.config.js
- Ensure parent has `bg-gray-900` or similar dark background

## File Structure

```
components/LiveStudio/
├── StreamStats.tsx              # Main component
├── StreamStatsExample.tsx        # Example/demo
├── STREAM_STATS_README.md        # Full documentation
└── STREAM_STATS_QUICK_START.md   # This file
```

## Next Steps

1. Copy the example component to test locally
2. Connect real stats via WebSocket or API
3. Customize colors in Tailwind if needed
4. Add alerts/notifications on threshold
5. Integrate with your streaming platform API

## API Reference

See `STREAM_STATS_README.md` for complete API docs with all props, types, and advanced patterns.
