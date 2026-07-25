# Multistream Integration Guide

Complete guide to integrating multistream broadcasting into the WISE² Live Studio.

## File Structure

```
apps/studio/lib/obs/multistream/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript definitions
├── MultistreamEngine.ts     # Core streaming engine
├── MultistreamControl.tsx   # React UI component
├── README.md                # Feature documentation
└── INTEGRATION_GUIDE.md     # This file
```

## Step 1: Add to Live Studio Page

Update your live studio component to include the multistream control:

```tsx
// apps/studio/app/live-studio/page.tsx

'use client';

import React, { useState } from 'react';
import { MultistreamControl } from '@/lib/obs/multistream';
import { MultistreamStatus } from '@/lib/obs/multistream/types';

export default function LiveStudioPage() {
  const [streamStatus, setStreamStatus] = useState<MultistreamStatus | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const handleStatusChange = (status: MultistreamStatus) => {
    setStreamStatus(status);
    console.log('Stream status updated:', status);
  };

  const handleError = (error: string) => {
    setStreamError(error);
    console.error('Stream error:', error);
  };

  return (
    <div className="live-studio">
      <div className="studio-layout">
        {/* Video preview area */}
        <div className="video-preview">
          <video id="stream-preview" className="preview-video" />
        </div>

        {/* Multistream control panel */}
        <div className="control-panel">
          <MultistreamControl
            enabled={false}
            onStatusChange={handleStatusChange}
            onError={handleError}
          />

          {/* Show current status */}
          {streamStatus && (
            <div className="status-info">
              <h3>Stream Status</h3>
              <p>Active Platforms: {streamStatus.activePlatforms}</p>
              <p>Total Viewers: {streamStatus.totalViewers}</p>
              <p>Health: {streamStatus.healthStatus}</p>
            </div>
          )}

          {/* Show errors */}
          {streamError && (
            <div className="error-display">
              <p>{streamError}</p>
              <button onClick={() => setStreamError(null)}>Dismiss</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .live-studio {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1rem;
          height: 100vh;
          padding: 1rem;
          background: #111827;
        }

        .video-preview {
          background: #000;
          border-radius: 0.5rem;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .status-info {
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
          color: #f3f4f6;
        }

        .error-display {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 0.5rem;
          color: #fca5a5;
        }

        .error-display button {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .error-display button:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}
```

## Step 2: Connect to Video Encoder

Wire the multistream engine to your video encoder:

```tsx
// apps/studio/lib/obs/streamingManager.ts

import { MultistreamEngine } from './obs/multistream';

export class StreamingManager {
  private engine: MultistreamEngine | null = null;
  private encoder: VideoEncoder | null = null;

  // Initialize streaming
  async initialize() {
    this.engine = new MultistreamEngine();

    // Set up video encoder
    this.setupEncoder();

    // Listen for encoded frames
    this.startEncodingLoop();
  }

  // Setup H.264 video encoder
  private setupEncoder() {
    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        // Send encoded frame to multistream engine
        if (this.engine && chunk.data) {
          this.engine.sendEncodedChunk(
            Buffer.from(chunk.data),
            metadata.decoderPrivate.isKeyFrame,
            chunk.timestamp,
          );
        }
      },
      error: (error) => {
        console.error('Encoder error:', error);
      },
    });

    this.encoder.configure({
      codec: 'avc1.42001e', // H.264 baseline profile
      width: 1920,
      height: 1080,
      framerate: 60,
      bitrate: 4500000, // 4.5 Mbps
    });
  }

  // Main encoding loop
  private async startEncodingLoop() {
    const canvas = document.getElementById('stream-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    const frameInterval = 1000 / 60; // 60 FPS

    const loop = () => {
      const now = performance.now();

      // Draw current frame
      // (Your custom rendering logic here)

      // Encode frame
      if (this.encoder) {
        const frame = new VideoFrame(canvas, { timestamp: now * 1000 });
        this.encoder.encode(frame);
        frame.close();
      }

      frameCount++;

      // Next frame
      requestAnimationFrame(loop);
    };

    // Start encoding loop
    loop();
  }

  // Get engine for UI
  getEngine(): MultistreamEngine | null {
    return this.engine;
  }
}
```

