/**
 * Health checks for router and dependencies
 */

import { OllamaProvider } from '../providers/ollama';

export interface HealthStatus {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  providers: {
    [name: string]: {
      healthy: boolean;
      lastCheck: string;
      error?: string;
    };
  };
  dependencies: {
    database: boolean;
    cache: boolean;
  };
}

export interface ReadinessStatus {
  ready: boolean;
  providers: {
    [name: string]: boolean;
  };
  timestamp: string;
}

export class HealthChecker {
  private ollama: OllamaProvider;
  private dbPool: any;

  constructor(ollama: OllamaProvider, dbPool: any) {
    this.ollama = ollama;
    this.dbPool = dbPool;
  }

  /**
   * Check overall health
   */
  async check(): Promise<HealthStatus> {
    const ollamaHealthy = await this.ollama.isHealthy();
    const dbHealthy = await this.checkDatabase();

    return {
      ok: ollamaHealthy && dbHealthy,
      status: ollamaHealthy && dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      providers: {
        ollama: {
          healthy: ollamaHealthy,
          lastCheck: new Date().toISOString(),
        },
      },
      dependencies: {
        database: dbHealthy,
        cache: true, // Redis check would go here
      },
    };
  }

  /**
   * Check readiness (all providers available)
   */
  async ready(): Promise<ReadinessStatus> {
    const ollamaHealthy = await this.ollama.isHealthy();
    const dbHealthy = await this.checkDatabase();

    return {
      ready: ollamaHealthy && dbHealthy,
      providers: {
        ollama: ollamaHealthy,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      if (!this.dbPool) return false;

      const result = await this.dbPool.query('SELECT 1');
      return !!result;
    } catch (error) {
      return false;
    }
  }
}
