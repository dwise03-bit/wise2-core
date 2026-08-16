# WISE² Studio WebSocket Server & Client

Real-time communication infrastructure for Suno music generation, OBS streaming, and cross-module notifications.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              StudioWebSocketServer (Port 3006)              │
├────────────────────┬────────────────────┬──────────────────┤
│  /suno Namespace   │  /obs Namespace    │ /studio Namespace│
├────────────────────┼────────────────────┼──────────────────┤
│ • sunoProgress     │ • streamStatus     │ • notification   │
│ • sunoComplete     │ • sceneSwitch      │ • activityFeed   │
│ • sunoError        │ • sourceUpdate     │                  │
│                    │ • statsUpdate      │                  │
└────────────────────┴────────────────────┴──────────────────┘
              ↓              ↓              ↓
       Connected to:  Connected to:  Connected to:
  StudioWebSocketClient (Browser/Node)
       ├─ suno client
       ├─ obs client
       └─ studio client
```

## Server-Side Usage

### Setup (NestJS Backend)

```typescript
// main.ts
import { initializeWebSocketServer } from '@wise2/studio/lib/websocket';

const app = await NestFactory.create(AppModule);

// Initialize WebSocket server
const wsServer = initializeWebSocketServer(3006, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3005',
    credentials: true,
  },
});

// Listen for server-ready event
wsServer.on('ready', ({ port }) => {
  console.log(`WebSocket server ready on port ${port}`);
});

wsServer.on('error', (error) => {
  console.error('WebSocket error:', error);
});

await app.listen(3000);
```

### Send Suno Progress Update

```typescript
import { getWebSocketServer } from '@/lib/websocket';

const wsServer = getWebSocketServer();

// When Suno generation progresses
wsServer.suno.emit('sunoProgress', {
  generationId: 'gen-123',
  progress: 45,
  eta: 30, // seconds
  status: 'processing',
  timestamp: Date.now(),
});
```

### Send OBS Stream Update

```typescript
const wsServer = getWebSocketServer();

// Notify stream status change
wsServer.obsNamespace.to('stream:stream-123').emit('streamStatus', {
  status: 'live',
  viewers: 250,
  bitrate: 5000, // kbps
  frameRate: 60,
  frameDrops: 0,
  totalFrames: 150000,
  timestamp: Date.now(),
});
```

### Send Notification

```typescript
const wsServer = getWebSocketServer();

wsServer.sendNotification('user-123', {
  type: 'success',
  title: 'Generation Complete',
  message: 'Your music is ready to download',
  action: {
    label: 'Download',
    url: '/studio/downloads/gen-123',
  },
  duration: 5000, // Show for 5 seconds
});
```

### Broadcast Activity

```typescript
wsServer.broadcastActivity('user-123', {
  type: 'generation_completed',
  actor: { userId: 'user-123' },
  details: {
    generationId: 'gen-123',
    duration: 45,
    title: 'Epic Orchestral Piece',
  },
});
```

## Client-Side Usage

### Setup in React Component

```typescript
import { useEffect, useRef } from 'react';
import { createWebSocketClient } from '@/lib/websocket-client';

export function MusicGenerationComponent() {
  const wsRef = useRef(null);

  useEffect(() => {
    // Initialize client
    const ws = createWebSocketClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3006',
      userId: 'current-user-id',
      username: 'current-username',
    });

    wsRef.current = ws;

    // Listen for connection
    ws.on('ready', () => {
      console.log('WebSocket connected');
    });

    // Cleanup
    return () => {
      ws.disconnect();
    };
  }, []);

  return <div>Music Generation Component</div>;
}
```

### Subscribe to Suno Events

```typescript
// Subscribe to generation progress
const unsubProgress = wsRef.current.suno.on('sunoProgress', (event) => {
  console.log(`Generation ${event.generationId}: ${event.progress}%`);
  // Update UI with progress bar
  setProgress(event.progress);
  setEta(event.eta);
});

// Subscribe to completion
const unsubComplete = wsRef.current.suno.on('sunoComplete', (event) => {
  console.log('Generation complete:', event.audioUrl);
  // Play audio or download
  playAudio(event.audioUrl);
});

// Subscribe to errors
const unsubError = wsRef.current.suno.on('sunoError', (event) => {
  console.error('Generation failed:', event.error);
  showErrorNotification(event.error);
});

// Cleanup
return () => {
  unsubProgress();
  unsubComplete();
  unsubError();
};
```

### Subscribe to OBS Events

```typescript
// Set stream ID for this user
wsRef.current.setStreamId('stream-123');

// Listen to stream status
wsRef.current.obs.on('streamStatus', (event) => {
  setStreamLive(event.status === 'live');
  setViewerCount(event.viewers);
  setBitrate(event.bitrate);
});

// Listen to scene switches
wsRef.current.obs.on('sceneSwitch', (event) => {
  console.log(`Scene changed to: ${event.sceneName}`);
});

