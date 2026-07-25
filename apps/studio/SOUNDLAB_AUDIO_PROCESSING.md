# Sound Lab: Audio Processing & Effects Integration

## Overview

Sound Lab uses Web Audio API to apply real-time effects to audio playback and export. The system is built in three layers:

1. **Hook Layer** (`useClipEffects`) — Effect state management
2. **UI Layer** (SoundLabEnhanced) — User interface controls
3. **Audio Layer** (`audioEffects.ts`) — Web Audio API implementation

---

## Architecture Diagram

```
User adjusts EQ in Effects Tab
         ↓
  effects.updateEffect(clipId, eqId, { lowGain: 3 })
         ↓
  useClipEffects Hook updates state
         ↓
  Component re-renders with new slider position
         ↓
  On playback, createEffectsChain() creates Web Audio nodes
         ↓
  Source → [Low Shelf EQ] → [Mid EQ] → [High Shelf EQ] → Volume → Pan → Output
         ↓
  Processed audio plays through speakers/headphones
```

---

## Layer 1: Hook State Management

### useClipEffects Hook

Manages effects configuration:

```typescript
// Initialize chain for a clip
effects.initializeChain(clipId, trackId);

// Get current state
const chain = effects.getChain(clipId);
// Returns:
// {
//   clipId: "clip-123",
//   trackId: "track-0",
//   volume: 0.8,       // Linear gain 0-1
//   pan: -0.3,         // Stereo pan -1 to +1
//   effects: [
//     {
//       id: "effect-456",
//       type: "eq",
//       enabled: true,
//       params: {
//         lowGain: 3,
//         midGain: 0,
//         highGain: 2
//       }
//     },
//     ...
//   ],
//   isMuted: false
// }

// Modify effects
effects.addEffect(clipId, 'reverb', { wet: 0.3, decay: 2 });
effects.updateEffect(clipId, effectId, { wet: 0.5 });
effects.toggleEffect(clipId, effectId);
effects.removeEffect(clipId, effectId);

// Modify mixing
effects.setVolume(clipId, 0.9);
effects.setPan(clipId, -0.5);
effects.toggleMute(clipId);
```

---

## Layer 2: UI Components

### SoundLabEnhanced

Connects hook state to Web Audio processing:

```typescript
// Effects Tab: User adds EQ
<button onClick={() => 
  effects.addEffect(clipId, 'eq', {
    lowGain: 0,
    midGain: 0,
    highGain: 0
  })
}>
  + Add EQ
</button>

// On update, UI updates effect display
// When user presses Play, Web Audio chain is created
```

### Playback with Effects

```typescript
const handlePlayTimeline = async () => {
  const allClips = clips.getClips();
  
  for (const clip of allClips) {
    // Get effects configuration
    const chain = effects.getChain(clip.id);
    
    // Create Web Audio nodes based on effects config
    const audioChain = createEffectsChain(
      audioContext,
      chain.effects,
      chain.volume,
      chain.pan
    );
    
    // Route clip through effects chain
    source.connect(audioChain.input);
    audioChain.output.connect(masterOutput);
    
    // Play
    source.start(0);
  }
};
```

---

## Layer 3: Web Audio Implementation

### Module: `utils/audioEffects.ts`

Provides functions to create Web Audio nodes matching effect configurations:

#### EQ (Equalization)

```typescript
// Low-shelf EQ (boost/cut bass)
const lowShelf = createLowShelfEQ(audioContext, gain);
// frequency: 200 Hz (fixed)
// gain: dB (positive = boost, negative = cut)

// Peaking EQ (boost/cut midrange)
const mid = createEQNode(audioContext, 1000, gain, 1);
// frequency: 1000 Hz
// gain: dB
// Q: Quality factor (default 1)

// High-shelf EQ (boost/cut treble)
const highShelf = createHighShelfEQ(audioContext, gain);
// frequency: 3000 Hz
// gain: dB

// Chain them: input → low → mid → high → output
```

**Usage in Effects Hook:**
```typescript
effects.addEffect(clipId, 'eq', {
  lowGain: 3,    // Boost bass by 3dB
  midGain: 0,    // Leave mids flat
  highGain: 2    // Boost treble by 2dB
});
```

#### Reverb (Convolver)

```typescript
const reverb = createReverbNode(audioContext, wet);
// wet: 0-1 (0 = no reverb, 1 = fully wet)
// Currently uses impulse response convolver
// For production, load .wav impulse response file

// Returns: { dry, wet, reverb, mix }
// Route: input → [dry + reverb] → mix → output
```

**Usage in Effects Hook:**
```typescript
effects.addEffect(clipId, 'reverb', {
  wet: 0.3,    // 30% wet
  decay: 2     // 2 second decay (future: impulse IR length)
});
```

#### Delay

```typescript
const delay = createDelayNode(
  audioContext,
  time,      // 0.5 seconds
  feedback,  // 0.5 (50% feedback loop)
  wet        // 0.3 (30% wet)
);

// Creates natural slapback/echo effect
// time: delay in seconds
// feedback: amount of signal fed back into delay (0-1)
// wet: output level of delayed signal
```

