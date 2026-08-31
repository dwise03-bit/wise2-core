import { Module } from '@nestjs/common';
import { EmailModule } from '../../email/email.module';
import { CloudBillingService } from './cloud-billing.service';
import { CloudController } from './cloud.controller';
import { CloudOrderStore } from './cloud-order.store';
import { CloudProvisioningService } from './cloud-provisioning.service';
import { CloudService } from './cloud.service';
import { CloudStripeEventStore } from './cloud-stripe-event.store';
import { CloudStripeService } from './cloud-stripe.service';
import { CloudProviderFactory } from './providers/provider.factory';
import { TwentyIProvider } from './providers/twenty-i.provider';

@Module({
  imports: [EmailModule],
  controllers: [CloudController],
  providers: [
    CloudService,
    CloudBillingService,
    CloudProvisioningService,
    CloudOrderStore,
    CloudStripeService,
    CloudStripeEventStore,
    CloudProviderFactory,
    TwentyIProvider,
  ],
  exports: [
    CloudService,
    CloudBillingService,
    CloudProvisioningService,
    CloudOrderStore,
    CloudStripeService,
    CloudStripeEventStore,
    CloudProviderFactory,
    TwentyIProvider,
  ],
})
export class CloudModule {}
