/**
 * Rate Limiter
 * Per-user, per-agent, per-endpoint rate limiting
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetAt: number;
  };
}

interface RateLimitResult {
  limit: number;
  remaining: number;
  resetAt: number;
  exceeded: boolean;
  retryAfter: number;
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private redisUrl?: string;
  private defaultConfig: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
  };

  private endpointConfigs: Map<string, RateLimitConfig> = new Map();
  private userConfigs: Map<string, RateLimitConfig> = new Map();

  constructor(redisUrl?: string) {
    this.redisUrl = redisUrl;
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // Endpoint-specific limits
    this.endpointConfigs.set('GET', {
      windowMs: 60000,
      maxRequests: 1000,
    });

    this.endpointConfigs.set('POST', {
      windowMs: 60000,
      maxRequests: 500,
    });

    this.endpointConfigs.set('DELETE', {
      windowMs: 60000,
      maxRequests: 100,
    });

    // Voice endpoint (more lenient)
    this.endpointConfigs.set('voice', {
      windowMs: 60000,
      maxRequests: 500,
    });

    // Automations endpoint (more lenient)
    this.endpointConfigs.set('automations', {
      windowMs: 60000,
      maxRequests: 500,
    });

    // Health endpoint (very lenient)
    this.endpointConfigs.set('health', {
      windowMs: 60000,
      maxRequests: 10000,
    });

    // Premium user config (higher limits)
    this.userConfigs.set('premium', {
      windowMs: 60000,
      maxRequests: 5000,
    });

    // Regular user config
    this.userConfigs.set('regular', {
      windowMs: 60000,
      maxRequests: 1000,
    });

    // Free user config
    this.userConfigs.set('free', {
      windowMs: 60000,
      maxRequests: 100,
    });
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    userId: string,
    endpoint: string,
    method: string = 'GET'
  ): Promise<RateLimitResult> {
    const key = this.generateKey(userId, endpoint);
    const config = this.getConfig(endpoint, method, userId);
    const now = Date.now();

    // Get current count
    const current = this.store[key] || {
      requests: 0,
      resetAt: now + config.windowMs,
    };

    // Check if window has expired
    if (now > current.resetAt) {
      current.requests = 0;
      current.resetAt = now + config.windowMs;
    }

    // Increment request count
    current.requests += 1;
    this.store[key] = current;

    const remaining = Math.max(0, config.maxRequests - current.requests);
    const exceeded = current.requests > config.maxRequests;
    const resetAt = current.resetAt;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      limit: config.maxRequests,
      remaining,
      resetAt,
      exceeded,
      retryAfter,
    };
  }

  /**
   * Reset rate limit for a user
   */
  async reset(userId: string, endpoint?: string): Promise<void> {
    if (endpoint) {
      const key = this.generateKey(userId, endpoint);
      delete this.store[key];
    } else {
      // Reset all endpoints for user
      Object.keys(this.store).forEach((key) => {
        if (key.startsWith(userId)) {
          delete this.store[key];
        }
      });
    }
  }

  /**
   * Get current usage for a user
   */
  async getUsage(userId: string): Promise<Record<string, RateLimitResult>> {
    const usage: Record<string, RateLimitResult> = {};

    Object.keys(this.store).forEach((key) => {
      if (key.startsWith(userId)) {
        const endpoint = key.substring(userId.length + 1);
        const current = this.store[key];
        const config = this.getConfig(endpoint, 'GET', userId);
        const remaining = Math.max(0, config.maxRequests - current.requests);

        usage[endpoint] = {
          limit: config.maxRequests,
          remaining,
          resetAt: current.resetAt,
          exceeded: current.requests > config.maxRequests,
          retryAfter: Math.ceil((current.resetAt - Date.now()) / 1000),
        };
      }
    });

    return usage;
  }

  /**
   * Set custom rate limit for an endpoint
   */
  setEndpointLimit(endpoint: string, config: RateLimitConfig): void {
    this.endpointConfigs.set(endpoint, config);
  }

  /**
   * Set custom rate limit for a user
   */
  setUserLimit(userId: string, config: RateLimitConfig): void {
    this.userConfigs.set(userId, config);
  }

  /**
   * Private helper to generate rate limit key
   */
  private generateKey(userId: string, endpoint: string): string {
    return `${userId}:${endpoint}`;
  }

  /**
   * Private helper to get rate limit config
   */
  private getConfig(
    endpoint: string,
    method: string,
    userId: string
  ): RateLimitConfig {
    // Check user-specific config
    if (this.userConfigs.has(userId)) {
      return this.userConfigs.get(userId)!;
    }

    // Check endpoint-specific config
    if (this.endpointConfigs.has(endpoint)) {
      return this.endpointConfigs.get(endpoint)!;
    }

    // Check method-specific config
    if (this.endpointConfigs.has(method)) {
      return this.endpointConfigs.get(method)!;
    }

    // Return default
    return this.defaultConfig;
  }

  /**
   * Clean up old entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    Object.entries(this.store).forEach(([key, value]) => {
      if (now > value.resetAt + 3600000) { // Delete if older than 1 hour after reset
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      delete this.store[key];
    });
  }
}

// Start cleanup interval
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const limiter = new RateLimiter();
    limiter.cleanup();
  }, 300000); // Every 5 minutes
}

export default RateLimiter;
