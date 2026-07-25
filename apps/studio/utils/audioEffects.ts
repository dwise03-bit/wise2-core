/**
 * Audio Effects Processor
 * Web Audio API implementation for effects chain processing
 *
 * Connects to useClipEffects hook to apply real audio processing
 * during playback and export
 */

export interface EffectParams {
  // EQ
  lowGain?: number; // dB
  midGain?: number; // dB
  highGain?: number; // dB

  // Reverb
  wet?: number; // 0-1
  decay?: number; // 0-10 seconds

  // Delay
  time?: number; // milliseconds
  feedback?: number; // 0-1

  // Compression
  threshold?: number; // dB
  ratio?: number; // 1-16
  attack?: number; // ms
  release?: number; // ms

  // Distortion
  drive?: number; // 0-1
  tone?: number; // 0-1
}

/**
 * Create EQ filter node
 * @param ctx AudioContext
 * @param frequency Center frequency (Hz)
 * @param gain Boost/cut (dB)
 * @param Q Quality factor
 */
export function createEQNode(
  ctx: AudioContext,
  frequency: number,
  gain: number,
  Q: number = 1
): BiquadFilterNode {
  const eq = ctx.createBiquadFilter();
  eq.type = 'peaking';
  eq.frequency.value = frequency;
  eq.gain.value = gain;
  eq.Q.value = Q;
  return eq;
}

/**
 * Create low-shelf EQ for bass
 */
export function createLowShelfEQ(ctx: AudioContext, gain: number): BiquadFilterNode {
  const eq = ctx.createBiquadFilter();
  eq.type = 'lowshelf';
  eq.frequency.value = 200;
  eq.gain.value = gain;
  return eq;
}

/**
 * Create high-shelf EQ for treble
 */
export function createHighShelfEQ(ctx: AudioContext, gain: number): BiquadFilterNode {
  const eq = ctx.createBiquadFilter();
  eq.type = 'highshelf';
  eq.frequency.value = 3000;
  eq.gain.value = gain;
  return eq;
}

/**
 * Create simple reverb using ConvolverNode
 * Note: Full reverb requires impulse response file
 */
export function createReverbNode(
  ctx: AudioContext,
  wet: number = 0.3
): { dry: GainNode; wet: GainNode; reverb: ConvolverNode; mix: GainNode } {
  const dryGain = ctx.createGain();
  const wetGain = ctx.createGain();
  const convolver = ctx.createConvolver();
  const mixGain = ctx.createGain();

  // Set wet/dry mix
  const dryLevel = 1 - wet;
  dryGain.gain.value = dryLevel;
  wetGain.gain.value = wet;

  // Route: input → [dry] → mix
  //              → [convolver] → [wet] → mix
  dryGain.connect(mixGain);
  convolver.connect(wetGain);
  wetGain.connect(mixGain);

  return { dry: dryGain, wet: wetGain, reverb: convolver, mix: mixGain };
}

/**
 * Create delay effect
 */
export function createDelayNode(
  ctx: AudioContext,
  time: number = 0.5,
  feedback: number = 0.5,
  wet: number = 0.3
): { input: GainNode; output: GainNode; delay: DelayNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const delay = ctx.createDelay(5); // Max 5 seconds
  const feedbackGain = ctx.createGain();
  const wetGain = ctx.createGain();

  // Set values
  delay.delayTime.value = time;
  feedbackGain.gain.value = feedback;
  wetGain.gain.value = wet;

  // Route: input → delay → feedback → delay (loop)
  //              → wet → output
  input.connect(delay);
  delay.connect(feedbackGain);
  feedbackGain.connect(delay); // Feedback loop
  delay.connect(wetGain);
  wetGain.connect(output);
  input.connect(output); // Dry signal

  return { input, output, delay };
}

/**
 * Create dynamic compressor
 */
export function createCompressorNode(
  ctx: AudioContext,
  threshold: number = -20,
  ratio: number = 4,
  attack: number = 0.003,
  release: number = 0.25
): DynamicsCompressorNode {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = threshold;
  compressor.ratio.value = ratio;
  compressor.attack.value = attack;
  compressor.release.value = release;
  compressor.knee.value = 40; // Smooth knee
  return compressor;
}

/**
 * Create distortion effect
 */
