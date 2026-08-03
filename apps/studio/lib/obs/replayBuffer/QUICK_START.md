# Replay Buffer Quick Start Guide

Get instant replay capture working in 5 minutes.

## 1. Add to Your Component (1 minute)

```tsx
import { ReplayUI } from '@/lib/obs/replayBuffer';

export function MyLiveStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div>
      {/* Your stream content */}
      
      {/* Add this one line */}
      <ReplayUI isStreaming={isStreaming} />
    </div>
  );
}
```

That's it! The replay buffer is now active when streaming.

## 2. Capture Video Frames (2 minutes)

When your video encoder outputs frames, add them to the replay buffer:

```tsx
import { useReplayBuffer } from '@/lib/obs/replayBuffer';

export function MyLiveStream() {
  const { addFrame, addAudioChunk } = useReplayBuffer({
    enabled: isStreaming,
  });

  // Hook into your video encoder
  const handleEncodedFrame = (frameData: Uint8Array) => {
    addFrame(frameData, false, 33); // 33ms per frame
  };

  // Hook into your audio encoder
  const handleAudio = (audioData: Float32Array) => {
    addAudioChunk(audioData, 48000); // 48kHz
  };

  return (
    // ... your component
  );
}
```

## 3. Configure (1 minute)

Customize the replay buffer:

```tsx
<ReplayUI
  isStreaming={isStreaming}
  onReplaySaved={(replay) => {
    console.log('Saved:', replay.filename);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

## 4. Test (1 minute)

1. Click "Start Stream"
2. Video frames are captured
3. Click "Save Replay" or press `Shift+Ctrl+R`
4. Watch replay appear in "Recent Replays" list
5. Download or play it back

Done! ✅

## Common Patterns

### Pattern 1: YouTube Live Streaming

```tsx
// YouTube integration with replay capture
<ReplayUI
  isStreaming={isStreaming}
  showAdvanced={true}
  onReplaySaved={(replay) => {
    // Upload to YouTube Shorts
    uploadToYouTubeShorts(replay);
  }}
/>
```

### Pattern 2: Twitch Streaming

```tsx
// Twitch integration
<ReplayUI
  isStreaming={isStreaming}
  onReplaySaved={(replay) => {
    // Save for Twitch VOD
    saveTwitchHighlight(replay);
  }}
/>
```

### Pattern 3: Local Recording Only

```tsx
// No streaming, just local replay capture
<ReplayUI
  isStreaming={true} // Always "on"
  onReplaySaved={(replay) => {
    // Download to user's device
    downloadReplay(replay.id);
  }}
/>
```

## Troubleshooting

### "No frames in buffer"

Make sure you're calling `addFrame()` for each video frame:

```typescript
// ❌ Wrong
const video = document.querySelector('video');
// (frames not added to buffer)

// ✅ Right
const { addFrame } = useReplayBuffer();
handleVideoFrame = (frameData) => {
  addFrame(frameData, isKeyFrame, 33);
};
```

### "Hotkey not working"

Check your OS:
- **Windows/Linux:** `Shift+Ctrl+R`
- **macOS:** `Shift+Cmd+R`

Or use the button instead:
```tsx
<button onClick={() => saveReplay()}>Save Replay</button>
```

### "Replay file not playing"

Make sure you're encoding to MP4 format:

```typescript
const buffer = new ReplayBuffer({
  outputFormat: 'mp4', // ← Required
  videoBitrate: 5000,
});
```

### "Buffer size growing too large"

Reduce the max duration:

```typescript
const buffer = new ReplayBuffer({
  maxDurationSeconds: 10, // Smaller = less memory
});
```

## Next Steps

1. **Read the full README** - `README.md`
2. **Check the architecture** - `ARCHITECTURE.md`
3. **See full integration** - `INTEGRATION_EXAMPLE.md`
4. **Review the API** - `ReplayBuffer` class in `ReplayBuffer.ts`

## API Cheat Sheet

```typescript
// Create buffer
const buffer = new ReplayBuffer(config);

// Capture
buffer.start();
buffer.addFrame(frameData, isKeyFrame, duration);
buffer.addAudioChunk(audioData, sampleRate);

// Save
const replay = await buffer.saveReplay(30); // Last 30 seconds

// Manage replays
await buffer.deleteReplay(id);
await buffer.downloadReplay(id);

// Query
const status = buffer.getStatus();
const replays = buffer.getSavedReplays();

// Events
buffer.on('save-complete', (replay) => {});
buffer.on('save-failed', (error) => {});

// Cleanup
buffer.stop();
buffer.destroy();
```

## React Hook Cheat Sheet

```typescript
const {
  // State
  status,
  savedReplays,
  selectedDuration,
  isSaving,
  error,

  // Controls
  startCapture,
  stopCapture,
  addFrame,
  addAudioChunk,
  saveReplay,
  deleteReplay,
  downloadReplay,
  playReplay,

  // Utilities
  formatBytes,
  formatDuration,
} = useReplayBuffer({
  enabled: true,
  config: { maxDurationSeconds: 30 },
  onReplaySaved: (replay) => {},
  onError: (error) => {},
});
```

## UI Cheat Sheet

```tsx
// Minimal
<ReplayUI isStreaming={isStreaming} />

// With callbacks
<ReplayUI
  isStreaming={isStreaming}
  onReplaySaved={(replay) => {}}
  onError={(error) => {}}
/>

// Full featured
<ReplayUI
  isStreaming={isStreaming}
  showAdvanced={true}
  className="custom-class"
  onReplaySaved={(replay) => {}}
  onError={(error) => {}}
/>
```

## Performance Tips

1. **Reduce max duration** for low-end devices
2. **Lower bitrate** for bandwidth-constrained networks
3. **Use Web Workers** for encoding (future feature)
4. **Cleanup old replays** regularly (automatic)

## Production Checklist

- [ ] Video frames added to buffer
- [ ] Audio chunks added to buffer
- [ ] Save replay working
- [ ] Download working
- [ ] Play working
- [ ] Delete working
- [ ] Hotkey working
- [ ] Error handling in place
- [ ] User notifications set up
- [ ] Server-side storage configured

---

**Need help?** Check `README.md` or `INTEGRATION_EXAMPLE.md`
