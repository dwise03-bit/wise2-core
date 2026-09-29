# Sound Lab DAW — Quick Start Guide

Professional multi-track DAW components for WISE² Studio.

## 5-Minute Setup

### 1. Import Components

```typescript
import {
  Timeline,
  Track,
  ClipEditor,
  TransportControl,
  Mixer,
  DAWExample, // Complete working example
} from '@/components/SoundLab';
```

### 2. Use the Complete Example

For a fully functional DAW with all components integrated:

```typescript
import { DAWExample } from '@/components/SoundLab';

export default function StudiosPage() {
  return <DAWExample />;
}
```

This includes:
- 3 sample tracks (Drums, Bass, Vocals)
- Timeline with zoom and scrolling
- Transport controls with playback
- Full mixer with metering
- Track management (add/delete/rename)

### 3. Minimal Custom Implementation

```typescript
'use client';

import { useState } from 'react';
import { Timeline, TransportControl, Track } from '@/components/SoundLab';

export function MyDAW() {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [zoom, setZoom] = useState(2);
  const [bpm, setBpm] = useState(120);

  // Calculate pixels per second based on zoom
  const pxPerSecond = 50 * zoom;

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Playback Control */}
      <TransportControl
        isPlaying={isPlaying}
        playheadPosition={playheadPosition}
        duration={120}
        bpm={bpm}
        isLooping={false}
        onPlayToggle={setIsPlaying}
        onBpmChange={setBpm}
        onStop={() => {
          setIsPlaying(false);
          setPlayheadPosition(0);
        }}
      />

      {/* Timeline with Tracks */}
      <Timeline
        duration={120}
        playheadPosition={playheadPosition}
        pxPerSecond={pxPerSecond}
        zoom={zoom}
        scrollX={0}
        bpm={bpm}
        isLooping={false}
        onPlayheadChange={setPlayheadPosition}
        onZoomChange={setZoom}
      >
        {/* First Track */}
        <Track
          id="track-1"
          name="Audio Track 1"
          index={0}
          volume={1}
          pan={0}
          isMuted={false}
          isSoloed={false}
          isArmed={false}
          peakLevel={-12}
          onVolumeChange={(vol) => console.log('Volume:', vol)}
          onSelect={() => console.log('Track 1 selected')}
        />

        {/* Second Track */}
        <Track
          id="track-2"
          name="Audio Track 2"
          index={1}
          volume={0.9}
          pan={0.2}
          isMuted={false}
          isSoloed={false}
          isArmed={false}
          peakLevel={-10}
          onVolumeChange={(vol) => console.log('Volume:', vol)}
          onSelect={() => console.log('Track 2 selected')}
        />
      </Timeline>
    </div>
  );
}
```

## Component Reference

### Timeline

Shows the project timeline with playhead and clips.

```typescript
<Timeline
  duration={120}                    // Project length in seconds
  playheadPosition={0}              // Current playhead position
  pxPerSecond={50 * zoom}           // Pixels per second (affects zoom)
  zoom={2}                          // Zoom level 1-10x
  scrollX={0}                       // Horizontal scroll offset
  bpm={120}                         // Beats per minute
  isLooping={false}                 // Loop enabled
  loopStart={0}                     // Loop start point
  loopEnd={60}                      // Loop end point
  onPlayheadChange={setPlayheadPosition}
  onZoomChange={setZoom}
  onScrollChange={setScrollX}
  onLoopChange={(enabled, start, end) => {
    setIsLooping(enabled);
    setLoopStart(start);
    setLoopEnd(end);
  }}
>
  {/* Track components go here */}
</Timeline>
```

### Track

Individual track with controls.

```typescript
<Track
  id="track-1"                      // Unique identifier
  name="Drums"                      // Track name (editable)
  index={0}                         // Track number (0-based)
  volume={1}                        // Volume 0-1 (1 = 0dB)
  pan={0}                           // Pan -1 (left) to 1 (right)
  isMuted={false}                   // Mute state
  isSoloed={false}                  // Solo state
  isArmed={false}                   // Record arm state
  peakLevel={-12}                   // Peak level in dB
  isSelected={false}                // Selection state
  color="#3b82f6"                   // Track color (hex)
  onVolumeChange={(vol) => console.log(vol)}
  onPanChange={(pan) => console.log(pan)}
  onMuteToggle={(muted) => console.log(muted)}
  onSoloToggle={(soloed) => console.log(soloed)}
  onArmToggle={(armed) => console.log(armed)}
  onSelect={() => console.log('selected')}
  onDelete={() => console.log('deleted')}
  onNameChange={(name) => console.log(name)}
>
  {/* Clips go here */}
</Track>
```

