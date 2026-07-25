# VOD Upload System - Integration Guide

Complete guide for integrating VOD auto-upload into WISE² Studio's streaming pipeline.

## Overview

The VOD Upload System automatically uploads recorded streams to multiple platforms after recording stops. It integrates with:

- **Recording System** (`recording.ts`) - Get finished recording metadata
- **Stream Pipeline** (`streamPipeline.ts`) - Listen for stream end events
- **Platform Integration** (`platformIntegration.ts`) - Reuse OAuth credentials
- **React UI Components** - Manage uploads from dashboard

## Step 1: Initialize VOD Engine on App Start

### In your main app layout or context provider:

```typescript
// apps/studio/app/providers.tsx

'use client';

import { useEffect } from 'react';
import { getVODEngine } from '@/lib/obs/vod';

export function VODProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize VOD engine with app-level config
    const engine = getVODEngine({
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
    });

    // Subscribe to events globally
    engine.on('upload_event', (event) => {
      console.log('[VOD]', event.type, event);

      // Optional: Send to analytics/logging service
      if (event.type === 'upload_completed') {
        // Track successful upload
      } else if (event.type === 'upload_failed') {
        // Alert user to failed upload
      }
    });

    return () => {
      // Cleanup on unmount
      engine.removeAllListeners();
    };
  }, []);

  return <>{children}</>;
}
```

Add to providers:

```typescript
// apps/studio/app/providers.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <VODProvider>
        {children}
      </VODProvider>
    </AuthProvider>
  );
}
```

## Step 2: Hook into Recording Stop Event

### Listen to recording completion and auto-start upload:

```typescript
// apps/studio/lib/obs/hooks/useRecordingUpload.ts

'use client';

import { useEffect, useCallback } from 'react';
import { getVODEngine } from '@/lib/obs/vod';
import { type RecordingMetadata } from '@/lib/obs/recording';

export function useRecordingUpload() {
  const engine = getVODEngine();

  const handleRecordingComplete = useCallback(
    async (recording: RecordingMetadata) => {
      // Auto-create upload job when recording stops
      const job = await engine.createUploadJob(
        recording.filePath,
        {
          id: recording.id,
          recordingId: recording.id,
          title: recording.title || 'Stream Recording',
          description: recording.platform
            ? `Recorded from ${recording.platform}`
            : undefined,
          tags: [],
          duration: recording.duration || 0,
          fileSize: recording.fileSize,
          resolution: '1920x1080',
          frameRate: 30,
          bitrate: 5000,
          recordedAt: recording.startedAt,
          createdAt: new Date(),
        },
        ['youtube', 's3'], // Auto-upload to these platforms
        'unlisted'
      );

      console.log('Upload job created:', job.id);
      return job;
    },
    [engine]
  );

  return { handleRecordingComplete };
}
```

### Use in Live Studio component:

```typescript
// apps/studio/components/LiveStudio.tsx

import { useRecordingUpload } from '@/lib/obs/hooks/useRecordingUpload';
import { getRecorder } from '@/lib/obs/recording';

export function LiveStudio() {
  const { handleRecordingComplete } = useRecordingUpload();

  const handleStopRecording = async () => {
    const recorder = getRecorder();
    const metadata = await recorder.stopRecording();

    // Auto-trigger upload
    await handleRecordingComplete(metadata);
  };

  return (
    // ... component JSX
  );
}
```

## Step 3: Setup Platform OAuth Integration

### Connect existing credentials to VOD engine:

```typescript
// apps/studio/lib/obs/hooks/usePlatformCredentials.ts

'use client';

import { useEffect } from 'react';
import { getVODEngine } from '@/lib/obs/vod';

export function usePlatformCredentials() {
  const engine = getVODEngine();

  useEffect(() => {
    // Fetch stored credentials from your auth system
    const setupCredentials = async () => {
      try {
        // YouTube
        const youtubeToken = await fetchStoredToken('youtube');
        if (youtubeToken) {
          await engine.setPlatformCredentials('youtube', {
            accessToken: youtubeToken.accessToken,
            refreshToken: youtubeToken.refreshToken,
            expiresAt: youtubeToken.expiresAt,
          });
        }

        // Twitch
        const twitchToken = await fetchStoredToken('twitch');
        if (twitchToken) {
          await engine.setPlatformCredentials('twitch', {
            accessToken: twitchToken.accessToken,
            userId: twitchToken.userId,
          });
        }

        // AWS S3
        const s3Credentials = await fetchStoredS3Credentials();
        if (s3Credentials) {
          await engine.setPlatformCredentials('s3', {
            accessKeyId: s3Credentials.accessKeyId,
            secretAccessKey: s3Credentials.secretAccessKey,
            region: s3Credentials.region,
          });
        }
      } catch (error) {
        console.error('Failed to setup platform credentials:', error);
      }
    };

    setupCredentials();
  }, [engine]);
}

async function fetchStoredToken(platform: string) {
  const response = await fetch(`/api/auth/${platform}/token`);
  if (response.ok) {
    return response.json();
  }
  return null;
}

async function fetchStoredS3Credentials() {
  const response = await fetch('/api/auth/s3/credentials');
  if (response.ok) {
    return response.json();
  }
  return null;
}
```

