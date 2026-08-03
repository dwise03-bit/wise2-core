# WebSocket Integration Guide

How to integrate the WISE² Studio WebSocket server with NestJS services.

## Setup

### 1. Add WebSocket Gateway to App Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket/websocket.gateway';

@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class AppModule {}
```

### 2. Initialize in main.ts

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { initializeWebSocketServer } from '@wise2/studio/lib/websocket';
import { WebSocketGateway } from './websocket/websocket.gateway';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize WebSocket server
  const wsServer = initializeWebSocketServer(3006, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3005',
      credentials: true,
    },
  });

  // Register with gateway
  const wsGateway = app.get(WebSocketGateway);
  wsGateway.initialize(wsServer);

  // Start API
  await app.listen(3000);
  console.log('API running on port 3000');
  console.log('WebSocket server running on port 3006');
}

bootstrap();
```

## Usage Examples

### Suno Music Generation Service

```typescript
// suno/suno.service.ts
import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class SunoService {
  constructor(private wsGateway: WebSocketGateway) {}

  /**
   * Generate music using Suno API
   */
  async generateMusic(
    userId: string,
    prompt: string,
    style?: string
  ): Promise<string> {
    // Start generation
    const generationId = await this.sunoApi.generate({
      prompt,
      style,
    });

    // Emit started event
    this.wsGateway.emitSunoProgress(userId, generationId, 0, 60, 'pending');

    // Poll for progress
    const pollInterval = setInterval(async () => {
      try {
        const status = await this.sunoApi.getStatus(generationId);

        // Emit progress
        this.wsGateway.emitSunoProgress(
          userId,
          generationId,
          status.progress,
          status.eta,
          status.status
        );

        // Check if complete
        if (status.status === 'completed') {
          clearInterval(pollInterval);

          // Emit completion
          this.wsGateway.emitSunoComplete(
            userId,
            generationId,
            status.audioUrl,
            status.duration,
            undefined, // title
            style
          );

          // Save to database
          await this.saveGeneration(userId, generationId, status);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);

          // Emit error
          this.wsGateway.emitSunoError(
            userId,
            generationId,
            status.error || 'Generation failed',
            status.errorCode
          );
        }
      } catch (error) {
        clearInterval(pollInterval);
        this.wsGateway.emitSunoError(
          userId,
          generationId,
          error.message,
          'POLL_ERROR'
        );
      }
    }, 5000); // Poll every 5 seconds

    return generationId;
  }

  private async saveGeneration(
    userId: string,
    generationId: string,
    status: any
  ) {
    // Save to database
    // await this.db.generations.create({...})
  }
}
```

### OBS Streaming Service

```typescript
// obs/obs.service.ts
import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ObsService {
  constructor(private wsGateway: WebSocketGateway) {}

  /**
   * Start monitoring stream metrics
   */
  startStreamMonitoring(userId: string, streamId: string): void {
    const obsWebsocket = new OBSWebSocket(); // Your OBS client

    obsWebsocket.on('StreamStateChanged', (state) => {
      const status =
        state.outputActive === true
          ? 'live'
          : state.outputActive === false
            ? 'offline'
            : 'reconnecting';

      this.wsGateway.emitStreamStatus(
        userId,
        streamId,
        status as any,
        state.viewers,
        state.bitrate,
        state.fps,
        state.droppedFrames,
        state.totalFrames
      );
    });

    obsWebsocket.on('CurrentSceneChanged', (data) => {
      this.wsGateway.emitSceneSwitch(
        userId,
        streamId,
        data.sceneName, // Use as ID
        data.sceneName,
        undefined,
        data.transitionDuration
      );
    });

    obsWebsocket.on('SourceFilterListReindexed', (data) => {
      this.wsGateway.emitSourceUpdate(
        userId,
        streamId,
        data.sourceName,
        data.sourceName,
        data.filters || {}
      );
    });

    // Emit stats every second (will be collected by server)
    const statsInterval = setInterval(async () => {
      try {
        const stats = await obsWebsocket.call('GetOutputStatus');

        this.wsGateway.emitStreamStats(
          streamId,
          stats.outputTimecodeFrameTimingDrift ?? 60,
          stats.outputTotalBitrate || 0,
          stats.outputTotalBitrate ? (stats.outputTotalBitrate / 5000) * 100 : 0,
          stats.cpuUsage || 0,
          stats.memoryUsage || 0,
          stats.droppedFrames || 0,
          stats.totalFrames || 0,
          stats.averageFrameTime || 16.67
        );
      } catch (error) {
        console.error('Failed to get OBS stats:', error);
      }
    }, 1000);

    // Cleanup on disconnect
    obsWebsocket.on('ConnectionClosed', () => {
      clearInterval(statsInterval);
    });
  }

  /**
   * Switch scene
   */
  switchScene(
    userId: string,
    streamId: string,
    sceneName: string
  ): Promise<void> {
    const obsWebsocket = this.getObsConnection(streamId);

    return obsWebsocket
      .call('SetCurrentProgramScene', {
        sceneName,
      })
      .then((response) => {
        // WebSocket events will trigger the broadcast
      });
  }

  /**
   * Update source properties
   */
  updateSource(
    userId: string,
    streamId: string,
    sourceName: string,
    properties: Record<string, any>
  ): Promise<void> {
    const obsWebsocket = this.getObsConnection(streamId);

    return obsWebsocket
      .call('SetInputSettings', {
        inputName: sourceName,
        inputSettings: properties,
      })
      .then(() => {
        // Emit update
        this.wsGateway.emitSourceUpdate(
          userId,
          streamId,
          sourceName,
          sourceName,
          properties
        );
      });
  }

  private getObsConnection(streamId: string) {
    // Return OBS connection for this stream
  }
}
```

