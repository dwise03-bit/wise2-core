/**
 * Route Handler
 * Smart routing logic for different services
 */

interface ServiceConfig {
  executive: string;
  developer: string;
  infrastructure: string;
  deployment: string;
  voiceAssistant: string;
  knowledgeGraph: string;
  automations: string;
  discord: string;
  sync: string;
  health: string;
}

interface RouteMatch {
  serviceName: keyof ServiceConfig;
  serviceUrl: string;
  pathRewrite: string;
  cacheEnabled: boolean;
  timeout: number;
}

export class RouteHandler {
  private services: ServiceConfig;

  constructor(services: ServiceConfig) {
    this.services = services;
  }

  /**
   * Determine which service a request should be routed to
   */
  route(method: string, path: string): RouteMatch {
    if (path.startsWith('/api/executive/')) {
      return this.createMatch('executive', path, true, 30000);
    }

    if (path.startsWith('/api/developer/')) {
      return this.createMatch('developer', path, true, 30000);
    }

    if (path.startsWith('/api/infrastructure/')) {
      return this.createMatch('infrastructure', path, true, 45000);
    }

    if (path.startsWith('/api/deployment/')) {
      return this.createMatch('deployment', path, true, 60000);
    }

    if (path.startsWith('/api/voice/')) {
      return this.createMatch('voiceAssistant', path, false, 30000);
    }

    if (path.startsWith('/api/knowledge-graph/')) {
      return this.createMatch('knowledgeGraph', path, true, 30000);
    }

    if (path.startsWith('/api/automations/')) {
      return this.createMatch('automations', path, false, 30000);
    }

    if (path.startsWith('/api/discord/')) {
      return this.createMatch('discord', path, false, 30000);
    }

    if (path.startsWith('/api/sync/')) {
      return this.createMatch('sync', path, true, 30000);
    }

    if (path.startsWith('/api/health/')) {
      return this.createMatch('health', path, true, 10000);
    }

    throw new Error(`No route found for ${method} ${path}`);
  }

  /**
   * Get service URL
   */
  getServiceUrl(serviceName: keyof ServiceConfig): string {
    return this.services[serviceName];
  }

  /**
   * Get all services
   */
  getServices(): ServiceConfig {
    return this.services;
  }

  /**
   * Check if a service is configured
   */
  isServiceConfigured(serviceName: keyof ServiceConfig): boolean {
    return !!this.services[serviceName];
  }

  /**
   * Update service URL (for dynamic configuration)
   */
  updateServiceUrl(serviceName: keyof ServiceConfig, url: string): void {
    this.services[serviceName] = url;
  }

  /**
   * Private helper to create route match
   */
  private createMatch(
    serviceName: keyof ServiceConfig,
    path: string,
    cacheEnabled: boolean,
    timeout: number
  ): RouteMatch {
    const serviceUrl = this.services[serviceName];

    if (!serviceUrl) {
      throw new Error(`Service ${serviceName} is not configured`);
    }

    // Remove gateway prefix and keep service path
    const pathRewrite = this.rewritePath(serviceName, path);

    return {
      serviceName,
      serviceUrl,
      pathRewrite,
      cacheEnabled,
      timeout,
    };
  }

  /**
   * Rewrite path for backend service
   */
  private rewritePath(serviceName: keyof ServiceConfig, path: string): string {
    const prefixMap: Record<keyof ServiceConfig, string> = {
      executive: '/api/executive/',
      developer: '/api/developer/',
      infrastructure: '/api/infrastructure/',
      deployment: '/api/deployment/',
      voiceAssistant: '/api/voice/',
      knowledgeGraph: '/api/knowledge-graph/',
      automations: '/api/automations/',
      discord: '/api/discord/',
      sync: '/api/sync/',
      health: '/api/health/',
    };

    const prefix = prefixMap[serviceName];
    const rewritten = path.substring(prefix.length);

    return `/${rewritten}` || '/';
  }
}

export default RouteHandler;
