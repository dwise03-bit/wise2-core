# Audio Effects Chain - Sound Lab

Professional audio effects processing library for Sound Lab. Provides production-grade effects with real-time parameter automation, metering, and visualization support.

## Overview

The effects library consists of 8 specialized effects and a central effect chain manager supporting up to 8 simultaneous effects per track with drag-to-reorder and automation capabilities.

## Effects

### 1. **EqualizerEffect** - Multi-mode EQ Processing

Provides three EQ modes for different workflows:

#### 3-Band EQ
Classic three-band equalization (Low, Mid, High):
- **Low**: 100 Hz center frequency
- **Mid**: 1 kHz center frequency  
- **High**: 10 kHz center frequency
- Range: ±12 dB per band
- Q: 0.5 (moderate width)

```typescript
const eq = new EqualizerEffect(audioContext);
eq.setMode('3-band');
eq.setParameter('lowGain', 4);    // Boost bass by 4dB
eq.setParameter('midGain', -2);   // Cut mids by 2dB
eq.setParameter('highGain', 3);   // Boost treble by 3dB
```

#### 10-Band Graphic EQ
1/3 octave spacing (61, 125, 250, 500, 1kHz, 2k, 4k, 8k, 12k, 16k Hz):
- Each band: ±12 dB range
- Narrow Q for precise control
- Professional DJ/mastering standard

```typescript
eq.setMode('10-band');
eq.setParameter('band0', 6);   // 60 Hz band (bass boost)
eq.setParameter('band4', 2);   // 1 kHz band (presence)
```

#### Parametric EQ
Single peak filter with editable frequency, gain, and Q:
- **Frequency**: 20 Hz - 20 kHz
- **Gain**: ±12 dB
- **Q**: 0.1 - 10 (bandwidth control)
- High Q for surgical cuts, low Q for smooth adjustment

```typescript
eq.setMode('parametric');
eq.setParameter('paramFreq', 5000);  // Center at 5 kHz
eq.setParameter('paramGain', -6);    // Cut by 6 dB
eq.setParameter('paramQ', 2);        // Narrow bandwidth
```

#### Built-in Presets
- `flat` - No coloration
- `warmth` - Emphasized lows and mids
- `brightness` - Scooped mids, boosted highs
- `bass-boost` - Low-end emphasis
- `vocal-enhance` - Presence and clarity
- `sizzle` - Extended high frequencies
- `presence` - Midrange punch
- `de-esser` - Reduced sibilance
- `telephone` - Narrow band, vintage tone
- `radio` - Compressed frequency range

```typescript
eq.applyPreset('warmth');
```

**Parameters:**
- `lowGain` (3-band): -12 to +12 dB
- `midGain` (3-band): -12 to +12 dB
- `highGain` (3-band): -12 to +12 dB
- `band0-band9` (10-band): -12 to +12 dB each
- `paramFreq` (parametric): 20 to 20000 Hz
- `paramGain` (parametric): -12 to +12 dB
- `paramQ` (parametric): 0.1 to 10
- `mix`: 0-100% (wet/dry)

**Frequency Response Visualization:**
```typescript
const response = eq.getFrequencyResponse();
// response.frequencies: [20, 21.5, 23.1, ...] Hz
// response.magnitudes: [-2, -1.5, -0.8, ...] dB
```

---

### 2. **ReverbEffect** - Spatial Reverb Processing

Convolver-based room simulation with decay control and multiple acoustic presets.

#### Reverb Presets

| Preset | Size | Decay | Character |
|--------|------|-------|-----------|
| `room` | Small | 1.5s | Intimate, natural reflections |
| `hall` | Medium | 2.5s | Concert/performance space |
| `cathedral` | Large | 4.0s | Grand, spacious ambience |
| `plate` | Studio | 1.2s | Smooth, musical (vintage) |
| `spring` | Compact | 2.0s | Lush, slightly metallic |

**Parameters:**
- `size`: 0.1 to 2.0 (scales reverb envelope)
- `decay`: 0.5 to 5.0 seconds (reverb tail length)
- `predelay`: 0 to 100 ms (delay before reverb onset)
- `damping`: 0 to 1 (high-frequency absorption)
- `mix`: 0-100% (wet/dry)

```typescript
const reverb = new ReverbEffect(audioContext);
reverb.loadPreset('hall');
reverb.setParameter('decay', 2.8);
reverb.setParameter('mix', 25);    // 25% wet
```

