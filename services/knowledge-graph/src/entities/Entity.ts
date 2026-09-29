import { v4 as uuidv4 } from 'uuid';

export interface EntityMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export enum EntityType {
  Person = 'person',
  Organization = 'organization',
  Project = 'project',
  Repository = 'repository',
  Service = 'service',
  Server = 'server',
  Document = 'document',
  Meeting = 'meeting',
  Task = 'task',
  Deployment = 'deployment',
  Prompt = 'prompt',
  Automation = 'automation'
}

export abstract class Entity {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  metadata: EntityMetadata;
  attributes: Record<string, unknown>;

  constructor(
    name: string,
    type: EntityType,
    description?: string,
    attributes?: Record<string, unknown>
  ) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.description = description;
    this.attributes = attributes || {};
    this.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: [],
      metadata: {}
    };
  }

  /**
   * Update entity attributes
   */
  update(attributes: Partial<Record<string, unknown>>): void {
    this.attributes = { ...this.attributes, ...attributes };
    this.metadata.updatedAt = new Date();
    this.metadata.version += 1;
  }

  /**
   * Add tags to entity
   */
  addTag(tag: string): void {
    if (!this.metadata.tags) {
      this.metadata.tags = [];
    }
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  /**
   * Remove tag from entity
   */
  removeTag(tag: string): void {
    if (this.metadata.tags) {
      this.metadata.tags = this.metadata.tags.filter((t) => t !== tag);
    }
  }

  /**
   * Serialize entity to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      attributes: this.attributes,
      metadata: this.metadata
    };
  }

  /**
   * Get entity summary
   */
  getSummary(): string {
    return `${this.type}(${this.name}): ${this.description || 'No description'}`;
  }
}

/**
 * Entity factory for creating typed entities
 */
export class EntityFactory {
  static create(name: string, type: EntityType, description?: string, attributes?: Record<string, unknown>): Entity {
    // Import specific entity classes when needed
    // This is a placeholder that creates base entities
    return new Entity(name, type, description, attributes);
  }
}
