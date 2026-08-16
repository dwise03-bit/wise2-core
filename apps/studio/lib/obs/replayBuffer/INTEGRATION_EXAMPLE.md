# Replay Buffer Integration Example

Complete example of integrating the Replay Buffer into the Live Studio component.

## Full Integration Example

### 1. Update LiveStudio Component

**File:** `apps/studio/components/LiveStudio/index.tsx`

```tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ReplayUI } from '@/lib/obs/replayBuffer';
import { useReplayBuffer } from '@/lib/obs/replayBuffer';
import { RecordingEngine } from '@/lib/obs/recording/RecordingEngine';

interface LiveStudioProps {
  streamKey: string;
  // ... other props
}

export function LiveStudio({ streamKey, ...props }: LiveStudioProps) {
  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState('idle');

  // Refs for encoding pipeline
  const recordingEngineRef = useRef<RecordingEngine | null>(null);
  const replayBufferRef = useRef<any>(null);

  // Replay buffer hook
  const {
    startCapture: startReplayCapture,
    stopCapture: stopReplayCapture,
    addFrame: addFrameToReplay,
    addAudioChunk: addAudioToReplay,
  } = useReplayBuffer({
    enabled: isStreaming,
    config: {
      maxDurationSeconds: 30,
      videoBitrate: 5000,
      audioBitrate: 128,
      resolution: '1920x1080',
      frameRate: 30,
    },
    onReplaySaved: (replay) => {
      console.log('✅ Replay saved:', replay.filename);
      // Show notification
      showNotification({
        type: 'success',
        message: `Replay saved: ${replay.filename}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.error('❌ Replay error:', error);
      showNotification({
        type: 'error',
        message: `Replay error: ${error.message}`,
        duration: 5,
      });
    },
  });

  /**
   * Start streaming
   */
  const handleStreamStart = useCallback(async () => {
    try {
      setStreamStatus('starting');

      // 1. Get media stream (camera + desktop)
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true,
      });

      // 2. Initialize recording engine
      recordingEngineRef.current = new RecordingEngine({
        format: 'mp4',
        quality: 'high',
        bitrate: 5000,
        resolution: '1920x1080',
        frameRate: 30,
        videoBitrate: 5000,
        audioBitrate: 128,
      });

      // 3. Start replay buffer capture
      startReplayCapture(mediaStream);

      // 4. Start recording (optional)
      await recordingEngineRef.current.startRecording(
        mediaStream,
        'Live Stream Recording'
      );

      // 5. Connect to stream destination (RTMP, HLS, etc.)
      await connectToStreamDestination(streamKey);

      // 6. Setup frame capture from encoder
      setupEncoderFrameCapture(mediaStream);

      setIsStreaming(true);
      setStreamStatus('streaming');
    } catch (error) {
      console.error('Failed to start stream:', error);
      setStreamStatus('error');
      showNotification({
        type: 'error',
        message: 'Failed to start stream',
      });
    }
  }, [streamKey, startReplayCapture]);

  /**
   * Stop streaming
   */
  const handleStreamStop = useCallback(async () => {
    try {
      setStreamStatus('stopping');

      // 1. Disconnect from stream
      await disconnectFromStreamDestination();

      // 2. Stop recording
      if (recordingEngineRef.current) {
        await recordingEngineRef.current.stopRecording();
      }

      // 3. Stop replay buffer capture
      stopReplayCapture();

      // 4. Cleanup
      recordingEngineRef.current = null;

      setIsStreaming(false);
      setStreamStatus('idle');
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setStreamStatus('error');
    }
  }, [stopReplayCapture]);

  /**
   * Setup encoder to capture frames for replay buffer
   *
   * This integrates with your video encoder/pipeline.
   * In production, hook this into your WebCodecs or ffmpeg pipeline.
   */
  const setupEncoderFrameCapture = useCallback((stream: MediaStream) => {
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    if (videoTrack) {
      // Option 1: Use Canvas API (browser-based)
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();

      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      const captureFrame = () => {
        if (!isStreaming) return;

        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, 1920, 1080);

        // Get frame data
        const imageData = ctx.getImageData(0, 0, 1920, 1080);
        const frameData = new Uint8Array(imageData.data);

        // Add to replay buffer
        addFrameToReplay(frameData, true, 33); // 33ms per frame at 30fps

        // Continue capturing
        requestAnimationFrame(captureFrame);
      };

      captureFrame();
    }

    if (audioTrack) {
      // Option 2: Use Web Audio API
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        // Convert to Float32Array copy
        const audioCopy = new Float32Array(audioData);
        addAudioToReplay(audioCopy, audioContext.sampleRate);
      };
    }
  }, [isStreaming, addFrameToReplay, addAudioToReplay]);

  /**
   * Connect to stream destination (implementation depends on your backend)
   */
  const connectToStreamDestination = async (streamKey: string) => {
    // Example: POST to your backend to start streaming
    const response = await fetch('/api/streams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamKey }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect to stream destination');
    }
  };

  /**
   * Disconnect from stream destination
   */
  const disconnectFromStreamDestination = async () => {
    const response = await fetch('/api/streams/stop', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect from stream');
    }
  };

  /**
   * Show notification utility
   */
  const showNotification = (notification: any) => {
    // Implement based on your notification system
    console.log(notification);
  };

  return (
    <div className="live-studio">
      {/* Header */}
      <header className="live-header">
        <h1>Live Studio</h1>
        <div className="stream-status">
          <span
            className={`status-badge ${streamStatus}`}
          >
            {streamStatus === 'streaming' && '🔴 LIVE'}
            {streamStatus === 'starting' && '🟡 Starting...'}
            {streamStatus === 'idle' && '⚫ Offline'}
            {streamStatus === 'error' && '🔴 Error'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="live-content">
        {/* Video Preview */}
        <div className="video-preview">
          <video
            id="stream-preview"
            autoPlay
            playsInline
            className="preview-video"
          />
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          {/* Stream Controls */}
          <div className="stream-controls">
            <button
              className={`btn btn-large ${isStreaming ? 'btn-danger' : 'btn-success'}`}
              onClick={isStreaming ? handleStreamStop : handleStreamStart}
              disabled={streamStatus === 'starting' || streamStatus === 'stopping'}
            >
              {isStreaming ? '⏹ Stop Stream' : '▶ Start Stream'}
            </button>
          </div>

          {/* Replay Buffer UI */}
          <div className="replay-buffer-section">
            <ReplayUI
              isStreaming={isStreaming}
              showAdvanced={true}
              onReplaySaved={(replay) => {
                console.log('Replay saved:', replay);
              }}
              onError={(error) => {
                console.error('Replay error:', error);
              }}
            />
          </div>

          {/* Additional Controls */}
          <div className="additional-controls">
            {/* Scene Selector */}
            <div className="control-group">
              <label>Scene</label>
              <select className="scene-select">
                <option>Main Scene</option>
                <option>Camera Only</option>
                <option>Screen Share</option>
                <option>Picture in Picture</option>
              </select>
            </div>

            {/* Audio Mixer */}
            <div className="control-group">
              <label>Audio</label>
              <div className="audio-mixer">
                {/* Microphone */}
                <div className="mixer-channel">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="slider"
                  />
                  <span>Mic</span>
                </div>

                {/* Desktop Audio */}
                <div className="mixer-channel">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="slider"
                  />
                  <span>Desktop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Panel (optional) */}
      <aside className="chat-panel">
        {/* Chat UI */}
      </aside>

      <style jsx>{`
        .live-studio {
          display: grid;
          grid-template: 'header' 60px 'content' 1fr 'chat' / auto 1fr 300px;
          gap: 12px;
          height: 100vh;
          background: #0a0a0a;
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .live-header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-bottom: 1px solid #0f3460;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .live-header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .status-badge.streaming {
          background: rgba(255, 68, 68, 0.2);
          color: #ff6b6b;
        }

        .status-badge.idle {
          background: rgba(100, 100, 100, 0.2);
          color: #999;
        }

        .live-content {
          grid-area: content;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 12px;
          padding: 12px;
          overflow: hidden;
        }

        .video-preview {
          background: #000;
          border: 1px solid #0f3460;
          border-radius: 8px;
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
          gap: 12px;
          overflow-y: auto;
        }

        .stream-controls {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-large {
          flex: 1;
          padding: 12px;
          font-size: 16px;
        }

        .btn-success {
          background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);
          color: #000;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%);
          color: #fff;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .replay-buffer-section {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #0f3460;
        }

        .additional-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-group {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #0f3460;
          border-radius: 6px;
          padding: 10px;
        }

        .control-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #a0a0a0;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .scene-select {
          width: 100%;
          padding: 8px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #0f3460;
          color: #e0e0e0;
          border-radius: 4px;
          font-size: 13px;
        }

        .audio-mixer {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mixer-channel {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .slider {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: #0f3460;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d4ff;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0, 212, 255, 0.5);
        }

        .chat-panel {
          grid-area: chat;
          background: rgba(0, 0, 0, 0.3);
          border-left: 1px solid #0f3460;
          border-radius: 8px;
          padding: 12px;
          overflow-y: auto;
        }

        @media (max-width: 1200px) {
          .live-studio {
            grid-template-columns: 1fr;
            grid-template-areas: 'header' 'content' 'chat';
          }

          .live-content {
            grid-template-columns: 1fr;
          }

          .chat-panel {
            border-left: none;
            border-top: 1px solid #0f3460;
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
```

## 2. API Endpoint for Replay Management

**File:** `apps/api/src/controllers/replay.controller.ts`

```typescript
import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { ReplayService } from '@/services/replay.service';

@Controller('replays')
export class ReplayController {
  constructor(private readonly replayService: ReplayService) {}

  @Post('save')
  async saveReplay(@Body() data: any) {
    // Handle replay save
    const replay = await this.replayService.save(data);
    return { success: true, replay };
  }

  @Get(':id/download')
  async downloadReplay(@Param('id') id: string) {
    // Handle replay download
    const stream = await this.replayService.getFileStream(id);
    return stream;
  }

  @Delete(':id')
  async deleteReplay(@Param('id') id: string) {
    // Handle replay deletion
    await this.replayService.delete(id);
    return { success: true };
  }

  @Get()
  async listReplays() {
    // List all replays
    const replays = await this.replayService.list();
    return { replays };
  }
}
```

## 3. Usage in Different Scenarios

### Scenario A: YouTube Live Streaming

```typescript
// Use existing YouTube RTMP integration
const streamKey = 'rtmp://a.rtmp.youtube.com/live2/...';

// Replay buffer works automatically
<LiveStudio streamKey={streamKey} destination="youtube" />
```

### Scenario B: Twitch Streaming

```typescript
// Use Twitch RTMP key
const streamKey = 'rtmp://live-iad.twitch.tv/live/...';

// Replay buffer works automatically
<LiveStudio streamKey={streamKey} destination="twitch" />
```

### Scenario C: HLS Recording Only (No Live Stream)

```typescript
// Just use replay buffer for local recording
const { saveReplay } = useReplayBuffer({
  enabled: true,
  config: { maxDurationSeconds: 60 },
});

// User saves replays manually or on triggers
<button onClick={() => saveReplay()}>Save Replay</button>
```

## 4. Testing the Integration

```typescript
// Test replay buffer in isolation
import { ReplayBuffer } from '@/lib/obs/replayBuffer';

// Mock video frame data
const mockFrameData = new Uint8Array(1920 * 1080 * 4); // RGBA
const mockAudioData = new Float32Array(48000); // 1 second at 48kHz

// Create buffer
const buffer = new ReplayBuffer({
  maxDurationSeconds: 30,
  videoBitrate: 5000,
});

// Start capturing
buffer.start();

// Add some frames
for (let i = 0; i < 30; i++) {
  buffer.addFrame(mockFrameData, i === 0, 33);
  buffer.addAudioChunk(mockAudioData, 48000);
}

// Save replay
const replay = await buffer.saveReplay(10);
console.log('Saved replay:', replay);

// Get status
const status = buffer.getStatus();
console.log('Buffer status:', status);
```

## Next Steps

1. **Connect to your encoding pipeline** - Hook video frames and audio chunks
2. **Implement server-side storage** - Store replays in cloud storage
3. **Add replay player** - Create video player component for playback
4. **Add replay editor** - Let users trim/crop/edit replays
5. **Analytics** - Track replay saves and downloads

