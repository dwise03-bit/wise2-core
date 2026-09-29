export type ProviderServiceStatus = 'pending' | 'active' | 'suspended' | 'terminated' | 'unknown';

export interface ProvisionInput {
  idempotencyKey: string;
  packageTypeId: string;
  domainName: string;
  label?: string;
  customerEmail?: string;
  stackUserRef?: string;
}

export interface ProvisionResult {
  externalId: string;
  domainName: string;
  status: ProviderServiceStatus;
  metadata?: Record<string, unknown>;
}

export interface ProviderStatus {
  externalId: string;
  domainName?: string;
  status: ProviderServiceStatus;
  raw?: Record<string, unknown>;
}

export interface HostingProvider {
  provision(input: ProvisionInput): Promise<ProvisionResult>;
  suspend(externalId: string): Promise<void>;
  unsuspend(externalId: string): Promise<void>;
  terminate(externalId: string): Promise<void>;
  getStatus(externalId: string): Promise<ProviderStatus>;
  listPackageTypes(): Promise<TwentyIPackageType[]>;
}

export interface TwentyIPackageType {
  id: number;
  label?: string;
  name?: string;
}
