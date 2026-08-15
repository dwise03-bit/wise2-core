import { Entity, EntityType } from './Entity';

export interface DeploymentAttributes {
  version?: string;
  environment?: 'dev' | 'staging' | 'production';
  status?: 'pending' | 'in-progress' | 'success' | 'failed';
  startTime?: Date;
  endTime?: Date;
  changes?: string[];
  rollback?: string;
  errorLog?: string;
}

export class Deployment extends Entity {
  declare attributes: DeploymentAttributes;

  constructor(name: string, attributes: DeploymentAttributes = {}) {
    super(name, EntityType.Deployment, undefined, attributes);
  }

  getVersion(): string | undefined {
    return this.attributes.version;
  }

  setVersion(version: string): void {
    this.update({ version });
  }

  getEnvironment(): string | undefined {
    return this.attributes.environment;
  }

  getStatus(): string | undefined {
    return this.attributes.status;
  }

  setStatus(status: DeploymentAttributes['status']): void {
    this.update({ status });
  }

  isSuccessful(): boolean {
    return this.getStatus() === 'success';
  }

  isFailed(): boolean {
    return this.getStatus() === 'failed';
  }

  getChanges(): string[] {
    return this.attributes.changes || [];
  }

  getErrorLog(): string | undefined {
    return this.attributes.errorLog;
  }

  setErrorLog(log: string): void {
    this.update({ errorLog: log });
  }
}