### ClipEditor

Audio clip with editing features.

```typescript
<ClipEditor
  id="clip-1"                       // Unique identifier
  trackId="track-1"                 // Parent track
  name="Drum Loop"                  // Clip name
  audioBuffer={buffer}              // Web Audio AudioBuffer
  type="recorded"                   // 'recorded' or 'generated'
  startTime={0}                     // Timeline position (seconds)
  duration={16}                     // Original duration (seconds)
  displayStart={0}                  // Trim start (seconds)
  displayEnd={16}                   // Trim end (seconds)
  fadeIn={0.5}                      // Fade-in duration (seconds)
  fadeOut={1}                       // Fade-out duration (seconds)
  pitchShift={0}                    // Pitch shift (semitones)
  timeStretch={1.0}                 // Time stretch factor
  pxPerSecond={100}                 // Pixels per second
  gridSnap={0.25}                   // Snap-to-grid interval
  isSelected={false}                // Selection state
  onMove={(startTime) => console.log(startTime)}
  onTrimStart={(start) => console.log(start)}
  onTrimEnd={(end) => console.log(end)}
  onTimeStretch={(factor) => console.log(factor)}
  onPitchShift={(semitones) => console.log(semitones)}
  onCrossfade={(duration) => console.log(duration)}
  onSelect={() => console.log('selected')}
  onDelete={() => console.log('deleted')}
/>
```

### TransportControl

Playback controls and timing display.

```typescript
<TransportControl
  isPlaying={false}                 // Playback state
  playheadPosition={0}              // Current position (seconds)
  duration={120}                    // Project duration (seconds)
  bpm={120}                         // Tempo (BPM)
  isLooping={false}                 // Loop enabled
  loopStart={0}                     // Loop start (seconds)
  loopEnd={60}                      // Loop end (seconds)
  isClickEnabled={false}            // Click track enabled
  clickVolume={0.8}                 // Click volume 0-1
  onPlayToggle={(playing) => console.log(playing)}
  onStop={() => console.log('stopped')}
  onBpmChange={(bpm) => console.log(bpm)}
  onLoopToggle={(enabled) => console.log(enabled)}
  onLoopStartChange={(start) => console.log(start)}
  onLoopEndChange={(end) => console.log(end)}
  onClickToggle={(enabled) => console.log(enabled)}
  onClickVolumeChange={(vol) => console.log(vol)}
/>
```

### Mixer

Channel strips with metering.

```typescript
<Mixer
  channels={[
    {
      id: 'track-1',
      name: 'Drums',
      volume: 1,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      peakLevel: -12,
    },
    {
      id: 'track-2',
      name: 'Bass',
      volume: 0.9,
      pan: -0.1,
      isMuted: false,
      isSoloed: false,
      peakLevel: -10,
    },
  ]}
  masterVolume={1}                  // Master volume 0-1
  masterPeakLevel={-6}              // Master peak level (dB)
  onChannelVolumeChange={(id, vol) => console.log(id, vol)}
  onChannelPanChange={(id, pan) => console.log(id, pan)}
  onChannelMuteToggle={(id, muted) => console.log(id, muted)}
  onChannelSoloToggle={(id, soloed) => console.log(id, soloed)}
  onChannelSelect={(id) => console.log(id)}
  onMasterVolumeChange={(vol) => console.log(vol)}
/>
```

## Common Patterns

### Add/Remove Tracks

```typescript
const [tracks, setTracks] = useState<TrackData[]>([...]);

const addTrack = () => {
  setTracks([...tracks, {
    id: `track-${Date.now()}`,
    name: `Track ${tracks.length + 1}`,
    volume: 1,
    pan: 0,
    isMuted: false,
    isSoloed: false,
    isArmed: false,
    peakLevel: -20,
    clips: [],
  }]);
};

const deleteTrack = (id: string) => {
  setTracks(tracks.filter(t => t.id !== id));
};
```

### Manage Playback

