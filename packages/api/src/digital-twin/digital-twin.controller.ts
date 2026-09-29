import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DigitalTwinService } from './digital-twin.service';
import { TenantGuard } from '../revenue-os/tenant/tenant.guard';
import { Tenant } from '../revenue-os/tenant/tenant.decorator';
import { TenantContext } from '../revenue-os/tenant/tenant-context';

@Controller('v1/digital-twins')
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Post('intake')
  async submitIntake(
    @Body()
    body: {
      packageId?: string;
      businessName: string;
      owner?: string;
      website?: string;
      industry?: string;
      tone?: string;
      phrases?: string;
      services?: string;
      faqs?: string;
      salesRules?: string;
      escalationContact?: string;
      voiceConsent?: boolean;
      videoConsent?: boolean;
      email?: string;
    },
  ) {
    return this.digitalTwinService.submitPublicIntake(body);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async upsertForTenant(
    @Tenant() tenant: TenantContext,
    @Body()
    body: {
      packageId?: string;
      businessName: string;
      owner?: string;
      website?: string;
      industry?: string;
      tone?: string;
      phrases?: string;
      services?: string;
      faqs?: string;
      salesRules?: string;
      escalationContact?: string;
      voiceConsent?: boolean;
      videoConsent?: boolean;
    },
  ) {
    return this.digitalTwinService.upsertTenantTwin(tenant, body);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getSummary(@Tenant() tenant: TenantContext) {
    return this.digitalTwinService.getSummary(tenant);
  }
}
