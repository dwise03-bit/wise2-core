# Professional Audio Mixer for Streaming

A production-ready audio mixing system for WISE² Studio with professional metering, multi-source support, and RTMP streaming integration.

## Architecture Overview

```
Audio Sources (Mic, System, Suno, SoundLab)
    ↓
[Web Audio API Mixer]
    ├─ Per-source gain control
    ├─ Pan control (stereo imaging)
    ├─ Mute/Solo functionality
    └─ Real-time metering (Peak/RMS)
    ↓
[Master Output]
    ├─ Master fader (-60dB to +6dB)
    ├─ Clipping detection
    ├─ Audio delay compensation
    └─ LUFS metering
    ↓
[RTMP Stream Output]
    └─ Stream to YouTube/Twitch/Custom
```

## Components

### 1. AudioMixing.ts - Web Audio API Engine

Core audio mixing engine using Web Audio API.

**Key Classes:**

- **StreamingAudioMixer**: Main mixer managing audio sources and mixing
  - `addSource()`: Add audio source (microphone, media, etc.)
  - `setSourceVolume()`: Control source volume (-60dB to +6dB)
  - `setSourcePan()`: Pan control (-1 left to +1 right)
  - `setSourceMute()`: Mute/unmute source
  - `updateMeters()`: Update real-time metering
  - `getMasterMetering()`: Get master levels and clipping status

- **AudioDelayCompensator**: Synchronize audio/video timing
  - `setDelay()`: Set delay (0-500ms)
  - `getDelay()`: Get current delay

- **StreamingAudioEncoder**: Encode audio for streaming
  - `encodePCM()`: Convert audio to PCM format
  - `setBitrate()`: Set encoding bitrate (32-320kbps)

**Usage:**
```typescript
const mixer = new StreamingAudioMixer();
mixer.addSource('mic-1', mediaStream);
mixer.setSourceVolume('mic-1', -6); // -6dB
mixer.updateMeters();
const metering = mixer.getSourceMetering('mic-1');
```

### 2. StreamingAudioIntegration.ts - High-Level API

Integration layer managing audio sources and stream output.

**Key Classes:**

- **StreamingAudioManager**: Manages all audio sources
  - `addMicrophoneSource()`: Add microphone input
  - `addSystemAudioSource()`: Add system audio
  - `addSunoTrackSource()`: Add AI-generated track
  - `addSoundLabSource()`: Integrate Sound Lab master output
  - `addMediaSource()`: Add audio/video file
  - `removeSource()`: Remove audio source
  - `setSourceVolume/Pan/Mute()`: Control sources
  - `setMasterVolume()`: Master output control
  - `setAudioDelay()`: Audio sync compensation

- **RTMPStreamOutput**: RTMP streaming connection
  - `connect()`: Connect to RTMP server
  - `sendAudioData()`: Send mixed audio to stream
  - `disconnect()`: Close stream connection
  - `isStreamActive()`: Check connection status

- **StreamingAudioSystem**: Complete system orchestration
  - Initializes audio context
  - Manages both audio and RTMP components
  - Handles cleanup and resource management

**Usage:**
```typescript
const system = new StreamingAudioSystem();
await system.initialize();

const audioManager = system.getAudioManager();
await audioManager.addMicrophoneSource('mic-1');
audioManager.setSourceVolume('mic-1', -6);

const rtmp = system.getRTMPOutput();
await rtmp.connect('rtmp://server.com/live', 'streamkey');
```

### 3. AudioMixer.tsx - UI Component

Professional channel strips with metering and controls.

**Features:**
- Channel strips with:
  - Volume faders (-60dB to +6dB)
  - Pan knobs (L ← 0 → R)
  - Mute/Solo buttons (color-coded)
  - Peak meter (green → yellow → red)
  - RMS meter (average level)
  - Source type icon and name
  - Clipping indicator
- Horizontal scrolling for many sources
- Real-time level updates

