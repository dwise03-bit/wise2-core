import { Entity, EntityType } from './Entity';

export interface DocumentAttributes {
  type?: 'note' | 'spec' | 'doc' | 'article' | 'report';
  path?: string;
  size?: number;
  format?: string;
  lastModified?: Date;
  content?: string;
  isPublic?: boolean;
}

export class Document extends Entity {
  declare attributes: DocumentAttributes;

  constructor(name: string, attributes: DocumentAttributes = {}) {
    super(name, EntityType.Document, undefined, attributes);
  }

  getType(): string | undefined {
    return this.attributes.type;
  }

  setType(type: DocumentAttributes['type']): void {
    this.update({ type });
  }

  getPath(): string | undefined {
    return this.attributes.path;
  }

  getContent(): string | undefined {
    return this.attributes.content;
  }

  setContent(content: string): void {
    this.update({ content });
  }

  getSize(): number | undefined {
    return this.attributes.size;
  }

  isPublic(): boolean {
    return this.attributes.isPublic !== false;
  }
}
