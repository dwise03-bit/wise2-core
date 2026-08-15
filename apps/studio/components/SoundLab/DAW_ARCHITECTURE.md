# Sound Lab DAW Core Architecture

Professional multi-track digital audio workstation (DAW) components for WISE² Studio.

## Overview

Sound Lab DAW provides a complete, production-grade foundation for audio editing and mixing:

- **Timeline.tsx** - Canvas-based 60fps timeline with zoom, time ruler, playhead, and loop regions
- **Track.tsx** - Individual track management with volume, pan, mute, solo, and record arm
- **ClipEditor.tsx** - Advanced clip editing with pitch shift, time stretch, and crossfades
- **TransportControl.tsx** - Playback control with BPM, loop regions, and click track
- **Mixer.tsx** - Professional channel strip mixer with peak metering and pan controls

## Component Architecture

### Timeline Component

Canvas-based rendering with 60fps refresh rate for smooth playback.

**Features:**
- Horizontal scrolling with time ruler (bars:beats:ticks format)
- Vertical zoom (1-10x magnification)
- Draggable playhead indicator (red line)
- Loop region markers (green dashed lines)
- Selection rectangle (drag to select time range)
- Real-time BPM-linked timing

**Key Props:**
```typescript
interface TimelineProps {
  duration: number;              // Total project duration (seconds)
  playheadPosition: number;      // Current playhead position (seconds)
  pxPerSecond: number;           // Pixels per second (zoom-dependent)
  zoom: number;                  // Zoom level (1-10x)
  scrollX: number;               // Horizontal scroll offset (pixels)
  bpm: number;                   // Tempo in beats per minute
  isLooping: boolean;            // Loop enabled flag
  loopStart?: number;            // Loop start position (seconds)
  loopEnd?: number;              // Loop end position (seconds)
}
```

**Callbacks:**
```typescript
onPlayheadChange(position: number)    // Playhead dragged
onZoomChange(zoom: number)            // Zoom button clicked or wheel
onScrollChange(scrollX: number)       // Horizontal scroll
onLoopChange(enabled, start, end)     // Loop settings changed
onSelectionChange(start, end)         // Time range selected
```

**Keyboard Shortcuts:**
- `Shift + Wheel` - Horizontal scroll
- `Ctrl/Cmd + Wheel` - Zoom in/out
- Click playhead area - Drag to seek

### Track Component

Individual audio track with complete control suite.

**Features:**
- Track header with name (editable)
- Volume fader (−∞ to +12dB)
- Pan knob (L/C/R)
- Mute/Solo/Record buttons with visual indicators
- Peak meter (green → yellow → red at threshold levels)
- Drag-to-reorder tracks
- Color-coded track identification

**Key Props:**
```typescript
interface TrackProps {
  id: string;              // Unique track identifier
  name: string;            // Track display name (editable)
  index: number;           // Track order index
  volume: number;          // Volume level (0-1, 1 = 0dB)
  pan: number;             // Pan value (-1 = left, 0 = center, 1 = right)
  isMuted: boolean;        // Mute state
  isSoloed: boolean;       // Solo state
  isArmed: boolean;        // Record arm state
  peakLevel: number;       // Peak level in dB (for metering)
  color?: string;          // Track identifier color
}
```

**Callbacks:**
```typescript
onVolumeChange(volume: number)        // Volume slider moved
onPanChange(pan: number)              // Pan knob rotated
onMuteToggle(muted: boolean)          // Mute button clicked
onSoloToggle(soloed: boolean)         // Solo button clicked
onArmToggle(armed: boolean)           // Record arm button clicked
onSelect()                             // Track selected
onDelete()                             // Delete track
onNameChange(name: string)            // Track renamed
```

### ClipEditor Component

Advanced clip editing with visual feedback and manipulation handles.

**Features:**
- **Clip Types**: Generated (blue) vs Recorded (green) with visual differentiation
- **Move**: Drag center to move clip with optional grid snap
- **Trim**: Drag edges to trim start/end independently
- **Fade**: Drag left/right edges to control fade-in/out duration
- **Pitch Shift**: Drag top edge to shift pitch (±12 semitones)
- **Time Stretch**: Drag bottom-right corner to change playback speed without pitch change
- **Crossfade**: Visual indicator for crossfade with next clip
- **Properties Dialog**: Double-click to open advanced properties

**Key Props:**
```typescript
interface ClipEditorProps {
  id: string;                    // Unique clip identifier
  name: string;                  // Clip display name
  audioBuffer: AudioBuffer;      // Web Audio API buffer
  type?: ClipType;               // 'recorded' | 'generated'
  startTime: number;             // Timeline position (seconds)
  duration: number;              // Original audio duration (seconds)
  displayStart: number;          // Trim start point (seconds)
  displayEnd: number;            // Trim end point (seconds)
  fadeIn?: number;               // Fade-in duration (seconds)
  fadeOut?: number;              // Fade-out duration (seconds)
  pitchShift?: number;           // Pitch shift (semitones)
  timeStretch?: number;          // Time stretch factor (0.25 - 4.0)
  crossfadeNextClip?: number;    // Crossfade duration (seconds)
  isSelected?: boolean;          // Selection state
  pxPerSecond: number;           // Pixels per second (zoom-dependent)
  gridSnap?: number;             // Snap-to-grid interval (seconds)
}
```

