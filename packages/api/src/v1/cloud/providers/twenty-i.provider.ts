import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwentyIClient } from './twenty-i.client';
import {
  HostingProvider,
  ProvisionInput,
  ProvisionResult,
  ProviderServiceStatus,
  ProviderStatus,
  TwentyIPackageType,
} from './hosting-provider.interface';

interface TwentyIPackageResponse {
  id?: number | string;
  names?: string[];
  disabled?: boolean;
  status?: string;
}

interface TwentyIProvisionResponse {
  result?: number | string;
}

@Injectable()
export class TwentyIProvider implements HostingProvider {
  private readonly logger = new Logger(TwentyIProvider.name);
  private readonly client: TwentyIClient | null;
  private readonly provisionedByKey = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('TWENTYI_API_KEY')?.trim() ?? '';
    if (!apiKey) {
      this.logger.warn('TWENTYI_API_KEY not set — 20i cloud provisioning disabled');
      this.client = null;
      return;
    }

    this.client = new TwentyIClient({
      apiKey,
      baseUrl: this.configService.get<string>('TWENTYI_API_BASE_URL'),
    });
  }

  private requireClient(): TwentyIClient {
    if (!this.client) {
      throw new Error('20i cloud provider is not configured (TWENTYI_API_KEY missing)');
    }
    return this.client;
  }

  async listPackageTypes(): Promise<TwentyIPackageType[]> {
    const response = await this.requireClient().get<TwentyIPackageType[]>('/reseller/*/packageTypes');
    return Array.isArray(response) ? response : [];
  }

  async provision(input: ProvisionInput): Promise<ProvisionResult> {
    const existingId = this.provisionedByKey.get(input.idempotencyKey);
    if (existingId) {
      return this.toProvisionResult(existingId, input.domainName, await this.getStatus(existingId));
    }

    const body: Record<string, unknown> = {
      type: input.packageTypeId,
      domain_name: input.domainName,
    };

    if (input.label) {
      body.label = input.label;
    }

    if (input.stackUserRef) {
      body.stackUser = input.stackUserRef;
    }

    const response = await this.requireClient().post<TwentyIProvisionResponse>('/reseller/*/addWeb', body);
    const externalId = String(response?.result ?? '');
    if (!externalId) {
      throw new Error('20i provision response did not include a package id');
    }

    this.provisionedByKey.set(input.idempotencyKey, externalId);
    this.logger.log(`Provisioned 20i package ${externalId} for ${input.domainName}`);

    return {
      externalId,
      domainName: input.domainName,
      status: 'active',
      metadata: {
        packageTypeId: input.packageTypeId,
      },
    };
  }

  async suspend(externalId: string): Promise<void> {
    await this.requireClient().post(`/package/${externalId}/userStatus`, {
      subservices: { default: false },
    });
  }

  async unsuspend(externalId: string): Promise<void> {
    await this.requireClient().post(`/package/${externalId}/userStatus`, {
      subservices: { default: true },
    });
  }

  async terminate(externalId: string): Promise<void> {
    await this.requireClient().post('/reseller/*/deleteWeb', {
      'delete-id': [externalId],
    });
  }

  async getStatus(externalId: string): Promise<ProviderStatus> {
    const info = await this.requireClient().get<TwentyIPackageResponse>(`/package/${externalId}`);
    return {
      externalId,
      domainName: info.names?.[0],
      status: mapPackageStatus(info),
      raw: info as Record<string, unknown>,
    };
  }

  private toProvisionResult(
    externalId: string,
    domainName: string,
    status: ProviderStatus,
  ): ProvisionResult {
    return {
      externalId,
      domainName: status.domainName ?? domainName,
      status: status.status,
    };
  }
}

function mapPackageStatus(info: TwentyIPackageResponse): ProviderServiceStatus {
  if (info.disabled === true) {
    return 'suspended';
  }

  const status = String(info.status ?? '').toLowerCase();
  if (status.includes('suspend') || status.includes('disable')) {
    return 'suspended';
  }
  if (status.includes('terminat') || status.includes('delet')) {
    return 'terminated';
  }
  if (status.includes('pending')) {
    return 'pending';
  }

  return 'active';
}
