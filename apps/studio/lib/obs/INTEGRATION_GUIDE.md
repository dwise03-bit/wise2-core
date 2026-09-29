# OBS Backend Integration Guide

Quick start guide for integrating the OBS backend into WISE² Studio.

## Setup (5 minutes)

### 1. Environment Configuration

Add to `.env.local`:

```bash
# RTMP Server
RTMP_PORT=1935
RECORDING_PATH=./recordings

# Twitch
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_secret

# YouTube
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_secret

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_secret

# App
APP_URL=http://localhost:3000
OBS_HOST=localhost
OBS_PORT=4444
```

### 2. Initialize OBS Backend

In your main layout or root component:

```typescript
// app/layout.tsx or app/providers.tsx
import { initObsBackend } from '@/lib/obs';

export default function RootLayout() {
  useEffect(() => {
    const obs = initObsBackend();
    obs.initialize().catch(console.error);

    return () => {
      obs.shutdown().catch(console.error);
    };
  }, []);

  return (
    // Your app
  );
}
```

### 3. API Route Setup

Create backend routes:

```typescript
// app/api/streams/start/route.ts
import { initStreamSessionManager, initRtmpServer } from '@/lib/obs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionManager = initStreamSessionManager();

    const session = sessionManager.createSession({
      userId: body.userId,
      streamKey: body.streamKey,
      resolution: body.resolution || { width: 1920, height: 1080 },
      frameRate: body.frameRate || 30,
      bitrate: body.bitrate || 2500,
      platforms: body.platforms || [],
    });

    await session.start();

    return NextResponse.json({
      sessionId: session.getSessionId(),
      status: session.getStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/scenes/route.ts
import { initSceneManager } from '@/lib/obs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sceneManager = initSceneManager();

    const scene = sceneManager.createScene({
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(scene);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const sceneManager = initSceneManager();
  return NextResponse.json({
    scenes: sceneManager.getScenes(),
    stats: sceneManager.getStats(),
  });
}
```

## Usage Examples

### Stream Control

```typescript
// hooks/useStream.ts
import { useState, useEffect } from 'react';
import { initStreamSessionManager } from '@/lib/obs';

export function useStream() {
  const [session, setSession] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const startStream = async (config) => {
    const manager = initStreamSessionManager();
    const sess = manager.createSession(config);

    sess.on('metrics:updated', setMetrics);
    await sess.start();

    setSession(sess);
  };

  const stopStream = async () => {
    if (session) {
      await session.stop();
      setSession(null);
    }
  };

  return { session, metrics, startStream, stopStream };
}
```

### Scene Management

```typescript
// hooks/useScenes.ts
import { useState, useCallback } from 'react';
import { initSceneManager } from '@/lib/obs';

export function useScenes() {
  const [scenes, setScenes] = useState([]);
  const sceneManager = initSceneManager();

  const loadScenes = useCallback(() => {
    setScenes(sceneManager.getScenes());
  }, []);

  const createScene = useCallback((config) => {
    const scene = sceneManager.createScene(config);
    loadScenes();
    return scene;
  }, [loadScenes]);

  const switchScene = useCallback(async (sceneId) => {
    await sceneManager.switchScene(sceneId);
    loadScenes();
  }, [loadScenes]);

  const addSource = useCallback((sceneId, source) => {
    const result = sceneManager.addSource(sceneId, source);
    loadScenes();
    return result;
  }, [loadScenes]);

  return {
    scenes,
    loadScenes,
    createScene,
    switchScene,
    addSource,
  };
}
```

### Platform Integration

```typescript
// hooks/usePlatforms.ts
import { useState, useEffect } from 'react';
import { initPlatformIntegration } from '@/lib/obs';

export function usePlatforms() {
  const [platforms, setPlatforms] = useState([]);
  const platformMgr = initPlatformIntegration();

  const initiateOAuth = async (platform) => {
    const { authUrl } = await platformMgr.initiateOAuth(platform);
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (platform, code) => {
    const credentials = await platformMgr.handleOAuthCallback(platform, code);
    setPlatforms(platformMgr.getConfiguredPlatforms());
    return credentials;
  };

  const startBroadcast = async (platform, config) => {
    return await platformMgr.startBroadcast(platform, config);
  };

  useEffect(() => {
    setPlatforms(platformMgr.getConfiguredPlatforms());
  }, []);

  return {
    platforms,
    initiateOAuth,
    handleOAuthCallback,
    startBroadcast,
  };
}
```

### Source Capture

```typescript
// hooks/useSourceCapture.ts
import { useState, useRef } from 'react';
import {
  ScreenCaptureSource,
  WebcamCaptureSource,
  SourceComposition,
} from '@/lib/obs';

export function useSourceCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const compositionRef = useRef<SourceComposition | null>(null);

  const captureScreen = async () => {
    const screen = new ScreenCaptureSource({ cursor: 'motion' });
    const mediaStream = await screen.start();
    setStream(mediaStream);
    return screen;
  };

  const captureWebcam = async (deviceId?) => {
    const webcam = new WebcamCaptureSource({ deviceId });
    const mediaStream = await webcam.start();
    setStream(mediaStream);
    return webcam;
  };

  const setupComposition = async () => {
    const composition = new SourceComposition(1920, 1080);
    await composition.initialize();
    compositionRef.current = composition;
    return composition;
  };

  return {
    stream,
    captureScreen,
    captureWebcam,
    setupComposition,
    composition: compositionRef.current,
  };
}
```

