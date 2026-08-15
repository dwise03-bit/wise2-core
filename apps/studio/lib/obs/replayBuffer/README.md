# Replay Buffer - Instant Replay Capture System

## Overview

The Replay Buffer is an instant replay system for the WISE² Live Studio. It captures the last 10-60 seconds of video/audio stream data in memory and allows you to save portions of it to disk with a single click or hotkey.

**Features:**
- Configurable duration (10s, 30s, 60s, or custom up to 5 minutes)
- Ring buffer (circular buffer) that keeps most recent data
- Memory-efficient with automatic trimming
- Hotkey support: `Shift+Ctrl+R` (or `Shift+Cmd+R` on Mac)
- Recent replays list with play/download/delete options
- Auto-cleanup (keeps last 5 replays)
- Real-time buffer status monitoring
- Light/dark theme support

## Architecture

### Components

```
ReplayBuffer/
├── ReplayBuffer.ts          (Core ring buffer & save logic)
├── useReplayBuffer.ts       (React hook for state management)
├── ReplayUI.tsx             (UI component with controls)
├── types.ts                 (Type definitions)
├── index.ts                 (Module exports)
└── README.md               (This file)
```

### Data Flow

```
Stream Data
    ↓
[ReplayBuffer] (ring buffer keeps last N seconds)
    ↓
UI (ReplayUI component)
    ├─ Duration selector (10s/30s/60s/custom)
    ├─ Save Replay button (hotkey: Shift+Ctrl+R)
    ├─ Buffer status (duration, size, frame count)
    └─ Recent replays list (play/download/delete)
    ↓
Save Operation
    ├─ Extract selected duration from buffer
    ├─ Encode to MP4
    └─ Save to storage (localStorage or server)
```

## Installation & Setup

### 1. Import the Module

```typescript
import { ReplayUI, useReplayBuffer } from '@/lib/obs/replayBuffer';
```

### 2. Add UI to Your Live Studio Component

```tsx
import { ReplayUI } from '@/lib/obs/replayBuffer';

export function LiveStudio() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="live-studio">
      {/* Your streaming UI */}
      
      {/* Add Replay Buffer UI */}
      <ReplayUI
        isStreaming={isStreaming}
        onReplaySaved={(replay) => {
          console.log('Replay saved:', replay);
          // Notify user, update UI, etc.
        }}
        onError={(error) => {
          console.error('Replay error:', error);
          // Show error notification
        }}
      />
    </div>
  );
}
```

### 3. Hook Into Your Encoding Pipeline

The replay buffer needs to receive raw video frames and audio chunks from your stream encoding pipeline:

```typescript
import { useReplayBuffer } from '@/lib/obs/replayBuffer';

export function LiveStudio() {
  const { addFrame, addAudioChunk, startCapture, stopCapture } = useReplayBuffer({
    enabled: isStreaming,
  });

  // When you start streaming:
  const handleStreamStart = async () => {
    startCapture(mediaStream);
    // ... rest of stream start logic
  };

  // When you get a video frame (from encoder):
  const handleVideoFrame = (frameData: Uint8Array, isKeyFrame: boolean) => {
    addFrame(frameData, isKeyFrame, 33); // 33ms per frame at 30fps
  };

  // When you get audio (from audio pipeline):
  const handleAudioChunk = (audioData: Float32Array) => {
    addAudioChunk(audioData, 48000); // 48kHz sample rate
  };

  // When you stop streaming:
  const handleStreamStop = () => {
    stopCapture();
  };

  return (
    // ... your component
  );
}
```

## Usage Guide

### UI Controls

#### Duration Selector
Choose how many seconds to capture:
- **10 sec** - Quick highlights, minimal storage
- **30 sec** - Default, good balance
- **60 sec** - Extended replays
- **Custom** - Enter any value 1-300 seconds

#### Save Replay Button
Click to save the most recent N seconds to disk.

**Hotkey:** `Shift+Ctrl+R` (Windows/Linux) or `Shift+Cmd+R` (Mac)

#### Recent Replays List
Shows the last 5 saved replays with:
- **Filename** - Timestamp-based name
- **Duration** - How many seconds captured
- **File Size** - Storage used
- **FPS** - Frame rate
- **Actions:**
  - ▶ Play - Open in video player
  - ↓ Download - Download to computer
  - 🗑 Delete - Remove from storage

### API Reference

#### ReplayBuffer Class

