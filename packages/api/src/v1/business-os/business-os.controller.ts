import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Optional,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsString, MinLength, IsOptional, IsInt, Min, Max, IsBoolean, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { AiPhoneService } from '../../ai-phone/ai-phone.service';
import { BusinessOsService } from './business-os.service';
import { BusinessOsMobileService } from './business-os.mobile.service';
import type { CloudDeployDto, CloudRestartDto, CloudRollbackDto } from './business-os.types';
import type { MobileCrmStage } from './business-os.mobile.types';

class SubmitCommandDto {
  @IsString()
  @MinLength(1)
  text!: string;
}

class LeadQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

class CustomerQueryDto extends LeadQueryDto {}

class ClaimLeadDto {
  @IsString()
  @MinLength(1)
  userId!: string;
}

class DeployDto implements CloudDeployDto {
  @IsString()
  @MinLength(1)
  service!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}

class RestartDto implements CloudRestartDto {
  @IsString()
  @MinLength(1)
  service!: string;
}

class RollbackDto implements CloudRollbackDto {
  @IsString()
  @MinLength(1)
  service!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  steps?: number;

  @IsOptional()
  @IsString()
  toTag?: string;
}

class HvacDraftBodyDto {
  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  notes!: string;
}

class MobileCloudOperationDto {
  @IsString()
  operation!: string;

  @IsOptional()
  @IsString()
  target?: string;
}

class AgentDecisionDto {
  @IsOptional()
  @IsString()
  note?: string;
}

class UpdatePhoneConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  greeting?: string;

  @IsOptional()
  @IsString()
  afterHoursMessage?: string;

  @IsOptional()
  @IsObject()
  businessHours?: Record<string, { open?: string; close?: string; closed?: boolean }>;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  transferNumber?: string;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  voicemailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @IsOptional()
  @IsString()
  aiPersona?: string;
}

class SimulatePhoneDto {
  @IsOptional()
  @IsString()
  fromNumber?: string;

  @IsArray()
  @IsString({ each: true })
  messages!: string[];
}

@Controller('v1/business-os')
@UseGuards(JwtAuthGuard)
export class BusinessOsController {
  constructor(
    private readonly businessOsService: BusinessOsService,
    private readonly mobileService: BusinessOsMobileService,
    @Optional() private readonly aiPhone?: AiPhoneService,
  ) {}

  @Get('dashboard')
  @HttpCode(200)
  getDashboard() {
    return this.businessOsService.getDashboard();
  }

  @Post('command')
  @HttpCode(200)
  submitCommand(@Body() body: SubmitCommandDto) {
    return this.businessOsService.submitCommand(body.text ?? '');
  }

  /** iOS mobile capability gate */
  @Get('capabilities')
  @HttpCode(200)
  getMobileCapabilities(@Req() req: { user: { role?: string } }) {
    return this.mobileService.getMobileCapabilities(req.user);
  }

  /** Admin capability matrix */
  @Get('capabilities/matrix')
  @HttpCode(200)
  getCapabilityMatrix() {
    return this.businessOsService.getCapabilities();
  }

  @Get('crm/pipeline')
  @HttpCode(200)
  getPipeline() {
    return this.businessOsService.getPipeline();
  }

  /** iOS: flat lead array with CRM stages */
  @Get('crm/leads')
  @HttpCode(200)
  getMobileLeads(@Query('stage') stage?: MobileCrmStage) {
    return this.mobileService.getMobileLeads(stage);
  }

  /** Admin: paginated lead list */
  @Get('crm/leads/admin')
  @HttpCode(200)
  getAdminLeads(@Query() query: LeadQueryDto) {
    return this.businessOsService.getLeads(query);
  }

  @Get('crm/opportunities')
  @HttpCode(200)
  getMobileOpportunities() {
    return this.mobileService.getMobileOpportunities();
  }

  /** iOS: claim via JWT subject (no userId in body) */
  @Post('crm/leads/:leadId/claim')
  @HttpCode(200)
  claimMobileLead(@Param('leadId') leadId: string, @Req() req: { user: { id: string } }) {
    return this.mobileService.claimMobileLead(leadId, req.user.id);
  }

  /** Admin: claim with explicit userId */
  @Post('crm/leads/:leadId/claim/admin')
  @HttpCode(200)
  async claimLeadAdmin(@Param('leadId') leadId: string, @Body() body: ClaimLeadDto) {
    const result = await this.businessOsService.claimLead(leadId, body.userId);
    if (!result) {
      throw new HttpException('Lead already claimed or claim store unavailable', HttpStatus.CONFLICT);
    }
    return result;
  }

  /** iOS clients module */
  @Get('clients')
  @HttpCode(200)
  getMobileClients() {
    return this.mobileService.getMobileCustomers();
  }

  @Get('customers')
  @HttpCode(200)
  getCustomers(@Query() query: CustomerQueryDto) {
    return this.businessOsService.getCustomers(query);
  }

