# Clip Playback Integration Guide

Complete guide for using the `useClipPlayback` hook for audio clip playback management.

## Overview

The `useClipPlayback` hook provides a comprehensive interface for playing audio clips through the Web Audio API with support for:

- Individual and multi-track clip playback
- Automatic synchronization between clips
- Fade in/out on clip boundaries
- Per-clip and per-track volume control
- Pause/resume functionality with position tracking
- Efficient buffer caching and memory management
- Type-safe TypeScript implementation

## Quick Start

### Basic Playback

```tsx
import { useClipPlayback } from '@/hooks/useClipPlayback';
import { useClips } from '@/hooks/useClips';

function ClipPlayer() {
  const playback = useClipPlayback();
  const { clips, addClip } = useClips();

  const handlePlayClip = async (clipId: string) => {
    try {
      await playback.playClip(clipId);
    } catch (error) {
      console.error('Failed to play clip:', error);
    }
  };

  return (
    <div>
      <button onClick={() => handlePlayClip(clipId)}>Play</button>
      <button onClick={() => playback.stopClip(clipId)}>Stop</button>
      <p>Playing: {playback.playingClips.join(', ')}</p>
    </div>
  );
}
```

### Multi-Track Playback

```tsx
async function playMultipleTracks() {
  const playback = useClipPlayback();

  // Play multiple clips simultaneously
  await Promise.all([
    playback.playClip(clipId1),
    playback.playClip(clipId2),
    playback.playClip(clipId3),
  ]);
}
```

## Hook Interface

### Playback Control

#### `playClip(clipId: string, fromTime?: number): Promise<void>`

Start playback of a single clip.

```tsx
// Play from beginning
await playback.playClip(clipId);

// Play from specific time offset (in seconds)
await playback.playClip(clipId, 2.5);
```

**Parameters:**
- `clipId` - ID of the clip to play
- `fromTime` - Optional time offset in seconds (default: 0)

**Returns:** Promise that resolves when playback starts

**Error Handling:**
- Throws if audio context cannot be initialized
- Logs error if clip not registered

#### `stopClip(clipId: string): void`

Stop playback of a single clip.

```tsx
playback.stopClip(clipId);
```

**Features:**
- Applies fade-out smoothly
- Cleans up Web Audio API resources
- Triggers `onClipEnded` callback

#### `stopAllClips(): void`

Stop all currently playing clips.

```tsx
playback.stopAllClips();
```

#### `pauseAllClips(): void`

Pause all playing clips while preserving playback position.

```tsx
playback.pauseAllClips();
// Clips can be resumed later
```

**Note:** Due to Web Audio API limitations, pause/resume re-creates source nodes internally. Playback position is preserved.

#### `resumeAllClips(): void`

Resume all paused clips from their pause position.

```tsx
playback.resumeAllClips();
```

### Volume Control

#### `setClipVolume(clipId: string, volume: number): void`

Set volume for a specific clip (0.0 to 1.0).

```tsx
playback.setClipVolume(clipId, 0.8);  // 80% volume
playback.setClipVolume(clipId, 0.5);  // 50% volume
playback.setClipVolume(clipId, 0);    // Silent
```

**Parameters:**
- `clipId` - ID of the clip
- `volume` - Volume level (clamped to 0-1)

#### `setTrackVolume(trackId: string, volume: number): void`

Set volume for all clips in a track.

```tsx
// Set all clips in track to 60% volume
playback.setTrackVolume(trackId, 0.6);
```

#### `setMasterVolume(volume: number): void`

Set master output volume for all clips.

```tsx
playback.setMasterVolume(0.75);  // 75% overall volume
```

### Mute Control

#### `muteClip(clipId: string): void`

Mute a specific clip.

```tsx
playback.muteClip(clipId);
```

#### `unmuteClip(clipId: string): void`

Unmute a specific clip.

```tsx
playback.unmuteClip(clipId);
```

### State Queries

#### `isClipPlaying(clipId: string): boolean`

Check if a clip is currently playing.

```tsx
if (playback.isClipPlaying(clipId)) {
  console.log('Clip is playing');
}
```

#### `playingClips: string[]`

Array of currently playing clip IDs.