// Listen to real-time stats (500ms updates)
wsRef.current.obs.on('statsUpdate', (event) => {
  setStats({
    fps: event.fps,
    bitrate: event.bitrate,
    cpuUsage: event.cpuUsage,
    memoryUsage: event.memoryUsage,
  });
});
```

### Send OBS Events

```typescript
// Notify scene change
wsRef.current.obs.sceneSwitch({
  sceneId: 'scene-2',
  sceneName: 'Gaming',
  previousSceneId: 'scene-1',
  transitionDuration: 500,
});

// Send stats from OBS
wsRef.current.obs.sendStats({
  fps: 60,
  bitrate: 5000,
  bandwidthUsage: 45,
  cpuUsage: 25,
  memoryUsage: 512,
  droppedFrames: 0,
  totalFrames: 150000,
  avgFrameTime: 16.67,
});
```

### Listen to Notifications

```typescript
wsRef.current.studio.on('notification', (notif) => {
  console.log(`${notif.type}: ${notif.message}`);
  
  // Show toast notification in UI
  showToast({
    type: notif.type,
    title: notif.title,
    message: notif.message,
    action: notif.action,
  });

  // Auto-dismiss if duration specified
  if (notif.duration > 0) {
    setTimeout(() => {
      wsRef.current.studio.dismissNotification(notif.id);
    }, notif.duration);
  }
});
```

### Subscribe to Activity Feed

```typescript
// Subscribe to activity feed
wsRef.current.studio.subscribeFeed({
  types: ['generation_completed', 'stream_started'],
});

// Listen to activity updates
wsRef.current.studio.on('activityFeed', (activity) => {
  console.log(`Activity: ${activity.type}`);
  
  // Add to activity feed UI
  addActivityToFeed({
    actor: activity.actor,
    type: activity.type,
    details: activity.details,
    timestamp: activity.timestamp,
  });
});
```

### Using Singleton Pattern

```typescript
import { getWebSocketClient } from '@/lib/websocket-client';

// First time initialization
const ws = getWebSocketClient({
  url: 'http://localhost:3006',
  userId: 'user-123',
});

