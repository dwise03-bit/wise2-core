import { DeviceId, VectorClock } from './types';
import crypto from 'crypto';

/**
 * Vector Clock implementation for causality tracking
 * Ensures proper ordering of distributed events
 */
export class VectorClockManager {
  private clock: VectorClock;
  private deviceId: DeviceId;

  constructor(deviceId: DeviceId, initialClock?: VectorClock) {
    this.deviceId = deviceId;
    this.clock = initialClock || { [deviceId as string]: 0 };
  }

  /**
   * Increment clock for this device
   */
  increment(): VectorClock {
    const current = this.clock[this.deviceId as string] || 0;
    this.clock[this.deviceId as string] = current + 1;
    return { ...this.clock };
  }

  /**
   * Update clock with received clock
   */
  update(receivedClock: VectorClock): VectorClock {
    // Take max of each component
    for (const [deviceId, timestamp] of Object.entries(receivedClock)) {
      const current = this.clock[deviceId] || 0;
      this.clock[deviceId] = Math.max(current, timestamp);
    }

    // Increment our own clock
    return this.increment();
  }

  /**
   * Get current clock
   */
  getClock(): VectorClock {
    return { ...this.clock };
  }

  /**
   * Set clock
   */
  setClock(clock: VectorClock): void {
    this.clock = { ...clock };
  }

  /**
   * Check if clock a happened before clock b
   */
  static happenedBefore(a: VectorClock, b: VectorClock): boolean {
    let hasSmaller = false;

    for (const deviceId of Object.keys({ ...a, ...b })) {
      const aVal = a[deviceId] || 0;
      const bVal = b[deviceId] || 0;

      if (aVal > bVal) {
        return false;
      }
      if (aVal < bVal) {
        hasSmaller = true;
      }
    }

    return hasSmaller;
  }

  /**
   * Check if clock a and b are concurrent (neither happened before the other)
   */
  static concurrent(a: VectorClock, b: VectorClock): boolean {
    const aBeforeB = this.happenedBefore(a, b);
    const bBeforeA = this.happenedBefore(b, a);
    return !aBeforeB && !bBeforeA;
  }

  /**
   * Check if clocks are identical
   */
  static identical(a: VectorClock, b: VectorClock): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if ((a[key] || 0) !== (b[key] || 0)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Hash vector clock for change identification
   */
  static hash(clock: VectorClock): string {
    const sorted = Object.entries(clock)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');

    return crypto.createHash('sha256').update(sorted).digest('hex').substring(0, 16);
  }

  /**
   * Merge multiple clocks (take maximum of each component)
   */
  static merge(...clocks: VectorClock[]): VectorClock {
    const merged: VectorClock = {};

    for (const clock of clocks) {
      for (const [deviceId, timestamp] of Object.entries(clock)) {
        merged[deviceId] = Math.max(merged[deviceId] || 0, timestamp);
      }
    }

    return merged;
  }

  /**
   * Create a new clock with single device
   */
  static create(deviceId: DeviceId): VectorClock {
    return { [deviceId as string]: 1 };
  }
}
