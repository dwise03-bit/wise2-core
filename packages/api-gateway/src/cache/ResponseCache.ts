/**
 * Response Cache
 * Redis-based response caching with TTL
 */

import { Request } from 'express';
import crypto from 'crypto';

interface CacheEntry {
  data: any;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export class ResponseCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private redisUrl?: string;
  private defaultTTL: number = 300; // 5 minutes

  constructor(redisUrl?: string) {
    this.redisUrl = redisUrl;
  }

  /**
   * Generate cache key from request
   */
  generateKey(req: Request): string {
    const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * Get cached response
   */
  async get(key: string): Promise<any | null> {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits += 1;

    return entry.data;
  }

  /**
   * Set cached response
   */
  async set(key: string, data: any, ttl: number = this.defaultTTL): Promise<void> {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + (ttl * 1000),
      createdAt: Date.now(),
      hits: 0,
    });
  }

  /**
   * Delete cached response
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  /**
   * Clear cache for a path pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: number;
    hitRate: number;
    averageHits: number;
  } {
    let totalHits = 0;
    let count = 0;

    this.memoryCache.forEach((entry) => {
      totalHits += entry.hits;
      count += 1;
    });

    return {
      size: this.memoryCache.size,
      entries: count,
      hitRate: count > 0 ? totalHits / count : 0,
      averageHits: count > 0 ? totalHits / count : 0,
    };
  }

  /**
   * Get detailed cache info
   */
  getDetailedInfo(): CacheEntry[] {
    return Array.from(this.memoryCache.values()).sort(
      (a, b) => b.hits - a.hits
    );
  }

  /**
   * Invalidate response cache for a service
   */
  async invalidateService(serviceName: string): Promise<void> {
    await this.clearPattern(`.*:.*${serviceName}.*`);
  }

  /**
   * Pre-populate cache with common responses
   */
  async warmCache(entries: Array<{ key: string; data: any; ttl: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.data, entry.ttl);
    }
  }

  /**
   * Get cache memory usage estimate (bytes)
   */
  getMemoryUsage(): number {
    let size = 0;

    this.memoryCache.forEach((entry) => {
      size += JSON.stringify(entry.data).length;
    });

    return size;
  }
}

export default ResponseCache;
