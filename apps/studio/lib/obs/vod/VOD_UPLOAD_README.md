# VOD Auto-Upload System

Professional Video On Demand (VOD) auto-upload system for WISE² Studio. Automatically upload stream recordings to YouTube, Twitch, AWS S3, and custom endpoints with intelligent retry logic, progress tracking, and platform-specific metadata.

## Features

- **Multi-Platform Upload**: Automatically upload to YouTube, Twitch, AWS S3, and custom endpoints
- **Smart Retry Logic**: Exponential backoff with configurable retry counts and delays
- **Thumbnail Generation**: Auto-generate thumbnails from keyframes (middle, start, end, or custom position)
- **Priority Queue**: Queue-based processing with priority support and persistence
- **Real-Time Progress**: Event-driven progress tracking and status updates
- **Metadata Auto-Fill**: Stream metadata automatically populated from recording context
- **Visibility Control**: Per-platform visibility settings (public, unlisted, private)
- **Concurrent Upload Control**: Limit simultaneous uploads to prevent resource exhaustion
- **Offline Support**: Queue persists to localStorage for recovery after disconnects
- **Error Tracking**: Detailed error logging and failed upload retry management

## Architecture

```
VODUploadEngine (Core upload orchestration)
├── VODUploadQueue (Priority-based job queue)
├── Platform Handlers (YouTube, Twitch, S3, Custom)
├── Thumbnail Generator (Keyframe extraction)
└── Retry Manager (Exponential backoff)

VODUploadUI (React component)
├── Platform Selection
├── Visibility Control
├── Progress Tracking
├── Upload History
└── Retry Management
```

## Installation

The VOD system is built into WISE² Studio at `apps/studio/lib/obs/vod/`.

### Basic Import

```typescript
import {
  getVODEngine,
  getVODQueue,
  VODUploadUI,
  type VODUploadConfig,
} from '@/lib/obs/vod';
```

### React Component

```typescript
import { VODUploadUI } from '@/lib/obs/vod';

export function MyComponent() {
  return (
    <VODUploadUI
      recordingId="rec-123"
      recordingPath="/recordings/stream.mp4"
      title="My Stream Recording"
      description="Recorded on July 24, 2026"
      onUploadComplete={(jobId) => console.log('Done!', jobId)}
      onUploadFailed={(jobId, error) => console.error('Failed:', error)}
    />
  );
}
```

## Configuration

### Engine Configuration

```typescript
import { VODUploadEngine } from '@/lib/obs/vod';

const engine = new VODUploadEngine({
  autoUploadEnabled: true,
  defaultVisibility: 'unlisted',
  maxConcurrentUploads: 2,
  thumbnailOptions: {
    generateFromKeyframe: true,
    keyframePosition: 'middle',
    width: 1280,
    height: 720,
    format: 'jpg',
    quality: 90,
  },
  uploadRetryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  storageConfig: {
    tempDirectory: '/tmp/vod-uploads',
    archiveDirectory: '/recordings/archive',
    maxStorageGB: 500,
  },
});
```

### Platform Configuration

```typescript
import { type VODPlatformConfig } from '@/lib/obs/vod';

const youtubeConfig: VODPlatformConfig = {
  platform: 'youtube',
  enabled: true,
  visibility: 'unlisted',
  autoRetry: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  youtube: {
    channelId: 'UC_your_channel_id',
    playlistId: 'PLyour_playlist_id',
    notifySubscribers: false,
    madeForKids: false,
    license: 'standard',
    enableComments: true,
    enableRatings: true,
  },
};

engine.updatePlatformConfig('youtube', true);
```

## Usage

### 1. Initialize Engine

```typescript
import { getVODEngine } from '@/lib/obs/vod';

const engine = getVODEngine({
  autoUploadEnabled: true,
  maxConcurrentUploads: 2,
});
```

### 2. Set Platform Credentials

