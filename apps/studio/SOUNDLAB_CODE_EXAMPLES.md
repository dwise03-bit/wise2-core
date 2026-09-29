# Sound Lab: Code Examples & Snippets

## Quick Implementation Examples

### 1. Initialize Sound Lab with Generation & Effects

```typescript
import { SoundLabEnhanced } from '@/components/SoundLab/SoundLabEnhanced';

export default function StudioPage() {
  const [status, setStatus] = useState('Ready');

  return (
    <div className="h-screen flex flex-col">
      <div className="h-8 flex items-center px-6 bg-studio-raised border-b border-studio-line text-xs text-gray-500">
        {status}
      </div>
      <div className="flex-1 overflow-hidden">
        <SoundLabEnhanced onStatusUpdate={setStatus} />
      </div>
    </div>
  );
}
```

---

### 2. Generate Music and Add to Timeline

```typescript
const handleGenerateAndAdd = async () => {
  try {
    // Step 1: Generate
    const response = await fetch('/api/suno/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Upbeat electronic dance music',
        genre: 'EDM',
        mood: 'energetic',
        duration: 30,
      }),
    });

    const generation = await response.json();
    console.log(`Generation started: ${generation.id}`);

    // Step 2: Poll for completion
    let attempts = 0;
    const checkStatus = async () => {
      const statusRes = await fetch(`/api/suno/status/${generation.id}`);
      const status = await statusRes.json();

      if (status.status === 'Completed' && status.audioUrl) {
        // Step 3: Convert to AudioBuffer
        const audioResponse = await fetch(status.audioUrl);
        const audioBuffer = await audioContext.decodeAudioData(
          await audioResponse.arrayBuffer()
        );

        // Step 4: Add to Sound Lab
        const clipId = clips.addGeneratedClip(
          'track-0',
          audioBuffer,
          generation,
          `${generation.params.genre} - ${generation.params.mood}`,
          0
        );

        // Step 5: Initialize effects
        effects.initializeChain(clipId, 'track-0');

        console.log(`Added clip: ${clipId}`);
      } else if (status.status === 'Failed') {
        console.error('Generation failed:', status.error);
      } else if (attempts < 120) {
        attempts++;
        setTimeout(checkStatus, 2500);
      }
    };

    checkStatus();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 3. Apply EQ to a Generated Clip

```typescript
const applyEQ = (clipId: string) => {
  // Initialize effects chain if needed
  effects.initializeChain(clipId, 'track-0');

  // Add 3-band EQ
  effects.addEffect(clipId, 'eq', {
    lowGain: 2,    // Boost bass by 2dB
    midGain: -1,   // Cut mids by 1dB
    highGain: 3,   // Boost treble by 3dB
  });

  console.log('EQ added to clip');
};
```

---

### 4. Create a Multi-Effect Chain

```typescript
const addVocalChain = (vocalClipId: string) => {
  // Initialize
  effects.initializeChain(vocalClipId, 'track-1');

  // 1. Compression (control dynamics)
  const compId = effects.addEffect(vocalClipId, 'compression', {
    threshold: -15,  // Start compressing at -15dB
    ratio: 4,        // 4:1 compression ratio
    attack: 3,       // 3ms attack
    release: 100,    // 100ms release
  });

  // 2. EQ (shape tone)
  const eqId = effects.addEffect(vocalClipId, 'eq', {
    lowGain: 0,      // Keep bass neutral
    midGain: 1,      // Slight presence boost
    highGain: 2,     // Add clarity
  });

  // 3. Reverb (add space)
  const reverbId = effects.addEffect(vocalClipId, 'reverb', {
    wet: 0.2,        // 20% wet reverb
    decay: 2,        // 2 second decay
  });

  // 4. Delay (add width)
  const delayId = effects.addEffect(vocalClipId, 'delay', {
    time: 375,       // 375ms delay
    feedback: 0.3,   // 30% feedback
  });

  // Set levels
  effects.setVolume(vocalClipId, 0.9);
  effects.setPan(vocalClipId, 0);

  console.log('Vocal chain applied');
};
```

---

### 5. Mix Two Clips Together

```typescript
const mixGeneratedAndRecorded = (beatClipId: string, vocalClipId: string) => {
  // Beat: Tight and punchy
  effects.initializeChain(beatClipId, 'track-0');
  effects.addEffect(beatClipId, 'compression', {
    threshold: -12,
    ratio: 6,
    attack: 2,
    release: 30,
  });
  effects.setVolume(beatClipId, 0.85);
  effects.setPan(beatClipId, 0);

  // Vocal: Warm with reverb
  effects.initializeChain(vocalClipId, 'track-1');
  effects.addEffect(vocalClipId, 'reverb', {
    wet: 0.25,
    decay: 2,
  });
  effects.setVolume(vocalClipId, 0.9);
  effects.setPan(vocalClipId, 0);

  console.log('Mix set up: Beat 0.85 + Vocal 0.9');
};
```

---

### 6. Undo Last Effect Change

```typescript
const handleUndo = () => {
  // Undo clip edits (move, trim, select)
  interaction.undo();

  // OR undo effect changes
  effects.undo();

  console.log('Undo applied');
};

