# Audio Recording System - WISE² Sound Lab

Professional audio recording system for WISE² Sound Lab with sub-10ms latency monitoring, multi-track overdubbing, and metronome sync.

## Components

### 1. RecordingEngine.ts

Core recording system managing microphone input and audio capture.

**Features:**
- 48kHz, 24-bit audio capture (configurable)
- getUserMedia() microphone access with echo cancellation
- Real-time level metering (peak and RMS in dB)
- Clipping detection (samples > 0.95 amplitude)
- Round-trip latency measurement
- Low-latency monitoring output (hear yourself while recording)
- Callback system for real-time updates

**Usage:**

```typescript
import { RecordingEngine } from '@/lib/audioRecording';

// Create engine
const engine = new RecordingEngine({
  sampleRate: 48000,      // 48kHz professional grade
  channelCount: 1,         // Mono (1) or Stereo (2)
  echoCancellation: true,  // Remove echo
  noiseSuppression: true,  // Reduce background noise
  autoGainControl: false,  // Manual control for pros
});

// Initialize (requests microphone access)
await engine.initialize();

// Register callbacks
engine.onLevelChange((peakDb, rmsDb) => {
  console.log(`Peak: ${peakDb.toFixed(1)} dB, RMS: ${rmsDb.toFixed(1)} dB`);
});

engine.onClippingDetected(() => {
  console.warn('Clipping detected!');
});

// Start recording
engine.startRecording();

// ... recording in progress ...

// Stop and get recorded buffer
const result = engine.stopRecording();
if (result) {
  console.log(`Recorded ${result.metadata.duration.toFixed(2)}s`);
  console.log(`Peak level: ${result.metadata.metrics.peakLevel.toFixed(1)} dB`);
  
  // Access AudioBuffer for playback/export
  const buffer = result.audioBuffer;
}

// Enable monitoring (hear yourself)
const monitorGain = engine.enableMonitoring(0.5); // 50% volume

// Clean up
engine.dispose();
```

**Interface:**

```typescript
interface RecordingOptions {
  sampleRate?: number;        // 44.1kHz or 48kHz (default: 48kHz)
  channelCount?: number;      // 1 (mono) or 2 (stereo) - default: 1
  echoCancellation?: boolean; // Default: true
  noiseSuppression?: boolean; // Default: true
  autoGainControl?: boolean;  // Default: false (pro control)
}

interface RecordingMetrics {
  duration: number;           // Seconds
  peakLevel: number;          // dBFS
  rmsLevel: number;           // dBFS
  clippingCount: number;      // Samples clipped
  latency: number;            // Milliseconds
}

interface RecordedAudioBuffer {
  audioBuffer: AudioBuffer;   // Web Audio API buffer
  metadata: {
    timestamp: number;
    duration: number;
    sampleRate: number;
    channels: number;
    metrics: RecordingMetrics;
  };
}
```

### 2. Overdubbing.ts

Multi-track recording system with punch in/out and undo history.

**Features:**
- Multiple tracks with volume, pan, and mute controls
- Punch in/out recording (replace section of track)
- Per-track undo/redo history
- Track mixing and stereo panning
- Mix-down to stereo
- Track enable/disable

**Usage:**

```typescript
import { OverdubbingSystem } from '@/lib/audioRecording';

const audioContext = new AudioContext();
const overdub = new OverdubbingSystem(audioContext);

// Create track from recorded buffer
const trackId = overdub.createTrack('Vocals', recordedBuffer);

// Record to track (replace entire track)
overdub.recordToTrack(trackId, newRecordingBuffer);

// Or punch in/out (replace only section)
overdub.recordToTrack(trackId, newRecordingBuffer, {
  punchInStart: 10,   // Start at 10 seconds
  punchInEnd: 20,     // End at 20 seconds
});

// Undo/redo
overdub.undoRecording(trackId);
overdub.redoRecording(trackId);

// Set punch markers for next recording
overdub.setPunchInOut(15, 25); // 15-25 seconds

// Control tracks
overdub.setTrackVolume(trackId, 0.8);
overdub.setTrackPan(trackId, -0.5);      // Pan left
overdub.setTrackMuted(trackId, false);
overdub.setTrackEnabled(trackId, true);

// Playback
overdub.play(0);  // Start from 0 seconds
overdub.stop();

// Mix down all tracks
const stereoBuffer = overdub.mixDown();

// Clean up
overdub.dispose();
```

**Interface:**

```typescript
interface Track {
  id: string;
  name: string;
  audioBuffer: AudioBuffer;
  enabled: boolean;
  volume: number;    // 0 to 1
  muted: boolean;
  pan: number;       // -1 (left) to +1 (right)
}

interface PunchInOutMarkers {
  startTime: number; // Seconds
  endTime: number;   // Seconds
  enabled: boolean;
}
```

### 3. ClickTrack.ts

Professional metronome with visual beat feedback and pre-count bars.

**Features:**
- BPM control (40-240)
- Multiple time signatures (2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8)
- Accented downbeats (1200 Hz vs 800 Hz tone)
- Pre-count bars before recording
- Visual beat callbacks for UI display
- Real-time BPM adjustment

**Usage:**

```typescript
import { ClickTrack } from '@/lib/audioRecording';

const audioContext = new AudioContext();
const click = new ClickTrack(audioContext, {
  bpm: 120,
  timeSignature: [4, 4],
  preCountBars: 2,
  volume: 0.8,
  accentFirst: true,
});

// Register beat update callback (for visual feedback)
click.onBeat((beat, bar) => {
  console.log(`Bar ${bar + 1}, Beat ${beat + 1}`);
  // Update UI beat indicator
});

// Start metronome
click.start();

// Adjust tempo in real-time
click.setBpm(130);

// Check if in pre-count phase
if (click.isInPreCount()) {
  console.log('Pre-count running...');
}

// Stop
click.stop();

// Clean up
click.dispose();
```