**Drag Modes:**
| Position | Drag Behavior |
|----------|---------------|
| Top edge | Pitch shift (semitones) |
| Left edge | Trim start point |
| Right edge | Trim end point |
| Bottom-right corner | Time stretch (playback speed) |
| Left area (20px) | Fade-in control |
| Right area (20px) | Fade-out control |
| Center | Move clip along timeline |

**Callbacks:**
```typescript
onMove(newStartTime: number)           // Clip moved
onTrimStart(newTrimStart: number)      // Start trimmed
onTrimEnd(newTrimEnd: number)          // End trimmed
onTimeStretch(factor: number)          // Time stretch changed
onPitchShift(semitones: number)        // Pitch shifted
onCrossfade(duration: number)          // Crossfade duration
onSelect()                              // Clip selected
onDelete()                              // Clip deleted
onFadeInChange(duration: number)       // Fade-in adjusted
onFadeOutChange(duration: number)      // Fade-out adjusted
onPropertiesOpen()                      // Properties dialog opened
```

### TransportControl Component

Playback control center with timing and tempo management.

**Features:**
- Play/Pause/Stop buttons with visual feedback
- Time display in bars:beats:ticks and mm:ss.ms formats
- BPM tempo control with ±1 buttons
- Loop toggle with editable loop points
- Click track (metronome) with adjustable volume
- Playback progress indicator
- Keyboard shortcuts (Space = Play/Pause, Enter = Stop)

**Key Props:**
```typescript
interface TransportControlProps {
  isPlaying: boolean;            // Playback state
  playheadPosition: number;      // Current position (seconds)
  duration: number;              // Total project duration (seconds)
  bpm: number;                   // Tempo in beats per minute
  isLooping: boolean;            // Loop enabled
  loopStart?: number;            // Loop start (seconds)
  loopEnd?: number;              // Loop end (seconds)
  isClickEnabled?: boolean;      // Click track enabled
  clickVolume?: number;          // Click volume (0-1)
}
```

**Callbacks:**
```typescript
onPlayToggle(playing: boolean)         // Play/Pause toggled
onStop()                               // Stop button clicked
onBpmChange(bpm: number)               // BPM changed
onLoopToggle(enabled: boolean)         // Loop toggled
onLoopStartChange(position: number)    // Loop start moved
onLoopEndChange(position: number)      // Loop end moved
onClickToggle(enabled: boolean)        // Click track toggled
onClickVolumeChange(volume: number)    // Click volume changed
```

### Mixer Component

Professional multi-track mixer with channel strips and master output.

**Features:**
- Individual channel strips for each track
- Vertical volume faders (−∞ to +12dB with real dB display)
- Pan knobs (L/C/R)
- Real-time peak meters (color-coded: green → yellow → red)
- Mute/Solo buttons with state indicators
- Master output section with peak metering
- Horizontal scrolling for unlimited channels
- Clipping indicator and headroom display

**Key Props:**
```typescript
interface MixerProps {
  channels: ChannelStrip[];      // Array of channel data
  masterVolume: number;          // Master volume (0-1)
  masterPeakLevel: number;       // Master peak level (dB)
  hoveredChannelId?: string;     // Currently hovered channel
}

interface ChannelStrip {
  id: string;                    // Channel identifier
  name: string;                  // Channel name
  volume: number;                // Volume level (0-1)
  pan: number;                   // Pan value (-1 to 1)
  isMuted: boolean;              // Mute state
  isSoloed: boolean;             // Solo state
  peakLevel: number;             // Peak level (dB)
  inputLevel?: number;           // Input level for recording (dB)
}
```

**Callbacks:**
```typescript
onChannelVolumeChange(id, volume)      // Channel volume changed
onChannelPanChange(id, pan)            // Channel pan changed
onChannelMuteToggle(id, muted)         // Channel muted
onChannelSoloToggle(id, soloed)        // Channel soloed
onChannelSelect(id)                    // Channel selected
onMasterVolumeChange(volume)           // Master volume changed
```

## Integration Example

See `DAWExample.tsx` for a complete working integration showing:

1. **State Management**: Track list, playhead position, zoom level, BPM
2. **Component Composition**: Timeline wraps Track components which wrap ClipEditor
3. **Multi-track Synchronization**: All components share playhead position and scroll offset
4. **Event Flow**: Transport control triggers playback, which updates playhead in Timeline
5. **Real-time Metering**: Peak levels update from track state to Mixer