**Features:**
- Synthetic impulse response generation for low CPU usage
- Schroeder reverberator topology (parallel comb + allpass)
- Early reflection modeling
- Low-pass feedback filtering for natural decay

---

### 3. **CompressorEffect** - Dynamic Range Processing

Professional compressor with real-time gain reduction metering and automatic makeup gain.

**Parameters:**
- `threshold`: -100 to 0 dB (level where compression begins)
- `ratio`: 1 to 16 (amount of gain reduction: 4:1 = 4dB reduction per 4dB over threshold)
- `attack`: 0.1 to 100 ms (how quickly compression engages)
- `release`: 10 to 1000 ms (how quickly compression releases)
- `makeupGain`: -24 to +24 dB (compensates for gain reduction)
- `knee`: 0 to 40 dB (soft-knee width)
- `mix`: 0-100% (wet/dry)

```typescript
const compressor = new CompressorEffect(audioContext);
compressor.setParameter('threshold', -20);  // Engage at -20dB
compressor.setParameter('ratio', 4);        // 4:1 compression
compressor.setParameter('attack', 5);       // 5ms attack
compressor.setParameter('release', 250);    // 250ms release
compressor.autoMakeupGain();                // Auto-calculate makeup gain
```

**Real-time Metering:**
```typescript
const state = compressor.getState();
console.log(state.gainReduction);  // Gain reduction in dB
console.log(state.inputLevel);     // Input level
console.log(state.outputLevel);    // Output level
console.log(state.threshold);
console.log(state.ratio);
```

**Soft-Knee Compression:**
```typescript
compressor.setSoftKnee(true);      // Smooth engagement
compressor.setKneeWidth(12);       // 12dB soft knee
```

---

### 4. **DistortionEffect** - Saturation & Distortion

Versatile distortion with multiple clipping algorithms and tone shaping.

#### Distortion Types

| Type | Character | Use Case |
|------|-----------|----------|
| `soft` | Smooth, analog-like (tanh) | Warmth, saturation |
| `hard` | Digital, harsh clipping | Aggressive, gritty |
| `fuzz` | Vintage, asymmetric | Retro, tone color |
| `sine` | Musical waveshaping | Harmonic enhancement |
| `tanh` | Natural compression | Tape saturation feel |

**Parameters:**
- `drive`: 0-100% (amount of pre-distortion gain)
- `tone`: 1000 to 20000 Hz (low-pass filter cutoff)
- `output`: -24 to +12 dB (post-distortion makeup gain)
- `mix`: 0-100% (wet/dry)

```typescript
const distortion = new DistortionEffect(audioContext);
distortion.setType('soft');
distortion.setParameter('drive', 50);      // 50% drive
distortion.setParameter('tone', 8000);     // 8kHz cutoff
distortion.setParameter('output', -3);     // -3dB makeup gain
distortion.setParameter('mix', 75);        // 75% distorted signal
```

**Waveshaping Curve (for visualization):**
```typescript
const curve = distortion.getWaveshapingCurve(512);
// Returns [-1...1] values representing distortion curve
// Use for display in UI distortion graph
```

---

### 5. **DelayEffect** - Time-Based Delay

Professional delay with tempo sync, feedback, and stereo spread.

#### Delay Time Units
- **`ms`**: Direct milliseconds (10-4000ms)
- **`note`**: Synced to song tempo (1/16, 1/8T, 1/8, 1/4T, 1/4, etc.)
- **`sync`**: Real-time tempo sync

**Parameters:**
- `delayTime`: 10 to 4000 ms (fixed delay time)
- `delayNote`: 0-8 (note index: 0=1/16, 4=1/4, 6=1/2, 8=whole)
- `feedback`: 0 to 99% (regeneration of delayed signal)
- `stereoSpread`: 0 to 100 ms (L/R delay difference)
- `tone`: 500 to 20000 Hz (feedback filter cutoff)
- `mix`: 0-100% (wet/dry)

```typescript
const delay = new DelayEffect(audioContext);
delay.setTempo(120);               // Set song tempo (BPM)
delay.setDelayNote(4);             // 1/4 note delay
delay.setParameter('feedback', 45); // 45% feedback
delay.setParameter('stereoSpread', 30); // 30ms L/R difference
delay.setParameter('mix', 40);     // 40% wet

// Or use fixed timing
delay.setDelayTime(375);           // 375ms = dotted 1/4
```

---

### 6. **ChorusEffect** - Modulation Processing

Lush modulation effects with multiple algorithm modes.

#### Modulation Types

