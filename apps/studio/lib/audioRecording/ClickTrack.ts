/**
 * ClickTrack.ts
 *
 * Professional metronome and click track system with visual beat feedback,
 * pre-count bars, and tempo synchronization.
 *
 * @module audioRecording/ClickTrack
 */

export interface ClickTrackConfig {
  bpm: number;                    // 40-240
  timeSignature: [number, number]; // [beats, noteValue] e.g., [4, 4]
  preCountBars: number;           // Number of bars before recording starts
  volume: number;                 // 0-1
  accentFirst: boolean;           // Accent first beat of measure
}

export interface ClickTrackState {
  isRunning: boolean;
  currentBeat: number;           // 0-based beat within measure
  currentBar: number;            // 0-based bar number
  bpm: number;
  volume: number;
  nextClickTime: number;         // Audio context time
}

/**
 * ClickTrack - Professional metronome system
 *
 * Generates:
 * - Audio click at specified BPM
 * - Accented beats on downbeat
 * - Visual feedback signals
 * - Pre-count bars before recording
 */
export class ClickTrack {
  private audioContext: AudioContext;
  private config: ClickTrackConfig;
  private state: ClickTrackState;
  private scheduledClickTimes: Map<number, boolean> = new Map();
  private onBeatUpdate?: (beat: number, bar: number) => void;
  private onClickSound?: (isAccent: boolean) => void;

  // Audio graph
  private clickGain: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private envelope: GainNode | null = null;

  // Animation frame for scheduling
  private animationFrameId: number | null = null;
  private lastScheduledTime: number = 0;

  constructor(audioContext: AudioContext, config: ClickTrackConfig) {
    this.audioContext = audioContext;
    this.config = config;
    this.state = {
      isRunning: false,
      currentBeat: 0,
      currentBar: 0,
      bpm: config.bpm,
      volume: config.volume,
      nextClickTime: 0,
    };
  }

  /**
   * Start click track
   */
  start(): void {
    if (this.state.isRunning) {
      console.warn('Click track already running');
      return;
    }

    this.state.isRunning = true;
    this.state.currentBeat = 0;
    this.state.currentBar = 0;
    this.state.nextClickTime = this.audioContext.currentTime;

    // Create audio nodes for click sound
    this.createClickAudioGraph();

    // Start scheduling clicks
    this.scheduleClicks();

    console.log(`Click track started: ${this.config.bpm} BPM, ${this.config.preCountBars} pre-count bars`);
  }