## Step 3: Handle Stream Keys Securely

Store stream keys in environment variables or a secure vault:

```bash
# .env.local (never commit this)
TWITCH_STREAM_KEY=xxxx_your_key_xxxx
YOUTUBE_STREAM_KEY=your_youtube_key
FACEBOOK_STREAM_KEY=your_facebook_key
LINKEDIN_STREAM_KEY=your_linkedin_key
```

```tsx
// apps/studio/lib/streamKeyManager.ts

export async function getStreamKeys() {
  // Load from secure backend endpoint, not directly from env
  const response = await fetch('/api/stream-keys');
  if (!response.ok) throw new Error('Failed to load stream keys');
  return response.json();
}

// API route: pages/api/stream-keys.ts
export default async function handler(req, res) {
  // Verify user is authenticated
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Return stream keys from secure storage
  const keys = {
    twitch: process.env.TWITCH_STREAM_KEY,
    youtube: process.env.YOUTUBE_STREAM_KEY,
    facebook: process.env.FACEBOOK_STREAM_KEY,
    linkedin: process.env.LINKEDIN_STREAM_KEY,
  };

  res.status(200).json(keys);
}
```

## Step 4: Database Migrations

Run Prisma migration to create multistream tables:

```bash
cd packages/db

# Create migration
npx prisma migrate dev --name add_multistream_tables

# Apply migration
npx prisma migrate deploy
```

## Step 5: Save Configuration

Save multistream configurations to database:

```tsx
// apps/studio/lib/api/multistream.ts

import { prisma } from '@/lib/db';
import { MultistreamConfig } from '@/lib/obs/multistream';

export async function saveMultistreamConfig(
  userId: string,
  config: MultistreamConfig,
) {
  return await prisma.multistreamConfig.create({
    data: {
      userId,
      name: config.name,
      description: config.description,
      platforms: config.platforms,
      encodingPreset: config.encodingPreset,
      videoBitrate: config.videoBitrate,
      audioBitrate: config.audioBitrate,
      resolution: config.resolution,
      fps: config.fps,
      enableFailover: config.enableFailover,
      failoverDelay: config.failoverDelay,
      enableMetrics: config.enableMetrics,
      metricsInterval: config.metricsInterval,
    },
  });
}

export async function loadMultistreamConfig(configId: string) {
  const config = await prisma.multistreamConfig.findUnique({
    where: { id: configId },
  });

  if (!config) throw new Error('Config not found');

  return {
    ...config,
    platforms: config.platforms as any[],
  };
}

export async function saveMultistreamSession(
  configId: string,
  sessionData: any,
) {
  return await prisma.multistreamSession.create({
    data: {
      configId,
      startedAt: new Date(sessionData.startedAt),
      stoppedAt: new Date(sessionData.stoppedAt || Date.now()),
      duration: sessionData.duration,
      platforms: sessionData.platforms,
      totalViewers: sessionData.totalViewers,
      platformStats: sessionData.platformStats,
      title: sessionData.title,
      category: sessionData.category,
      tags: sessionData.tags || [],
    },
  });
}
```

## Step 6: Analytics & Reporting

Create analytics dashboard for multistream sessions:

