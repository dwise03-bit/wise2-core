# Sound Lab Effects Chain Integration Guide

How to integrate the professional effects chain into Sound Lab's existing audio engine.

## File Structure

```
apps/studio/lib/audioEffects/
├── BaseEffect.ts              # Abstract base class
├── EqualizerEffect.ts         # 3-band/10-band/parametric EQ
├── ReverbEffect.ts            # Reverb processor
├── CompressorEffect.ts        # Dynamic range compressor
├── DistortionEffect.ts        # Distortion/saturation
├── DelayEffect.ts             # Time-based delay
├── ChorusEffect.ts            # Modulation effects
├── AnalyzerEffect.ts          # Spectrum analysis & metering
├── EffectChain.ts             # Chain manager (8-slot rack)
├── index.ts                   # Export all public APIs
├── README.md                  # Feature documentation
└── INTEGRATION_GUIDE.md       # This file
```

## Integration Steps

### 1. Add to Existing Audio Engine

Modify `apps/studio/lib/audio/db-conversion.ts` or create new:

```typescript
// apps/studio/lib/audio/audioEngine.ts
import { EffectChain } from '../audioEffects';

export class AudioEngine {
  private audioContext: AudioContext;
  private tracks: Map<string, TrackEffectChain> = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  createTrack(trackId: string): void {
    const effectChain = new EffectChain(this.audioContext, 8);
    this.tracks.set(trackId, {
      id: trackId,
      effectChain,
      input: this.audioContext.createGain(),
      output: this.audioContext.createGain(),
    });
  }

  getEffectChain(trackId: string): EffectChain | undefined {
    return this.tracks.get(trackId)?.effectChain;
  }
}
```

### 2. React Hook for Effect Management

Create `apps/studio/hooks/useTrackEffects.ts`:

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EffectChain,
  EffectType,
  EffectSlot,
  ChainState,
} from 'lib/audioEffects';

export function useTrackEffects(audioContext: AudioContext) {
  const chainRef = useRef<EffectChain | null>(null);
  const [slots, setSlots] = useState<EffectSlot[]>([]);
  const [chainState, setChainState] = useState<ChainState | null>(null);

  // Initialize chain
  useEffect(() => {
    if (!chainRef.current && audioContext) {
      const chain = new EffectChain(audioContext, 8);
      chainRef.current = chain;

      // Listen for state changes
      chain.addListener((state) => {
        setChainState(state);
        setSlots(state.slots);
      });

      setChainState(chain.getState());
    }

    return () => {
      if (chainRef.current) {
        chainRef.current.dispose();
        chainRef.current = null;
      }
    };
  }, [audioContext]);

  const addEffect = useCallback((type: EffectType, position?: number) => {
    if (!chainRef.current) return null;
    return chainRef.current.addEffect(type, position);
  }, []);

  const removeEffect = useCallback((id: string) => {
    if (!chainRef.current) return false;
    return chainRef.current.removeEffect(id);
  }, []);

  const setParameter = useCallback(
    (id: string, paramName: string, value: number) => {
      if (!chainRef.current) return false;
      return chainRef.current.setEffectParameter(id, paramName, value);
    },
    []
  );

  const moveEffect = useCallback((id: string, position: number) => {
    if (!chainRef.current) return false;
    return chainRef.current.moveEffect(id, position);
  }, []);

  const toggleEffect = useCallback((id: string, enabled: boolean) => {
    if (!chainRef.current) return false;
    return chainRef.current.setEffectEnabled(id, enabled);
  }, []);

  const getChain = useCallback(() => chainRef.current, []);

  return {
    slots,
    chainState,
    addEffect,
    removeEffect,
    setParameter,
    moveEffect,
    toggleEffect,
    getChain,
  };
}
```

### 3. UI Component - Effect Rack

Create `apps/studio/components/EffectRack.tsx`:

```typescript
import React from 'react';
import { ChainState, EffectSlot } from 'lib/audioEffects';

interface EffectRackProps {
  slots: EffectSlot[];
  onAddEffect?: (type: string) => void;
  onRemoveEffect?: (id: string) => void;
  onParameterChange?: (id: string, param: string, value: number) => void;
  onMoveEffect?: (id: string, newPosition: number) => void;
  onToggleEffect?: (id: string, enabled: boolean) => void;
}

