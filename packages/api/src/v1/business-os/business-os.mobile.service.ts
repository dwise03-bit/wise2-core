import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { HermesService } from '../../hermes/hermes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { ProspectsService } from '../prospects/prospects.service';
import { BusinessOsControlBridgeClient } from './business-os-control-bridge.client';
import { BusinessOsLeadClaimStore } from './business-os-lead-claim.store';
import { BusinessOsService } from './business-os.service';
import {
  BLOCKED_COMMAND_CAPABILITIES,
  BusinessOperationDto,
} from './business-os.types';
import {
  MobileAgentJobDto,
  MobileBusinessCapabilitiesDto,
  MobileBusinessCustomerDto,
  MobileBusinessJobDto,
  MobileBusinessLeadDto,
  MobileBusinessOpportunityDto,
  MobileBusinessProjectDto,
  MobileCloudHealthDto,
  MobileCloudInventoryDto,
  MobileCloudOperationRequestDto,
  MobileCloudOperationResultDto,
  MobileConversationDto,
  MobileFinanceSummaryDto,
  MobileHvacDraftDto,
  MobileHvacJobDto,
  MobileLeadClaimResultDto,
  MobileStudioSummaryDto,
  PROSPECT_TO_MOBILE_STAGE,
  MobileCrmStage,
} from './business-os.mobile.types';

const TRADING_ROLES = new Set(['FOUNDER', 'ADMIN', 'TRADER']);
const CLOUD_ROLES = new Set(['FOUNDER', 'ADMIN', 'OPERATOR']);

@Injectable()
export class BusinessOsMobileService {
  private readonly hvacDrafts = new Map<string, MobileHvacDraftDto>();

  constructor(
    private readonly core: BusinessOsService,
    @Optional() private readonly prospects?: ProspectsService,
    @Optional() private readonly customers?: CustomersService,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly hermes?: HermesService,
    @Optional() private readonly leadClaimStore?: BusinessOsLeadClaimStore,
    @Optional() private readonly controlBridge?: BusinessOsControlBridgeClient,
  ) {}

  getMobileCapabilities(user?: { role?: string }): MobileBusinessCapabilitiesDto {
    const role = (user?.role ?? '').toUpperCase();
    return {
      trading: TRADING_ROLES.has(role),
      cloud: CLOUD_ROLES.has(role) && Boolean(process.env.CONTROL_BRIDGE_URL),
      hvac: true,
    };
  }

  async getMobileLeads(stage?: MobileCrmStage): Promise<MobileBusinessLeadDto[]> {
    if (!this.prospects) return [];
    const { prospects } = await this.prospects.getProspects({ limit: 100 });
    const leads: MobileBusinessLeadDto[] = [];

    for (const prospect of prospects) {
      const mappedStage = PROSPECT_TO_MOBILE_STAGE[prospect.status] ?? 'lead';
      if (stage && mappedStage !== stage) continue;
      const claim = this.leadClaimStore ? await this.leadClaimStore.get(prospect.id) : undefined;
      leads.push({
        id: prospect.id,
        businessName: prospect.businessName,
        contactName: prospect.contactName,
        email: prospect.email,
        phone: prospect.phone ?? null,
        stage: mappedStage,
        estimatedOpportunity: prospect.estimatedOpportunity,
        claimedBy: claim?.claimedBy ?? null,
        claimedAt: claim?.claimedAt.toISOString() ?? null,
        source: 'prospect',
      });
    }

    return leads;
  }

  async getMobileOpportunities(): Promise<MobileBusinessOpportunityDto[]> {
    const leads = await this.getMobileLeads();
    return leads
      .filter((lead) => ['qualified', 'proposal', 'won'].includes(lead.stage))
      .map((lead) => ({
        id: `opp-${lead.id}`,
        title: lead.businessName,
        amount: lead.estimatedOpportunity,
        stage: lead.stage,
      }));
  }