```tsx
playback.playingClips.forEach(clipId => {
  console.log(`Clip ${clipId} is playing`);
});
```

### Advanced Control

#### `registerClip(clip: ClipData): void`

Register a clip for playback tracking.

```tsx
const clipData: ClipData = {
  id: 'clip-1',
  trackId: 'track-1',
  name: 'My Audio',
  audioBuffer: buffer,
  startTime: 0,
  duration: 10,
  displayStart: 0,
  displayEnd: 10,
  fadeIn: 0.1,
  fadeOut: 0.1,
  isSelected: false,
};

playback.registerClip(clipData);
```

**Note:** Clips must be registered before playback.

#### `unregisterClip(clipId: string): void`

Unregister a clip and stop playback if currently playing.

```tsx
playback.unregisterClip(clipId);
```

#### `getMasterGain(): GainNode | null`

Get the master gain node for manual Web Audio API control.

```tsx
const masterGain = playback.getMasterGain();
if (masterGain) {
  // Direct access to Web Audio API gain node
  masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
}
```

## Complete Example: DAW-like Editor

```tsx
import React, { useEffect } from 'react';
import { useClipPlayback } from '@/hooks/useClipPlayback';
import { useClips } from '@/hooks/useClips';

interface AudioEditorProps {
  projectId: string;
}

export function AudioEditor({ projectId }: AudioEditorProps) {
  const playback = useClipPlayback({
    fadeDuration: 0.15,
    onClipEnded: (clipId) => {
      console.log(`Clip ${clipId} finished`);
    },
  });

  const { clips, addClip, removeClip } = useClips();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [selectedClipId, setSelectedClipId] = React.useState<string | null>(null);

  // Register clips when they change
  useEffect(() => {
    clips.forEach((clip) => {
      playback.registerClip(clip);
    });

    return () => {
      clips.forEach((clip) => {
        playback.unregisterClip(clip.id);
      });
    };
  }, [clips, playback]);

  // Handle file import
  const handleImportAudio = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = playback.getMasterGain()?.context || new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const clipId = addClip(
        'track-1', // trackId
        audioBuffer,
        file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        0 // startTime
      );

      setSelectedClipId(clipId);
    } catch (error) {
      console.error('Failed to import audio:', error);
    }
  };

  // Playback controls
  const handlePlayPause = async () => {
    if (isPlaying) {
      playback.pauseAllClips();
      setIsPlaying(false);
    } else {
      playback.resumeAllClips();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    playback.stopAllClips();
    setIsPlaying(false);
  };

  // Volume control
  const handleVolumeChange = (clipId: string, volume: number) => {
    playback.setClipVolume(clipId, volume);
  };

  // Rendering
  return (
    <div className="audio-editor">
      <div className="controls">
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleStop}>Stop</button>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && handleImportAudio(e.target.files[0])}
        />
      </div>

      <div className="timeline">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className={`clip ${playback.isClipPlaying(clip.id) ? 'playing' : ''}`}
            onClick={() => setSelectedClipId(clip.id)}
          >
            <span>{clip.name}</span>
          </div>
        ))}
      </div>

      {selectedClipId && (
        <div className="clip-editor">
          <label>
            Clip Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              onChange={(e) => handleVolumeChange(selectedClipId, parseFloat(e.target.value))}
            />
          </label>
          <button onClick={() => playback.muteClip(selectedClipId)}>Mute</button>
          <button onClick={() => playback.unmuteClip(selectedClipId)}>Unmute</button>
          <button
            onClick={() => {
              removeClip(selectedClipId);
              setSelectedClipId(null);
            }}
          >
            Delete
          </button>
        </div>
      )}

      <div className="status">
        Playing: {playback.playingClips.length} clips
      </div>
    </div>
  );
}
```

## Hook Configuration

### Default Behavior

```tsx
const playback = useClipPlayback();
```

This creates a default hook with:
- Auto-created audio context
- Auto-created master gain node
- 0.1 second fade duration
- No clip end callback

### Custom Configuration

```tsx
const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

const playback = useClipPlayback({
  masterGainNode: masterGain,
  fadeDuration: 0.2,
  onClipEnded: (clipId) => {
    console.log(`Clip ${clipId} ended`);
  },
});
```

