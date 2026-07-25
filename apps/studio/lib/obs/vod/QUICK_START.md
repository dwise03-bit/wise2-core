# VOD Upload System - Quick Start

Get VOD auto-upload running in 5 minutes.

## 1. Import Components

```typescript
import { getVODEngine, VODUploadUI } from '@/lib/obs/vod';
```

## 2. Initialize Engine (In App Layout)

```typescript
// apps/studio/app/layout.tsx

'use client';

import { useEffect } from 'react';
import { getVODEngine } from '@/lib/obs/vod';

export default function RootLayout() {
  useEffect(() => {
    // Initialize once on app start
    const engine = getVODEngine({
      autoUploadEnabled: true,
      maxConcurrentUploads: 2,
    });

    // Listen to events
    engine.on('upload_event', (event) => {
      console.log('[VOD Upload]', event.type, event);
    });
  }, []);

  return (
    <html>
      <body>{/* ... */}</body>
    </html>
  );
}
```

## 3. Set Platform Credentials

```typescript
// apps/studio/components/LiveStudio.tsx

const engine = getVODEngine();

// After OAuth flow completes
await engine.setPlatformCredentials('youtube', {
  accessToken: 'ya29.a0...',
  refreshToken: '1//...',
});

await engine.setPlatformCredentials('twitch', {
  accessToken: 'gapj...',
  userId: 'user123',
});

await engine.setPlatformCredentials('s3', {
  accessKeyId: 'AKIA...',
  secretAccessKey: 'wJa...',
  region: 'us-east-1',
});
```

## 4. Add UI Component

```typescript
// apps/studio/components/StreamRecorder.tsx

import { VODUploadUI } from '@/lib/obs/vod';

export function StreamRecorder() {
  return (
    <VODUploadUI
      recordingId="rec-123"
      recordingPath="/recordings/stream-2026-07-24.mp4"
      title="My Stream"
      description="Awesome stream"
      onUploadComplete={(jobId) => console.log('Done!', jobId)}
      onUploadFailed={(jobId, error) => console.error('Failed:', error)}
    />
  );
}
```

## 5. Manual Upload (Optional)

```typescript
const engine = getVODEngine();

const job = await engine.createUploadJob(
  '/recordings/stream.mp4',
  {
    id: 'rec-123',
    recordingId: 'rec-123',
    title: 'My Stream',
    duration: 3600,
    fileSize: 5368709120,
    resolution: '1920x1080',
    frameRate: 30,
    bitrate: 5000,
    recordedAt: new Date(),
    createdAt: new Date(),
    tags: ['stream', 'live'],
  },
  ['youtube', 'twitch', 's3']
);

console.log('Upload started:', job.id);
```

## What Happens Next

1. ✅ Auto-thumbnails generated from middle keyframe
2. ✅ Upload to YouTube (unlisted by default)
3. ✅ Upload to Twitch (if connected)
4. ✅ Backup to AWS S3
5. ✅ Auto-retry on failure (up to 3 times)
6. ✅ Event notifications for each step

## Monitor Progress

```typescript
const engine = getVODEngine();

// Listen to events
engine.on('upload_event', (event) => {
  switch (event.type) {
    case 'platform_started':
      console.log(`📤 Uploading to ${event.platform}...`);
      break;
    case 'platform_completed':
      console.log(`✅ ${event.platform} complete`);
      break;
    case 'upload_completed':
      console.log('✅ All uploads finished!');
      break;
    case 'upload_failed':
      console.log('❌ Upload failed:', event.error);
      break;
  }
});

// Get metrics anytime
const metrics = engine.getMetrics();
console.log(`${metrics.successfulUploads}/${metrics.totalUploads} uploads successful`);
```

## Configuration Examples

### High volume (many short streams)
```typescript
getVODEngine({
  autoUploadEnabled: true,
  maxConcurrentUploads: 3,
  uploadRetryConfig: {
    maxRetries: 2,
    initialDelayMs: 500,
  },
});
```

### Large files (long streams)
```typescript
getVODEngine({
  autoUploadEnabled: true,
  maxConcurrentUploads: 1,
  uploadRetryConfig: {
    maxRetries: 5,
    initialDelayMs: 5000,
  },
});
```

### Development/Testing
```typescript
getVODEngine({
  autoUploadEnabled: false, // Manual upload only
  maxConcurrentUploads: 1,
  uploadRetryConfig: {
    maxRetries: 1,
  },
});
```

## Auto-Upload from Recording

When recording stops:

```typescript
import { getRecorder } from '@/lib/obs/recording';
import { getVODEngine } from '@/lib/obs/vod';

async function handleStopRecording() {
  const recorder = getRecorder();
  const metadata = await recorder.stopRecording();

  // Auto-start VOD upload
  const engine = getVODEngine();
  const job = await engine.createUploadJob(
    metadata.filePath,
    {
      id: metadata.id,
      recordingId: metadata.id,
      title: metadata.title || 'Stream Recording',
      duration: metadata.duration || 0,
      fileSize: metadata.fileSize,
      resolution: '1920x1080',
      frameRate: 30,
      bitrate: 5000,
      recordedAt: metadata.startedAt,
      createdAt: new Date(),
      tags: [],
    },
    ['youtube', 's3'] // Upload to these platforms
  );

  console.log('Recording uploaded:', job.id);
}
```

