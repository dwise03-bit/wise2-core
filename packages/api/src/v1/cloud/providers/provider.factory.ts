import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FakeProvider } from './fake.provider';
import { HostingProvider } from './hosting-provider.interface';
import { TwentyIProvider } from './twenty-i.provider';

@Injectable()
export class CloudProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly twentyIProvider: TwentyIProvider,
  ) {}

  getProvider(): HostingProvider {
    const provider = (this.configService.get<string>('CLOUD_HOSTING_PROVIDER') ?? 'twentyi').toLowerCase();
    if (provider === 'fake') {
      return new FakeProvider();
    }
    return this.twentyIProvider;
  }
}