```typescript
// YouTube OAuth token
await engine.setPlatformCredentials('youtube', {
  accessToken: 'ya29.a0...',
  refreshToken: '1//...',
  expiresAt: Date.now() + 3600000,
});

// Twitch OAuth token
await engine.setPlatformCredentials('twitch', {
  accessToken: 'gapj...',
  userId: 'user123',
});

// AWS S3 credentials
await engine.setPlatformCredentials('s3', {
  accessKeyId: 'AKIA...',
  secretAccessKey: 'wJa...',
  region: 'us-east-1',
});
```

### 3. Create Upload Job

```typescript
const job = await engine.createUploadJob(
  '/recordings/stream-2026-07-24.mp4',
  {
    id: 'rec-123',
    recordingId: 'rec-123',
    title: 'Live Stream - July 24',
    description: 'Amazing stream with guests',
    tags: ['live', 'streaming', 'react'],
    category: 'technology',
    duration: 3600, // seconds
    fileSize: 5368709120, // bytes
    resolution: '1920x1080',
    frameRate: 30,
    bitrate: 5000,
    recordedAt: new Date(),
    createdAt: new Date(),
  },
  ['youtube', 'twitch', 's3'],
  'unlisted'
);

// Job automatically starts uploading if autoUploadEnabled is true
console.log('Upload job created:', job.id);
```

### 4. Subscribe to Events

```typescript
engine.on('upload_event', (event) => {
  switch (event.type) {
    case 'upload_started':
      console.log('Upload started:', event.jobId);
      break;

    case 'platform_started':
      console.log(`Uploading to ${event.platform}...`);
      break;

    case 'platform_progress':
      console.log(`${event.platform}: ${event.progress}%`);
      break;

    case 'platform_completed':
      console.log(`✓ ${event.platform}: ${event.message}`);
      break;

    case 'platform_failed':
      console.error(`✗ ${event.platform}: ${event.error}`);
      break;

    case 'thumbnail_generated':
      console.log('Thumbnail ready:', event.message);
      break;

    case 'upload_completed':
      console.log('All uploads complete!');
      break;

    case 'upload_failed':
      console.error('Upload failed:', event.error);
      break;

    case 'retry_scheduled':
      console.log('Retry scheduled:', event.message);
      break;
  }
});
```

### 5. Manage Uploads

```typescript
const engine = getVODEngine();

// Get job status
const job = engine.getJobStatus('vod-123-abc');
console.log('Progress:', job?.progress, '%');

// Get upload queue
const queue = engine.getUploadQueue();
console.log('Pending uploads:', queue.length);

// Pause upload
await engine.pauseUpload('vod-123-abc');

// Resume upload
await engine.resumeUpload('vod-123-abc');

// Cancel upload
await engine.cancelUpload('vod-123-abc');

// Get metrics
const metrics = engine.getMetrics();
console.log('Total uploads:', metrics.totalUploads);
console.log('Successful:', metrics.successfulUploads);
console.log('Failed:', metrics.failedUploads);
console.log('Data uploaded:', (metrics.totalDataUploaded / 1e9).toFixed(2), 'GB');
```

## Queue Management

### Using the Queue

```typescript
import { getVODQueue } from '@/lib/obs/vod';

const queue = getVODQueue();

// Add item with priority (0-10)
queue.enqueue(
  'vod-123',
  '/recordings/stream.mp4',
  ['youtube', 's3'],
  metadata,
  9 // high priority
);

// Get next item
const item = queue.dequeue();

// Peek at next without removing
const nextItem = queue.peek();

// Get queue statistics
const stats = queue.getStats();
console.log(`${stats.pendingItems} uploads pending`);

// Update priority
queue.updatePriority('vod-123', 10); // move to front

// Clear queue
queue.clear();
```

### Queue Persistence

The queue automatically persists to localStorage and recovers after page refreshes:

```typescript
// Export queue for backup
const backup = queue.export();
localStorage.setItem('vod-queue-backup', backup);

// Import queue from backup
queue.import(backup);
```

## API Reference

### VODUploadEngine

#### Methods