**Props:**
```typescript
interface AudioMixerProps {
  channels: AudioChannel[];
  masterVolume: number;
  masterPeakLevel: number;
  masterRmsLevel: number;
  masterIsClipping?: boolean;
  onChannelVolumeChange?: (id: string, volume: number) => void;
  onChannelPanChange?: (id: string, pan: number) => void;
  onChannelMuteToggle?: (id: string, muted: boolean) => void;
  onChannelSoloToggle?: (id: string, soloed: boolean) => void;
  onMasterVolumeChange?: (volume: number) => void;
}
```

### 4. MasterChannel.tsx - Master Output Control

Master output controls with monitoring and advanced settings.

**Features:**
- Master volume fader
- Peak and RMS metering
- LUFS loudness metering
- Output monitor selector (headphones/output/both)
- Audio delay compensation (0-500ms)
- Clipping detection and warning
- Headroom indicator
- Loudness standard references
- Advanced settings toggle

**Props:**
```typescript
interface MasterChannelProps {
  masterVolume: number;
  masterPeakLevel: number;
  masterRmsLevel: number;
  masterLUFS?: number;
  isClipping?: boolean;
  outputDestination?: 'headphones' | 'output' | 'both';
  audioDelay?: number;
  onVolumeChange?: (volume: number) => void;
  onDelayChange?: (delayMs: number) => void;
  onOutputChange?: (destination: 'headphones' | 'output' | 'both') => void;
  onReset?: () => void;
}
```

### 5. useStreamingAudioMixer.ts - React Hook

Complete React hook for audio mixer state management.

**State:**
- `isInitialized`: Audio context ready
- `isStreaming`: Active stream connection
- `channels`: All audio sources with metering
- `masterVolume`: Current master volume
- `masterMetering`: Master level and clipping data
- `audioState`: Web Audio API state

**Actions:**
```typescript
// Add sources
await addMicrophoneSource();
await addSystemAudioSource();
await addSunoTrackSource(url);
addMediaSource(element, name);
removeSource(sourceId);

// Control sources
setSourceVolume(id, dB);
setSourcePan(id, pan);
setSourceMute(id, muted);
toggleSourceSolo(id);
setAudioDelay(id, ms);

// Stream control
await connectToStream(url, key);
disconnectStream();
isStreamConnected();

// Cleanup
cleanup();
```

**Usage:**
```typescript
function MyComponent() {
  const {
    channels,
    masterVolume,
    masterMetering,
    addMicrophoneSource,
    setSourceVolume,
    connectToStream,
  } = useStreamingAudioMixer();

  return (
    <div>
      <AudioMixer
        channels={channels}
        masterVolume={masterVolume}
        masterPeakLevel={masterMetering.peakLevel}
        onChannelVolumeChange={setSourceVolume}
      />
      <button onClick={() => connectToStream(url, key)}>
        Go Live
      </button>
    </div>
  );
}
```

## Integration Guide

### 1. Basic Setup

```typescript
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';

function StreamingPage() {
  const mixer = useStreamingAudioMixer();

  return (
    <div>
      <AudioMixer
        channels={mixer.channels}
        masterVolume={mixer.masterVolume}
        masterPeakLevel={mixer.masterMetering.peakLevel}
        onChannelVolumeChange={mixer.setSourceVolume}
      />
    </div>
  );
}
```

### 2. Sound Lab Integration

```typescript
// In Sound Lab component
const { getAudioManager } = useStreamingAudioMixer();

// After Sound Lab is initialized:
const audioManager = getAudioManager();
audioManager.addSoundLabSource(
  soundLabAudioContext,
  soundLabMasterOutput,
  'soundlab-master'
);

// Control Sound Lab volume through mixer
mixer.setSourceVolume('soundlab-master', -3);
```

### 3. Suno Integration

```typescript
// Add Suno-generated tracks
const audioManager = mixer.getAudioManager();

// Single track
await audioManager.addSunoTrackSource(
  'https://suno-api.com/audio/track-id.mp3',
  'suno-track-1'
);

// Multiple tracks
for (const track of sunoPlaylist) {
  await audioManager.addSunoTrackSource(track.audioUrl);
}
```

### 4. RTMP Streaming

```typescript
// Connect to stream
const success = await mixer.connectToStream(
  'rtmp://your-server.com/live',
  'your-stream-key'
);

// Monitor streaming status
if (mixer.isStreamConnected()) {
  console.log('Streaming active');
}

// Disconnect when done
mixer.disconnectStream();
```