| Type | Rate | Depth | Character |
|------|------|-------|-----------|
| `chorus` | 0.5-2 Hz | 20-50ms delay | Width, spaciousness |
| `flanger` | 0.5-3 Hz | 1-10ms delay + feedback | Whooshing, metallic |
| `phaser` | 0.1-2 Hz | All-pass modulation | Sweeping, phase effects |
| `vibrato` | 1-10 Hz | Pitch modulation | Subtle pitch wobble |

**Parameters:**
- `rate`: 0.1 to 10 Hz (LFO frequency)
- `depth`: 0-100% (modulation amount)
- `mix`: 0-100% (wet/dry)
- `spread`: 0-180° (stereo phase offset)

```typescript
const chorus = new ChorusEffect(audioContext);
chorus.setType('chorus');
chorus.setParameter('rate', 1.5);     // 1.5 Hz LFO
chorus.setParameter('depth', 50);     // 50% depth
chorus.setParameter('mix', 50);       // 50% wet
chorus.setParameter('spread', 90);    // Stereo offset
```

---

### 7. **AnalyzerEffect** - Real-time Monitoring

Non-destructive analysis for spectrum, loudness, and metering.

#### Frequency Analysis

```typescript
const analyzer = new AnalyzerEffect(audioContext);

// Get spectrum data
const spectrum = analyzer.getSpectrum();
console.log(spectrum.frequencies);  // [0, 10.7, 21.5, ...] Hz
console.log(spectrum.magnitudes);   // [-96, -85, -72, ...] dB
console.log(spectrum.peaks);        // Peak frequencies
```

#### Loudness Metering (LUFS)

```typescript
const loudness = analyzer.getLoudness();
console.log(loudness.lufs);         // Integrated loudness (LUFS)
console.log(loudness.rms);          // RMS level (dB)
console.log(loudness.peak);         // Peak level (dB)
console.log(loudness.headroom);     // Headroom to 0dBFS
```

#### Waveform Display

```typescript
const waveform = analyzer.getWaveform();
// Returns normalized samples [-1...1] for oscilloscope view
```

#### Frequency Bins (for visualization)

```typescript
const bins = analyzer.getFrequencyBins(64);  // 64-bin spectrum
// Returns condensed spectrum data for real-time UI display
```

**Parameters:**
- `smoothing`: 0.1 to 1.0 (FFT smoothing factor)
- `fftSize`: 8 to 14 (log2 of FFT size: 256 to 16384)

---

### 8. **EffectChain** - Track Effect Rack

Central manager for up to 8 effects per track with automation and serialization.

#### Adding Effects

```typescript
const chain = new EffectChain(audioContext, 8);

const eqSlot = chain.addEffect('eq', 0);         // Position 0
const compSlot = chain.addEffect('compressor');  // Last position
const reverbSlot = chain.addEffect('reverb');    // Last position
```

#### Reordering Effects

```typescript
chain.moveEffect(compSlot.id, 1);  // Move compressor to position 1
// Chain order: EQ → Compressor → Reverb
```

#### Enabling/Disabling

```typescript
chain.setEffectEnabled(eqSlot.id, false);   // Disable EQ
chain.setEffectBypassed(reverbSlot.id, true); // Bypass reverb
```

#### Parameter Control

```typescript
chain.setEffectParameter(eqSlot.id, 'lowGain', 6);
const value = chain.getEffectParameter(eqSlot.id, 'lowGain');

const params = chain.getEffectParameters(eqSlot.id);
params.forEach(param => console.log(param.name, param.value));
```

#### Automation

```typescript
const automation = {
  parameter: 'mix',
  points: [
    { time: 0, value: 0 },
    { time: 2, value: 50 },
    { time: 4, value: 100 },
  ],
  enabled: true,
};

chain.setAutomation(reverbSlot.id, 'mix', automation);

// Update during playback
chain.updateAutomation(currentTimeInSeconds);
```

#### Chain State Serialization

```typescript
// Save chain state
const state = chain.getState();
localStorage.setItem('effectChainState', JSON.stringify(state));

// Restore chain state
const saved = JSON.parse(localStorage.getItem('effectChainState'));
chain.setState(saved);
```

#### Master Mix Control

```typescript
chain.setMasterMix(80);  // 80% wet, 20% dry for entire chain
chain.setBypass(true);   // Bypass entire chain
```

---

## Usage Examples

### Basic Track Setup

