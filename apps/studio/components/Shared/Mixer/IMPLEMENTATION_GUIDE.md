# VU Meter Implementation Guide

Complete guide for integrating the professional VU meter visualization system with the audio engine.

## Overview

The VU Meter system provides real-time visual feedback of audio levels across multiple mixer channels. It consists of:

1. **VUMeter Component** - Canvas-based visualization with smooth animation
2. **MixerChannel Component** - Individual channel with integrated VUMeter
3. **MasterMixer Component** - Container managing all channels
4. **Audio Engine Integration** - Real-time peak level data flow

## Architecture

```
Audio Engine
    ↓
(generates peak level data)
    ↓
State Management (Redux/Zustand/Context)
    ↓
MasterMixer Component
    ├─ MixerChannel (x N)
    │   └─ VUMeter (small)
    └─ MixerChannel (Master)
        └─ VUMeter (large)
```

## Step 1: Define Audio Channel State

Create a type for channel configuration that includes peak level:

```typescript
// types/audio.ts
export interface AudioChannel {
  id: string;
  name: string;
  label: string;
  volume: number;           // -60 to +6 dB
  peakLevel: number;        // Current peak in dB
  peakHold?: number;        // For manual peak tracking
  isMuted: boolean;
  isSolo: boolean;
}

export interface MixerState {
  channels: AudioChannel[];
  masterVolume: number;
  masterPeakLevel: number;
}
```

## Step 2: Create Audio Engine Integration

Implement peak level calculation in your audio engine:

```typescript
// hooks/useAudioEngine.ts
export function useAudioEngine() {
  const [mixerState, setMixerState] = useState<MixerState>({
    channels: [],
    masterVolume: 0,
    masterPeakLevel: -Infinity,
  });

  // Process audio and update peak levels
  const processAudio = useCallback((audioData: Float32Array, channelId: string) => {
    // Calculate RMS and peak values
    let rms = 0;
    let peak = -Infinity;

    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.abs(audioData[i]);
      rms += sample * sample;
      peak = Math.max(peak, sample);
    }

    // Convert to dB
    rms = Math.sqrt(rms / audioData.length);
    const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    const peakDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;

    // Update channel peak level
    setMixerState(prev => ({
      ...prev,
      channels: prev.channels.map(ch =>
        ch.id === channelId
          ? { ...ch, peakLevel: peakDb }
          : ch
      ),
    }));
  }, []);

  return {
    mixerState,
    processAudio,
  };
}
```

## Step 3: Connect Audio Processing

Integrate peak level updates with your audio worklet or processing loop:

```typescript
// hooks/useAudioProcessor.ts
export function useAudioProcessor() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());

  // Setup analyser for each channel
  const setupChannelAnalyser = useCallback(
    (channelId: string, sourceNode: AudioNode) => {
      if (!audioContextRef.current) {
        audioContextRef.current = sourceNode.context;
      }

      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      sourceNode.connect(analyser);
      analyserNodesRef.current.set(channelId, analyser);

      return analyser;
    },
    []
  );

  // Get peak level from analyser
  const getPeakLevel = useCallback((channelId: string): number => {
    const analyser = analyserNodesRef.current.get(channelId);
    if (!analyser) return -Infinity;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Find peak
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      max = Math.max(max, dataArray[i]);
    }

    // Convert to dB (0-255 → -96dB to 0dB)
    return max > 0 ? 20 * Math.log10(max / 255) : -Infinity;
  }, []);

  return {
    setupChannelAnalyser,
    getPeakLevel,
  };
}
```

## Step 4: Implement Animation Loop

Update peak levels continuously in your audio processing loop:

```typescript
// hooks/useAudioMeterUpdate.ts
export function useAudioMeterUpdate(updateFrequency = 50) {
  const [peakLevels, setPeakLevels] = useState<Map<string, number>>(new Map());
  const { getPeakLevel } = useAudioProcessor();
  const channelIdsRef = useRef<string[]>([]);

  // Update peak levels in animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPeakLevels(prev => {
        const updated = new Map(prev);
        for (const channelId of channelIdsRef.current) {
          const peak = getPeakLevel(channelId);
          updated.set(channelId, peak);
        }
        return updated;
      });
    }, 1000 / updateFrequency);

    return () => clearInterval(interval);
  }, [updateFrequency, getPeakLevel]);

  return { peakLevels };
}
```

## Step 5: Connect to Mixer UI

Bind the audio engine to mixer components:

```typescript
// components/LiveStudio.tsx
import { MasterMixer } from '@/components/Shared/Mixer';

export function LiveStudio() {
  const { mixerState, processAudio } = useAudioEngine();
  const { peakLevels } = useAudioMeterUpdate();

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    // Update audio routing volume
    updateChannelVolume(channelId, volume);
  };

  const handleMasterVolumeChange = (volume: number) => {
    // Update master output volume
    updateMasterVolume(volume);
  };

  return (
    <MasterMixer
      channels={mixerState.channels.map(ch => ({
        ...ch,
        peakLevel: peakLevels.get(ch.id) ?? -Infinity,
      }))}
      masterVolume={mixerState.masterVolume}
      masterPeakLevel={peakLevels.get('master') ?? -Infinity}
      onChannelVolumeChange={handleChannelVolumeChange}
      onChannelMuteToggle={(id) => toggleChannelMute(id)}
      onChannelSoloToggle={(id) => toggleChannelSolo(id)}
      onMasterVolumeChange={handleMasterVolumeChange}
    />
  );
}
```

