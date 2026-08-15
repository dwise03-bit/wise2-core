/**
 * BaseEffect
 *
 * Abstract base class for all audio effects in Sound Lab.
 * Provides common lifecycle management, parameter automation,
 * and Web Audio API integration patterns.
 *
 * @module audioEffects/BaseEffect
 */

export interface EffectParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export interface AutomationPoint {
  time: number; // in seconds
  value: number;
}

export interface EffectAutomation {
  parameter: string;
  points: AutomationPoint[];
  enabled: boolean;
}

/**
 * Abstract base class for all audio effects
 */
export abstract class BaseEffect {
  protected audioContext: AudioContext;
  protected input: AudioNode;
  protected output: AudioNode;
  protected enabled: boolean = true;
  protected parameters: Map<string, EffectParameter> = new Map();
  protected automation: Map<string, EffectAutomation> = new Map();
  protected bypassed: boolean = false;

  /**
   * Create a new effect instance
   */
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    // Default passthrough if not overridden
    const gainNode = audioContext.createGain();
    this.input = gainNode;
    this.output = gainNode;
  }

  /**
   * Get the input node for connecting sources
   */
  getInput(): AudioNode {
    return this.input;
  }

  /**
   * Get the output node for connecting destinations
   */
  getOutput(): AudioNode {
    return this.output;
  }

  /**
   * Connect this effect's output to a destination node or audio param
   */
  connect(destination: AudioNode | AudioParam): AudioNode | void {
    if (destination instanceof AudioParam) {
      return this.output.connect(destination);
    }
    return this.output.connect(destination);
  }

  /**
   * Disconnect this effect from all destinations
   */
  disconnect(): void {
    this.output.disconnect();
  }

  /**
   * Enable or disable the effect (toggle bypass)
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.updateBypass();
  }

  /**
   * Check if effect is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !this.bypassed;
  }

  /**
   * Set bypass state (effect passes through signal unchanged)
   */
  setBypass(bypass: boolean): void {
    this.bypassed = bypass;
    this.updateBypass();
  }

  /**
   * Get bypass state
   */
  isBypassed(): boolean {
    return this.bypassed;
  }

  /**
   * Update bypass routing (to be implemented by subclasses)
   */
  protected updateBypass(): void {
    // Override in subclasses to handle effect-specific bypass logic
  }

  /**
   * Set parameter value with validation
   */
  setParameter(name: string, value: number): void {
    const param = this.parameters.get(name);
    if (!param) {
      console.warn(`Parameter "${name}" not found in ${this.constructor.name}`);
      return;
    }

    // Clamp to range
    param.value = Math.max(param.min, Math.min(param.max, value));
    this.onParameterChange(name, param.value);
  }

  /**
   * Get parameter value
   */
  getParameter(name: string): number | undefined {
    return this.parameters.get(name)?.value;
  }

  /**
   * Get all parameters
   */
  getParameters(): EffectParameter[] {
    return Array.from(this.parameters.values());
  }

  /**
   * Register a parameter (called during initialization)
   */
  protected registerParameter(param: EffectParameter): void {
    this.parameters.set(param.name, param);
  }

  /**
   * Handle parameter changes (override in subclasses)
   */
  protected abstract onParameterChange(name: string, value: number): void;

  /**
   * Set automation for a parameter
   */
  setAutomation(parameterName: string, automation: EffectAutomation): void {
    automation.parameter = parameterName;
    this.automation.set(parameterName, automation);
  }

  /**
   * Remove automation for a parameter
   */
  removeAutomation(parameterName: string): void {
    this.automation.delete(parameterName);
  }

  /**
   * Get automation for a parameter
   */
  getAutomation(parameterName: string): EffectAutomation | undefined {
    return this.automation.get(parameterName);
  }

  /**
   * Update automation playback (call from playback loop)
   */
  updateAutomation(currentTime: number): void {
    for (const [paramName, automation] of this.automation) {
      if (!automation.enabled || automation.points.length === 0) continue;

      // Find surrounding points
      let prevPoint = automation.points[0];
      let nextPoint = automation.points[automation.points.length - 1];

      for (let i = 0; i < automation.points.length - 1; i++) {
        if (
          automation.points[i].time <= currentTime &&
          currentTime < automation.points[i + 1].time
        ) {
          prevPoint = automation.points[i];
          nextPoint = automation.points[i + 1];
          break;
        }
      }

      // Linear interpolation between points
      if (prevPoint === nextPoint) {
        this.setParameter(paramName, prevPoint.value);
      } else {
        const alpha =
          (currentTime - prevPoint.time) / (nextPoint.time - prevPoint.time);
        const interpolated =
          prevPoint.value + (nextPoint.value - prevPoint.value) * alpha;
        this.setParameter(paramName, interpolated);
      }
    }
  }

  /**
   * Cleanup resources (call when effect is destroyed)
   */
  abstract dispose(): void;
}
