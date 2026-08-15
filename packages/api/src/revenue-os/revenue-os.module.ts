import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TenantService } from './tenant/tenant.service';
import { TenantGuard } from './tenant/tenant.guard';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';

/**
 * WISE² Revenue OS.
 *
 * Turn leads into booked jobs: CAMPAIGN → LEAD → CONVERSATION → BOOKING →
 * ESTIMATE → SOLD JOB → REVENUE → REVIEW → MEMBERSHIP → REACTIVATION.
 *
 * Gated by REVENUE_OS_ENABLED globally and Tenant.revenueOsEnabled per
 * tenant, both enforced in TenantGuard. With the flag off, nothing in this
 * module is reachable and existing WISE² behaviour is unchanged.
 *
 * AuthModule is imported for the JWT strategy that JwtAuthGuard depends on.
 */
@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [LeadsController],
  providers: [TenantService, TenantGuard, LeadsService],
  exports: [TenantService, LeadsService],
})
export class RevenueOsModule {}
