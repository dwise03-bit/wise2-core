# Audio Mixer File Reference

Quick navigation to all audio mixer components and documentation.

## Core Library

### AudioMixing.ts
**Path**: `lib/obs/audio/AudioMixing.ts`  
**Lines**: 640  
**Purpose**: Web Audio API mixer engine

**Main Classes**:
- `StreamingAudioMixer` - Multi-source mixing
- `AudioDelayCompensator` - A/V sync
- `StreamingAudioEncoder` - Audio encoding

**Key Methods**:
```typescript
mixer.addSource(id, stream)
mixer.setSourceVolume(id, dB)
mixer.getSourceMetering(id)
mixer.getMasterMetering()
```

### StreamingAudioIntegration.ts
**Path**: `lib/obs/audio/StreamingAudioIntegration.ts`  
**Lines**: 520  
**Purpose**: High-level integration API

**Main Classes**:
- `StreamingAudioManager` - Source management
- `RTMPStreamOutput` - Stream output
- `StreamingAudioSystem` - Complete orchestration

**Key Methods**:
```typescript
manager.addMicrophoneSource()
manager.addSunoTrackSource(url)
manager.addSoundLabSource(ctx, destination)
system.connectToStream(url, key)
```

### index.ts
**Path**: `lib/obs/audio/index.ts`  
**Lines**: 20  
**Purpose**: Export all audio mixer components

---

## UI Components

### AudioMixer.tsx
**Path**: `components/LiveStudio/AudioMixer.tsx`  
**Lines**: 380  
**Purpose**: Channel strips UI component

**Main Components**:
- `ChannelStrip` - Per-source controls
- `AudioMixer` - Main mixer UI

**Props**:
```typescript
interface AudioMixerProps {
  channels: AudioChannel[];
  masterVolume: number;
  masterPeakLevel: number;
  masterRmsLevel: number;
  onChannelVolumeChange?: (id: string, dB: number) => void;
  onMasterVolumeChange?: (dB: number) => void;
}
```

### MasterChannel.tsx
**Path**: `components/LiveStudio/MasterChannel.tsx`  
**Lines**: 320  
**Purpose**: Master output control panel

**Features**:
- Master volume fader
- Peak/RMS/LUFS metering
- Output monitor selector
- Audio delay compensation
- Clipping warning

**Props**:
```typescript
interface MasterChannelProps {
  masterVolume: number;
  masterPeakLevel: number;
  masterRmsLevel: number;
  onVolumeChange?: (dB: number) => void;
  onDelayChange?: (ms: number) => void;
}
```

### StreamingAudioMixerExample.tsx
**Path**: `components/LiveStudio/StreamingAudioMixerExample.tsx`  
**Lines**: 360  
**Purpose**: Complete working example

**Features**:
- Full mixer UI with all controls
- Multi-source audio addition
- RTMP stream connection
- Live streaming status

---

## React Integration

### useStreamingAudioMixer.ts
**Path**: `hooks/useStreamingAudioMixer.ts`  
**Lines**: 280  
**Purpose**: React hook for audio mixer state management

**Exports**:
```typescript
function useStreamingAudioMixer(): UseStreamingAudioMixerState

// State
isInitialized, isStreaming, channels, masterVolume, masterMetering

// Actions
addMicrophoneSource(), addSunoTrackSource(url), removeSource(id)

// Controls
setSourceVolume(id, dB), setSourcePan(id, pan), setSourceMute(id)

// Streaming
connectToStream(url, key), disconnectStream(), isStreamConnected()
```

**Usage**:
```typescript
const mixer = useStreamingAudioMixer();
const { channels, masterVolume, setSourceVolume } = mixer;
```

---

## Documentation

### AUDIO_MIXER_README.md
**Path**: `lib/obs/audio/AUDIO_MIXER_README.md`  
**Lines**: 430  
**Purpose**: Complete technical reference

**Sections**:
- Architecture overview
- Component documentation
- Integration guide
- Volume and metering reference
- Browser compatibility
- Troubleshooting guide
- Best practices

**When to Use**: Look up detailed technical information

---

### AUDIO_MIXER_QUICK_START.md
**Path**: `components/LiveStudio/AUDIO_MIXER_QUICK_START.md`  
**Lines**: 450  
**Purpose**: Step-by-step getting started guide

**Sections**:
- 1-minute basic setup
- 5-minute complete setup
- Common tasks with code examples
- Typical streaming setup
- Troubleshooting tips

**When to Use**: Getting started, copy-paste examples

---

### AUDIO_MIXER_BUILD_SUMMARY.md
**Path**: `components/LiveStudio/AUDIO_MIXER_BUILD_SUMMARY.md`  
**Lines**: 400  
**Purpose**: Build overview and implementation status

**Sections**:
- What's built with line counts
- Features implemented
- Integration points
- Technical specifications
- Performance metrics
- File structure
- Next steps

**When to Use**: Understanding what's included, status overview

---

### AUDIO_MIXER_IMPLEMENTATION_CHECKLIST.md
**Path**: `components/LiveStudio/AUDIO_MIXER_IMPLEMENTATION_CHECKLIST.md`  
**Lines**: 350  
**Purpose**: Deployment and testing checklist

**Sections**:
- 7 implementation phases
- Testing requirements
- Browser testing matrix
- Deployment procedures
- File inventory
- API contract
- Sign-off checklist

**When to Use**: Planning implementation, testing, deployment

---

### STREAMING_AUDIO_MIXER_DELIVERY.md
**Path**: `STREAMING_AUDIO_MIXER_DELIVERY.md`  
**Lines**: 500  
**Purpose**: Complete delivery summary and executive overview