  async claimMobileLead(leadId: string, userId: string): Promise<MobileLeadClaimResultDto> {
    if (this.prospects) {
      const prospect = await this.prospects.getProspect(leadId);
      if (!prospect) throw new NotFoundException(`Lead ${leadId} not found`);
    }

    if (!this.leadClaimStore) {
      throw new BadRequestException('Lead claim store unavailable');
    }

    const existing = await this.leadClaimStore.get(leadId);
    const record = await this.leadClaimStore.tryClaim(leadId, userId);
    if (!record) {
      throw new ConflictException({
        message: 'Lead already claimed',
        claimedBy: existing?.claimedBy,
        claimedAt: existing?.claimedAt.toISOString(),
      });
    }

    return {
      leadId,
      claimedBy: userId,
      claimedAt: record.claimedAt.toISOString(),
      status: existing?.claimedBy === userId ? 'already_claimed' : 'claimed',
    };
  }

  async getMobileCustomers(): Promise<MobileBusinessCustomerDto[]> {
    const result = await this.core.getCustomers({ limit: 100 });
    return result.customers.map((c) => ({
      id: c.id,
      businessName: c.businessName,
      contactName: c.contactName,
      mrr: c.mrr,
      status: c.status,
    }));
  }

  async getMobileProjects(userId: string): Promise<MobileBusinessProjectDto[]> {
    if (!this.prisma) return [];
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    return projects.map((p) => ({ id: p.id, title: p.title, status: p.status }));
  }

  async getMobileJobs(): Promise<MobileBusinessJobDto[]> {
    if (!this.prisma) return [];
    const jobs = await this.prisma.serviceJob.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    return jobs.map((job) => ({
      id: job.id,
      title: job.serviceType ?? 'Service job',
      status: job.status,
    }));
  }

  async getMobileAgentJobs(userId: string, status?: string): Promise<MobileAgentJobDto[]> {
    if (!this.hermes) return [];
    const actions = await this.hermes.listActions(userId, status as any);
    return actions.map((action) => ({
      id: action.id,
      summary: action.summary ?? action.title,
      role: action.kind,
      status: action.status,
      requiresApproval: action.requiresApproval,
    }));
  }

  async approveMobileAgentJob(
    userId: string,
    jobId: string,
  ): Promise<BusinessOperationDto<MobileAgentJobDto>> {
    if (!this.hermes) throw new BadRequestException('Agent provider unavailable');
    const action = await this.hermes.approveAction(userId, jobId, {});
    const result: MobileAgentJobDto = {
      id: action.id,
      summary: action.summary ?? action.title,
      role: action.kind,
      status: action.status,
      requiresApproval: action.requiresApproval,
    };
    return {
      operationId: `agent-approve-${jobId}`,
      status: 'completed',
      message: 'Agent job approved',
      auditEventId: `audit-${jobId}`,
      result,
    };
  }

  async rejectMobileAgentJob(
    userId: string,
    jobId: string,
    note?: string,
  ): Promise<BusinessOperationDto<MobileAgentJobDto>> {
    if (!this.hermes) throw new BadRequestException('Agent provider unavailable');
    const action = await this.hermes.rejectAction(userId, jobId, { note });
    const result: MobileAgentJobDto = {
      id: action.id,
      summary: action.summary ?? action.title,
      role: action.kind,
      status: action.status,
      requiresApproval: action.requiresApproval,
    };
    return {
      operationId: `agent-reject-${jobId}`,
      status: 'completed',
      message: 'Agent job rejected',
      auditEventId: `audit-${jobId}`,
      result,
    };
  }

  getMobileConversations(): MobileConversationDto[] {
    return [];
  }

  async getMobileCloudInventory(): Promise<MobileCloudInventoryDto> {
    const inventory = await this.core.getInventory();
    const configured = Boolean(process.env.CONTROL_BRIDGE_URL);
    return {
      apps: inventory.services.map((s) => s.name),
      services: inventory.services.map((s) => s.status),
      controlBridgeConfigured: configured,
    };
  }

