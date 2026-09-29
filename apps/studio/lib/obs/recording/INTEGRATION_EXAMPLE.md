# Recording System Integration Example

Complete example of integrating the recording system into a streaming application.

## Basic Setup

### 1. Create Recording Provider

```typescript
// app/providers/RecordingProvider.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useRecording } from '@/lib/obs/recording';

const RecordingContext = createContext<ReturnType<typeof useRecording> | null>(null);

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const recording = useRecording({
    config: {
      format: 'mp4',
      quality: 'high',
      bitrate: 5000,
      resolution: '1920x1080',
      frameRate: 30,
      splitThreshold: 'small', // 1GB
    },
    autoFetch: true,
  });

  return (
    <RecordingContext.Provider value={recording}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecordingContext() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecordingContext must be used within RecordingProvider');
  }
  return context;
}
```

### 2. Add Provider to Root Layout

```typescript
// app/layout.tsx
import { RecordingProvider } from '@/app/providers/RecordingProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <RecordingProvider>
          {children}
        </RecordingProvider>
      </body>
    </html>
  );
}
```

## Complete Streaming Component

### Simple Integration

```typescript
// app/live-stream/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRecordingContext } from '@/app/providers/RecordingProvider';
import { RecordingControl, RecordingsList } from '@/lib/obs/recording';

export default function LiveStreamPage() {
  const {
    status,
    duration,
    fileSize,
    splitCount,
    isLoading,
    error,
    currentRecording,
    recordings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    downloadRecording,
    fetchRecordings,
  } = useRecordingContext();

  const streamRef = useRef<MediaStream | null>(null);

  // Capture display + audio for recording
  const captureStream = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      return stream;
    } catch (error) {
      if ((error as any).name === 'NotAllowedError') {
        console.log('Screen capture was cancelled');
      }
      throw error;
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await captureStream();
      streamRef.current = stream;

      await startRecording(stream, 'Live Stream', {
        platform: 'twitch', // or 'youtube', 'facebook', etc.
        streamTitle: 'My Awesome Stream',
      });

      // Handle stream stop
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        console.log('Display capture ended');
        handleStopRecording();
      };
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Refresh recordings list
      await fetchRecordings();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePlayRecording = (recordingId: string) => {
    // Open recording player
    const recording = recordings.find((r) => r.id === recordingId);
    if (recording) {
      window.open(`/player?recording=${recordingId}`, '_blank');
    }
  };

  const handleMoveRecording = (recordingId: string, destination: string) => {
    // Implement archive/move logic
    console.log(`Moving recording ${recordingId} to ${destination}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Live Streaming & Recording</h1>
        <p className="text-gray-400">
          Record your streams locally while broadcasting to Twitch, YouTube, Facebook, LinkedIn, or custom RTMP
        </p>
      </div>

      {/* Recording Controls */}
      <RecordingControl
        status={status}
        duration={duration}
        fileSize={fileSize}
        splitCount={splitCount}
        recording={currentRecording}
        isLoading={isLoading}
        error={error}
        onStart={handleStartRecording}
        onStop={handleStopRecording}
        onPause={pauseRecording}
        onResume={resumeRecording}
      />

      {/* Platform Selection */}
      <div className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">📡 Broadcasting Platforms</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Twitch', icon: '💜' },
            { name: 'YouTube', icon: '🔴' },
            { name: 'Facebook', icon: '👍' },
            { name: 'LinkedIn', icon: '🔗' },
            { name: 'TikTok', icon: '🎵' },
            { name: 'Instagram', icon: '📷' },
            { name: 'Discord', icon: '💬' },
            { name: 'Custom RTMP', icon: '📡' },
          ].map((platform) => (
            <button
              key={platform.name}
              className="p-4 rounded border border-slate-600 hover:border-amber-500 transition-colors"
            >
              <div className="text-2xl mb-2">{platform.icon}</div>
              <div className="text-sm font-medium text-gray-300">{platform.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recordings List */}
      <div className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">📹 Saved Recordings</h3>
        <RecordingsList
          recordings={recordings}
          isLoading={isLoading}
          onPlay={handlePlayRecording}
          onDelete={deleteRecording}
          onDownload={downloadRecording}
          onMove={handleMoveRecording}
        />
      </div>
    </div>
  );
}
```

## Advanced: Multi-Platform Broadcasting

```typescript
// services/MultiPlatformBroadcaster.ts
interface BroadcastConfig {
  platforms: {
    twitch?: { streamKey: string; quality: 'high' | 'medium' | 'low' };
    youtube?: { streamKey: string; quality: 'high' | 'medium' | 'low' };
    facebook?: { pageId: string; quality: 'high' | 'medium' | 'low' };
    linkedin?: { companyId: string; quality: 'high' | 'medium' | 'low' };
    custom?: { rtmpUrl: string; quality: 'high' | 'medium' | 'low' };
  };
}