  @Get('customers/stats')
  @HttpCode(200)
  getCustomerStats() {
    return this.businessOsService.getCustomerStats();
  }

  @Get('work/projects')
  @HttpCode(200)
  getMobileProjects(@Req() req: { user: { id: string } }) {
    return this.mobileService.getMobileProjects(req.user.id);
  }

  @Get('work/jobs')
  @HttpCode(200)
  getMobileJobs() {
    return this.mobileService.getMobileJobs();
  }

  @Get('ai/jobs')
  @HttpCode(200)
  getMobileAgentJobs(@Req() req: { user: { id: string } }, @Query('status') status?: string) {
    return this.mobileService.getMobileAgentJobs(req.user.id, status);
  }

  @Post('ai/jobs/:id/approve')
  @HttpCode(200)
  approveMobileAgentJob(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.mobileService.approveMobileAgentJob(req.user.id, id);
  }

  @Post('ai/jobs/:id/reject')
  @HttpCode(200)
  rejectMobileAgentJob(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body() body: AgentDecisionDto,
  ) {
    return this.mobileService.rejectMobileAgentJob(req.user.id, id, body.note);
  }

  @Get('comms/conversations')
  @HttpCode(200)
  async getMobileConversations(@Req() req: { user: { id: string } }) {
    return this.mobileService.getMobileConversations(req.user.id);
  }

  @Get('phone')
  @HttpCode(200)
  async getPhoneDashboard(
    @Req() req: { user: { id: string } },
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = await this.requirePhoneTenant(req.user.id, tenantHeader);
    return this.aiPhone!.getDashboard(tenantId);
  }

  @Patch('phone')
  @HttpCode(200)
  async updatePhoneConfig(
    @Req() req: { user: { id: string; role?: string } },
    @Body() body: UpdatePhoneConfigDto,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = await this.requirePhoneTenant(req.user.id, tenantHeader);
    const role = (await this.aiPhone!.membershipRole(req.user.id, tenantId)) ?? req.user.role;
    return this.aiPhone!.updateConfig(tenantId, role, body);
  }

  @Post('phone/simulate')
  @HttpCode(200)
  async simulatePhoneCall(
    @Req() req: { user: { id: string } },
    @Body() body: SimulatePhoneDto,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = await this.requirePhoneTenant(req.user.id, tenantHeader);
    return this.aiPhone!.simulate(tenantId, body);
  }

  @Get('cloud/health')
  @HttpCode(200)
  getMobileCloudHealth() {
    return this.mobileService.getMobileCloudHealth();
  }

  @Get('cloud/inventory')
  @HttpCode(200)
  getMobileCloudInventory() {
    return this.mobileService.getMobileCloudInventory();
  }

  @Post('cloud/operations')
  @HttpCode(200)
  submitMobileCloudOperation(
    @Req() req: { user: { id: string; role?: string } },
    @Body() body: MobileCloudOperationDto,
  ) {
    return this.mobileService.submitMobileCloudOperation(req.user, body);
  }

  @Post('cloud/deploy')
  @HttpCode(200)
  deploy(@Body() body: DeployDto) {
    return this.businessOsService.deploy(body);
  }

  @Post('cloud/restart')
  @HttpCode(200)
  restart(@Body() body: RestartDto) {
    return this.businessOsService.restart(body);
  }

  @Post('cloud/rollback')
  @HttpCode(200)
  rollback(@Body() body: RollbackDto) {
    return this.businessOsService.rollback(body);
  }

  @Get('hvac/jobs')
  @HttpCode(200)
  getMobileHvacJobs() {
    return this.mobileService.getMobileHvacJobs();
  }

  @Get('hvac/drafts')
  @HttpCode(200)
  listMobileHvacDrafts(@Req() req: { user: { id: string } }) {
    return this.mobileService.listMobileHvacDrafts(req.user.id);
  }

  @Post('hvac/drafts')
  @HttpCode(200)
  saveMobileHvacDraft(@Req() req: { user: { id: string } }, @Body() body: HvacDraftBodyDto) {
    return this.mobileService.saveMobileHvacDraft(req.user.id, body);
  }

  @Get('studio/summary')
  @HttpCode(200)
  getMobileStudioSummary() {
    return this.mobileService.getMobileStudioSummary();
  }

  @Get('finance/summary')
  @HttpCode(200)
  getMobileFinanceSummary() {
    return this.mobileService.getMobileFinanceSummary();
  }

  @Get('finance')
  @HttpCode(200)
  getFinanceSnapshot() {
    return this.businessOsService.getFinanceSnapshot();
  }

  private async requirePhoneTenant(userId: string, tenantHeader?: string): Promise<string> {
    if (!this.aiPhone) {
      throw new ForbiddenException('AI Phone is not available');
    }
    const tenantId = await this.aiPhone.resolveTenantId(userId, tenantHeader);
    if (!tenantId) {
      throw new ForbiddenException('No active workspace is available for AI Phone');
    }
    return tenantId;
  }
}