### Notifications Service

```typescript
// notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NotificationsService {
  constructor(private wsGateway: WebSocketGateway) {}

  /**
   * Send a notification to user
   */
  async notify(
    userId: string,
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string,
    options?: {
      action?: { label: string; url?: string };
      duration?: number;
    }
  ): Promise<void> {
    // Send via WebSocket
    this.wsGateway.sendNotification(userId, {
      type,
      title,
      message,
      action: options?.action,
      duration: options?.duration,
    });

    // Also store in database for history
    await this.db.notifications.create({
      userId,
      type,
      title,
      message,
      createdAt: new Date(),
    });
  }

  /**
   * Notify export completion
   */
  notifyExportComplete(
    userId: string,
    generationId: string,
    format: string,
    downloadUrl: string
  ): void {
    this.notify(
      userId,
      'success',
      'Export Complete',
      `Your ${format.toUpperCase()} export is ready`,
      {
        action: {
          label: 'Download',
          url: downloadUrl,
        },
        duration: 0, // Persistent
      }
    );

    // Also broadcast to activity feed
    this.wsGateway.broadcastActivity(userId, 'export_completed', {
      generationId,
      format,
      downloadUrl,
    });
  }

  /**
   * Notify collaboration update
   */
  notifyCollaborationUpdate(
    userId: string,
    collaboratorName: string,
    action: string
  ): void {
    this.notify(
      userId,
      'info',
      'Collaboration Update',
      `${collaboratorName} ${action}`,
      { duration: 5000 }
    );

    this.wsGateway.broadcastActivity(
      userId,
      'collaboration_update',
      {
        collaboratorName,
        action,
      },
      userId,
      collaboratorName
    );
  }
}
```

### Scheduled Tasks with WebSocket

```typescript
// tasks/streaming-stats.task.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { ObsService } from '../obs/obs.service';

@Injectable()
export class StreamingStatsTask {
  private logger = new Logger(StreamingStatsTask.name);

  constructor(
    private wsGateway: WebSocketGateway,
    private obsService: ObsService
  ) {}

  /**
   * Poll active streams for stats every 5 seconds
   */
  @Cron('*/5 * * * * *')
  async pollStreamStats() {
    const activeStreams = await this.getActiveStreams();

    for (const stream of activeStreams) {
      try {
        const stats = await this.obsService.getStreamStats(stream.id);

        // Emit to WebSocket
        this.wsGateway.emitStreamStats(
          stream.userId,
          stats.fps,
          stats.bitrate,
          stats.bandwidthUsage,
          stats.cpuUsage,
          stats.memoryUsage,
          stats.droppedFrames,
          stats.totalFrames,
          stats.avgFrameTime
        );
      } catch (error) {
        this.logger.error(
          `Failed to poll stats for stream ${stream.id}:`,
          error
        );
      }
    }
  }

  private async getActiveStreams() {
    // Query database for active streams
  }
}
```