// Check if undo is available
const { canUndo } = effects.getHistoryInfo();
console.log(`Can undo: ${canUndo}`);
```

---

### 7. Export Mix with All Effects

```typescript
const handleExport = async () => {
  try {
    // Create offline context for rendering
    const sampleRate = 48000;
    const duration = 300; // 5 minutes max
    const offlineContext = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    // Process each clip
    for (const clip of clips.getClips().values()) {
      if (clip.isMuted) continue;

      const chain = effects.getChain(clip.id);
      if (!chain) continue;

      // Process with effects
      const processedBuffer = await processAudioBufferWithEffects(
        offlineContext,
        clip.audioBuffer,
        chain.effects,
        chain.volume,
        chain.pan
      );

      // Add to mix
      const source = offlineContext.createBufferSource();
      source.buffer = processedBuffer;
      source.start(clip.startTime);
      source.connect(offlineContext.destination);
    }

    // Render
    const masterBuffer = await offlineContext.startRendering();

    // Encode to WAV
    const wav = encodeWAV(masterBuffer, sampleRate);

    // Download
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mix.wav';
    link.click();

    console.log('Export complete');
  } catch (error) {
    console.error('Export error:', error);
  }
};
```

---

### 8. Modify Effect Parameters in Real-time

```typescript
const updateEQSliders = (clipId: string, eqEffectId: string) => {
  // Low frequency
  const lowInput = document.querySelector('#lowGain');
  lowInput?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    effects.updateEffect(clipId, eqEffectId, { lowGain: value });
  });

  // Mid frequency
  const midInput = document.querySelector('#midGain');
  midInput?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    effects.updateEffect(clipId, eqEffectId, { midGain: value });
  });

  // High frequency
  const highInput = document.querySelector('#highGain');
  highInput?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    effects.updateEffect(clipId, eqEffectId, { highGain: value });
  });
};
```

---

### 9. Create Preset Effect Templates

```typescript
const effectPresets = {
  vocalChain: (clipId: string) => {
    effects.initializeChain(clipId, 'track-0');
    effects.addEffect(clipId, 'compression', {
      threshold: -15,
      ratio: 3,
      attack: 5,
      release: 100,
    });
    effects.addEffect(clipId, 'reverb', { wet: 0.2, decay: 1.5 });
    effects.setVolume(clipId, 0.9);
  },

  beatChain: (clipId: string) => {
    effects.initializeChain(clipId, 'track-0');
    effects.addEffect(clipId, 'compression', {
      threshold: -12,
      ratio: 6,
      attack: 2,
      release: 30,
    });
    effects.addEffect(clipId, 'eq', { lowGain: 2 });
    effects.setVolume(clipId, 0.95);
  },

  warmChain: (clipId: string) => {
    effects.initializeChain(clipId, 'track-0');
    effects.addEffect(clipId, 'eq', {
      lowGain: 2,
      midGain: -1,
      highGain: 1,
    });
    effects.addEffect(clipId, 'reverb', { wet: 0.25, decay: 2 });
    effects.setVolume(clipId, 0.85);
  },
};

// Usage
effectPresets.vocalChain(vocalClipId);
effectPresets.beatChain(beatClipId);
```

---

### 10. Monitor Playback with Peak Levels

```typescript
const monitorPlayback = async (clipId: string) => {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  // Create source from clip
  const source = audioContext.createBufferSource();
  const clip = clips.getSelectedClip();
  if (!clip) return;

  source.buffer = clip.audioBuffer;

  // Get effects chain
  const chain = effects.getChain(clipId);
  const webAudioChain = createEffectsChain(
    audioContext,
    chain?.effects || [],
    chain?.volume || 1,
    chain?.pan || 0
  );

  // Connect: source → chain → analyser → destination
  source.connect(webAudioChain.input);
  webAudioChain.output.connect(analyser);
  analyser.connect(audioContext.destination);

  // Monitor levels
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const monitor = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    const peak = Math.max(...dataArray) / 255;
    const peakDb = (Math.log10(peak) * 20) - 20;
    console.log(`Peak level: ${peakDb.toFixed(1)} dB`);
  }, 100);

  // Start playback
  source.start(0);

  // Stop monitoring after playback
  source.onended = () => {
    clearInterval(monitor);
    console.log('Playback ended');
  };
};
```

---

### 11. Batch Add Effects to Multiple Clips

```typescript
const batchAddEffect = (
  clipIds: string[],
  effectType: 'eq' | 'reverb' | 'delay' | 'compression' | 'distortion',
  params: any
) => {
  for (const clipId of clipIds) {
    effects.initializeChain(clipId, 'track-0');
    effects.addEffect(clipId, effectType, params);
    console.log(`Added ${effectType} to ${clipId}`);
  }
};

