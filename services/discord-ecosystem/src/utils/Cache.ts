/**
 * WISE² Discord Ecosystem - Cache Utility
 * In-memory caching with TTL and LRU eviction
 */

import { CacheConfig, CacheEntry, CacheStats } from '../types';

export class Cache<T> {
  private data: Map<string, CacheEntry<T>> = new Map();
  private config: Required<CacheConfig>;
  private stats = { hits: 0, misses: 0 };

  constructor(config: CacheConfig = { ttl: 60000, maxSize: 1000, strategy: 'lru' }) {
    this.config = {
      ttl: config.ttl,
      maxSize: config.maxSize || 1000,
      strategy: config.strategy || 'lru',
    };
  }

  public set(key: string, value: T): void {
    // Evict if necessary
    if (this.data.size >= this.config.maxSize) {
      this.evict();
    }

    this.data.set(key, {
      value,
      expiresAt: Date.now() + this.config.ttl,
      hits: 0,
    });
  }

  public get(key: string): T | null {
    const entry = this.data.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.data.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit counter
    entry.hits++;
    this.stats.hits++;
    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.data.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.data.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    return this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  public size(): number {
    return this.data.size;
  }

  public getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.data.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  private evict(): void {
    if (this.config.strategy === 'lru') {
      this.evictLRU();
    } else if (this.config.strategy === 'lfu') {
      this.evictLFU();
    } else {
      this.evictFIFO();
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;

    for (const [key, entry] of this.data.entries()) {
      if (entry.hits < lruHits) {
        lruHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.data.delete(lruKey);
    }
  }

  private evictLFU(): void {
    let lfuKey: string | null = null;
    let lfuHits = Infinity;

    for (const [key, entry] of this.data.entries()) {
      if (entry.hits < lfuHits) {
        lfuHits = entry.hits;
        lfuKey = key;
      }
    }

    if (lfuKey) {
      this.data.delete(lfuKey);
    }
  }

  private evictFIFO(): void {
    const firstKey = this.data.keys().next().value;
    if (firstKey) {
      this.data.delete(firstKey);
    }
  }

  public cleanup(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.data.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.data.delete(key);
    }

    return keysToDelete.length;
  }

  public periodicCleanup(intervalMs: number = 60000): NodeJS.Timer {
    return setInterval(() => this.cleanup(), intervalMs);
  }

  public getAll(): Map<string, T> {
    const result = new Map<string, T>();
    const now = Date.now();

    for (const [key, entry] of this.data.entries()) {
      if (now <= entry.expiresAt) {
        result.set(key, entry.value);
      }
    }

    return result;
  }

  public resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }
}

export default Cache;