## Common Patterns

### Real-time Progress Tracking

```typescript
// For long-running operations (generation, export, etc.)
async function trackProgress(
  userId: string,
  operationId: string,
  operation: Promise<any>
) {
  let progress = 0;

  // Emit initial
  this.wsGateway.emitProgress(userId, operationId, 0);

  try {
    // Do work and update progress
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 100) progress = 100;

      this.wsGateway.emitProgress(userId, operationId, progress);

      if (progress >= 100) clearInterval(interval);
    }, 1000);

    const result = await operation;

    clearInterval(interval);
    this.wsGateway.emitProgressComplete(userId, operationId, result);

    return result;
  } catch (error) {
    this.wsGateway.emitProgressError(userId, operationId, error.message);
    throw error;
  }
}
```

### Broadcasting to Multiple Users

```typescript
// Notify all users in a collaboration
async notifyCollaborators(projectId: string, message: string) {
  const collaborators = await this.db.collaborators.findByProject(projectId);

  for (const collaborator of collaborators) {
    this.wsGateway.sendNotification(collaborator.userId, {
      type: 'info',
      title: 'Project Update',
      message,
    });
  }
}
```

### Checking Connection Status

```typescript
// Before sending heavy data
if (this.wsGateway.isUserConnected(userId)) {
  // User is connected, send via WebSocket
  this.wsGateway.emitSunoComplete(userId, ...);
} else {
  // User is offline, send email or save for later
  await this.emailService.send(userId, ...);
}
```

## Best Practices

### 1. Always Check Server Initialization

```typescript
if (!this.wsGateway) {
  this.logger.warn('WebSocket gateway not initialized');
  return;
}
```

### 2. Use Consistent Event Names

Keep event names consistent across client and server:
- Use camelCase: `sunoProgress`, not `suno_progress`
- Server emits: `emit('eventName', data)`
- Client listens: `on('eventName', callback)`

### 3. Include Timestamps

Always include `timestamp: Date.now()` in event payloads for client-side sorting and duplicate detection:

```typescript
this.wsGateway.emitSunoProgress(userId, generationId, progress, eta, status);
// Creates: { generationId, progress, eta, status, timestamp: Date.now() }
```

### 4. Error Handling

```typescript
try {
  await this.complexOperation();
  this.wsGateway.sendNotification(userId, {
    type: 'success',
    message: 'Operation completed',
  });
} catch (error) {
  this.wsGateway.sendNotification(userId, {
    type: 'error',
    message: error.message,
  });
  this.logger.error('Operation failed:', error);
}
```

### 5. Clean Up Resources

```typescript
// Always unsubscribe from intervals/listeners
const statsInterval = setInterval(() => {
  // Check stats
}, 1000);

// On stream end
stream.on('end', () => {
  clearInterval(statsInterval);
});
```

## Troubleshooting

### WebSocket Server Not Emitting Events

**Check**:
1. Is `wsGateway.initialize(wsServer)` called in main.ts?
2. Is the WebSocket server actually running on port 3006?
3. Is the browser client connected to the correct URL?

```typescript
// Verify in browser console
ws.isConnected(); // Should be true
```

### Events Not Appearing in Activity Feed

**Ensure**:
1. Using `wsGateway.broadcastActivity()` not just `emit()`
2. User has subscribed to activity feed: `ws.studio.subscribeFeed()`
3. Feed room is joined: `to('feed:userId')`

### Stats Not Updating

**Check**:
1. `emitStreamStats()` is being called at least once per second
2. Client is subscribed to `statsUpdate` event
3. Stats interval isn't cleared prematurely

## Performance Optimization

### Rate Limiting Events

If events are sent too frequently, debounce on client:

```typescript
// Client side
const debouncedUpdate = debounce((stats) => {
  setStats(stats);
}, 500); // Max once per 500ms

ws.obs.on('statsUpdate', debouncedUpdate);
```

### Selective Broadcasting

Only emit to users who are currently viewing the stream:

```typescript
// Only emit if user is connected
if (this.wsGateway.isUserConnected(userId)) {
  this.wsGateway.emitStreamStats(...);
}
```

### Memory Management

The WebSocket server automatically cleans up:
- Disconnected user sessions
- Completed generation trackers
- Inactive stream metrics

No manual cleanup needed for normal usage.