// Usage: Add reverb to all clips
const allClipIds = Array.from(clips.getClips().keys());
batchAddEffect(allClipIds, 'reverb', { wet: 0.2, decay: 2 });
```

---

### 12. Create Master Bus Effects

```typescript
const createMasterBus = (masterClipId: string) => {
  // Master effects (applied to mixed output)
  effects.initializeChain(masterClipId, 'master');

  // Gentle compression (glue)
  effects.addEffect(masterClipId, 'compression', {
    threshold: -18,
    ratio: 3,
    attack: 10,
    release: 200,
  });

  // Subtle EQ (polish)
  effects.addEffect(masterClipId, 'eq', {
    lowGain: 1,
    midGain: 0,
    highGain: 1,
  });

  // Master limiter (prevent clipping)
  // Note: Would need custom limiter implementation
  effects.setVolume(masterClipId, 0.95); // Headroom

  console.log('Master bus set up');
};
```

---

### 13. Detect and Display Clip Metadata

```typescript
const displayClipInfo = (clipId: string) => {
  const clip = clips.clips.get(clipId);
  if (!clip) return;

  const info = {
    name: clip.name,
    source: clip.source || 'recorded',
    duration: `${clip.duration.toFixed(2)}s`,
    startTime: `${clip.startTime.toFixed(2)}s`,
    isGenerated: clip.source === 'generated',
    generationId: clip.sunoGenerationId,
    generationParams: clip.sunoMetadata?.sunoParams,
  };

  console.log('Clip Info:', info);

  // Display in UI
  return (
    <div className="p-4 bg-studio-input rounded">
      <h3 className="font-bold text-white">{info.name}</h3>
      <p className="text-xs text-gray-500">
        {info.source} • {info.duration} @ {info.startTime}
      </p>
      {info.isGenerated && (
        <p className="text-xs text-blue-400">
          Generated: {info.generationParams?.genre}
        </p>
      )}
    </div>
  );
};
```

---

### 14. Toggle Effects Visibility in UI

```typescript
const EffectsList = ({ clipId }: { clipId: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  const chain = effects.getChain(clipId);

  if (!chain || chain.effects.length === 0) {
    return <div className="text-xs text-gray-600">No effects</div>;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-white hover:text-wise-accent transition"
      >
        {showDetails ? '▼' : '▶'} {chain.effects.length} Effect
        {chain.effects.length !== 1 ? 's' : ''}
      </button>

      {showDetails && (
        <div className="pl-2 space-y-1 border-l border-studio-line">
          {chain.effects.map(effect => (
            <div key={effect.id} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={effect.enabled}
                onChange={() => effects.toggleEffect(clipId, effect.id)}
              />
              <span className="text-gray-300">{effect.name}</span>
              <button
                onClick={() => effects.removeEffect(clipId, effect.id)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 15. Handle Generation Errors Gracefully

```typescript
const safeGenerate = async (params: SunoGenerationParams) => {
  try {
    setError(null);
    setIsLoading(true);

    const response = await fetch('/api/suno/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const generation = await response.json();

    if (!generation.id) {
      throw new Error('No generation ID returned');
    }

    // Poll with error handling
    const pollWithRetry = async (attempts = 0, maxAttempts = 120) => {
      try {
        const statusResponse = await fetch(
          `/api/suno/status/${generation.id}`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (!statusResponse.ok) {
          throw new Error('Status check failed');
        }

        const status = await statusResponse.json();

        if (status.status === 'Completed' && status.audioUrl) {
          // Success
          await addGeneratedClipToTimeline(status);
          setIsLoading(false);
        } else if (status.status === 'Failed') {
          throw new Error(status.error || 'Generation failed');
        } else if (attempts < maxAttempts) {
          // Keep trying
          setTimeout(() => pollWithRetry(attempts + 1, maxAttempts), 2500);
        } else {
          throw new Error('Generation timeout (2 minutes)');
        }
      } catch (error) {
        if (attempts < maxAttempts - 1) {
          // Retry after delay
          setTimeout(() => pollWithRetry(attempts + 1, maxAttempts), 5000);
        } else {
          throw error;
        }
      }
    };

    pollWithRetry();
  } catch (error) {
    console.error('Generation error:', error);
    setError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    setIsLoading(false);
  }
};

// In UI
{error && (
  <div className="p-3 bg-red-900/30 border border-red-500/30 rounded text-sm text-red-400">
    {error}
  </div>
)}
```

---

## Summary

These examples show:
- ✅ Generating music with Suno
- ✅ Adding to timeline
- ✅ Applying effects (EQ, Reverb, Delay, Compression)
- ✅ Mixing generated + recorded
- ✅ Exporting with effects
- ✅ Undo/redo
- ✅ Presets and batching
- ✅ Error handling
- ✅ UI integration

Adapt these patterns for your specific use case!