export function EffectRack({
  slots,
  onAddEffect,
  onRemoveEffect,
  onParameterChange,
  onMoveEffect,
  onToggleEffect,
}: EffectRackProps) {
  return (
    <div className="effect-rack">
      <div className="effect-slots">
        {slots.map((slot, index) => (
          <EffectSlotComponent
            key={slot.id}
            slot={slot}
            position={index}
            onRemove={() => onRemoveEffect?.(slot.id)}
            onParameterChange={(param, value) =>
              onParameterChange?.(slot.id, param, value)
            }
            onToggle={(enabled) => onToggleEffect?.(slot.id, enabled)}
            onMove={(newPos) => onMoveEffect?.(slot.id, newPos)}
          />
        ))}
      </div>
      
      {slots.length < 8 && (
        <div className="add-effect">
          <select onChange={(e) => onAddEffect?.(e.target.value)}>
            <option value="">Add Effect...</option>
            <option value="eq">EQ</option>
            <option value="compressor">Compressor</option>
            <option value="reverb">Reverb</option>
            <option value="delay">Delay</option>
            <option value="distortion">Distortion</option>
            <option value="chorus">Chorus</option>
            <option value="analyzer">Analyzer</option>
          </select>
        </div>
      )}
    </div>
  );
}

interface EffectSlotComponentProps {
  slot: EffectSlot;
  position: number;
  onRemove: () => void;
  onParameterChange: (param: string, value: number) => void;
  onToggle: (enabled: boolean) => void;
  onMove: (position: number) => void;
}

