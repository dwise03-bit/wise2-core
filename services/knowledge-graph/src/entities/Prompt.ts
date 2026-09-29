import { Entity, EntityType } from './Entity';

export interface PromptAttributes {
  category?: string;
  template?: string;
  variables?: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  usage?: number;
  rating?: number;
}

export class Prompt extends Entity {
  declare attributes: PromptAttributes;

  constructor(name: string, attributes: PromptAttributes = {}) {
    super(name, EntityType.Prompt, undefined, attributes);
  }

  getCategory(): string | undefined {
    return this.attributes.category;
  }

  setCategory(category: string): void {
    this.update({ category });
  }

  getTemplate(): string | undefined {
    return this.attributes.template;
  }

  setTemplate(template: string): void {
    this.update({ template });
  }

  getVariables(): string[] {
    return this.attributes.variables || [];
  }

  getModel(): string | undefined {
    return this.attributes.model;
  }

  setModel(model: string): void {
    this.update({ model });
  }

  getUsageCount(): number {
    return this.attributes.usage || 0;
  }

  incrementUsage(): void {
    const usage = this.getUsageCount();
    this.update({ usage: usage + 1 });
  }

  getRating(): number {
    return this.attributes.rating || 0;
  }

  setRating(rating: number): void {
    this.update({ rating: Math.max(0, Math.min(5, rating)) });
  }
}
