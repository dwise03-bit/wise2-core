# WebSocket Quick Reference

## Files Created

```
apps/studio/lib/
├── websocket.ts                    # Server implementation
├── websocket-client.ts             # Browser client
└── WEBSOCKET_README.md             # Full documentation

packages/api/src/websocket/
├── websocket.gateway.ts            # NestJS gateway
└── INTEGRATION_GUIDE.md            # Integration examples
```

## Server Quick Start

### Initialize Server (main.ts)

```typescript
import { initializeWebSocketServer } from '@wise2/studio/lib/websocket';

const wsServer = initializeWebSocketServer(3006, {
  cors: { origin: 'http://localhost:3005', credentials: true },
});
```

### Send Suno Events (API Service)

```typescript
// Progress
wsServer.sunoNamespace.to('user:userId').emit('sunoProgress', {
  generationId, progress, eta, status, timestamp: Date.now(),
});

// Complete
wsServer.sunoNamespace.to('user:userId').emit('sunoComplete', {
  generationId, audioUrl, duration, timestamp: Date.now(),
});

// Error
wsServer.sunoNamespace.to('user:userId').emit('sunoError', {
  generationId, error, timestamp: Date.now(),
});
```

### Send OBS Events (API Service)

```typescript
// Stream Status
wsServer.obsNamespace.to('stream:streamId').emit('streamStatus', {
  status, viewers, bitrate, frameRate, frameDrops, timestamp: Date.now(),
});

// Scene Switch
wsServer.obsNamespace.to('stream:streamId').emit('sceneSwitch', {
  sceneId, sceneName, previousSceneId, timestamp: Date.now(),
});

// Source Update
wsServer.obsNamespace.to('stream:streamId').emit('sourceUpdate', {
  sourceId, sourceName, properties, timestamp: Date.now(),
});

// Stats (every 500ms)
wsServer.obsNamespace.to('stream:streamId').emit('statsUpdate', {
  fps, bitrate, cpuUsage, memoryUsage, droppedFrames, timestamp: Date.now(),
});
```

### Send Notifications (API Service)

```typescript
wsServer.sendNotification('user:userId', {
  type: 'success',
  title: 'Generation Complete',
  message: 'Your music is ready',
  action: { label: 'Download', url: '/download' },
  duration: 5000, // ms, 0 = persistent
});
```

### Broadcast Activity (API Service)

```typescript
wsServer.broadcastActivity('userId', {
  type: 'generation_completed',
  actor: { userId: 'actor-id' },
  details: { generationId, duration, title },
});
```

## Client Quick Start (React)

### Setup

```typescript
import { createWebSocketClient } from '@wise2/studio/lib/websocket-client';

const ws = createWebSocketClient({
  url: 'http://localhost:3006',
  userId: 'user-123',
  username: 'John Doe',
  autoConnect: true,
  debug: true,
});
```

### Listen to Suno

```typescript
ws.suno.on('sunoProgress', (e) => {
  console.log(`${e.generationId}: ${e.progress}% (ETA: ${e.eta}s)`);
});

ws.suno.on('sunoComplete', (e) => {
  console.log(`Complete: ${e.audioUrl}`);
  playAudio(e.audioUrl);
});

ws.suno.on('sunoError', (e) => {
  console.error(`Error: ${e.error}`);
});
```

### Listen to OBS

```typescript
ws.setStreamId('stream-123');

ws.obs.on('streamStatus', (e) => {
  console.log(`Status: ${e.status} (${e.viewers} viewers)`);
});

ws.obs.on('sceneSwitch', (e) => {
  console.log(`Scene: ${e.sceneName}`);
});

ws.obs.on('statsUpdate', (e) => {
  console.log(`FPS: ${e.fps}, Bitrate: ${e.bitrate}kbps`);
});
```

### Send OBS Events

```typescript
ws.obs.sceneSwitch({
  sceneId: 'scene-2',
  sceneName: 'Gaming',
  previousSceneId: 'scene-1',
});

ws.obs.sendStats({
  fps: 60,
  bitrate: 5000,
  cpuUsage: 25,
  memoryUsage: 512,
  droppedFrames: 0,
  totalFrames: 150000,
  avgFrameTime: 16.67,
});
```

### Listen to Notifications

```typescript
ws.studio.on('notification', (notif) => {
  console.log(`${notif.type}: ${notif.message}`);
  showToast(notif);
});
```

### Listen to Activity Feed

```typescript
ws.studio.subscribeFeed();

ws.studio.on('activityFeed', (activity) => {
  console.log(`${activity.actor.username} ${activity.type}`);
  addToFeed(activity);
});
```

### Cleanup Listeners

```typescript
const unsub = ws.suno.on('sunoProgress', callback);
// Later...
unsub();
```

## Namespaces

| Namespace | Purpose | Room Pattern |
|-----------|---------|--------------|
| `/suno` | Music generation | `user:{userId}` |
| `/obs` | Stream monitoring | `stream:{streamId}` |
| `/studio` | Notifications | `user:{userId}`, `feed:{userId}` |

## Event Patterns

### Suno (Server → Client)

| Event | When | Data |
|-------|------|------|
| `sunoProgress` | Generation progressing | `{generationId, progress, eta, status, timestamp}` |
| `sunoComplete` | Generation done | `{generationId, audioUrl, duration, timestamp}` |
| `sunoError` | Generation failed | `{generationId, error, code, timestamp}` |

### OBS (Server → Client)

| Event | When | Data |
|-------|------|------|
| `streamStatus` | Stream status changed | `{status, viewers, bitrate, frameRate, frameDrops, timestamp}` |
| `sceneSwitch` | Scene changed | `{sceneId, sceneName, previousSceneId, timestamp}` |
| `sourceUpdate` | Source changed | `{sourceId, sourceName, properties, timestamp}` |
| `statsUpdate` | Stats available (500ms) | `{fps, bitrate, cpuUsage, memoryUsage, droppedFrames, timestamp}` |

