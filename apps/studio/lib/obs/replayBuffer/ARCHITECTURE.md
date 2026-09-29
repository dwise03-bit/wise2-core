# Replay Buffer Architecture

## System Design

The Replay Buffer is a memory-efficient instant replay capture system that maintains a ring buffer of the last N seconds of stream data.

### Core Concepts

#### Ring Buffer (Circular Buffer)

```
Time: 0s     10s     20s     30s     40s (current)
      |------|------|------|------|
      Frame 1 Frame 2 Frame 3 Frame 4
      [oldest]                [newest]

When buffer is full (30s capacity):
- New frame arrives → added to end
- Oldest frame (0s) → removed
- Buffer maintains sliding window of time
```

#### Memory Management

```
Total Buffer Size = Video Data + Audio Data

Video Data:
  - H264 at 5000kbps for 30s
  - ~186 KB/s × 30s = ~5.6 MB

Audio Data:
  - AAC at 128kbps for 30s
  - ~16 KB/s × 30s = ~480 KB

Total: ~6 MB for 30-second replay buffer
```

#### Save Operation

```
Buffer Contents (30s):
  ├─ Frame 1 (0.0s)
  ├─ Frame 2 (0.033s)
  ├─ Frame 3 (0.066s)
  └─ ...
  └─ Frame 900 (30.0s)

User clicks "Save Replay" (for last 10s):
  ↓
Filter frames from 20s-30s
  ↓
Encode to MP4 format
  ↓
Save to storage (localStorage or server)
  ↓
Return metadata (filename, size, duration)
  ↓
Cleanup (keep last 5 replays)
```

## Module Structure

```
lib/obs/replayBuffer/
├── types.ts                    # Type definitions
├── ReplayBuffer.ts             # Core ring buffer logic (235 lines)
├── useReplayBuffer.ts          # React hook for state management (300+ lines)
├── ReplayUI.tsx                # React component with UI controls (400+ lines)
├── index.ts                    # Module exports
├── README.md                   # User documentation
├── ARCHITECTURE.md             # This file
├── INTEGRATION_EXAMPLE.md      # Integration walkthrough
└── API_REFERENCE.md            # (Future) Detailed API docs
```

## Class Diagram

```
┌─────────────────────────────────────┐
│         ReplayBuffer (Core)         │
├─────────────────────────────────────┤
│ Manages ring buffer of frames/audio │
│ - start/stop capture                │
│ - addFrame(frameData, isKeyFrame)   │
│ - addAudioChunk(audioData)          │
│ - saveReplay(duration) → ReplaySave │
│ - deleteReplay(id)                  │
│ - downloadReplay(id)                │
│ - getStatus() → ReplayBufferStatus  │
└─────────────────────────────────────┘
         │
         │ used by
         ↓
┌─────────────────────────────────────┐
│      useReplayBuffer (Hook)         │
├─────────────────────────────────────┤
│ React wrapper with state management │
│ - startCapture(stream)              │
│ - saveReplay(duration)              │
│ - [state] savedReplays, status, ... │
│ - [event handlers] on/off listeners │
└─────────────────────────────────────┘
         │
         │ uses
         ↓
┌─────────────────────────────────────┐
│         ReplayUI Component          │
├─────────────────────────────────────┤
│ React component with UI controls    │
│ - Duration selector (10/30/60/custom)
│ - Save Replay button (hotkey)       │
│ - Recent replays list               │
│ - Play/Download/Delete actions      │
└─────────────────────────────────────┘
```

## Data Flow