### 5. Microphone and System Audio

```typescript
// Add microphone
const micAdded = await mixer.addMicrophoneSource();

// Add system audio (for screen capture audio)
const systemAdded = await mixer.addSystemAudioSource();

// Control levels
mixer.setSourceVolume('mic-1', -6);
mixer.setSourceVolume('system-1', -3);

// Mute during transitions
mixer.setSourceMute('mic-1', true);
```

## Volume and Metering Reference

### Volume Levels
- **-∞ to -60dB**: Inaudible/Muted
- **-60 to -20dB**: Very quiet to quiet
- **-20 to -6dB**: Quiet to moderate
- **-6 to 0dB**: Moderate to loud (normal range)
- **0 to +6dB**: Loud to very loud
- **≥0dB**: Clipping (distortion risk)

### Peak Levels
- **Green**: -12dB and below (safe)
- **Amber**: -12dB to -3dB (caution)
- **Yellow**: -3dB to 0dB (warning)
- **Red**: 0dB and above (clipping)

### LUFS (Loudness Units relative to Full Scale)
- **< -23 LUFS**: Too quiet
- **-23 to -19 LUFS**: Good (streaming standard)
- **-19 to -14 LUFS**: Loud
- **> -14 LUFS**: Too loud (clipping risk)

## Audio Delay Compensation

For A/V sync issues, use the audio delay compensation feature:

```typescript
// If audio is behind video by 100ms:
mixer.setAudioDelay('mic-1', 100);

// If audio is ahead of video by 50ms:
mixer.setAudioDelay('soundlab-master', -50);
```

Range: 0-500ms (50ms steps recommended)

## Best Practices

1. **Start with -6dB**: Set all sources to -6dB initially, then adjust individually
2. **Monitor Headroom**: Keep master below -3dB to avoid clipping
3. **Use Peak Levels**: Watch peak meters more than RMS
4. **Mute Unused**: Mute sources not in use to reduce noise
5. **Test Audio Delays**: Verify A/V sync before going live
6. **Follow Loudness Standards**: Aim for -16 to -24 LUFS for streaming
7. **Watch Clipping**: Red indicators mean distortion - reduce volume immediately

## Performance Considerations

- Web Audio API runs at 48kHz sample rate
- Metering updates at 20Hz (50ms intervals)
- Supports 8+ simultaneous audio sources on modern devices
- RTMP streaming requires stable internet connection
- Audio context consumes minimal CPU (<2%)

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support (may need permission)
- Safari: Full support (iOS 14.5+)
- Mobile: Requires HTTPS and user interaction

## Troubleshooting

### No Audio Output
- Check browser audio permissions
- Ensure audio context is not suspended
- Verify sources are not all muted

### Clipping/Distortion
- Reduce master volume
- Lower individual source volumes
- Check for multiple sources at high volume simultaneously

### A/V Out of Sync
- Use audio delay compensation
- Test both ahead and behind (negative/positive values)
- Record test stream to verify

### Stream Connection Fails
- Verify RTMP URL and stream key
- Check network connectivity
- Ensure RTMP server is accessible
- Try HTTPS WebSocket connection if available

## File Structure

```
lib/obs/audio/
├── AudioMixing.ts                 # Core Web Audio API mixer
├── StreamingAudioIntegration.ts    # High-level integration API
└── AUDIO_MIXER_README.md          # This file

components/LiveStudio/
├── AudioMixer.tsx                 # Channel strips UI
├── MasterChannel.tsx              # Master output control
└── StreamingAudioMixerExample.tsx  # Complete example

hooks/
└── useStreamingAudioMixer.ts       # React hook
```

## Example Usage

See `StreamingAudioMixerExample.tsx` for a complete working example with:
- All audio source types
- Complete mixer UI
- RTMP connection dialog
- Live streaming controls
- Real-time metering display

## Next Steps

1. Test with single source (microphone)
2. Add second source (system audio)
3. Integrate Sound Lab output
4. Add Suno tracks
5. Configure RTMP streaming
6. Perform A/V sync testing
7. Deploy to production
