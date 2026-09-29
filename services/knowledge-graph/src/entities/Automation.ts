import { Entity, EntityType } from './Entity';

export interface AutomationAttributes {
  type?: 'workflow' | 'schedule' | 'trigger' | 'rule';
  trigger?: string;
  actions?: string[];
  enabled?: boolean;
  lastRun?: Date;
  nextRun?: Date;
  successCount?: number;
  failureCount?: number;
  schedule?: string;
}

export class Automation extends Entity {
  declare attributes: AutomationAttributes;

  constructor(name: string, attributes: AutomationAttributes = {}) {
    super(name, EntityType.Automation, undefined, attributes);
  }

  getType(): string | undefined {
    return this.attributes.type;
  }

  setType(type: AutomationAttributes['type']): void {
    this.update({ type });
  }

  getTrigger(): string | undefined {
    return this.attributes.trigger;
  }

  getActions(): string[] {
    return this.attributes.actions || [];
  }

  addAction(action: string): void {
    const actions = this.getActions();
    this.update({ actions: [...actions, action] });
  }

  isEnabled(): boolean {
    return this.attributes.enabled !== false;
  }

  enable(): void {
    this.update({ enabled: true });
  }

  disable(): void {
    this.update({ enabled: false });
  }

  getLastRun(): Date | undefined {
    return this.attributes.lastRun;
  }

  getSuccessCount(): number {
    return this.attributes.successCount || 0;
  }

  getFailureCount(): number {
    return this.attributes.failureCount || 0;
  }

  getSchedule(): string | undefined {
    return this.attributes.schedule;
  }

  setSchedule(schedule: string): void {
    this.update({ schedule });
  }
}