**Interface:**

```typescript
interface ClickTrackConfig {
  bpm: number;                    // 40-240
  timeSignature: [number, number]; // [beats, noteValue] e.g., [4, 4]
  preCountBars: number;           // Number of bars before recording
  volume: number;                 // 0-1
  accentFirst: boolean;           // Accent first beat of measure
}

interface ClickTrackState {
  isRunning: boolean;
  currentBeat: number;   // 0-based beat within measure
  currentBar: number;    // 0-based bar number
  bpm: number;
  volume: number;
  nextClickTime: number; // Audio context time
}
```

## React Components

### RecordingControl.tsx

Complete recording interface with timer and clipping detection.

```tsx
import { RecordingControl } from '@/components/SoundLab/RecordingControl';

<RecordingControl
  onRecordingComplete={(buffer) => {
    // Handle recorded audio
    console.log(`Recorded ${buffer.metadata.duration}s`);
  }}
  onRecordingStart={() => console.log('Recording started')}
  onRecordingStop={() => console.log('Recording stopped')}
  onClipping={() => console.log('Clipping detected')}
/>
```

**Features:**
- Record/Stop button with visual feedback
- Recording time display (mm:ss.ms)
- Real-time peak level meter
- Clipping indicator with animation
- Latency display
- Error handling

### InputMonitor.tsx

Real-time audio level metering display.

```tsx
import { InputMonitor } from '@/components/SoundLab/InputMonitor';

<InputMonitor
  peakLevel={-6}
  rmsLevel={-18}
  isClipping={false}
  inputGain={0.8}
  onGainChange={(gain) => {
    // Update microphone gain
  }}
/>
```

**Features:**
- Peak and RMS level displays
- Visual level meter with gradient
- Peak hold indicator (2 second decay)
- Clipping zone marker
- Input gain slider
- Warning messages for hot levels

### MetronomeControl.tsx

Complete metronome interface with BPM and time signature controls.

```tsx
import { MetronomeControl } from '@/components/SoundLab/MetronomeControl';

<MetronomeControl
  audioContext={audioContext}
  onBeatUpdate={(beat, bar) => {
    // Update UI beat indicator
  }}
/>
```

**Features:**
- BPM control (40-240) with ±10 buttons
- Time signature selector (8 common signatures)
- Pre-count bars setting (0-8)
- Click volume control
- Visual beat indicator
- Play/Stop button
- Beat position display

## Integration Example

Complete recording setup combining all components:

```tsx
import React, { useRef } from 'react';
import { RecordingControl, InputMonitor, MetronomeControl } from '@/components/SoundLab';
import { RecordingEngine, ClickTrack, type RecordedAudioBuffer } from '@/lib/audioRecording';

export function RecordingStudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [peakLevel, setPeakLevel] = React.useState(-60);
  const [rmsLevel, setRmsLevel] = React.useState(-60);
  const [isClipping, setIsClipping] = React.useState(false);

  // Initialize audio context
  React.useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
  }, []);

  const handleRecordingComplete = (buffer: RecordedAudioBuffer) => {
    console.log('Recording complete:', buffer.metadata);
    // Save buffer, export, etc.
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Metronome */}
      <MetronomeControl
        audioContext={audioContextRef.current}
      />

      {/* Recording Control */}
      <RecordingControl
        onRecordingComplete={handleRecordingComplete}
        onClipping={() => setIsClipping(true)}
      />

      {/* Input Monitor */}
      <InputMonitor
        peakLevel={peakLevel}
        rmsLevel={rmsLevel}
        isClipping={isClipping}
      />
    </div>
  );
}
```

## Performance Characteristics

- **Sample Rate**: 48kHz (professional standard)
- **Bit Depth**: 32-bit float (Web Audio API standard)
- **Round-trip Latency**: <10ms (hardware dependent)
- **Clipping Detection**: Real-time, sample-accurate
- **Meter Update Rate**: 100ms refresh (configurable)
- **FFT Size**: 2048 bins (detailed analysis)

## Browser Support

Requires:
- Chrome 25+
- Firefox 25+
- Safari 14+
- Edge 79+

Uses Web Audio API standard features:
- `AudioContext`
- `getUserMedia()` (via `navigator.mediaDevices`)
- `ScriptProcessorNode` (or `AudioWorklet` for future)
- `AnalyserNode`

## Notes

- **Monitoring latency**: Monitoring input is tapped after the analyser, providing system-dependent latency (typically <50ms on modern hardware)
- **Undo history**: Limited by available memory; consider implementing periodic snapshots for long sessions
- **Punch in/out**: Times are in seconds; ensure accurate sample-rate-aware timing
- **MIX NORMALIZATION**: Automatic gain normalization prevents clipping on mix-down but may reduce dynamic range
- **Audio context state**: Must be resumed on user interaction (browser autoplay policy)

## Future Enhancements

- [ ] AudioWorklet for lower-latency ScriptProcessorNode
- [ ] Real-time VST/AU effect plugins
- [ ] Multi-channel recording (5.1, Ambisonics)
- [ ] Automatic gain control optimization
- [ ] WAV/FLAC export
- [ ] Time-stretch/pitch-shift for track alignment
- [ ] MIDI sync support
- [ ] Network recording (multi-client sync)