**Sections**:
- Executive summary
- What's delivered
- Technical specifications
- Integration paths
- Performance metrics
- Production readiness
- Next steps

**When to Use**: High-level overview, stakeholder communication

---

## File Statistics

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| AudioMixing.ts | lib/obs/audio/ | 640 | Core mixer engine |
| StreamingAudioIntegration.ts | lib/obs/audio/ | 520 | Integration API |
| index.ts | lib/obs/audio/ | 20 | Exports |
| AudioMixer.tsx | components/LiveStudio/ | 380 | Channel strips UI |
| MasterChannel.tsx | components/LiveStudio/ | 320 | Master controls UI |
| StreamingAudioMixerExample.tsx | components/LiveStudio/ | 360 | Complete example |
| useStreamingAudioMixer.ts | hooks/ | 280 | React hook |
| **Total Code** | - | **2,520** | - |
| AUDIO_MIXER_README.md | lib/obs/audio/ | 430 | Technical reference |
| AUDIO_MIXER_QUICK_START.md | components/LiveStudio/ | 450 | Getting started |
| AUDIO_MIXER_BUILD_SUMMARY.md | components/LiveStudio/ | 400 | Build overview |
| AUDIO_MIXER_IMPLEMENTATION_CHECKLIST.md | components/LiveStudio/ | 350 | Deployment checklist |
| STREAMING_AUDIO_MIXER_DELIVERY.md | root | 500 | Delivery summary |
| **Total Documentation** | - | **2,130** | - |

**Total**: ~4,650 lines of production code and documentation

---

## Quick Reference

### Use the React Hook
```typescript
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';

function MyComponent() {
  const mixer = useStreamingAudioMixer();
  // Use mixer state and methods
}
```

### Import UI Components
```typescript
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';
import { MasterChannel } from '@/components/LiveStudio/MasterChannel';

function Dashboard() {
  return (
    <>
      <AudioMixer {...mixerProps} />
      <MasterChannel {...masterProps} />
    </>
  );
}
```

### Use Example Component
```typescript
import { StreamingAudioMixerExample } from '@/components/LiveStudio/StreamingAudioMixerExample';

function StreamingPage() {
  return <StreamingAudioMixerExample />;
}
```

### Direct Library Usage
```typescript
import { StreamingAudioMixer } from '@/lib/obs/audio/AudioMixing';

const mixer = new StreamingAudioMixer();
mixer.addSource('mic', mediaStream);
mixer.setSourceVolume('mic', -6);
```

---

## Common Tasks

### Find How To...
- **Add microphone**: See QUICK_START.md → "Add Microphone"
- **Set volume**: See QUICK_START.md → "Control Volume"
- **Fix A/V sync**: See QUICK_START.md → "Fix A/V Sync Issues"
- **Connect to RTMP**: See QUICK_START.md → "Streaming" section
- **Understand metering**: See README.md → "Volume and Metering Reference"
- **Troubleshoot**: See README.md → "Troubleshooting" section

### Find How To Integrate...
- **With Sound Lab**: See README.md → "Integration Guide" → "Sound Lab"
- **With Live Dashboard**: See QUICK_START.md → "Complete Example"
- **With multistreaming**: See README.md → "Advanced Features"
- **Custom implementation**: See IMPLEMENTATION_CHECKLIST.md → "Deployment"

### Find Technical Details...
- **Audio processing**: See AudioMixing.ts inline comments
- **Volume calculations**: See AudioMixer.tsx → `dbToLinear()`
- **Metering**: See AudioMixing.ts → `getAnalyserPeak()`
- **RTMP streaming**: See StreamingAudioIntegration.ts → `RTMPStreamOutput`
- **React hook state**: See useStreamingAudioMixer.ts → `UseStreamingAudioMixerState`

---

## Import Paths

```typescript
// Core library
import { StreamingAudioMixer, AudioDelayCompensator } from '@/lib/obs/audio';
import { StreamingAudioSystem, StreamingAudioManager } from '@/lib/obs/audio';

// UI components
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';
import { MasterChannel } from '@/components/LiveStudio/MasterChannel';
import { StreamingAudioMixerExample } from '@/components/LiveStudio/StreamingAudioMixerExample';

// React hook
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';

// Types
import type { AudioChannel } from '@/components/LiveStudio/AudioMixer';
import type { MeteringData } from '@/lib/obs/audio';
```

---

## Getting Started Path

1. **Overview**: Read `STREAMING_AUDIO_MIXER_DELIVERY.md` (5 min)
2. **Quick Start**: Follow `AUDIO_MIXER_QUICK_START.md` (10 min)
3. **Example**: Review `StreamingAudioMixerExample.tsx` (10 min)
4. **Integration**: Use `useStreamingAudioMixer` hook in your component (15 min)
5. **Deep Dive**: Reference `AUDIO_MIXER_README.md` as needed

**Total Time**: ~40 minutes to full understanding

---

## Support

### For Questions About...
- **How to use the mixer**: See QUICK_START.md
- **How the mixer works**: See README.md
- **What's included**: See BUILD_SUMMARY.md
- **Implementation details**: See IMPLEMENTATION_CHECKLIST.md
- **Specific code**: See inline comments in source files

### For Issues...
- **Audio not working**: See README.md → Troubleshooting
- **Connection fails**: See README.md → Troubleshooting
- **Performance issues**: See README.md → Performance Considerations
- **Browser compatibility**: See README.md → Browser Compatibility

---

**Last Updated**: July 24, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