function EffectSlotComponent({
  slot,
  position,
  onRemove,
  onParameterChange,
  onToggle,
  onMove,
}: EffectSlotComponentProps) {
  const params = slot.effect.getParameters();

  return (
    <div className="effect-slot" draggable>
      <div className="effect-header">
        <input
          type="checkbox"
          checked={slot.enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="effect-name">{slot.type.toUpperCase()}</span>
        <button onClick={onRemove} className="remove-btn">
          ×
        </button>
      </div>

      <div className="effect-params">
        {params.map((param) => (
          <div key={param.name} className="param">
            <label>{param.name}</label>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step || 0.1}
              value={param.value}
              onChange={(e) =>
                onParameterChange(param.name, parseFloat(e.target.value))
              }
            />
            <span className="param-value">
              {param.value.toFixed(1)} {param.unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Connect to Existing Sound Lab Track

Modify existing track component to use effects:

```typescript
// apps/studio/components/TrackMixer.tsx
import { useTrackEffects } from '../hooks/useTrackEffects';
import { EffectRack } from './EffectRack';

export function TrackMixer({ track, audioContext }: TrackMixerProps) {
  const {
    slots,
    addEffect,
    removeEffect,
    setParameter,
    moveEffect,
    toggleEffect,
    getChain,
  } = useTrackEffects(audioContext);

  // Connect effect chain to track
  useEffect(() => {
    const chain = getChain();
    if (!chain) return;

    track.connect(chain.getInput());
    chain.getOutput().connect(audioContext.destination);

    return () => {
      chain.getOutput().disconnect();
    };
  }, [track, audioContext, getChain]);

  return (
    <div className="track-mixer">
      <TrackFader track={track} />
      <EffectRack
        slots={slots}
        onAddEffect={addEffect}
        onRemoveEffect={removeEffect}
        onParameterChange={setParameter}
        onMoveEffect={moveEffect}
        onToggleEffect={toggleEffect}
      />
    </div>
  );
}
```

### 5. Add Analyzer/Metering Display

Create `apps/studio/components/AnalyzerDisplay.tsx`:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { AnalyzerEffect } from 'lib/audioEffects';

interface AnalyzerDisplayProps {
  analyzerEffect: AnalyzerEffect;
}

export function AnalyzerDisplay({ analyzerEffect }: AnalyzerDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loudness, setLoudness] = useState({ lufs: -∞, peak: -∞, headroom: 0 });

  useEffect(() => {
    let rafId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw spectrum
      const spectrum = analyzerEffect.getSpectrum();
      drawSpectrum(ctx, spectrum, canvas.width, canvas.height);

      // Update loudness
      const loud = analyzerEffect.getLoudness();
      setLoudness(loud);

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(rafId);
  }, [analyzerEffect]);

  return (
    <div className="analyzer-display">
      <canvas
        ref={canvasRef}
        width={512}
        height={256}
        className="spectrum-canvas"
      />
      <div className="loudness-meters">
        <div className="meter">
          <span>LUFS</span>
          <span className="value">{loudness.lufs.toFixed(1)}</span>
        </div>
        <div className="meter">
          <span>Peak</span>
          <span className="value">{loudness.peak.toFixed(1)}</span>
        </div>
        <div className="meter">
          <span>Headroom</span>
          <span className="value">{loudness.headroom.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  spectrum: any,
  width: number,
  height: number
) {
  const binCount = 64;
  const binWidth = width / binCount;

  // Aggregate spectrum to fewer bins
  const bins = new Array(binCount).fill(-∞);
  spectrum.magnitudes.forEach((mag: number, i: number) => {
    const binIndex = Math.floor((i / spectrum.magnitudes.length) * binCount);
    if (binIndex < binCount) {
      bins[binIndex] = Math.max(bins[binIndex], mag);
    }
  });

  // Draw bars
  ctx.fillStyle = '#00ff00';
  bins.forEach((mag, i) => {
    const normalizedMag = (mag + 96) / 96; // -96 to 0 dB range
    const barHeight = Math.max(0, normalizedMag) * height;
    ctx.fillRect(i * binWidth, height - barHeight, binWidth - 1, barHeight);
  });
}
```

### 6. Save/Restore Effect Chain

```typescript
// apps/studio/lib/effectChainStorage.ts
import { EffectChain } from 'lib/audioEffects';

export interface SavedChainState {
  trackId: string;
  timestamp: number;
  state: any;
}

export async function saveEffectChain(
  trackId: string,
  chain: EffectChain
): Promise<void> {
  const state = chain.getState();
  const saved: SavedChainState = {
    trackId,
    timestamp: Date.now(),
    state,
  };

  localStorage.setItem(
    `effectChain_${trackId}`,
    JSON.stringify(saved)
  );
}

export async function loadEffectChain(
  trackId: string,
  chain: EffectChain
): Promise<boolean> {
  const saved = localStorage.getItem(`effectChain_${trackId}`);
  if (!saved) return false;

  try {
    const { state } = JSON.parse(saved);
    chain.setState(state);
    return true;
  } catch (e) {
    console.error('Failed to restore effect chain:', e);
    return false;
  }
}
```

## Integration Checklist

- [ ] Copy effect files to `apps/studio/lib/audioEffects/`
- [ ] Create `useTrackEffects` hook
- [ ] Create `EffectRack` React component
- [ ] Connect effect chain in existing track mixer
- [ ] Add analyzer/metering display
- [ ] Implement save/restore functionality
- [ ] Add effect preset management UI
- [ ] Style effect rack UI to match Sound Lab design
- [ ] Test with existing tracks (ClipTrack, recorder, etc.)
- [ ] Profile CPU usage with full 8-effect chain
- [ ] Document effect parameters in user guide
- [ ] Add keyboard shortcuts for effect control

## CSS Styling

```css
.effect-rack {
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-slot {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  transition: border-color 0.2s;
}

.effect-slot:hover {
  border-color: #666;
}

.effect-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.effect-name {
  flex: 1;
  font-weight: 600;
  color: #00ff00;
  font-size: 12px;
  letter-spacing: 1px;
}

.param {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.param label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
}

.param input[type='range'] {
  cursor: pointer;
}

.param-value {
  font-size: 11px;
  color: #00ff00;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.spectrum-canvas {
  width: 100%;
  height: 200px;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 4px;
}

.loudness-meters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.meter {
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  font-size: 11px;
  color: #999;
}

.meter .value {
  display: block;
  color: #00ff00;
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
```

## Testing

```typescript
// apps/studio/__tests__/audioEffects.test.ts
import { EffectChain } from 'lib/audioEffects';

describe('EffectChain', () => {
  let audioContext: AudioContext;
  let chain: EffectChain;

  beforeEach(() => {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    chain = new EffectChain(audioContext);
  });

  it('should add effects to chain', () => {
    const slot = chain.addEffect('eq');
    expect(slot).toBeDefined();
    expect(chain.getEffects()).toHaveLength(1);
  });

  it('should set effect parameters', () => {
    const slot = chain.addEffect('eq');
    chain.setEffectParameter(slot.id, 'lowGain', 6);
    const value = chain.getEffectParameter(slot.id, 'lowGain');
    expect(value).toBe(6);
  });

  it('should reorder effects', () => {
    const eq = chain.addEffect('eq');
    const reverb = chain.addEffect('reverb');
    chain.moveEffect(eq.id, 1);
    const effects = chain.getEffects();
    expect(effects[1].type).toBe('eq');
  });
});
```

---

## Next Steps

1. **AudioWorklet Migration**: Move delay, distortion, and chorus to AudioWorklet for better performance
2. **Preset System**: Build preset browser and saver for effect chains
3. **MIDI Mapping**: Map MIDI CC to effect parameters
4. **Sidechain Compression**: Allow compressor to key off other tracks
5. **Multiband EQ**: Split EQ into independent frequency bands

See `README.md` for detailed feature documentation.
