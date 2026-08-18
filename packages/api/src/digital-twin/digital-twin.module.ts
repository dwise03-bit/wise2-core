import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantGuard } from '../revenue-os/tenant/tenant.guard';
import { TenantService } from '../revenue-os/tenant/tenant.service';
import { DigitalTwinController } from './digital-twin.controller';
import { DigitalTwinService } from './digital-twin.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService, TenantService, TenantGuard],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