```tsx
// apps/studio/components/MultistreamAnalytics.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { MultistreamSession } from '@/lib/obs/multistream';

interface MultistreamAnalyticsProps {
  sessionId: string;
}

export function MultistreamAnalytics({ sessionId }: MultistreamAnalyticsProps) {
  const [session, setSession] = useState<MultistreamSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/multistream/sessions/${sessionId}`);
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="analytics">
      <h2>Broadcast Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Duration</div>
          <div className="stat-value">
            {session.duration ? `${Math.round(session.duration / 60)}m` : 'N/A'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Viewers</div>
          <div className="stat-value">{session.totalViewers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Platforms</div>
          <div className="stat-value">{session.platforms.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Chat Messages</div>
          <div className="stat-value">{session.totalChatMessages || 0}</div>
        </div>
      </div>

      {/* Per-platform stats */}
      <div className="platform-stats">
        <h3>Platform Performance</h3>
        {session.platformStats.map((stats) => (
          <div key={stats.platform} className="platform-stat">
            <h4>{stats.platform}</h4>
            <ul>
              <li>Peak Viewers: {stats.peakViewers}</li>
              <li>Average Bitrate: {Math.round(stats.averageBitrate / 1000)}M</li>
              <li>Uptime: {Math.round(stats.uptime)}%</li>
              <li>Frame Drops: {stats.frameDropPercentage.toFixed(2)}%</li>
              <li>Reconnects: {stats.reconnectCount}</li>
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .analytics {
          padding: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
          border: 1px solid #4b5563;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 600;
          color: #10b981;
        }

        .platform-stats {
          margin-top: 2rem;
        }

        .platform-stat {
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .platform-stat h4 {
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }

        .platform-stat ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .platform-stat li {
          padding: 0.25rem 0;
          font-size: 0.875rem;
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
```

## Step 7: Testing

Test the multistream functionality:

```tsx
// apps/studio/__tests__/multistream.test.ts

import { MultistreamEngine, MultistreamConfig } from '@/lib/obs/multistream';
import { describe, it, expect, beforeEach } from 'vitest';

describe('MultistreamEngine', () => {
  let engine: MultistreamEngine;

  beforeEach(() => {
    engine = new MultistreamEngine();
  });

  it('should initialize with configuration', async () => {
    const config: MultistreamConfig = {
      id: 'test-config',
      name: 'Test Broadcast',
      platforms: [
        {
          id: 'twitch',
          platform: 'twitch',
          name: 'Twitch',
          streamKey: 'test_key',
          isEnabled: true,
          isConnected: false,
          status: 'idle',
          settings: {},
        },
      ],
      encodingPreset: 'fast',
      videoBitrate: 4500,
      audioBitrate: 128,
      resolution: '1080p',
      fps: 30,
      enableFailover: true,
      failoverDelay: 5000,
      enableMetrics: true,
      metricsInterval: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await engine.initialize(config);
    const status = engine.getStatus();

    expect(status.isActive).toBe(false);
  });

  it('should start streaming', async () => {
    const config = { /* ... */ };
    await engine.initialize(config);
    await engine.start();

    const status = engine.getStatus();
    expect(status.isActive).toBe(true);
  });

  it('should stop streaming', async () => {
    const config = { /* ... */ };
    await engine.initialize(config);
    await engine.start();
    const session = await engine.stop();

    expect(session).toBeDefined();
    expect(session.platforms).toBeDefined();
  });

  it('should handle platform errors with failover', async () => {
    // Test failover logic
  });
});
```

## Troubleshooting

### Stream Keys Not Loading
- Check environment variables are set
- Verify API endpoint is returning keys
- Check browser console for errors

### Connection Failures
- Verify stream keys are correct
- Check network connectivity
- Ensure firewall allows RTMP/RTMPS

### Performance Issues
- Reduce bitrate or resolution
- Change encoding preset to `ultrafast`
- Check CPU usage
- Monitor network bandwidth

### Database Errors
- Run `npx prisma migrate deploy`
- Check database connection string
- Verify Prisma schema is up to date

## Next Steps

1. **Custom Overlays** - Add platform-specific overlays
2. **Chat Integration** - Aggregate chat from all platforms
3. **Analytics Dashboard** - Real-time metrics display
4. **Auto-Quality** - Automatic bitrate adjustment
5. **Scheduled Broadcasts** - Schedule streams in advance
6. **Recording** - Simultaneous recording during multistream

## Resources

- [Main Multistream README](./README.md)
- [OBS Module Documentation](../README.md)
- [WISE² Core Documentation](/docs)