- `createUploadJob(recordingPath, metadata, platforms, visibility)` - Create new upload job
- `setPlatformCredentials(platform, credentials)` - Set OAuth/API credentials
- `getJobStatus(jobId)` - Get status of specific job
- `getUploadQueue()` - Get all queued/active jobs
- `getMetrics()` - Get upload statistics
- `pauseUpload(jobId)` - Pause in-progress upload
- `resumeUpload(jobId)` - Resume paused upload
- `cancelUpload(jobId)` - Cancel upload
- `setAutoUploadEnabled(enabled)` - Enable/disable auto-upload
- `updatePlatformConfig(platform, enabled)` - Enable/disable platform
- `destroy()` - Cleanup engine and release resources

#### Events

- `upload_started` - Upload job created
- `upload_progress` - Overall progress update
- `platform_started` - Started uploading to platform
- `platform_progress` - Platform upload progress
- `platform_completed` - Platform upload finished successfully
- `platform_failed` - Platform upload failed
- `thumbnail_generated` - Thumbnail ready
- `upload_completed` - All uploads finished successfully
- `upload_failed` - All uploads failed
- `retry_scheduled` - Retry scheduled for failed upload

### VODUploadQueue

#### Methods

- `enqueue(jobId, path, platforms, metadata, priority)` - Add to queue
- `dequeue()` - Remove and return next item
- `peek()` - View next item without removing
- `remove(jobId)` - Remove specific item
- `prioritize(jobId)` - Move to front
- `contains(jobId)` - Check if in queue
- `size()` - Get queue length
- `clear()` - Remove all items
- `getAll()` - Get all items
- `getStats()` - Get queue statistics
- `getHealth()` - Get queue health info
- `export()` - Export for backup
- `import(data)` - Restore from backup

## YouTube Upload Integration

### OAuth Setup