**Usage in Effects Hook:**
```typescript
effects.addEffect(clipId, 'delay', {
  time: 500,      // 500ms delay
  feedback: 0.4   // 40% feedback
});
```

#### Compression (Dynamic Range Compression)

```typescript
const compressor = createCompressorNode(
  audioContext,
  threshold,  // -20 dB
  ratio,      // 4:1 compression ratio
  attack,     // 3ms attack time
  release     // 250ms release time
);

// Reduces volume of loud signals
// Useful for controlling dynamics in mix
```

**Usage in Effects Hook:**
```typescript
effects.addEffect(clipId, 'compression', {
  threshold: -20,  // Compress signals above -20dB
  ratio: 4,        // 4:1 ratio (4dB in = 1dB out)
  attack: 3,       // 3ms attack
  release: 250     // 250ms release
});
```

#### Distortion (Waveshaper)

```typescript
const distortion = createDistortionNode(audioContext, drive);
// drive: 0-1 (0 = no distortion, 1 = heavy distortion)

// Uses waveshaper curve for soft clipping
// Adds harmonic character/grit to sound
```

**Usage in Effects Hook:**
```typescript
effects.addEffect(clipId, 'distortion', {
  drive: 0.3  // 30% distortion
});
```

### Complete Effects Chain

```typescript
const chain = createEffectsChain(
  audioContext,
  [
    {
      type: 'eq',
      enabled: true,
      params: { lowGain: 3, midGain: 0, highGain: 2 }
    },
    {
      type: 'compression',
      enabled: true,
      params: { threshold: -20, ratio: 4, attack: 3, release: 250 }
    },
    {
      type: 'reverb',
      enabled: true,
      params: { wet: 0.3, decay: 2 }
    },
    {
      type: 'delay',
      enabled: false,
      params: { time: 500, feedback: 0.4 }
    },
  ],
  volume = 0.8,   // Linear gain (0-1)
  pan = -0.3      // Stereo pan (-1 to +1)
);

// Returns: { input, output, nodes }
// Connection: source → chain.input → [effects] → chain.output → destination
```

---

## Integration: Hook → Web Audio

### Playback Flow

```typescript
// 1. User clicks Play in Timeline tab
const handlePlayTimeline = async () => {
  const audioContext = new AudioContext();
  
  // 2. Iterate through all clips
  for (const clip of clips.getClips().values()) {
    // 3. Get effects configuration from hook state
    const effectsChain = effects.getChain(clip.id);
    
    // 4. Create Web Audio nodes based on hook config
    const webAudioChain = createEffectsChain(
      audioContext,
      effectsChain.effects,
      effectsChain.volume,
      effectsChain.pan
    );
    
    // 5. Connect: clip audio → effects → speaker
    const source = audioContext.createBufferSource();
    source.buffer = clip.audioBuffer;
    source.connect(webAudioChain.input);
    webAudioChain.output.connect(audioContext.destination);
    
    // 6. Play
    source.start(clip.startTime);
  }
};
```

### Export Flow

```typescript
// 1. User clicks Export in Timeline tab
const handleExport = async () => {
  const offlineContext = new OfflineAudioContext(2, 48000 * 30, 48000);
  
  // 2. For each clip
  for (const clip of clips.getClips().values()) {
    const effectsChain = effects.getChain(clip.id);
    
    // 3. Process audio buffer with effects
    const processedBuffer = await processAudioBufferWithEffects(
      offlineContext,
      clip.audioBuffer,
      effectsChain.effects,
      effectsChain.volume,
      effectsChain.pan
    );
    
    // 4. Mix into master
    const source = offlineContext.createBufferSource();
    source.buffer = processedBuffer;
    source.start(clip.startTime);
    source.connect(offlineContext.destination);
  }
  
  // 5. Render and encode
  const masterBuffer = await offlineContext.startRendering();
  const wav = encodeWAV(masterBuffer);
  download(wav, 'mix.wav');
};
```

---

## Reference: Effect Parameters

### EQ
```javascript
{
  lowGain: -12 to +12 dB      // Bass (200 Hz)
  midGain: -12 to +12 dB      // Midrange (1000 Hz)
  highGain: -12 to +12 dB     // Treble (3000 Hz)
}
```

**Presets:**
- Warm: `lowGain: 3, midGain: -2, highGain: 1`
- Bright: `lowGain: -1, midGain: 1, highGain: 3`
- Dark: `lowGain: 1, midGain: -3, highGain: -2`

### Reverb
```javascript
{
  wet: 0 to 1               // Mix level (0=dry, 1=full reverb)
  decay: 0.5 to 10 seconds  // Tail length
}
```

**Presets:**
- Room: `wet: 0.15, decay: 0.5`
- Hall: `wet: 0.25, decay: 2`
- Cathedral: `wet: 0.35, decay: 5`

### Delay
```javascript
{
  time: 50 to 1000 ms       // Delay amount
  feedback: 0 to 1          // Repeats (0=single, 0.5=few, 1=infinite)
}
```