## UI Components

### Stream Control Component

```typescript
// components/StreamControl.tsx
'use client';

import { useStream } from '@/hooks/useStream';
import { Button } from '@/components/ui/button';

export function StreamControl() {
  const { session, metrics, startStream, stopStream } = useStream();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => startStream({
            userId: 'user-1',
            streamKey: 'key-123',
            platforms: ['twitch'],
          })}
          disabled={!!session}
        >
          Start Stream
        </Button>
        <Button
          onClick={stopStream}
          disabled={!session}
          variant="destructive"
        >
          Stop Stream
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">FPS</span>
            <p className="text-2xl font-bold">{metrics.fps}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Bitrate</span>
            <p className="text-2xl font-bold">{metrics.bitrate} kbps</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Dropped Frames</span>
            <p className="text-2xl font-bold">{metrics.droppedFrames}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Duration</span>
            <p className="text-2xl font-bold">{metrics.duration}s</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Scene Manager Component

```typescript
// components/SceneManager.tsx
'use client';

import { useScenes } from '@/hooks/useScenes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SceneManager() {
  const { scenes, createScene, switchScene } = useScenes();
  const [name, setName] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Scene name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={() => {
          createScene({ name });
          setName('');
        }}>
          Create Scene
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {scenes.map((scene) => (
          <Button
            key={scene.id}
            variant={scene.isActive ? 'default' : 'outline'}
            onClick={() => switchScene(scene.id)}
            className="h-auto flex flex-col items-start p-4"
          >
            <span className="font-bold">{scene.name}</span>
            <span className="text-xs text-gray-500">
              {scene.sources.length} sources
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### Platform Integration Component

```typescript
// components/PlatformIntegration.tsx
'use client';

import { usePlatforms } from '@/hooks/usePlatforms';
import { Button } from '@/components/ui/button';

export function PlatformIntegration() {
  const { platforms, initiateOAuth } = usePlatforms();

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Connected Platforms</h3>

      <div className="grid grid-cols-3 gap-2">
        {['twitch', 'youtube', 'facebook'].map((platform) => (
          <Button
            key={platform}
            variant={
              platforms.includes(platform) ? 'default' : 'outline'
            }
            onClick={() => initiateOAuth(platform)}
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

## Database Setup

Run migrations to create stream-related tables:

```bash
# Generate Prisma models
npx prisma generate

# Create migration
npx prisma migrate dev --name add_streaming_tables
```

## Testing

```typescript
// __tests__/stream-session.test.ts
import { initStreamSessionManager } from '@/lib/obs';

describe('Stream Session', () => {
  it('should create and manage session lifecycle', async () => {
    const manager = initStreamSessionManager();

    const session = manager.createSession({
      userId: 'test-user',
      streamKey: 'test-key',
    });

    expect(session.getStatus()).toBe('initializing');

    await session.start();
    expect(session.getStatus()).toBe('active');

    const info = session.getSessionInfo();
    expect(info.userId).toBe('test-user');

    await session.stop();
    expect(session.getStatus()).toBe('stopped');
  });

  it('should track metrics', async () => {
    const manager = initStreamSessionManager();
    const session = manager.createSession({
      userId: 'test-user',
      streamKey: 'test-key',
    });

    await session.start();

    session.updateMetrics({
      fps: 30,
      bitrate: 2500,
      droppedFrames: 0,
    });

    const metrics = session.getMetrics();
    expect(metrics.fps).toBe(30);
    expect(metrics.bitrate).toBe(2500);
  });
});
```

## Monitoring & Debugging

### Enable Logging

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  import('debug').then(({ default: debug }) => {
    window.DEBUG = debug('obs:*');
  });
}
```

### Listen to Events

```typescript
// Monitor all system events
const obs = getObsBackend();

obs.getRtmpServer().on('stream:start', (stream) => {
  console.log('[RTMP] Stream started:', stream.id);
});

obs.getSessionManager().getActiveSessions().forEach((session) => {
  session.on('metrics:updated', (metrics) => {
    console.log('[Metrics]', metrics);
  });
});
```

## Performance Tips

1. **Lazy load streams** - Only initialize active streams
2. **Batch scene updates** - Combine multiple source updates into one transaction
3. **Debounce metrics** - Don't update UI on every metric change
4. **Cleanup sessions** - Always call `session.cleanup()` when done
5. **Monitor memory** - Long-running streams consume memory; implement periodic cleanup

## Troubleshooting

### RTMP Port Already in Use
```bash
# Find process using port 1935
lsof -i :1935

# Kill process
kill -9 <PID>
```

### OAuth Redirect Issues
- Verify `APP_URL` matches configured redirect URI
- Check platform OAuth app settings
- Ensure cookies enabled in browser

### Source Capture Not Working
- Check browser permissions for screen/camera
- Verify HTTPS (required for some capture APIs)
- Test with different browsers

### High Latency
- Reduce bitrate
- Lower resolution
- Check network connectivity
- Increase buffer size

## Next Steps

1. Customize UI components for your design system
2. Add analytics/telemetry
3. Implement recording backend (ffmpeg integration)
4. Add bitrate adaptation logic
5. Create Stream Deck integration
6. Build custom overlay system

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review error codes in each module
- Check browser console for detailed logs
- Review metrics to diagnose performance issues