// Subsequent calls return the same instance
const ws2 = getWebSocketClient(); // Same as ws
```

## Event Reference

### Suno Namespace (`/suno`)

#### Emitted to Client

| Event | Data | Description |
|-------|------|-------------|
| `sunoProgress` | `SunoProgressEvent` | Generation progress update (0-100%) |
| `sunoComplete` | `SunoCompleteEvent` | Generation completed successfully |
| `sunoError` | `SunoErrorEvent` | Generation failed |
| `connected` | `{userId, timestamp}` | Connection established |

#### Sent from Client

| Event | Data | Description |
|-------|------|-------------|
| `progress` | `SunoProgressEvent` | Report generation progress |
| `complete` | `SunoCompleteEvent` | Report generation completion |
| `error_report` | `SunoErrorEvent` | Report generation error |
| `status_request` | `generationId: string` | Request current progress status |

### OBS Namespace (`/obs`)

#### Emitted to Client

| Event | Data | Description |
|-------|------|-------------|
| `streamStatus` | `ObsStreamStatusEvent` | Stream status changed |
| `sceneSwitch` | `ObsSceneSwitchEvent` | Scene was switched |
| `sourceUpdate` | `ObsSourceUpdateEvent` | Source properties changed |
| `statsUpdate` | `ObsStatsEvent` | Real-time metrics (500ms interval) |
| `connected` | `{userId, streamId, timestamp}` | Connection established |

#### Sent from Client

| Event | Data | Description |
|-------|------|-------------|
| `stream_status` | `ObsStreamStatusEvent` | Report stream status |
| `scene_switch` | `ObsSceneSwitchEvent` | Report scene change |
| `source_update` | `ObsSourceUpdateEvent` | Report source update |
| `stats` | `ObsStatsEvent` | Send real-time metrics |
| `stats_request` | - | Request current stats |

### Studio Namespace (`/studio`)

#### Emitted to Client

| Event | Data | Description |
|-------|------|-------------|
| `notification` | `StudioNotificationEvent` | User notification |
| `activityFeed` | `ActivityFeedEvent` | Activity feed update |
| `connected` | `{userId, timestamp}` | Connection established |
| `feed_subscribed` | `{userId, filters}` | Feed subscription confirmed |

#### Sent from Client

| Event | Data | Description |
|-------|------|-------------|
| `notification_dismiss` | `notificationId: string` | Dismiss a notification |
| `subscribe_feed` | `filters?: Record<string, any>` | Subscribe to activity feed |

## Type Definitions

All types are exported from `websocket.ts`:

```typescript
import type {
  SunoProgressEvent,
  SunoCompleteEvent,
  SunoErrorEvent,
  ObsStreamStatusEvent,
  ObsSceneSwitchEvent,
  ObsSourceUpdateEvent,
  ObsStatsEvent,
  StudioNotificationEvent,
  ActivityFeedEvent,
} from '@/lib/websocket';
```

## Configuration

### Server Configuration

```typescript
initializeWebSocketServer(3006, {
  cors: {
    origin: 'http://localhost:3005',
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxHttpBufferSize: 1e6, // 1MB
  pingInterval: 25000,
  pingTimeout: 60000,
});
```

### Client Configuration

```typescript
new StudioWebSocketClient(
  {
    url: 'http://localhost:3006',
    userId: 'user-123',
    username: 'John Doe',
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  },
  {
    autoConnect: true, // Connect immediately
    debug: true, // Log debug messages
  }
);
```

## Room Management

### Automatic Rooms

The server automatically manages these rooms:

- `user:{userId}` - User-specific room for direct communication
- `stream:{streamId}` - Stream-specific room for OBS updates
- `feed:{userId}` - Activity feed room for a user

### Example: Send to Specific User

```typescript
const wsServer = getWebSocketServer();

// Emit to specific user
wsServer.sunoNamespace.to('user:user-123').emit('sunoProgress', event);

// Broadcast to all users in a stream
wsServer.obsNamespace.to('stream:stream-123').emit('streamStatus', event);
```

## Best Practices

### 1. Always Cleanup Listeners

```typescript
useEffect(() => {
  const unsub = ws.suno.on('sunoProgress', callback);
  return () => unsub(); // Cleanup on unmount
}, []);
```

### 2. Handle Reconnection

```typescript
ws.on('disconnected', () => {
  setConnectionStatus('disconnected');
  // UI should show reconnecting indicator
});

ws.on('ready', () => {
  setConnectionStatus('connected');
  // Resubscribe to feeds
  ws.studio.subscribeFeed();
});
```

### 3. Debounce Stats Updates

Stats emit every 500ms. If your UI updates are expensive, debounce them:

```typescript
import { debounce } from 'lodash';

const updateStats = debounce((event) => {
  setStats(event);
}, 1000); // Update UI max once per second

ws.obs.on('statsUpdate', updateStats);
```

### 4. Error Handling

```typescript
ws.on('error', ({ namespace, error }) => {
  console.error(`[${namespace}] Connection error:`, error);
  showErrorNotification('Connection lost. Attempting to reconnect...');
});

ws.suno.on('sunoError', (event) => {
  console.error('Generation failed:', event.error);
  showErrorNotification(event.error);
});
```

### 5. Use Singleton for App-Wide Access

```typescript
// hooks/useWebSocket.ts
import { getWebSocketClient } from '@/lib/websocket-client';

export function useWebSocket() {
  const ws = getWebSocketClient({
    url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3006',
    userId: getCurrentUserId(), // Your auth logic
  });

  return ws;
}

// Usage in components
function MyComponent() {
  const ws = useWebSocket();
  // ws is already connected and available
}
```

## Performance Notes

- **Stats Emission**: 500ms interval prevents overwhelming the network
- **Max Buffer Size**: 1MB default (configurable)
- **Polling Fallback**: Automatic fallback to long-polling if WebSocket unavailable
- **Memory**: Rooms are auto-cleaned when users disconnect
- **Reconnection**: Automatic with exponential backoff (1s → 5s max)

## Troubleshooting

### WebSocket Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:3006
```

**Solution**: Ensure server is running on correct port
```bash
# In API (NestJS)
npm run dev # Should start WebSocket on 3006
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update CORS configuration:
```typescript
cors: {
  origin: ['http://localhost:3005', 'https://yourdomain.com'],
  credentials: true,
}
```

### Events Not Being Received

**Check**:
1. Client is connected: `ws.isConnected()`
2. Event listener is registered: `ws.suno.on('sunoProgress', ...)`
3. Server is emitting to correct room: `wsServer.sunoNamespace.to('user:userId').emit(...)`

### Memory Leaks

Always cleanup listeners:
```typescript
const unsub = ws.suno.on('event', callback);
// Later...
unsub(); // Cleanup
```

## Integration Examples

### React Component with Suno Progress

```typescript
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function GenerationProgress() {
  const ws = useWebSocket();
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);

  useEffect(() => {
    const unsub = ws.suno.on('sunoProgress', (event) => {
      setProgress(event.progress);
      setEta(event.eta);
    });

    return unsub;
  }, [ws]);

  return (
    <div>
      <progress value={progress} max={100} />
      <p>Time remaining: {eta}s</p>
    </div>
  );
}
```

### React Hook for Stream Stats

```typescript
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function useStreamStats(streamId) {
  const ws = useWebSocket();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    ws.setStreamId(streamId);

    const unsub = ws.obs.on('statsUpdate', setStats);
    return unsub;
  }, [ws, streamId]);

  return stats;
}

// Usage
function StreamDashboard() {
  const stats = useStreamStats('stream-123');
  return <div>FPS: {stats?.fps} | Bitrate: {stats?.bitrate} kbps</div>;
}
```

## License

Part of WISE² Creative Studio. See main project LICENSE.