**Options:**
- `masterGainNode` - Provide existing gain node (optional)
- `fadeDuration` - Fade duration in seconds (default: 0.1)
- `onClipEnded` - Callback when clip finishes (optional)

## Performance Considerations

### Buffer Caching

The hook automatically caches trimmed buffers to avoid recreation:

```tsx
// First call: Creates trimmed buffer and caches it
await playback.playClip(clipId);

// Subsequent calls: Uses cached buffer
await playback.playClip(clipId);
```

Cache key is based on: `clipId:displayStart:displayEnd:fadeIn:fadeOut`

### Memory Management

```tsx
// Cleanup happens automatically on unmount
// But you can also manually unregister clips:
playback.unregisterClip(clipId);

// Or stop all playback:
playback.stopAllClips();
```

## Error Handling

### Audio Context Initialization

The hook gracefully handles audio context initialization failures:

```tsx
try {
  await playback.playClip(clipId);
} catch (error) {
  // Audio context initialization failed
  // Check browser audio support
  console.error('Playback failed:', error);
}
```

### Unregistered Clips

Playing unregistered clips logs an error but doesn't throw:

```tsx
// Must register before playing
playback.registerClip(clipData);
await playback.playClip(clipData.id);
```

## Browser Compatibility

- Chrome/Edge: Full support (Web Audio API)
- Firefox: Full support (Web Audio API)
- Safari: Full support (WebKit Audio Context)
- Mobile browsers: Requires user interaction to start audio context

## Advanced: Custom Audio Processing

```tsx
const playback = useClipPlayback();

// Access master gain for custom processing
const masterGain = playback.getMasterGain();
if (masterGain) {
  const audioContext = masterGain.context;
  
  // Create custom effects chain
  const compressor = audioContext.createDynamicsCompressor();
  const eq = audioContext.createBiquadFilter();
  
  // Connect: masterGain -> compressor -> eq -> destination
  masterGain.disconnect();
  masterGain.connect(compressor);
  compressor.connect(eq);
  eq.connect(audioContext.destination);
}
```

## Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { useClipPlayback } from '@/hooks/useClipPlayback';

describe('useClipPlayback', () => {
  it('should play a clip', async () => {
    const { result } = renderHook(() => useClipPlayback());

    const mockClip = {
      id: 'test-clip',
      trackId: 'track-1',
      name: 'Test',
      audioBuffer: new AudioBuffer({ length: 44100, sampleRate: 44100 }),
      startTime: 0,
      duration: 1,
      displayStart: 0,
      displayEnd: 1,
      fadeIn: 0,
      fadeOut: 0,
      isSelected: false,
    };

    act(() => {
      result.current.registerClip(mockClip);
    });

    await act(async () => {
      await result.current.playClip('test-clip');
    });

    expect(result.current.playingClips).toContain('test-clip');
  });
});
```

## Troubleshooting

### No Sound Output

1. Check browser audio is enabled
2. Verify master volume isn't muted or at 0
3. Check clip volume levels
4. Ensure audio buffer contains audio data

### Pause/Resume Not Working

- Pause/resume requires re-creating audio sources (Web Audio API limitation)
- Position is tracked internally
- If clip doesn't resume, it may have already ended

### Memory Leaks

- Always unregister clips when no longer needed
- Hook cleans up on unmount automatically
- Clear cache if running for extended periods

```tsx
// Force cache clear if needed
const { unregisterClip } = playback;
clips.forEach(clip => unregisterClip(clip.id));
```

## Comparison: Previous Hook vs New Hook

| Feature | Previous | New |
|---------|----------|-----|
| Basic Playback | ✓ | ✓ |
| Pause/Resume | ✗ | ✓ |
| Per-Clip Mute | ✗ | ✓ |
| Per-Track Volume | ✗ | ✓ |
| Master Volume | ✗ | ✓ |
| State Tracking | Limited | ✓ Full |
| Error Handling | Basic | ✓ Comprehensive |
| JSDoc | Limited | ✓ Complete |
| TypeScript | ✓ | ✓ Full |

## API Reference

See `useClipPlayback.ts` for complete JSDoc documentation.