export class MultiPlatformBroadcaster {
  private streams: Map<string, RTCPeerConnection> = new Map();

  async broadcast(
    stream: MediaStream,
    config: BroadcastConfig
  ): Promise<void> {
    // Connect to each platform simultaneously
    const platforms = Object.entries(config.platforms);

    for (const [platform, settings] of platforms) {
      if (settings) {
        await this.connectToPlatform(platform, stream, settings);
      }
    }
  }

  private async connectToPlatform(
    platform: string,
    stream: MediaStream,
    settings: any
  ): Promise<void> {
    // Platform-specific connection logic
    console.log(`Connecting to ${platform}...`);

    // Example for RTMP platforms (Twitch, YouTube, Facebook, LinkedIn)
    if (['twitch', 'youtube', 'facebook', 'linkedin', 'custom'].includes(platform)) {
      const streamKey = settings.streamKey || settings.rtmpUrl;
      // Use rtmp.js or ffmpeg for RTMP streaming
      // This is pseudo-code; actual implementation would use appropriate libraries
    }
  }

  stopBroadcast(platform?: string): void {
    if (platform) {
      const conn = this.streams.get(platform);
      if (conn) {
        conn.close();
        this.streams.delete(platform);
      }
    } else {
      // Stop all streams
      this.streams.forEach((conn) => conn.close());
      this.streams.clear();
    }
  }
}
```

## API Route Implementation

```typescript
// app/api/obs/recordings/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleUploadRecording } from '@/lib/obs/recording/api';

export async function POST(req: NextRequest) {
  return handleUploadRecording(req);
}

// app/api/obs/recordings/metadata/route.ts
import { handleSaveMetadata } from '@/lib/obs/recording/api';

export async function POST(req: NextRequest) {
  return handleSaveMetadata(req);
}

// app/api/obs/recordings/metadata/[id]/route.ts
import { handleUpdateMetadata } from '@/lib/obs/recording/api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdateMetadata(req, params);
}

// app/api/obs/recordings/route.ts
import { handleListRecordings } from '@/lib/obs/recording/api';

export async function GET(req: NextRequest) {
  return handleListRecordings(req);
}

// app/api/obs/recordings/[id]/route.ts
import { handleGetRecording, handleDeleteRecording } from '@/lib/obs/recording/api';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleGetRecording(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDeleteRecording(req, params);
}

// app/api/obs/recordings/[id]/download/route.ts
import { handleDownloadRecording } from '@/lib/obs/recording/api';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDownloadRecording(req, params);
}
```

## Recording Player Component

```typescript
// components/RecordingPlayer.tsx
'use client';

import React, { useState } from 'react';
import { RecordingFile } from '@/lib/obs/recording';

interface RecordingPlayerProps {
  recording: RecordingFile;
  onClose: () => void;
}

