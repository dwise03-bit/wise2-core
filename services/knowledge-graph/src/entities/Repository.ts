import { Entity, EntityType } from './Entity';

export interface RepositoryAttributes {
  url?: string;
  language?: string[];
  isPublic?: boolean;
  stars?: number;
  forks?: number;
  branch?: string;
  lastCommit?: Date;
}

export class Repository extends Entity {
  declare attributes: RepositoryAttributes;

  constructor(name: string, attributes: RepositoryAttributes = {}) {
    super(name, EntityType.Repository, undefined, attributes);
  }

  getUrl(): string | undefined {
    return this.attributes.url;
  }

  setUrl(url: string): void {
    this.update({ url });
  }

  getLanguages(): string[] {
    return this.attributes.language || [];
  }

  isPublic(): boolean {
    return this.attributes.isPublic !== false;
  }

  getStars(): number {
    return this.attributes.stars || 0;
  }
}