```
                 Live Stream
                     │
              ┌──────┴──────┐
              ↓             ↓
          Video          Audio
          Track          Track
              │             │
              └──────┬──────┘
                     ↓
         ┌───────────────────────┐
         │   Encoding Pipeline   │
         │ (WebCodecs/ffmpeg)    │
         └───────────────────────┘
                     │
              ┌──────┴──────┐
              ↓             ↓
           Frames        Audio Chunks
              │             │
              └──────┬──────┘
                     ↓
         ┌───────────────────────┐
         │    ReplayBuffer       │
         │   (Ring Buffer - 30s) │
         │  [Frame 1, 2, 3 ...]  │
         └───────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    User clicks               Monitor
    "Save Replay"             Buffer Status
         │                       │
         ↓                       ↓
    Save Operation         ReplayUI Shows:
    ├─ Filter frames        - Current duration
    ├─ Encode to MP4        - Buffer size
    └─ Save to storage      - Frame count
                            - Recent replays
    ↓
Replay File (MP4)
├─ Metadata
├─ Video Track
└─ Audio Track
```

## State Management Flow

### ReplayBuffer State

```typescript
state = {
  isRecording: boolean,
  videoFrames: ReplayFrame[],  // Ring buffer
  audioChunks: ReplayAudioChunk[],
  currentBufferSize: number,
  totalFrames: number,
  savedReplays: ReplaySave[],  // Last 5
  isProcessing: boolean,
}
```

### useReplayBuffer Hook State

```typescript
state = {
  // Buffer state
  status: ReplayBufferStatus,
  savedReplays: ReplaySave[],
  
  // UI state
  selectedDuration: number,
  isSaving: boolean,
  error: Error | null,
}
```

### ReplayUI Component State

```typescript
state = {
  isExpanded: boolean,
  customDuration: string,
}

// Derives from parent hook
props: {
  status,
  savedReplays,
  isSaving,
}
```

## Event System

### Events Emitted by ReplayBuffer

```typescript
Events:
  ├─ buffer-started        // Capture started
  ├─ frame-added           // New frame in buffer
  ├─ audio-added           // New audio in buffer
  ├─ save-started          // Save operation started
  ├─ save-complete         // Save operation completed
  ├─ save-failed           // Save operation failed
  └─ buffer-cleared        // Buffer cleared/stopped
```

### Example Usage

```typescript
buffer.on('frame-added', (data) => {
  console.log(`Frames: ${data.frameCount}`);
  if (data.frameCount % 30 === 0) {
    updateUI(); // Update every 1 second at 30fps
  }
});

buffer.on('save-complete', (replay) => {
  console.log(`Saved: ${replay.filename} (${replay.duration}s)`);
  showNotification('Replay saved!');
});
```

## Performance Optimization

### Memory Efficiency

```
Without trimming (30 min stream):
  - Frames: 54,000 × ~1KB = 54 MB
  - Audio: 108,000 chunks × ~1KB = 108 MB
  - TOTAL: 162 MB ❌ Too much

With ring buffer trimming (30s max):
  - Frames: 900 × ~1KB = 900 KB
  - Audio: 1,500 chunks × ~1KB = 1.5 MB
  - TOTAL: ~2.5 MB ✅ Reasonable
```

### CPU Efficiency

```
Frame Capture:     <1% (just copy Uint8Array)
Audio Capture:     <1% (just copy Float32Array)
Buffer Trimming:   <1% (periodic cleanup)
Encoding (async):  5-10% (only when saving)
```

### Optimization Techniques

1. **Ring Buffer Trimming**
   - Automatically remove old frames when max duration exceeded
   - Aggressive trim if exceeding max byte size

2. **Lazy Encoding**
   - Don't encode until user clicks "Save"
   - Encoding happens asynchronously

3. **Memory Pooling** (Future)
   - Reuse frame buffer arrays
   - Reduce GC pressure

4. **Worker Thread Encoding** (Future)
   - Offload video encoding to Worker
   - Keep main thread responsive

## Storage Implementation

### Current: Browser LocalStorage

```typescript
// Limitations
- 5-50 MB per domain
- Blocks on main thread
- Persists only in single browser

// Usage
localStorage.setItem('replay_buffer_saves', JSON.stringify(replays));
localStorage.setItem(replayId, blobData);
```