export function RecordingPlayer({ recording, onClose }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{recording.name}</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
          >
            ✕ Close
          </button>
        </div>

        <video
          key={recording.id}
          src={recording.path}
          className="w-full rounded-lg bg-black"
          controls
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        <div className="mt-4 p-4 bg-slate-800 rounded text-gray-300 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{Math.floor(recording.duration / 60)}m {recording.duration % 60}s</span>
          </div>
          <div className="flex justify-between">
            <span>File Size:</span>
            <span>{(recording.size / 1024 / 1024 / 1024).toFixed(2)} GB</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span>{recording.format}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform:</span>
            <span className="capitalize">{recording.platform || 'Local'}</span>
          </div>
          {recording.audioTracks && recording.audioTracks.length > 0 && (
            <div className="flex justify-between">
              <span>Audio Tracks:</span>
              <span>{recording.audioTracks.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Keyboard Shortcuts

```typescript
// hooks/useRecordingShortcuts.ts
import { useEffect } from 'react';
import { useRecordingContext } from '@/app/providers/RecordingProvider';

export function useRecordingShortcuts() {
  const { status, startRecording, stopRecording, pauseRecording, resumeRecording } =
    useRecordingContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // R: Record
      if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        if (status === 'IDLE') {
          // Start recording
          console.log('Starting recording...');
        }
      }

      // S: Stop
      if (e.code === 'KeyS' && e.ctrlKey) {
        e.preventDefault();
        if (status === 'RECORDING') {
          // Stop recording
          console.log('Stopping recording...');
        }
      }

      // P: Pause/Resume
      if (e.code === 'KeyP' && e.ctrlKey) {
        e.preventDefault();
        if (status === 'RECORDING') {
          pauseRecording();
        } else if (status === 'PAUSED') {
          resumeRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startRecording, stopRecording, pauseRecording, resumeRecording]);
}
```

## Testing

```typescript
// __tests__/recording.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecording } from '@/lib/obs/recording';

describe('useRecording', () => {
  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useRecording());

    expect(result.current.status).toBe('IDLE');
    expect(result.current.duration).toBe(0);
    expect(result.current.fileSize).toBe(0);
  });

  it('should start recording', async () => {
    const { result } = renderHook(() => useRecording());

    const mockStream = {
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    } as any;

    await act(async () => {
      await result.current.startRecording(mockStream, 'Test Recording');
    });

    expect(result.current.status).toBe('RECORDING');
  });

  it('should pause and resume recording', async () => {
    const { result } = renderHook(() => useRecording());

    act(() => {
      result.current.pauseRecording();
    });

    expect(result.current.status).toBe('PAUSED');

    act(() => {
      result.current.resumeRecording();
    });

    expect(result.current.status).toBe('RECORDING');
  });

  it('should stop recording', async () => {
    const { result } = renderHook(() => useRecording());

    await act(async () => {
      await result.current.stopRecording();
    });

    expect(result.current.status).toBe('STOPPED');
  });
});
```

## Deployment Checklist

- [ ] Create `/public/recordings/` directory with write permissions
- [ ] Set up database with LocalStreamRecording schema
- [ ] Create API route handlers for all endpoints
- [ ] Configure RecordingProvider in root layout
- [ ] Set up recording storage backend (local or S3)
- [ ] Configure file retention/cleanup policies
- [ ] Set up monitoring and error logging
- [ ] Test recording with different formats and quality levels
- [ ] Verify file splitting works correctly
- [ ] Test audio track extraction
- [ ] Implement authentication/authorization for sensitive recordings
- [ ] Set up automated backups for important recordings
- [ ] Configure rate limiting for API endpoints
- [ ] Document maintenance procedures
- [ ] Test in production environment

## Performance Optimization

```typescript
// Lazy load recording components
const RecordingControl = lazy(() => import('@/lib/obs/recording').then(m => ({ default: m.RecordingControl })));
const RecordingsList = lazy(() => import('@/lib/obs/recording').then(m => ({ default: m.RecordingsList })));

// Use Suspense for better loading states
<Suspense fallback={<RecordingControlSkeleton />}>
  <RecordingControl {...props} />
</Suspense>
```
