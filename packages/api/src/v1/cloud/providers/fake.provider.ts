import {
  HostingProvider,
  ProvisionInput,
  ProvisionResult,
  ProviderServiceStatus,
  ProviderStatus,
  TwentyIPackageType,
} from './hosting-provider.interface';

export class FakeProvider implements HostingProvider {
  private readonly services = new Map<string, ProviderStatus>();
  private readonly idempotency = new Map<string, string>();

  async listPackageTypes(): Promise<TwentyIPackageType[]> {
    return [
      { id: 1, label: 'Starter' },
      { id: 2, label: 'Business' },
      { id: 3, label: 'Pro' },
    ];
  }

  async provision(input: ProvisionInput): Promise<ProvisionResult> {
    const existing = this.idempotency.get(input.idempotencyKey);
    if (existing) {
      const status = this.services.get(existing);
      if (!status) {
        throw new Error(`Missing fake service for ${existing}`);
      }
      return {
        externalId: existing,
        domainName: status.domainName ?? input.domainName,
        status: status.status,
      };
    }

    const externalId = `fake-${this.services.size + 1}`;
    this.idempotency.set(input.idempotencyKey, externalId);
    this.services.set(externalId, {
      externalId,
      domainName: input.domainName,
      status: 'active',
    });

    return {
      externalId,
      domainName: input.domainName,
      status: 'active',
    };
  }

  async suspend(externalId: string): Promise<void> {
    this.setStatus(externalId, 'suspended');
  }

  async unsuspend(externalId: string): Promise<void> {
    this.setStatus(externalId, 'active');
  }

  async terminate(externalId: string): Promise<void> {
    this.setStatus(externalId, 'terminated');
  }

  async getStatus(externalId: string): Promise<ProviderStatus> {
    const status = this.services.get(externalId);
    if (!status) {
      throw new Error(`Unknown fake service ${externalId}`);
    }
    return status;
  }

  private setStatus(externalId: string, status: ProviderServiceStatus): void {
    const current = this.services.get(externalId);
    if (!current) {
      throw new Error(`Unknown fake service ${externalId}`);
    }
    this.services.set(externalId, { ...current, status });
  }
}