```typescript
import {
  EffectChain,
  EqualizerEffect,
  CompressorEffect,
  ReverbEffect,
} from 'lib/audioEffects';

const audioContext = new AudioContext();
const track = audioContext.createGain();
const chain = new EffectChain(audioContext, 8);

// Connect audio
track.connect(chain.getInput());
chain.getOutput().connect(audioContext.destination);

// Add effects
const eq = chain.addEffect('eq');
const comp = chain.addEffect('compressor');
const reverb = chain.addEffect('reverb');

// Configure EQ
chain.setEffectParameter(eq.id, 'lowGain', 2);
chain.setEffectParameter(eq.id, 'highGain', 3);

// Configure compressor
chain.setEffectParameter(comp.id, 'threshold', -15);
chain.setEffectParameter(comp.id, 'ratio', 6);

// Configure reverb
chain.setEffectParameter(reverb.id, 'mix', 20);

// Disable compressor initially
chain.setEffectEnabled(comp.id, false);
```

### Real-time Monitoring

```typescript
const analyzer = chain.addEffect('analyzer');

function updateMeters() {
  const effect = chain.getEffect(analyzer.id);
  if (!effect || effect.constructor.name !== 'AnalyzerEffect') return;

  const loudness = effect.getLoudness();
  updateMeterUI(loudness.lufs, loudness.peak, loudness.headroom);

  requestAnimationFrame(updateMeters);
}
updateMeters();
```

### Dynamic Automation

```typescript
// Automate reverb wet during fade-out
const reverbAutomation = {
  parameter: 'mix',
  points: [
    { time: 8, value: 30 },
    { time: 10, value: 100 }, // Fade into reverb
  ],
  enabled: true,
};

chain.setAutomation(reverb.id, 'mix', reverbAutomation);

// In playback loop
function render() {
  chain.updateAutomation(currentPlaybackTime);
  // ... render audio ...
  requestAnimationFrame(render);
}
```

---

## Architecture

### Signal Flow

```
Input
  ↓
Effect Slot 1 (Input) ──→ [DSP] ──→ Output
  ↓
Effect Slot 2 (Input) ──→ [DSP] ──→ Output
  ↓
Effect Slot N (Input) ──→ [DSP] ──→ Output
  ↓
Master Mix (Wet/Dry)
  ↓
Output
```

### Web Audio API Integration

- **BiquadFilterNode**: EQ filtering
- **ConvolverNode**: Reverb processing
- **DynamicsCompressorNode**: Compression
- **AnalyserNode**: Spectrum analysis
- **GainNode**: Mixing and makeup gain
- **AudioWorkletNode**: Future CPU-intensive DSP (distortion, delay, chorus)

### Parameter Ranges

All parameters use standard music production conventions:
- **Frequency**: Hz (20-20000)
- **Gain**: dB (±12 to ±24)
- **Time**: ms or seconds
- **Percentage**: 0-100%
- **Ratio**: 1-16 (for compressor)
- **Q**: 0.1-10 (for parametric EQ)

---

## Performance Considerations

### CPU Usage Estimates
- **EQ**: ~1-2% (biquad filters)
- **Compressor**: ~1-2% (native Web Audio)
- **Reverb**: ~3-5% (convolver)
- **Distortion**: ~0.5-1% (static waveshaping)
- **Delay**: ~2-3% (with feedback)
- **Chorus**: ~2-3% (modulation + delay)
- **Analyzer**: ~3-5% (FFT + metering)

Total for full 8-effect chain: ~15-25% CPU on modern hardware.

### Optimization Tips
1. Disable analyzer when not needed (real-time metering is expensive)
2. Use lower FFT sizes for spectrum display
3. Disable effects via `setEffectEnabled` rather than removing them
4. Use `processFrame()` judiciously (Web Audio handles filtering efficiently)
5. Batch parameter updates to reduce update frequency

---

## Limitations & Future Enhancements

### Current Limitations
- Delay line processing is CPU-intensive on main thread (should use AudioWorklet)
- Distortion is static waveshaping (no dynamic algorithm selection)
- LUFS calculation is simplified (not ITU-R BS.1770-4 compliant)
- Phaser/Flanger modulation is basic (could use more sophisticated algorithms)

### Planned Enhancements
1. **AudioWorklet Processors**: Move CPU-heavy effects to audio thread
2. **Sidechain Compression**: Allow compressor to key off other tracks
3. **Multiband Compression**: Separate bands for independent dynamic control
4. **Linear Phase EQ**: Zero-latency version for mastering
5. **Convolver Optimization**: IR resampling for different sample rates
6. **Effect Presets**: Store and recall professional mixing chains

---

## License

Part of Sound Lab / WISE² Genesis. Production-grade audio processing library.