## Step 4: Add VOD UI to Dashboard

### Display in Live Studio control panel:

```typescript
// apps/studio/components/LiveStudioPanel.tsx

import { VODUploadUI } from '@/lib/obs/vod';
import { useState } from 'react';

export function LiveStudioPanel() {
  const [recordingPath, setRecordingPath] = useState<string>();
  const [recordingId, setRecordingId] = useState<string>();

  return (
    <div className="space-y-6">
      {/* Existing stream controls */}

      {/* VOD Upload Manager */}
      <VODUploadUI
        recordingId={recordingId}
        recordingPath={recordingPath}
        title="Tonight's Stream"
        description="Community stream with Q&A"
        onUploadComplete={(jobId) => {
          console.log('Upload complete:', jobId);
          // Show success toast
        }}
        onUploadFailed={(jobId, error) => {
          console.error('Upload failed:', jobId, error);
          // Show error toast
        }}
      />
    </div>
  );
}
```

## Step 5: Create API Endpoints for Uploads

### Backend endpoint to handle file upload:

```typescript
// apps/studio/app/api/obs/vod/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobId = formData.get('jobId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save to recording directory
    const filename = `vod-${jobId}-${Date.now()}.mp4`;
    const filePath = join(process.cwd(), 'public/recordings', filename);

    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    return NextResponse.json(
      {
        success: true,
        jobId,
        path: `/recordings/${filename}`,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('VOD upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Step 6: Stream End Hook Integration

### Connect to existing stream pipeline:

```typescript
// apps/studio/lib/obs/hooks/useStreamLifecycle.ts

'use client';

import { useEffect } from 'react';
import { getVODEngine } from '@/lib/obs/vod';
import { StreamPipeline } from '@/lib/obs/streamPipeline';

export function useStreamLifecycle(pipeline: StreamPipeline) {
  const engine = getVODEngine();

  useEffect(() => {
    // Listen to stream end event
    const handleStreamEnd = () => {
      console.log('Stream ended - VOD upload queued');

      // Get recording metadata
      const recording = pipeline.getRecordingMetadata();
      if (recording) {
        engine.createUploadJob(
          recording.filePath,
          {
            id: recording.id,
            recordingId: recording.id,
            title: recording.title || 'Stream Recording',
            duration: recording.duration || 0,
            fileSize: recording.fileSize,
            resolution: '1920x1080',
            frameRate: 30,
            bitrate: 5000,
            recordedAt: recording.startedAt,
            createdAt: new Date(),
            tags: [],
          },
          ['youtube', 's3'],
          'unlisted'
        );
      }
    };

    pipeline.on('stream:end', handleStreamEnd);

    return () => {
      pipeline.removeListener('stream:end', handleStreamEnd);
    };
  }, [engine, pipeline]);
}
```

## Step 7: Environment Configuration

### Add to `.env.local`:

```bash
# YouTube OAuth
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxx
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# Twitch OAuth
TWITCH_CLIENT_ID=xxx
TWITCH_CLIENT_SECRET=xxx
TWITCH_REDIRECT_URI=http://localhost:3000/api/auth/twitch/callback

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=wise2-recordings
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# VOD Configuration
VOD_AUTO_UPLOAD_ENABLED=true
VOD_DEFAULT_VISIBILITY=unlisted
VOD_MAX_CONCURRENT_UPLOADS=2
VOD_STORAGE_ARCHIVE=/recordings/archive
VOD_STORAGE_MAX_GB=500
```

## Step 8: Error Handling & Notifications

### Toast notifications for upload status:

```typescript
// apps/studio/components/VODNotifications.tsx

'use client';

import { useEffect } from 'react';
import { getVODEngine } from '@/lib/obs/vod';
import { useToast } from '@/components/ui/use-toast';

export function VODNotifications() {
  const { toast } = useToast();
  const engine = getVODEngine();

  useEffect(() => {
    engine.on('upload_event', (event) => {
      switch (event.type) {
        case 'upload_started':
          toast({
            title: 'Upload Started',
            description: 'Recording upload in progress',
            variant: 'default',
          });
          break;

        case 'platform_completed':
          toast({
            title: `${event.platform} Upload Complete`,
            description: event.message,
            variant: 'default',
          });
          break;

        case 'upload_completed':
          toast({
            title: 'All Uploads Complete',
            description: 'Recording successfully uploaded to all platforms',
            variant: 'default',
          });
          break;

        case 'upload_failed':
          toast({
            title: 'Upload Failed',
            description: event.error || 'Unknown error',
            variant: 'destructive',
          });
          break;

        case 'retry_scheduled':
          toast({
            title: 'Retry Scheduled',
            description: event.message,
            variant: 'default',
          });
          break;
      }
    });
  }, [engine, toast]);

  return null;
}