### Basic Setup

```typescript
import {
  Timeline,
  Track,
  ClipEditor,
  TransportControl,
  Mixer,
} from '@/components/SoundLab';

export function MyDAW() {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [bpm, setBpm] = useState(120);
  
  const pxPerSecond = 50 * zoom; // pixels per second at current zoom

  return (
    <div className="flex flex-col h-screen">
      {/* Transport */}
      <TransportControl
        isPlaying={isPlaying}
        playheadPosition={playheadPosition}
        duration={120}
        bpm={bpm}
        onPlayToggle={setIsPlaying}
        onBpmChange={setBpm}
      />

      {/* Timeline with Tracks */}
      <Timeline
        duration={120}
        playheadPosition={playheadPosition}
        pxPerSecond={pxPerSecond}
        zoom={zoom}
        bpm={bpm}
        onPlayheadChange={setPlayheadPosition}
        onZoomChange={setZoom}
      >
        {/* Render tracks here */}
      </Timeline>

      {/* Mixer */}
      <Mixer channels={channelData} masterVolume={1} masterPeakLevel={-6} />
    </div>
  );
}
```

## Performance Optimizations

### Timeline Rendering
- Canvas-based rendering for time ruler and playhead (60fps)
- RequestAnimationFrame loop for smooth updates
- Viewport culling to avoid rendering off-screen clips

### Track Management
- Virtualized rendering for unlimited tracks
- Only render visible tracks (implement with useVirtual)
- Memoized callbacks to prevent unnecessary re-renders

### Clip Editing
- Defer heavy waveform rendering until clip is visible
- Cache waveform canvases to avoid re-rendering
- Use requestAnimationFrame for smooth drag operations

### Mixer
- Throttle level metering updates (30Hz sufficient)
- CSS transforms for smooth fader animations
- GPU-accelerated meter bars with CSS transitions

## Audio Engine Integration

To connect with Web Audio API for actual playback:

```typescript
// Audio context initialization
const audioContext = new AudioContext();

// Play clips
async function playClips(clips: ClipData[], trackVolumes: Record<string, number>) {
  const now = audioContext.currentTime;
  
  clips.forEach(clip => {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = clip.audioBuffer;
    gainNode.gain.value = trackVolumes[clip.trackId];
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Apply trim and fades
    const trimmedStart = clip.displayStart;
    const trimmedDuration = clip.displayEnd - clip.displayStart;
    
    // Apply pitch shift (requires Web Audio API stretch/pitch processors)
    if (clip.pitchShift !== 0) {
      // Use Tone.js or implement pitch shifting
    }
    
    source.start(now + clip.startTime, trimmedStart, trimmedDuration);
  });
}
```

## Styling & Theming

All components use Tailwind CSS with dark theme (gray-900/gray-950 background).

Color scheme:
- **Primary**: Blue (generated clips, selection)
- **Recording**: Green (recorded clips, arm button)
- **Loop**: Green (loop region)
- **Playhead**: Red
- **Meters**: Green → Yellow → Red (safe → warning → clipping)
- **Solo**: Yellow
- **Mute**: Red
- **Pitch/Stretch**: Orange/Purple

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Pause |
| Enter | Stop |
| M | Mute selected track |
| S | Solo selected track |
| R | Arm selected track |
| Delete/Backspace | Delete selected clip |
| Double-click Clip | Open properties |
| Shift + Wheel | Horizontal scroll |
| Ctrl/Cmd + Wheel | Zoom timeline |
| Drag Playhead | Seek to position |

## Testing Checklist

- [ ] Timeline renders with correct time ruler formatting
- [ ] Playhead follows playback position smoothly
- [ ] Zoom in/out updates all track widths proportionally
- [ ] Loop region markers display correctly and repeat playback
- [ ] Tracks can be added, deleted, renamed, muted, soloed
- [ ] Clips can be moved, trimmed, faded, pitch-shifted, time-stretched
- [ ] Transport controls work with keyboard shortcuts
- [ ] Mixer channels update in real-time
- [ ] Peak meters show correct levels and color change at thresholds
- [ ] Horizontal scrolling doesn't break layout
- [ ] All drag operations are smooth at 60fps

## Future Enhancements

1. **Undo/Redo Stack**: Track all edits in immutable history
2. **Audio Engine Integration**: Actual Web Audio API playback
3. **Recording Engine**: Real-time recording from microphone/line-in
4. **Automation**: Per-track automation curves for volume/pan
5. **Effects Chain**: Plugin/VST support for processing
6. **MIDI Support**: MIDI clip editing and playback
7. **Collaboration**: Real-time multi-user editing via WebSocket
8. **Export**: Multi-format audio export (WAV, MP3, FLAC)

## References

- [Web Audio API Specification](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Hooks Guide](https://react.dev/reference/react)
