import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CherryCountController, CherryCountPublicController } from './cherry-count.controller';
import { CherryCountService } from './cherry-count.service';
import { CherryCountTenantGuard } from './cherry-count-tenant.guard';
import { CherryCountAiService } from './cherry-count-ai.service';
import { CherryCountPhoneService } from './cherry-count-phone.service';
import { CherryCountSeedService } from './cherry-count-seed.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CherryCountController, CherryCountPublicController],
  providers: [
    CherryCountService,
    CherryCountTenantGuard,
    CherryCountAiService,
    CherryCountPhoneService,
    CherryCountSeedService,
  ],
  exports: [CherryCountService],
})
export class CherryCountModule {}