## Enable/Disable Uploads

```typescript
const engine = getVODEngine();

// Turn off auto-upload (manual only)
engine.setAutoUploadEnabled(false);

// Turn back on
engine.setAutoUploadEnabled(true);

// Enable/disable specific platform
engine.updatePlatformConfig('youtube', false); // Don't upload to YouTube
engine.updatePlatformConfig('twitch', true);   // Do upload to Twitch
```

## Manage Queue

```typescript
import { getVODQueue } from '@/lib/obs/vod';

const queue = getVODQueue();

// Check queue size
console.log('Pending uploads:', queue.size());

// Prioritize specific job
queue.prioritize('vod-123-abc');

// Remove job from queue
queue.remove('vod-123-abc');

// Get queue stats
const stats = queue.getStats();
console.log(`${stats.pendingItems} uploads waiting`);
```

## Troubleshooting

### Uploads not starting
```typescript
const engine = getVODEngine();
console.log('Auto-upload enabled?', engine.getMetrics());

// Check if credentials set
// Check if auto-upload is enabled: engine.config.autoUploadEnabled
```

### Check upload status
```typescript
const engine = getVODEngine();
const job = engine.getJobStatus('vod-123-abc');

if (job) {
  console.log(`Status: ${job.status}`);
  console.log(`Progress: ${job.progress}%`);
  console.log(`Platforms: ${job.platforms.join(', ')}`);
  
  // Check per-platform status
  job.platformResults.forEach((result, platform) => {
    console.log(`${platform}: ${result.status}`);
  });
}
```

### View queue health
```typescript
import { getVODQueue } from '@/lib/obs/vod';

const queue = getVODQueue();
const health = queue.getHealth();

console.log('Queue depth:', health.queueDepth);
console.log('Avg item age:', health.avgItemAge, 'seconds');
console.log('Oldest item:', health.oldestItem);
```

## Environment Variables

Add to `.env.local`:

```bash
# YouTube
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxx

# Twitch
TWITCH_CLIENT_ID=xxx
TWITCH_CLIENT_SECRET=xxx

# AWS S3
AWS_S3_BUCKET=wise2-recordings
AWS_REGION=us-east-1
```

## Next Steps

1. ✅ Read full docs: `VOD_UPLOAD_README.md`
2. ✅ Integration guide: `INTEGRATION_GUIDE.md`
3. ✅ Check type definitions: `VODTypes.ts`
4. ✅ Explore API: `VODUploadEngine.ts`

## Common Tasks

### Change visibility after upload started
```typescript
// Can't change mid-upload, but can set for next job
const engine = getVODEngine();
const nextJob = await engine.createUploadJob(
  path,
  metadata,
  platforms,
  'private' // This time, private
);
```

### Retry failed upload
```typescript
const engine = getVODEngine();
await engine.resumeUpload('vod-123-abc');
```

### Cancel in-progress upload
```typescript
const engine = getVODEngine();
await engine.cancelUpload('vod-123-abc');
```

### Export upload queue for backup
```typescript
import { getVODQueue } from '@/lib/obs/vod';

const queue = getVODQueue();
const backup = queue.export();
console.log(backup); // JSON string, save somewhere safe
```

### Restore queue from backup
```typescript
const queue = getVODQueue();
queue.import(savedBackup);
```

## Performance Tips

1. **Limit concurrent uploads** - Set to 2-3 max for best performance
2. **Batch small uploads** - Multiple 30-min streams better than one 6-hour stream
3. **Refresh OAuth daily** - Tokens expire, set background refresh
4. **Monitor queue depth** - Alert if queue grows beyond 5 items
5. **Archive old uploads** - Move to S3 Glacier after 30 days

## API Cheat Sheet

```typescript
// Engine
getVODEngine()                                 // Get/create engine
engine.createUploadJob()                       // Start upload
engine.setPlatformCredentials()                // Add auth
engine.getJobStatus()                          // Check job
engine.getUploadQueue()                        // All jobs
engine.getMetrics()                            // Stats
engine.pauseUpload()                           // Pause job
engine.resumeUpload()                          // Resume job
engine.cancelUpload()                          // Cancel job
engine.setAutoUploadEnabled()                  // Enable/disable auto
engine.updatePlatformConfig()                  // Enable/disable platform

// Queue
getVODQueue()                                  // Get queue
queue.enqueue()                                // Add item
queue.dequeue()                                // Remove & return
queue.prioritize()                             // Move to front
queue.size()                                   // Queue length
queue.getStats()                               // Stats
queue.getHealth()                              // Health check
queue.export()                                 // Backup
queue.import()                                 // Restore

// UI
<VODUploadUI />                                // Component
```

That's it! You're ready to upload. 🚀