export function createDistortionNode(
  ctx: AudioContext,
  drive: number = 0.5
): { input: GainNode; output: GainNode; waveshaper: WaveShaperNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const waveshaper = ctx.createWaveShaper();

  // Drive (input gain)
  input.gain.value = 1 + drive * 10;

  // Output normalization
  output.gain.value = 0.5;

  // Waveshaper curve (soft clipping)
  const curve = new Float32Array(ctx.sampleRate);
  const deg = Math.PI / 180;
  for (let i = 0; i < ctx.sampleRate; i++) {
    const x = (i * 2) / ctx.sampleRate - 1;
    curve[i] = ((3 + drive * 50) * x * 20 * deg) / (Math.PI + drive * Math.abs(x) * 20);
  }
  waveshaper.curve = curve;

  input.connect(waveshaper);
  waveshaper.connect(output);

  return { input, output, waveshaper };
}

/**
 * Create complete effects chain from clip configuration
 * Usage:
 *   const chain = createEffectsChain(audioContext, clipEffectsChain);
 *   sourceNode.connect(chain.input);
 *   chain.output.connect(destinationNode);
 */
export function createEffectsChain(
  ctx: AudioContext,
  effects: Array<{
    type: 'eq' | 'reverb' | 'delay' | 'compression' | 'distortion';
    enabled: boolean;
    params: EffectParams;
  }>,
  volume: number = 1,
  pan: number = 0
): {
  input: GainNode;
  output: GainNode;
  nodes: { [key: string]: any };
} {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const volumeGain = ctx.createGain();
  const panNode = ctx.createStereoPanner();

  // Set volume and pan
  volumeGain.gain.value = volume;
  panNode.pan.value = pan;

  // Build effect nodes
  const nodes: { [key: string]: any } = {};
  let currentNode = input;

  for (const effect of effects) {
    if (!effect.enabled) continue;

    let effectNode: any;

    switch (effect.type) {
      case 'eq': {
        // 3-band EQ
        const lowShelf = createLowShelfEQ(ctx, effect.params.lowGain ?? 0);
        const mid = createEQNode(ctx, 1000, effect.params.midGain ?? 0, 1);
        const highShelf = createHighShelfEQ(ctx, effect.params.highGain ?? 0);

        currentNode.connect(lowShelf);
        lowShelf.connect(mid);
        mid.connect(highShelf);
        currentNode = highShelf;
        nodes.eq = { low: lowShelf, mid, high: highShelf };
        break;
      }

      case 'reverb': {
        const reverb = createReverbNode(ctx, effect.params.wet ?? 0.3);
        currentNode.connect(reverb.dry);
        currentNode.connect(reverb.reverb);
        currentNode = reverb.mix;
        nodes.reverb = reverb;
        break;
      }

      case 'delay': {
        const delay = createDelayNode(
          ctx,
          (effect.params.time ?? 500) / 1000, // Convert ms to seconds
          effect.params.feedback ?? 0.5,
          0.3
        );
        currentNode.connect(delay.input);
        currentNode = delay.output;
        nodes.delay = delay;
        break;
      }

      case 'compression': {
        const compressor = createCompressorNode(
          ctx,
          effect.params.threshold ?? -20,
          effect.params.ratio ?? 4,
          (effect.params.attack ?? 3) / 1000,
          (effect.params.release ?? 250) / 1000
        );
        currentNode.connect(compressor);
        currentNode = compressor;
        nodes.compressor = compressor;
        break;
      }

      case 'distortion': {
        const distortion = createDistortionNode(ctx, effect.params.drive ?? 0.5);
        currentNode.connect(distortion.input);
        currentNode = distortion.output;
        nodes.distortion = distortion;
        break;
      }
    }
  }

  // Final stage: volume → pan → output
  currentNode.connect(volumeGain);
  volumeGain.connect(panNode);
  panNode.connect(output);

  return { input, output, nodes };
}

/**
 * Apply effects to AudioBuffer (for export/processing)
 * Returns new processed AudioBuffer
 */
export async function processAudioBufferWithEffects(
  ctx: OfflineAudioContext,
  buffer: AudioBuffer,
  effects: Array<{
    type: 'eq' | 'reverb' | 'delay' | 'compression' | 'distortion';
    enabled: boolean;
    params: EffectParams;
  }>,
  volume: number = 1,
  pan: number = 0
): Promise<AudioBuffer> {
  // Create source
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Create effects chain
  const chain = createEffectsChain(ctx, effects, volume, pan);

  // Connect: source → chain → output
  source.connect(chain.input);
  chain.output.connect(ctx.destination);

  // Start playback
  source.start(0);

  // Render
  return await ctx.startRendering();
}

/**
 * Utility: Convert dB to linear gain
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Utility: Convert linear gain to dB
 */
export function linearToDb(linear: number): number {
  return Math.log10(Math.max(linear, 0.001)) * 20;
}

/**
 * Utility: Create gain node from dB value
 */
export function createGainNodeFromDb(ctx: AudioContext, db: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = dbToLinear(db);
  return gain;
}