```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [playheadPosition, setPlayheadPosition] = useState(0);

useEffect(() => {
  if (!isPlaying) return;

  const startTime = Date.now();
  const startPosition = playheadPosition;

  const tick = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    setPlayheadPosition(startPosition + elapsed);
    requestAnimationFrame(tick);
  };

  const id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}, [isPlaying, playheadPosition]);
```

### Create and Edit Clips

```typescript
const addClip = (trackId: string, audioBuffer: AudioBuffer) => {
  setTracks(tracks.map(track => {
    if (track.id !== trackId) return track;
    return {
      ...track,
      clips: [...track.clips, {
        id: `clip-${Date.now()}`,
        name: 'New Clip',
        audioBuffer,
        startTime: playheadPosition,
        duration: audioBuffer.duration,
        displayStart: 0,
        displayEnd: audioBuffer.duration,
        fadeIn: 0,
        fadeOut: 0,
        type: 'recorded',
      }],
    };
  }));
};
```

### Sync Zoom Across Components

```typescript
const [zoom, setZoom] = useState(2);
const pxPerSecond = 50 * zoom; // Base pixels per second

// Pass to Timeline
<Timeline pxPerSecond={pxPerSecond} onZoomChange={setZoom} />

// Pass to Tracks
{tracks.map(track => (
  <Track key={track.id}>
    {track.clips.map(clip => (
      <ClipEditor
        key={clip.id}
        pxPerSecond={pxPerSecond}
        // ... other props
      />
    ))}
  </Track>
))}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Space** | Play/Pause |
| **Enter** | Stop |
| **M** | Mute selected track |
| **S** | Solo selected track |
| **R** | Arm selected track |
| **Delete** | Delete selected clip |
| **Double-click** | Open clip properties |
| **Shift + Scroll** | Horizontal scroll timeline |
| **Ctrl/Cmd + Scroll** | Zoom timeline |
| **Drag Playhead** | Seek to position |

## Styling & Customization

All components use Tailwind CSS. Colors are defined in component `className` attributes.

### Custom Theme

```typescript
// Modify component classNames to use your colors
<Track
  className={`bg-your-color border-your-border`}
  // ...
/>
```

### Dark Mode

Components are dark-mode optimized by default. All use gray-900/gray-950 backgrounds with appropriate contrast.

## Performance Tips

1. **Memoize Callbacks**: Use `useCallback` for event handlers
   ```typescript
   const handleVolumeChange = useCallback((vol) => {
     setTracks(/* ... */);
   }, [tracks]);
   ```

2. **Virtualize Large Track Lists**: Render only visible tracks
   ```typescript
   // Use react-virtual or similar library
   <VirtualList items={tracks}>
     {(track) => <Track key={track.id} {...track} />}
   </VirtualList>
   ```

3. **Throttle Meter Updates**: Don't update levels on every frame
   ```typescript
   const updateMeters = useCallback(() => {
     // Update every 30ms (30Hz)
   }, []);
   ```

4. **Lazy Load Waveforms**: Render waveform only when clip is visible
   ```typescript
   const [isVisible, setIsVisible] = useState(false);
   useEffect(() => {
     const observer = new IntersectionObserver(([entry]) => {
       setIsVisible(entry.isIntersecting);
     });
     observer.observe(canvasRef.current);
   }, []);
   ```

## Troubleshooting

### Playhead not updating
- Ensure `playheadPosition` state is updated continuously in useEffect
- Check that `requestAnimationFrame` loop is running
- Verify callbacks are properly connected

### Clips not rendering
- Ensure `audioBuffer` is a valid Web Audio AudioBuffer
- Check that `displayStart < displayEnd`
- Verify `pxPerSecond` is positive number

### Zoom not working
- Ensure `zoom` state is between 1-10
- Check that `pxPerSecond` calculation is correct
- Verify `onZoomChange` callback is connected

### Audio playback not working
- Implement Web Audio API playback in your audio engine
- See "Audio Engine Integration" in DAW_ARCHITECTURE.md
- Use useClipPlayback hook for existing playback system

## Next Steps

1. **Read DAW_ARCHITECTURE.md** for detailed technical reference
2. **Explore DAWExample.tsx** for complete working implementation
3. **Integrate with useClipPlayback hook** for actual audio playback
4. **Add recording functionality** with useRecorder hook
5. **Implement undo/redo** with state history management

## Support

For issues, questions, or contributions:
- Check DAW_ARCHITECTURE.md
- Review existing component props and callbacks
- See DAWExample.tsx for integration patterns