### Production: Server-Side Storage

```typescript
// POST /api/replays/save
{
  "metadata": { ...ReplaySave },
  "video": Blob,
  "audio": Blob
}

// Files stored in:
// - Local disk: /data/replays/{id}.mp4
// - Cloud: S3, GCS, Azure Blob Storage

// Benefits
✓ No browser storage limits
✓ Multi-device access
✓ Backup & redundancy
✓ CDN distribution
```

### Hybrid: Browser + Server

```typescript
// Save flow
1. Create file in localStorage (fast, immediate)
2. Async upload to server (background)
3. Once server confirms, clean up local copy
4. User can delete from anywhere
```

## Integration Points

### With Recording Engine

```
RecordingEngine
    ├─ Captures frames
    ├─ Sends to ReplayBuffer (in parallel)
    └─ Saves full recording

ReplayBuffer
    └─ Keeps last 30s
    └─ User can save snippet
```

### With OBS Pipeline

```
OBS → WebSocket API → streamPipeline.ts
                           │
                    Extracts frames
                           │
                    ReplayBuffer ← addFrame()
                           │
                      Display on UI
```

### With Web Codecs (Future)

```
VideoEncoder
    ├─ Input: VideoFrame
    ├─ Output: EncodedVideoChunk
    └─ Call: replayBuffer.addFrame()
```

## Future Architecture Enhancements

### 1. Multi-Segment Replay

```
Buffer segments:
  0-10s segment (oldest)
  10-20s segment
  20-30s segment (newest)

Benefits:
- Faster trimming (remove entire segment)
- Better memory patterns
- Easier timestamp lookups
```

### 2. GPU-Accelerated Encoding

```
GPU Pipeline:
  Frame → GPU Encoder → Encoded Chunk → ReplayBuffer
                ↓
           Much faster than CPU
```

### 3. Progressive Encoding

```
Save starts:
  ↓
Encode at lower quality first (fast preview)
  ↓
Re-encode at full quality (background)
  ↓
User can download at any quality
```

### 4. Replay Composition

```
Multiple replays:
  [Replay 1: 0-10s]
  [Replay 2: 15-25s]
  [Replay 3: 20-30s]
      ↓
   Compose into single video
      ↓
[Final: 0-30s composite with transitions]
```

## Security Considerations

### Data Privacy

```typescript
// Sensitive data handling
- Stream keys: Never stored in replay buffer
- User data: Encrypted at rest
- Local storage: Browser sandbox (same-origin policy)
```

### Rate Limiting

```typescript
// Prevent abuse
- Max 5 replays per stream
- Max 1 save per 5 seconds
- Max 5GB total storage per account
```

### Validation

```typescript
// Validate inputs
- Frame data: Check size and format
- Duration: Min 1s, Max 300s
- File size: Max 1GB per replay
```

## Testing Strategy

### Unit Tests

```typescript
✓ Ring buffer trimming
✓ Frame addition/removal
✓ Time-based filtering
✓ Metadata generation
✓ Event emission
```

### Integration Tests

```typescript
✓ Full save workflow
✓ UI controls (duration, save, delete)
✓ Hotkey triggering
✓ Storage operations
```

### Performance Tests

```typescript
✓ Memory usage under load
✓ CPU usage during encoding
✓ UI responsiveness
✓ File I/O speed
```

### E2E Tests

```typescript
✓ Start stream → add frames → save replay
✓ Play/download/delete replays
✓ Verify MP4 file integrity
```

## Deployment Checklist

- [ ] Add replay buffer to LiveStudio component
- [ ] Implement server-side storage API
- [ ] Setup video replay player
- [ ] Configure storage backend (S3/GCS)
- [ ] Add rate limiting middleware
- [ ] Implement audit logging
- [ ] Setup monitoring/alerts
- [ ] Performance testing on target devices
- [ ] Documentation for users
- [ ] Documentation for developers