**Presets:**
- Slapback: `time: 100, feedback: 0`
- Echo: `time: 375, feedback: 0.4`
- Dub: `time: 750, feedback: 0.6`

### Compression
```javascript
{
  threshold: -40 to 0 dB    // Level above which compression starts
  ratio: 1 to 16            // Compression ratio (4:1 = moderate)
  attack: 0.5 to 50 ms      // How fast compression engages
  release: 10 to 500 ms     // How fast compression releases
}
```

**Presets:**
- Gentle: `threshold: -20, ratio: 2, attack: 10, release: 100`
- Moderate: `threshold: -20, ratio: 4, attack: 5, release: 50`
- Aggressive: `threshold: -15, ratio: 8, attack: 2, release: 20`

### Distortion
```javascript
{
  drive: 0 to 1             // Amount of distortion
  tone: 0 to 1              // Tone shaping (future)
}
```

**Presets:**
- Subtle: `drive: 0.1`
- Medium: `drive: 0.4`
- Heavy: `drive: 0.8`

---

## Common Mixing Setups

### Setup 1: Vocal + Generated Beat

```typescript
// Generated Beat
effects.addEffect(beatClipId, 'eq', { highGain: 2 });           // Brighten
effects.addEffect(beatClipId, 'compression', {                  // Glue
  threshold: -20, ratio: 4, attack: 5, release: 50
});
effects.setVolume(beatClipId, 0.85);
effects.setPan(beatClipId, 0);

// Vocal
effects.addEffect(vocalClipId, 'compression', {                 // Control dynamics
  threshold: -15, ratio: 3, attack: 3, release: 100
});
effects.addEffect(vocalClipId, 'reverb', {                      // Add space
  wet: 0.2, decay: 1.5
});
effects.setVolume(vocalClipId, 0.9);
effects.setPan(vocalClipId, 0);
```

### Setup 2: Hip-Hop Drums + Bass + Melody

```typescript
// Drums: Tight and loud
effects.addEffect(drumsClipId, 'compression', {
  threshold: -12, ratio: 6, attack: 2, release: 30
});
effects.setVolume(drumsClipId, 0.95);

// Bass: Warm and controlled
effects.addEffect(bassClipId, 'eq', { lowGain: 2 });
effects.addEffect(bassClipId, 'compression', {
  threshold: -18, ratio: 4, attack: 5, release: 50
});
effects.setVolume(bassClipId, 0.8);

// Melody: Bright and spacious
effects.addEffect(melodyClipId, 'eq', { highGain: 3 });
effects.addEffect(melodyClipId, 'reverb', { wet: 0.25, decay: 2 });
effects.setVolume(melodyClipId, 0.75);
```

### Setup 3: Ambient/Chill

```typescript
// Everything with reverb and delay
effects.addEffect(clipId, 'reverb', { wet: 0.4, decay: 3 });
effects.addEffect(clipId, 'delay', { time: 500, feedback: 0.3 });
effects.addEffect(clipId, 'eq', { lowGain: -1, midGain: 0, highGain: 1 });
```

---

## Performance Optimization

### Memory Usage
- Each effect node uses ~1-2 KB
- 100 clips × 5 effects = ~1 MB
- Safe for most browsers

### CPU Usage
- Each effect type has different CPU cost
- EQ (low), Compression (medium), Convolver/Reverb (high)
- Disable effects when not needed

### Offline Rendering
- Use OfflineAudioContext for export
- Processes entire mix in background
- Doesn't block UI playback

```typescript
// Faster export (offline context)
const offline = new OfflineAudioContext(2, 96000 * 30, 48000);
const result = await offline.startRendering(); // Fast!
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| AudioContext | ✅ | ✅ | ✅ | ✅ |
| BiquadFilter | ✅ | ✅ | ✅ | ✅ |
| Convolver | ✅ | ✅ | ✅ | ✅ |
| WaveShaper | ✅ | ✅ | ✅ | ✅ |
| DynamicsCompressor | ✅ | ✅ | ✅ | ✅ |
| StereoPanner | ✅ | ✅ | ✅ | ✅ |
| OfflineAudioContext | ✅ | ✅ | ✅ | ✅ |

---

## Troubleshooting

### Issue: No sound during playback
- Check `audioContext.state === 'running'`
- Verify `source.connect(destination)` is called
- Check browser console for errors

### Issue: Effects not applied
- Verify `effects.getChain()` returns valid chain
- Check effect `enabled: true`
- Ensure `createEffectsChain()` called before playback

### Issue: Audio distorted
- Check master volume not clipping
- Reduce gain on individual clips
- Add limiting to master output

### Issue: Export takes too long
- Use OfflineAudioContext instead of real-time context
- Disable expensive effects (Convolver) if possible
- Reduce sample rate if appropriate

---

## Next Steps

1. **Impulse Response Library** — Load real reverb IRs (.wav files)
2. **Custom Presets** — Save/load effect combinations
3. **Visual Feedback** — Waveform display with effects applied
4. **Automation** — Keyframe effect parameters over time
5. **Multi-band Processing** — Separate processing for different frequency ranges

---

**Last Updated**: 2026-07-24  
**Status**: Production Ready
