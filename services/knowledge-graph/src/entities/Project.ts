import { Entity, EntityType } from './Entity';

export interface ProjectAttributes {
  status?: 'active' | 'completed' | 'archived' | 'planning';
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  repository?: string;
  team?: string[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export class Project extends Entity {
  declare attributes: ProjectAttributes;

  constructor(
    name: string,
    attributes: ProjectAttributes = {}
  ) {
    super(name, EntityType.Project, undefined, attributes);
  }

  getStatus(): string | undefined {
    return this.attributes.status;
  }

  setStatus(status: ProjectAttributes['status']): void {
    this.update({ status });
  }

  isActive(): boolean {
    return this.getStatus() === 'active';
  }

  getBudget(): number | undefined {
    return this.attributes.budget;
  }

  setBudget(budget: number): void {
    this.update({ budget });
  }

  getPriority(): string | undefined {
    return this.attributes.priority;
  }

  setPriority(priority: ProjectAttributes['priority']): void {
    this.update({ priority });
  }
}