### Studio (Server → Client)

| Event | When | Data |
|-------|------|------|
| `notification` | Alert to user | `{id, type, title, message, action, duration, timestamp}` |
| `activityFeed` | Activity update | `{id, type, actor, details, timestamp}` |

## Common Use Cases

### Display Generation Progress

```typescript
// Server (API)
wsServer.sunoNamespace.to('user:123').emit('sunoProgress', {
  generationId: 'gen-abc',
  progress: 45,
  eta: 30,
  status: 'processing',
  timestamp: Date.now(),
});

// Client (React)
ws.suno.on('sunoProgress', (event) => {
  setProgress(event.progress);
  setEta(event.eta);
});
```

### Live Stream Dashboard

```typescript
// Client
ws.setStreamId('stream-123');

ws.obs.on('statsUpdate', (stats) => {
  setDashboard({
    fps: stats.fps,
    bitrate: `${stats.bitrate} kbps`,
    cpu: `${stats.cpuUsage}%`,
  });
});

ws.obs.on('streamStatus', (event) => {
  setLiveStatus(event.status === 'live' ? 'LIVE' : 'OFFLINE');
  setViewerCount(event.viewers);
});
```

### System Notifications

```typescript
// Server (API Service)
this.wsGateway.sendNotification('user-123', {
  type: 'success',
  title: 'Export Complete',
  message: 'Your file is ready to download',
  action: { label: 'Download', url: '/files/export-123' },
  duration: 0, // Persistent
});

// Client (Toast)
ws.studio.on('notification', (notif) => {
  toast.show({
    type: notif.type,
    title: notif.title,
    message: notif.message,
    action: notif.action,
  });
});
```

### Activity Timeline

```typescript
// Server
wsServer.broadcastActivity('user-123', {
  type: 'generation_completed',
  actor: { userId: 'user-456', username: 'Alice' },
  details: { generationId: 'gen-xyz', duration: 60, title: 'Epic Track' },
});

// Client
ws.studio.subscribeFeed({ types: ['generation_completed'] });

ws.studio.on('activityFeed', (activity) => {
  timeline.add({
    time: new Date(activity.timestamp),
    actor: activity.actor.username,
    action: activity.type,
    details: activity.details,
  });
});
```

## Connection States

```
                     connect()
                         ↓
                    Connecting
                    ↓         ↓
              timeout()    connected
                ↓             ↓
            reconnect()    Connected
                ↓             ↓
            Connecting    disconnect()
                              ↓
                          Disconnected
```

## Debugging

### Check Connection Status

```typescript
console.log('Suno connected:', ws.suno.getConnected());
console.log('OBS connected:', ws.obs.getConnected());
console.log('Studio connected:', ws.studio.getConnected());
console.log('All connected:', ws.isConnected());
```

### Enable Debug Logging

```typescript
const ws = createWebSocketClient(config, { debug: true });
// Shows all [WebSocket] messages in console
```

### Check User Sessions (Server)

```typescript
wsServer.getActiveSessions(); // All active users
wsServer.getUserSession('user-123'); // Specific user
wsServer.isUserConnected('user-123'); // Is connected
```

### Monitor Generation Progress (Server)

```typescript
const tracker = wsServer.getGenerationProgress('gen-123');
if (tracker) {
  console.log(`${tracker.progress}% complete, ETA: ${tracker.eta}s`);
}
```

## Performance Tips

### 1. Debounce Stats

```typescript
import { debounce } from 'lodash';

const updateStats = debounce((stats) => setStats(stats), 500);
ws.obs.on('statsUpdate', updateStats);
```

### 2. Unsubscribe from Unused Events

```typescript
useEffect(() => {
  const unsub = ws.suno.on('sunoProgress', handleProgress);
  return () => unsub(); // Cleanup
}, []);
```

### 3. Check Connection Before Heavy Operations

```typescript
if (ws.isConnected()) {
  // Send via WebSocket
  ws.suno.on('sunoComplete', handleComplete);
} else {
  // Fallback to polling or email
  await pollForCompletion();
}
```

### 4. Batch Operations

```typescript
// Instead of emitting 60 times per second
for (let i = 0; i < 60; i++) {
  emit('stat', stats[i]); // Bad
}

// Accumulate and emit once per 500ms
this.stats = latestStats;
// Server emits on 500ms interval automatically
```

## Deployment Checklist

- [ ] WebSocket server configured on port 3006
- [ ] CORS origin includes production frontend URL
- [ ] SSL/TLS enabled (wss:// for production)
- [ ] Reconnection logic enabled in client
- [ ] Error handling implemented on both sides
- [ ] Cleanup/unsubscribe in React effects
- [ ] Memory limits configured (maxHttpBufferSize)
- [ ] Test with multiple concurrent users
- [ ] Monitor WebSocket connection metrics
- [ ] Logging enabled for debugging

## File Sizes

- `websocket.ts` - 10.2 KB (server implementation)
- `websocket-client.ts` - 12.4 KB (browser client)
- `websocket.gateway.ts` - 8.7 KB (NestJS integration)

## Dependencies

- `socket.io` (^4.7.0) - Server
- `socket.io-client` (^4.7.0) - Browser client
- TypeScript 5.3+

## Support

For issues or questions:
1. Check `WEBSOCKET_README.md` for detailed documentation
2. See `INTEGRATION_GUIDE.md` for server-side examples
3. Review type definitions in `websocket.ts`
4. Enable debug mode: `{ debug: true }`
