import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { HermesModule } from '../../hermes/hermes.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiPhoneModule } from '../../ai-phone/ai-phone.module';
import { CustomersModule } from '../customers/customers.module';
import { ProspectsModule } from '../prospects/prospects.module';
import { BusinessOsControlBridgeClient } from './business-os-control-bridge.client';
import { BusinessOsController } from './business-os.controller';
import { BusinessOsLeadClaimStore } from './business-os-lead-claim.store';
import { BusinessOsMobileService } from './business-os.mobile.service';
import { BusinessOsService } from './business-os.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ProspectsModule,
    CustomersModule,
    HermesModule,
    AiPhoneModule,
  ],
  controllers: [BusinessOsController],
  providers: [
    BusinessOsService,
    BusinessOsMobileService,
    BusinessOsLeadClaimStore,
    BusinessOsControlBridgeClient,
  ],
  exports: [BusinessOsService],
})
export class BusinessOsModule {}