// Add to app layout
export default function RootLayout() {
  return (
    <html>
      <body>
        <VODNotifications />
        {/* ... rest of layout */}
      </body>
    </html>
  );
}
```

## Step 9: Monitoring & Analytics

### Track upload metrics:

```typescript
// apps/studio/components/VODMetricsPanel.tsx

'use client';

import { useEffect, useState } from 'react';
import { getVODEngine } from '@/lib/obs/vod';

export function VODMetricsPanel() {
  const engine = getVODEngine();
  const [metrics, setMetrics] = useState(engine.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(engine.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [engine]);

  const successRate =
    metrics.totalUploads > 0
      ? ((metrics.successfulUploads / metrics.totalUploads) * 100).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-slate-800 p-4 rounded">
        <div className="text-sm text-slate-400">Total Uploads</div>
        <div className="text-2xl font-bold text-white">
          {metrics.totalUploads}
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <div className="text-sm text-slate-400">Success Rate</div>
        <div className="text-2xl font-bold text-green-400">
          {successRate}%
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <div className="text-sm text-slate-400">Data Uploaded</div>
        <div className="text-2xl font-bold text-white">
          {(metrics.totalDataUploaded / 1e9).toFixed(1)} GB
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <div className="text-sm text-slate-400">Avg Upload Time</div>
        <div className="text-2xl font-bold text-white">
          {(metrics.averageUploadTimeMs / 1000).toFixed(1)}s
        </div>
      </div>
    </div>
  );
}
```

## Step 10: Testing

### Integration test example:

```typescript
// apps/studio/__tests__/vod-upload.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { getVODEngine, resetVODEngine } from '@/lib/obs/vod';

describe('VOD Upload System', () => {
  beforeEach(() => {
    resetVODEngine();
  });

  it('should create upload job', async () => {
    const engine = getVODEngine();

    const job = await engine.createUploadJob(
      '/recordings/test.mp4',
      {
        id: 'rec-test',
        recordingId: 'rec-test',
        title: 'Test Recording',
        duration: 3600,
        fileSize: 1024 * 1024 * 100,
        resolution: '1920x1080',
        frameRate: 30,
        bitrate: 5000,
        recordedAt: new Date(),
        createdAt: new Date(),
        tags: [],
      },
      ['youtube', 's3'],
      'unlisted'
    );

    expect(job.id).toBeDefined();
    expect(job.status).toBe('pending');
    expect(job.platforms).toEqual(['youtube', 's3']);
  });

  it('should track upload progress', async () => {
    const engine = getVODEngine();
    let uploadStarted = false;

    engine.on('upload_event', (event) => {
      if (event.type === 'upload_started') {
        uploadStarted = true;
      }
    });

    // ... create job
    expect(uploadStarted).toBe(true);
  });

  it('should handle platform credentials', async () => {
    const engine = getVODEngine();

    await engine.setPlatformCredentials('youtube', {
      accessToken: 'test-token',
    });

    // Should not throw
    expect(engine).toBeDefined();
  });
});
```

## Deployment Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] OAuth tokens configured for YouTube, Twitch
- [ ] AWS S3 bucket created and credentials set
- [ ] VOD storage directory accessible
- [ ] Upload queue persistence tested
- [ ] Error notifications configured
- [ ] Analytics tracking setup
- [ ] Rate limiting configured (if needed)
- [ ] CORS configured for upload endpoints
- [ ] Monitoring and alerting setup

## Performance Recommendations

1. **Keep auto-upload enabled** - Uploads start immediately after recording
2. **Use 2-3 concurrent uploads** - Balance speed and resource usage
3. **Set sensible retry counts** - 2-3 retries is sufficient
4. **Monitor queue depth** - Warn if queue > 5 items
5. **Cleanup old records** - Archive uploads > 30 days old
6. **Cache credentials** - Refresh OAuth tokens daily

## Troubleshooting

### Uploads not starting

```typescript
const engine = getVODEngine();
console.log('Auto-upload enabled:', engine.getMetrics());
console.log('Queue size:', engine.getUploadQueue().length);
```

### OAuth token expired

```typescript
const engine = getVODEngine();
const newToken = await refreshOAuthToken('youtube');
await engine.setPlatformCredentials('youtube', {
  accessToken: newToken,
});
```

### Queue recovery after disconnect

```typescript
const queue = getVODQueue();
const health = queue.getHealth();
console.log('Queue health:', health);
```

## Support & Documentation

- Complete API: See `VOD_UPLOAD_README.md`
- Type definitions: See `VODTypes.ts`
- Platform docs: YouTube Data API v3, Twitch API, AWS S3
- For issues: Create GitHub issue with logs
