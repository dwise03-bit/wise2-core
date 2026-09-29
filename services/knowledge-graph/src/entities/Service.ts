import { Entity, EntityType } from './Entity';

export interface ServiceAttributes {
  type?: 'api' | 'worker' | 'scheduler' | 'stream' | 'event';
  port?: number;
  health?: 'healthy' | 'degraded' | 'down';
  version?: string;
  endpoint?: string;
  uptime?: number;
}

export class Service extends Entity {
  declare attributes: ServiceAttributes;

  constructor(name: string, attributes: ServiceAttributes = {}) {
    super(name, EntityType.Service, undefined, attributes);
  }

  getType(): string | undefined {
    return this.attributes.type;
  }

  setType(type: ServiceAttributes['type']): void {
    this.update({ type });
  }

  getHealth(): string | undefined {
    return this.attributes.health;
  }

  setHealth(health: ServiceAttributes['health']): void {
    this.update({ health });
  }

  isHealthy(): boolean {
    return this.getHealth() === 'healthy';
  }

  getPort(): number | undefined {
    return this.attributes.port;
  }

  getEndpoint(): string | undefined {
    return this.attributes.endpoint;
  }
}
