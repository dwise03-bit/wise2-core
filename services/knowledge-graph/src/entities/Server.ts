import { Entity, EntityType } from './Entity';

export interface ServerAttributes {
  type?: 'cloud' | 'vps' | 'raspberry-pi' | 'local' | 'edge';
  ip?: string;
  region?: string;
  cpu?: string;
  memory?: number;
  disk?: number;
  status?: 'online' | 'offline' | 'maintenance';
  services?: string[];
}

export class Server extends Entity {
  declare attributes: ServerAttributes;

  constructor(name: string, attributes: ServerAttributes = {}) {
    super(name, EntityType.Server, undefined, attributes);
  }

  getType(): string | undefined {
    return this.attributes.type;
  }

  setType(type: ServerAttributes['type']): void {
    this.update({ type });
  }

  getIp(): string | undefined {
    return this.attributes.ip;
  }

  getStatus(): string | undefined {
    return this.attributes.status;
  }

  isOnline(): boolean {
    return this.getStatus() === 'online';
  }

  getMemory(): number | undefined {
    return this.attributes.memory;
  }

  getServices(): string[] {
    return this.attributes.services || [];
  }
}