  /**
   * Stop click track
   */
  stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    this.state.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }

    if (this.envelope) {
      this.envelope.disconnect();
      this.envelope = null;
    }

    if (this.clickGain) {
      this.clickGain.disconnect();
      this.clickGain = null;
    }

    this.scheduledClickTimes.clear();
    console.log('Click track stopped');
  }

  /**
   * Create Web Audio nodes for click sound
   */
  private createClickAudioGraph(): void {
    // Gain node for overall click volume
    this.clickGain = this.audioContext.createGain();
    this.clickGain.gain.value = this.config.volume;
    this.clickGain.connect(this.audioContext.destination);

    // Envelope for click shape (sharp attack, quick release)
    this.envelope = this.audioContext.createGain();
    this.envelope.connect(this.clickGain);

    // Oscillator for click tone (800 Hz for regular, 1200 Hz for accent)
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 800;
    this.oscillator.connect(this.envelope);
    this.oscillator.start();
  }

  /**
   * Schedule click sounds with Web Audio scheduling
   */
  private scheduleClicks(): void {
    const beatDuration = this.beatDurationInSeconds();
    const scheduleAhead = 0.1; // Look ahead 100ms for scheduling

    const scheduleClick = () => {
      const currentTime = this.audioContext.currentTime;
      const now = currentTime;
      const scheduleUntil = currentTime + scheduleAhead;

      // Schedule all clicks up to scheduleUntil time
      while (this.state.nextClickTime < scheduleUntil) {
        const clickTime = this.state.nextClickTime;

        // Determine if this is an accented beat
        const isAccent = this.config.accentFirst && this.state.currentBeat === 0;

        // Only play audio if not in pre-count phase, OR if pre-count is enabled
        const totalPreCountTime = this.config.preCountBars * (this.config.timeSignature[0] * beatDuration);
        const shouldPlayAudio = clickTime >= totalPreCountTime;

        // Schedule the click at the exact time
        this.scheduleClickAtTime(clickTime, isAccent, shouldPlayAudio);

        // Update beat position
        this.state.currentBeat++;
        if (this.state.currentBeat >= this.config.timeSignature[0]) {
          this.state.currentBeat = 0;
          this.state.currentBar++;
        }

        this.state.nextClickTime += beatDuration;
      }

      // Continue scheduling if still running
      if (this.state.isRunning) {
        this.animationFrameId = requestAnimationFrame(scheduleClick);
      }
    };

    scheduleClick();
  }

  /**
   * Schedule a click sound at a specific audio context time
   */
  private scheduleClickAtTime(
    time: number,
    isAccent: boolean,
    playAudio: boolean
  ): void {
    if (playAudio && this.oscillator && this.envelope && this.clickGain) {
      const frequency = isAccent ? 1200 : 800;
      const duration = isAccent ? 0.08 : 0.05;

      // Set frequency for accent vs regular
      this.oscillator.frequency.setValueAtTime(frequency, time);

      // Envelope: sharp attack, exponential release
      this.envelope.gain.setValueAtTime(0, time);
      this.envelope.gain.linearRampToValueAtTime(1, time + 0.005); // 5ms attack
      this.envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);

      // Callback for visual feedback
      if (this.onClickSound) {
        this.onClickSound(isAccent);
      }
    }

    // Always trigger beat update callback (for visual UI feedback)
    if (this.onBeatUpdate) {
      this.onBeatUpdate(this.state.currentBeat, this.state.currentBar);
    }
  }

  /**
   * Calculate beat duration in seconds
   */
  private beatDurationInSeconds(): number {
    // BPM = beats per minute
    // Beat = quarter note (1/4)
    const beatsPerSecond = this.config.bpm / 60;
    return 1 / beatsPerSecond;
  }

  /**
   * Set BPM and update click timing
   */
  setBpm(bpm: number): void {
    this.config.bpm = Math.max(40, Math.min(240, bpm));
    this.state.bpm = this.config.bpm;

    // If currently running, need to reschedule clicks
    if (this.state.isRunning) {
      console.log(`BPM updated to ${this.config.bpm}`);
      // The scheduling will adapt automatically on next iteration
    }
  }

  /**
   * Set click volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.state.volume = this.config.volume;

    if (this.clickGain) {
      this.clickGain.gain.value = this.config.volume;
    }
  }

  /**
   * Set time signature
   */
  setTimeSignature(beats: number, noteValue: number): void {
    this.config.timeSignature = [beats, noteValue];
  }

  /**
   * Get current state
   */
  getState(): ClickTrackState {
    return {
      ...this.state,
      isRunning: this.state.isRunning,
    };
  }

  /**
   * Register callback for beat updates (visual feedback)
   */
  onBeat(callback: (beat: number, bar: number) => void): void {
    this.onBeatUpdate = callback;
  }

  /**
   * Register callback for click sounds (debug/testing)
   */
  onClick(callback: (isAccent: boolean) => void): void {
    this.onClickSound = callback;
  }

  /**
   * Get time remaining in pre-count phase
   */
  getPreCountRemaining(): number {
    const beatDuration = this.beatDurationInSeconds();
    const totalPreCountTime = this.config.preCountBars * (this.config.timeSignature[0] * beatDuration);
    const elapsedTime = this.state.nextClickTime - this.audioContext.currentTime;
    return Math.max(0, totalPreCountTime - elapsedTime);
  }

  /**
   * Check if in pre-count phase
   */
  isInPreCount(): boolean {
    const beatDuration = this.beatDurationInSeconds();
    const totalPreCountTime = this.config.preCountBars * (this.config.timeSignature[0] * beatDuration);
    return this.state.currentBar < this.config.preCountBars;
  }

  /**
   * Get current BPM
   */
  getBpm(): number {
    return this.config.bpm;
  }

  /**
   * Get time signature
   */
  getTimeSignature(): [number, number] {
    return this.config.timeSignature;
  }

  /**
   * Get running state
   */
  getIsRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
  }
}