## Step 6: Real-time Data Flow Example

Complete example with Web Audio API:

```typescript
// components/MixerWithAudioEngine.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MasterMixer, type MixerChannel } from '@/components/Shared/Mixer';

export function MixerWithAudioEngine() {
  const [channels, setChannels] = useState<MixerChannel[]>([
    {
      id: 'mic1',
      name: 'MIC 1',
      label: 'Vocals',
      volume: -12,
      peakLevel: -20,
      isMuted: false,
      isSolo: false,
    },
    {
      id: 'mic2',
      name: 'MIC 2',
      label: 'Guest',
      volume: -15,
      peakLevel: -25,
      isMuted: false,
      isSolo: false,
    },
  ]);

  const [masterVolume, setMasterVolume] = useState(-6);
  const [masterPeakLevel, setMasterPeakLevel] = useState(-10);

  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    initAudio();
  }, []);

  // Update peak levels from analyser nodes
  useEffect(() => {
    const updatePeakLevels = () => {
      const newChannels = channels.map(channel => {
        const analyser = analyserNodesRef.current.get(channel.id);
        if (!analyser) return channel;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
          max = Math.max(max, dataArray[i]);
        }

        const peakDb = max > 0 ? 20 * Math.log10(max / 255) : -Infinity;

        return { ...channel, peakLevel: peakDb };
      });

      setChannels(newChannels);

      // Update master peak level (simplified)
      const maxChannelPeak = Math.max(
        ...newChannels.map(ch => ch.peakLevel)
      );
      setMasterPeakLevel(maxChannelPeak);
    };

    const interval = setInterval(updatePeakLevels, 50);
    return () => clearInterval(interval);
  }, [channels]);

  const handleChannelVolumeChange = useCallback(
    (channelId: string, volume: number) => {
      setChannels(channels =>
        channels.map(ch =>
          ch.id === channelId ? { ...ch, volume } : ch
        )
      );
    },
    []
  );

  const handleChannelMuteToggle = useCallback((channelId: string) => {
    setChannels(channels =>
      channels.map(ch =>
        ch.id === channelId ? { ...ch, isMuted: !ch.isMuted } : ch
      )
    );
  }, []);

  const handleChannelSoloToggle = useCallback((channelId: string) => {
    setChannels(channels =>
      channels.map(ch =>
        ch.id === channelId ? { ...ch, isSolo: !ch.isSolo } : ch
      )
    );
  }, []);

  return (
    <MasterMixer
      channels={channels}
      masterVolume={masterVolume}
      masterPeakLevel={masterPeakLevel}
      onChannelVolumeChange={handleChannelVolumeChange}
      onChannelMuteToggle={handleChannelMuteToggle}
      onChannelSoloToggle={handleChannelSoloToggle}
      onMasterVolumeChange={setMasterVolume}
      title="LIVE MIXER"
      showAllTracksLink={true}
    />
  );
}
```

## Performance Optimization Tips

### 1. Analyser Update Frequency
```typescript
// Update analyser every 50ms (20 Hz) - balance between smoothness and CPU
const ANALYSER_UPDATE_INTERVAL = 50;
```

### 2. Peak Level Throttling
```typescript
// Smooth peak transitions to avoid jitter
const smoothPeakLevel = (current: number, target: number, alpha: number = 0.2) => {
  return current + (target - current) * alpha;
};
```

### 3. Memory Management
```typescript
// Clean up audio nodes when channels are removed
const cleanupChannel = (channelId: string) => {
  analyserNodesRef.current.delete(channelId);
};
```

### 4. Canvas Optimization
```typescript
// The VUMeter component automatically optimizes:
// - High DPI scaling
// - Efficient redrawing
// - Automatic frame cleanup
```

## Testing Peak Level Updates

Create a test component to verify the integration:

```typescript
// components/MixerTest.tsx
export function MixerTest() {
  const [peakLevel, setPeakLevel] = useState(-20);

  // Simulate varying peak levels
  useEffect(() => {
    const interval = setInterval(() => {
      setPeakLevel(prev => {
        const random = Math.random();
        if (random < 0.1) return -Math.random() * 10; // Random peaks
        return prev - Math.random() * 3; // Natural decay
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <VUMeter
      peakLevel={peakLevel}
      size="large"
      showPeakHold={true}
      onPeakReset={() => console.log('Peak reset')}
    />
  );
}
```

## Troubleshooting

### VU Meter not updating
- Verify `peakLevel` prop is being updated
- Check that updates flow through to the component
- Confirm audio processing loop is running

### Canvas rendering issues
- Clear cache and rebuild
- Check browser console for errors
- Verify WebGL/Canvas support in browser

### Peak hold not resetting
- Check `peakHoldDuration` prop (default 1000ms)
- Verify `onPeakReset` callback is fired
- Confirm component is re-rendering

## Browser Compatibility

- **Chrome/Edge**: Full support (90+)
- **Firefox**: Full support (88+)
- **Safari**: Full support (14+)
- **Mobile**: Supported (iOS 14.5+, Android Chrome 90+)

## References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [AudioContext.createAnalyser()](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser)
- [Decibel Scale](https://en.wikipedia.org/wiki/Decibel)