1. Get credentials from [Google Cloud Console](https://console.cloud.google.com)
2. Set redirect URI to `{APP_URL}/api/auth/youtube/callback`
3. Set `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` environment variables

### Required Scopes

- `https://www.googleapis.com/auth/youtube.upload` - Upload videos
- `https://www.googleapis.com/auth/youtube` - Manage playlists

### Metadata Fields

- `title` - Video title (1-100 chars)
- `description` - Video description (max 5000 chars)
- `tags` - Array of tags (max 500 chars total)
- `category` - Category ID (see YouTube docs)
- `visibility` - 'public' | 'unlisted' | 'private'
- `thumbnail` - Custom thumbnail URL

## Twitch Upload Integration

### OAuth Setup

1. Register app at [Twitch Dev Console](https://dev.twitch.tv/console)
2. Set redirect URI to `{APP_URL}/api/auth/twitch/callback`
3. Set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` environment variables

### Required Scopes

- `user:edit:broadcast` - Manage broadcast settings
- `channel:manage:videos` - Manage VOD settings

### Metadata Fields

- `title` - Video title
- `description` - Video description
- `language` - Language code (e.g., 'en')
- `isMature` - Mark as mature content
- `ttl` - Time to live in days

## AWS S3 Upload Integration

### Configuration

Set environment variables:

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJa...
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-recordings
```

### Storage Classes

- `STANDARD` - Frequently accessed (default)
- `STANDARD_IA` - Infrequent access, lower cost
- `GLACIER` - Archive, lowest cost

## Error Handling

### Retry Logic

Failures automatically retry with exponential backoff:

```
Attempt 1: immediate
Attempt 2: 1s delay
Attempt 3: 2s delay
Attempt 4: 4s delay
... (capped at max 30s)
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `OAUTH_CONFIG_ERROR` | Missing credentials | Set platform credentials |
| `FILE_NOT_FOUND` | Recording path invalid | Check file exists |
| `UPLOAD_FAILED` | Network issue | Auto-retry enabled |
| `QUOTA_EXCEEDED` | Platform limit reached | Reduce upload frequency |
| `INVALID_METADATA` | Bad title/description | Check metadata |

## Performance Tuning

### Optimal Settings for Different Scenarios

**High Volume (Many short streams)**:
```typescript
{
  maxConcurrentUploads: 3,
  uploadRetryConfig: {
    maxRetries: 2,
    initialDelayMs: 500,
  },
}
```

**Large Files (Long streams)**:
```typescript
{
  maxConcurrentUploads: 1,
  uploadRetryConfig: {
    maxRetries: 5,
    initialDelayMs: 5000,
  },
}
```

**Reliable Network**:
```typescript
{
  maxConcurrentUploads: 4,
  uploadRetryConfig: {
    maxRetries: 1,
  },
}
```

## Metrics & Monitoring

```typescript
const engine = getVODEngine();
const metrics = engine.getMetrics();

console.log({
  totalUploads: metrics.totalUploads,
  successRate: (
    (metrics.successfulUploads / metrics.totalUploads) *
    100
  ).toFixed(2) + '%',
  failedUploads: metrics.failedUploads,
  dataUploaded: (metrics.totalDataUploaded / 1e9).toFixed(2) + ' GB',
  avgUploadTime: (metrics.averageUploadTimeMs / 1000).toFixed(1) + 's',
});
```

## Types Reference

### VODUploadJob

```typescript
interface VODUploadJob {
  id: string; // Unique job ID
  recordingId: string; // Recording identifier
  recordingPath: string; // File path
  platforms: VODPlatform[]; // Target platforms
  metadata: VODMetadata; // Video metadata
  status: VODUploadStatus; // Current status
  progress: number; // 0-100
  currentPlatform?: VODPlatform; // Active platform
  platformResults: Map<VODPlatform, VODPlatformResult>; // Per-platform results
  attempts: number; // Retry count
  error?: string; // Error message
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update
}
```

### VODMetadata

```typescript
interface VODMetadata {
  id: string;
  recordingId: string;
  title: string;
  description?: string;
  tags: string[];
  category?: string;
  thumbnail?: { url: string; uploadedAt?: Date };
  duration: number; // seconds
  fileSize: number; // bytes
  resolution: string;
  frameRate: number;
  bitrate: number; // kbps
  recordedAt: Date;
  createdAt: Date;
}
```

## Troubleshooting

### Upload Stuck

Check queue health:
```typescript
const queue = getVODQueue();
const health = queue.getHealth();
console.log('Queue depth:', health.queueDepth);
console.log('Oldest item age:', health.avgItemAge, 'seconds');
```

### No Progress

Verify auto-upload is enabled:
```typescript
const engine = getVODEngine();
const queue = engine.getUploadQueue();
console.log('Queue size:', queue.length);
```

### Authentication Failed

Refresh credentials:
```typescript
const engine = getVODEngine();
const newToken = await refreshOAuthToken();
await engine.setPlatformCredentials('youtube', {
  accessToken: newToken,
});
```

## Best Practices

1. **Set credentials before creating jobs** - Ensure all platforms have valid tokens
2. **Monitor events** - Subscribe to upload events for real-time feedback
3. **Use appropriate priorities** - Higher priority uploads process first
4. **Archive to S3** - Always include S3 backup for long-term storage
5. **Test with small files** - Verify setup works before processing large videos
6. **Rotate credentials** - Refresh OAuth tokens before expiry
7. **Monitor metrics** - Track success rates and adjust settings as needed

## Limitations

- Maximum file size: Depends on platform (YouTube: 256GB, Twitch: 10GB)
- Maximum concurrent uploads: 4 (configurable, default 2)
- Thumbnail generation: Requires FFmpeg or similar
- OAuth refresh: Manual or via background task
- Queue size: Unlimited (but limited by browser storage ~5-10MB)

## Future Enhancements

- [ ] Resumable uploads for large files
- [ ] Direct platform-to-platform transfers
- [ ] Batch upload scheduling
- [ ] Multi-language caption generation
- [ ] Analytics integration
- [ ] Custom watermark support
- [ ] Live stream validation
- [ ] Automatic video optimization per platform

## Support

For issues or questions:
1. Check troubleshooting guide above
2. Review platform-specific documentation
3. Check browser console for detailed error messages
4. File issue with reproduction steps

## License

Part of WISE² Core - See LICENSE.md
