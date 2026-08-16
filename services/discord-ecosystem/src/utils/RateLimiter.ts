/**
 * WISE² Discord Ecosystem - Rate Limiter
 * Multi-level rate limiting for commands and API calls
 */

import { RateLimitConfig, RateLimitEntry, RateLimitType } from '../types';

export class RateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  };
  private configs: Map<RateLimitType, RateLimitConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    // User-level: 10 requests per minute
    this.configs.set('user', { maxRequests: 10, windowMs: 60000 });

    // Guild-level: 20 requests per minute
    this.configs.set('guild', { maxRequests: 20, windowMs: 60000 });

    // Channel-level: 30 requests per minute
    this.configs.set('channel', { maxRequests: 30, windowMs: 60000 });

    // Command-level: 5 requests per minute
    this.configs.set('command', { maxRequests: 5, windowMs: 60000 });
  }

  public setConfig(type: RateLimitType, config: RateLimitConfig): void {
    this.configs.set(type, config);
  }

  public getConfig(type: RateLimitType): RateLimitConfig {
    return this.configs.get(type) || this.defaultConfig;
  }

  private getBucketKey(type: RateLimitType, id: string, commandName?: string): string {
    if (commandName && type === 'command') {
      return `${type}:${id}:${commandName}`;
    }
    return `${type}:${id}`;
  }

  public isAllowed(type: RateLimitType, id: string, commandName?: string): boolean {
    const key = this.getBucketKey(type, id, commandName);
    const config = this.getConfig(type);
    const now = Date.now();

    let entry = this.buckets.get(key);

    // Initialize or reset expired bucket
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
      };
      this.buckets.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  public getRemainingRequests(type: RateLimitType, id: string, commandName?: string): number {
    const key = this.getBucketKey(type, id, commandName);
    const config = this.getConfig(type);
    const entry = this.buckets.get(key);

    if (!entry || Date.now() > entry.resetAt) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  public getResetTime(type: RateLimitType, id: string, commandName?: string): number {
    const key = this.getBucketKey(type, id, commandName);
    const entry = this.buckets.get(key);

    if (!entry) {
      return 0;
    }

    const resetIn = entry.resetAt - Date.now();
    return Math.max(0, resetIn);
  }

  public reset(type?: RateLimitType, id?: string): void {
    if (!type && !id) {
      // Clear all buckets
      this.buckets.clear();
      return;
    }

    if (type && id) {
      const prefix = `${type}:${id}`;
      for (const key of this.buckets.keys()) {
        if (key.startsWith(prefix)) {
          this.buckets.delete(key);
        }
      }
    }
  }

  public getStats(): {
    totalBuckets: number;
    activeBuckets: number;
    expiredBuckets: number;
  } {
    const now = Date.now();
    let activeBuckets = 0;
    let expiredBuckets = 0;

    for (const entry of this.buckets.values()) {
      if (now > entry.resetAt) {
        expiredBuckets++;
      } else {
        activeBuckets++;
      }
    }

    return {
      totalBuckets: this.buckets.size,
      activeBuckets,
      expiredBuckets,
    };
  }

  public cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.buckets.entries()) {
      if (now > entry.resetAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.buckets.delete(key);
    }
  }

  public periodicCleanup(intervalMs: number = 60000): NodeJS.Timer {
    return setInterval(() => this.cleanup(), intervalMs);
  }
}

export default new RateLimiter();
