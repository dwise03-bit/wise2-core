/**
 * Caching Layer
 * Redis integration for performance optimization
 */

const CACHE_TTL = {
  leaderboards: 5 * 60, // 5 minutes
  analytics: 10 * 60, // 10 minutes
  articles: 30 * 60, // 30 minutes
  profile: 2 * 60, // 2 minutes
  trends: 15 * 60, // 15 minutes
};

// Simple in-memory cache fallback (when Redis unavailable)
const memoryCache = new Map<string, { data: any; expires: number }>();

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
  // Check memory cache first
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in memory cache
  memoryCache.set(key, {
    data,
    expires: Date.now() + ttl * 1000,
  });

  // In production, also cache to Redis
  // await redis.set(key, JSON.stringify(data), 'EX', ttl);

  return data;
}

export function invalidateCache(pattern: string) {
  // Clear matching keys from memory cache
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
  // In production: await redis.del(redis.keys(`${pattern}*`));
}

export async function clearAllCache() {
  memoryCache.clear();
  // In production: await redis.flushdb();
}

export { CACHE_TTL };