  async getMobileCloudHealth(): Promise<MobileCloudHealthDto> {
    const health = await this.core.getCloudHealth();
    return {
      status: health.status,
      components: [{ name: 'control-bridge', status: health.status }],
    };
  }

  async submitMobileCloudOperation(
    user: { id: string; role?: string },
    body: MobileCloudOperationRequestDto,
  ): Promise<BusinessOperationDto<MobileCloudOperationResultDto>> {
    for (const blocked of BLOCKED_COMMAND_CAPABILITIES) {
      if (body.operation.toLowerCase().includes(blocked)) {
        throw new BadRequestException(`Blocked capability: ${blocked}`);
      }
    }

    const role = (user.role ?? '').toUpperCase();
    if (!CLOUD_ROLES.has(role)) {
      throw new ForbiddenException('Cloud operations not authorized for this user');
    }

    const target = body.target ?? 'wise2-api';
    let status = 'queued';
    let message = `${body.operation} queued`;

    switch (body.operation) {
      case 'healthCheck':
        await this.core.getCloudHealth();
        status = 'completed';
        message = 'Health check completed';
        break;
      case 'deploy':
        await this.core.deploy({ service: target });
        break;
      case 'restart':
        await this.core.restart({ service: target });
        break;
      case 'rollback':
        await this.core.rollback({ service: target });
        break;
      default:
        throw new BadRequestException(`Unsupported cloud operation: ${body.operation}`);
    }

    return {
      operationId: `cloud-${Date.now()}`,
      status,
      message,
      auditEventId: `audit-cloud-${Date.now()}`,
      result: { operation: body.operation, target: body.target ?? null },
    };
  }

  async getMobileHvacJobs(): Promise<MobileHvacJobDto[]> {
    if (!this.prisma) return [];
    const orders = await this.prisma.workOrder.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { customer: true, technician: true },
    });
    return orders.map((order) => ({
      id: order.id,
      customerName: order.customer?.businessName ?? 'Unknown',
      status: order.status,
      technician: order.technician
        ? `${order.technician.firstName} ${order.technician.lastName}`.trim()
        : null,
    }));
  }

  listMobileHvacDrafts(userId: string): MobileHvacDraftDto[] {
    return [...this.hvacDrafts.values()].filter((draft) => draft.id.startsWith(userId));
  }

  saveMobileHvacDraft(
    userId: string,
    draft: { idempotencyKey: string; customerId?: string; notes: string },
  ): MobileHvacDraftDto {
    const existing = [...this.hvacDrafts.values()].find(
      (item) => item.idempotencyKey === draft.idempotencyKey,
    );
    if (existing) return existing;

    const record: MobileHvacDraftDto = {
      id: `${userId}-${Date.now()}`,
      idempotencyKey: draft.idempotencyKey,
      customerId: draft.customerId ?? null,
      notes: draft.notes,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    this.hvacDrafts.set(record.id, record);
    return record;
  }

  async getMobileStudioSummary(): Promise<MobileStudioSummaryDto> {
    if (!this.prisma) {
      return { campaigns: 0, attributedLeads: 0, attributedRevenue: 0, providerAvailable: false };
    }
    try {
      const [campaigns, leads] = await Promise.all([
        this.prisma.campaign.count(),
        this.prisma.lead.count(),
      ]);
      return {
        campaigns,
        attributedLeads: leads,
        attributedRevenue: 0,
        providerAvailable: true,
      };
    } catch {
      return { campaigns: 0, attributedLeads: 0, attributedRevenue: 0, providerAvailable: false };
    }
  }

  async getMobileFinanceSummary(): Promise<MobileFinanceSummaryDto> {
    const finance = await this.core.getFinanceSnapshot();
    return {
      revenueToday: finance.revenueToday,
      revenueMonth: finance.revenueMonth,
      unpaidInvoiceCount: finance.unpaidInvoiceCount,
      providerAvailable: Boolean(this.customers),
      message: this.customers ? null : 'Accounting provider not configured; metrics default to zero.',
    };
  }
}
