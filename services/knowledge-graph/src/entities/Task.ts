import { Entity, EntityType } from './Entity';

export interface TaskAttributes {
  status?: 'open' | 'in-progress' | 'completed' | 'blocked';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  assignee?: string;
  estimate?: number;
  spent?: number;
  blockers?: string[];
}

export class Task extends Entity {
  declare attributes: TaskAttributes;

  constructor(name: string, attributes: TaskAttributes = {}) {
    super(name, EntityType.Task, undefined, attributes);
  }

  getStatus(): string | undefined {
    return this.attributes.status;
  }

  setStatus(status: TaskAttributes['status']): void {
    this.update({ status });
  }

  isCompleted(): boolean {
    return this.getStatus() === 'completed';
  }

  getPriority(): string | undefined {
    return this.attributes.priority;
  }

  setPriority(priority: TaskAttributes['priority']): void {
    this.update({ priority });
  }

  getAssignee(): string | undefined {
    return this.attributes.assignee;
  }

  setAssignee(assignee: string): void {
    this.update({ assignee });
  }

  getDueDate(): Date | undefined {
    return this.attributes.dueDate;
  }

  isOverdue(): boolean {
    const dueDate = this.getDueDate();
    return dueDate ? dueDate < new Date() && !this.isCompleted() : false;
  }

  getBlockers(): string[] {
    return this.attributes.blockers || [];
  }

  isBlocked(): boolean {
    return this.getBlockers().length > 0;
  }
}