```typescript
import { ReplayBuffer } from '@/lib/obs/replayBuffer';

const buffer = new ReplayBuffer({
  maxDurationSeconds: 30,
  videoBitrate: 5000,
  audioBitrate: 128,
  resolution: '1920x1080',
  frameRate: 30,
});

// Start capturing
buffer.start();

// Add video frames
buffer.addFrame(frameData, isKeyFrame, duration);

// Add audio
buffer.addAudioChunk(audioData, sampleRate);

// Save current buffer
const replay = await buffer.saveReplay(30); // Save last 30 seconds

// Get status
const status = buffer.getStatus();
console.log(`Buffer: ${status.currentDuration}s, ${status.frameCount} frames`);

// Delete a replay
await buffer.deleteReplay(replayId);

// Download a replay
await buffer.downloadReplay(replayId);

// Listen to events
buffer.on('frame-added', (data) => {
  console.log(`Frame count: ${data.frameCount}`);
});

buffer.on('save-complete', (replay) => {
  console.log('Replay saved:', replay);
});

// Stop capturing
buffer.stop();

// Cleanup
buffer.destroy();
```

#### useReplayBuffer Hook

```typescript
import { useReplayBuffer } from '@/lib/obs/replayBuffer';

const {
  // State
  status,              // ReplayBufferStatus
  savedReplays,        // ReplaySave[]
  selectedDuration,    // number
  isSaving,            // boolean
  error,               // Error | null

  // Controls
  startCapture,        // (stream?: MediaStream) => void
  stopCapture,         // () => void
  addFrame,            // (data, isKeyFrame?, duration?) => void
  addAudioChunk,       // (data, sampleRate?) => void
  saveReplay,          // (duration?) => Promise<ReplaySave>
  deleteReplay,        // (id) => Promise<void>
  downloadReplay,      // (id) => Promise<void>
  playReplay,          // (id) => void
  setSelectedDuration, // (seconds) => void

  // Utilities
  formatBytes,         // (bytes) => string
  formatDuration,      // (seconds) => string
} = useReplayBuffer({
  enabled: true,
  config: { maxDurationSeconds: 30 },
  onReplaySaved: (replay) => {},
  onError: (error) => {},
});
```

## Configuration

### ReplayBufferConfig

```typescript
interface ReplayBufferConfig {
  maxDurationSeconds: number;  // 10-60, default 30
  maxBufferSize: number;        // bytes
  videoCodec: 'h264' | 'vp8' | 'vp9';
  audioCodec: 'aac' | 'opus';
  outputFormat: 'mp4' | 'webm' | 'mkv';
  videoBitrate?: number;        // kbps, default 5000
  audioBitrate?: number;        // kbps, default 128
  resolution?: string;          // e.g. "1920x1080"
  frameRate?: number;           // fps, default 30
}
```

### Example: High Quality Replay

```typescript
const highQualityConfig: ReplayBufferConfig = {
  maxDurationSeconds: 60,
  videoBitrate: 10000,    // 10 Mbps
  audioBitrate: 192,      // 192 kbps
  resolution: '2560x1440',
  frameRate: 60,
  videoCodec: 'h264',
  audioCodec: 'aac',
  outputFormat: 'mp4',
};

const buffer = new ReplayBuffer(highQualityConfig);
```

### Example: Memory-Constrained Device

```typescript
const lowResourceConfig: ReplayBufferConfig = {
  maxDurationSeconds: 10,
  videoBitrate: 1500,     // 1.5 Mbps
  audioBitrate: 64,       // 64 kbps
  resolution: '1280x720',
  frameRate: 24,
};

const buffer = new ReplayBuffer(lowResourceConfig);
```

## Events

```typescript
buffer.on('buffer-started', () => {
  console.log('Replay buffer started capturing');
});

buffer.on('frame-added', (data) => {
  console.log(`Frame added: total=${data.frameCount}`);
});

buffer.on('audio-added', (data) => {
  console.log(`Audio added: total=${data.audioChunkCount}`);
});

buffer.on('save-started', () => {
  console.log('Saving replay...');
});

buffer.on('save-complete', (replay) => {
  console.log('Replay saved:', replay.filename);
});

buffer.on('save-failed', (error) => {
  console.error('Replay save failed:', error.message);
});

buffer.on('buffer-cleared', () => {
  console.log('Buffer cleared');
});
```

## Integration with OBS Pipeline

### Recommended Integration Point

Integrate with the existing recording pipeline in `lib/obs/recording/RecordingEngine.ts`:

```typescript
import { ReplayBuffer } from '@/lib/obs/replayBuffer';

export class RecordingEngine {
  private replayBuffer: ReplayBuffer;

  constructor(config: RecordingConfig) {
    this.replayBuffer = new ReplayBuffer({
      maxDurationSeconds: 30,
      videoBitrate: config.videoBitrate,
      audioBitrate: config.audioBitrate,
      resolution: config.resolution,
      frameRate: config.frameRate,
    });
    this.replayBuffer.start();
  }

  // When adding frames to recording
  async addVideoFrame(frameData: Uint8Array, isKeyFrame: boolean) {
    // Add to recording
    this.recordedChunks.push(frameData);

    // Also add to replay buffer
    this.replayBuffer.addFrame(frameData, isKeyFrame, 33);
  }

  // When adding audio to recording
  async addAudioFrame(audioData: Float32Array) {
    // Add to recording
    this.audioChunks.push(audioData);

    // Also add to replay buffer
    this.replayBuffer.addAudioChunk(audioData, 48000);
  }
}
```

## Storage Management

### Current Implementation

Replays are stored in:
- **Browser:** `localStorage` (keeps last 5 replays)
- **Size limit:** 5-50MB per domain
- **Cleanup:** Automatic removal of old replays

### Production Implementation

For production, implement server-side storage:

```typescript
// POST /api/replays/save
async function saveReplay(replay: ReplaySave, videoBlob: Blob, audioBlob: Blob) {
  const formData = new FormData();
  formData.append('metadata', JSON.stringify(replay));
  formData.append('video', videoBlob);
  formData.append('audio', audioBlob);

  const response = await fetch('/api/replays/save', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

// DELETE /api/replays/{id}
async function deleteReplay(id: string) {
  await fetch(`/api/replays/${id}`, { method: 'DELETE' });
}

// GET /api/replays/{id}/download
async function downloadReplay(id: string) {
  const response = await fetch(`/api/replays/${id}/download`);
  const blob = await response.blob();
  // Trigger download
}
```

## Hotkey Reference

| Hotkey | Action | Platform |
|--------|--------|----------|
| `Shift+Ctrl+R` | Save Replay | Windows / Linux |
| `Shift+Cmd+R` | Save Replay | macOS |
| (Customizable) | - | Mobile (button only) |

## Performance Considerations

### Memory Usage

- **Buffer size:** ~37-75 MB for 30-60 seconds at 5Mbps
- **Trimming:** Automatic when buffer exceeds maxBufferSize
- **Audio:** Minimal (~1MB for 60s at 48kHz)

### CPU Usage

- **Frame capture:** <1% (passthrough to buffer)
- **Encoding:** 5-10% (when saving replay)
- **Cleanup:** <1% (periodic)

### Optimization Tips

1. **Adjust max duration based on device capability**
   ```typescript
   const maxDuration = isLowEnd ? 10 : 30;
   ```

2. **Use lower bitrates for preview/testing**
   ```typescript
   const bitrate = isDev ? 2000 : 5000;
   ```

3. **Implement progressive encoding**
   - Capture raw frames
   - Encode asynchronously on worker thread
   - Show progress to user

## Troubleshooting

### Replay Saves But Can't Play

**Issue:** Video file corrupted or incomplete
**Solution:** Ensure frames are being added to buffer consistently

```typescript
buffer.on('frame-added', (data) => {
  if (data.frameCount % 30 === 0) {
    console.log(`${data.frameCount} frames captured`);
  }
});
```

### Buffer Size Growing Too Large

**Issue:** Trimming not happening
**Solution:** Check that old frames are being removed

```typescript
const status = buffer.getStatus();
console.log(`Buffer size: ${formatBytes(status.bufferSize)}`);
console.log(`Buffer duration: ${status.currentDuration}s`);
```

### Hotkey Not Working

**Issue:** Shift+Ctrl+R (or Shift+Cmd+R) not triggering save
**Solution:** Check if other app intercepted hotkey or use button instead

```typescript
// Fallback to button
<button onClick={() => saveReplay()}>Save Replay</button>
```

### Replay List Not Updating

**Issue:** Recent replays not showing
**Solution:** Ensure onReplaySaved callback is called

```typescript
<ReplayUI
  onReplaySaved={(replay) => {
    console.log('Replay saved:', replay);
    // Force update
  }}
/>
```

## Future Enhancements

- [ ] Async encoding to worker thread (avoid UI blocking)
- [ ] ffmpeg.wasm integration for proper H264 encoding
- [ ] Cloud storage backend (S3, GCS, etc.)
- [ ] Replay editing (trim, crop, add effects)
- [ ] Export to social media formats
- [ ] Replay scheduling for automated uploads
- [ ] Multi-clip composition (combine multiple replays)
- [ ] Watermark & branding support
- [ ] Live preview of replay
- [ ] Replay analytics (view count, shares, etc.)

## License

Part of WISE² Genesis - AI-Native Business Operating System
