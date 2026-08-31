import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HermesService } from '../../hermes/hermes.service';
import { ProspectsService } from '../prospects/prospects.service';
import { CustomersService } from '../customers/customers.service';
import { BusinessOsControlBridgeClient } from './business-os-control-bridge.client';
import { BusinessOsLeadClaimStore } from './business-os-lead-claim.store';
import {
  ALLOWED_COMMAND_INTENTS,
  BLOCKED_COMMAND_CAPABILITIES,
  AllowedCommandIntent,
  BusinessDashboardDto,
  BusinessOperationDto,
  CapabilityMatrixDto,
  CloudDeployDto,
  CloudHealthDto,
  CloudInventoryDto,
  CloudOperationResultDto,
  CloudRestartDto,
  CloudRollbackDto,
  CommandResultDto,
  CrmPipelineDto,
  CustomerListDto,
  CustomerStatsDto,
  FinanceSnapshotDto,
  LeadClaimDto,
  LeadDto,
  LeadListDto,
} from './business-os.types';

@Injectable()
export class BusinessOsService {
  private static opCounter = 0;

  constructor(
    @Optional() private readonly prospects?: ProspectsService,
    @Optional() private readonly customers?: CustomersService,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly hermes?: HermesService,
    @Optional() private readonly leadClaimStore?: BusinessOsLeadClaimStore,
    @Optional() private readonly controlBridge?: BusinessOsControlBridgeClient,
  ) {}

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(): Promise<BusinessDashboardDto> {
    const [hotLeadCount, customerStats] = await Promise.all([
      this.getHotLeadCount(),
      this.getCustomerStats().catch(() => null),
    ]);

    return {
      revenueToday: 0,
      revenueMonth: customerStats?.totalMrr ?? 0,
      hotLeadCount,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    };
  }

  // ─── Commands ───────────────────────────────────────────────────────────────

  submitCommand(text: string): BusinessOperationDto<CommandResultDto> {
    const normalized = text.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Command text is required');
    }

    for (const blocked of BLOCKED_COMMAND_CAPABILITIES) {
      if (normalized.includes(blocked)) {
        throw new BadRequestException(`Blocked capability: ${blocked}`);
      }
    }

    const intent = this.resolveIntent(normalized);
    if (!intent) {
      throw new BadRequestException('Unknown or unsupported command');
    }

    return {
      operationId: `business-os-${Date.now()}-${++BusinessOsService.opCounter}`,
      status: 'completed',
      message: 'Command accepted',
      auditEventId: null,
      result: this.buildCommandResult(intent),
    };
  }

  // ─── CRM / Leads ────────────────────────────────────────────────────────────

  async getPipeline(): Promise<CrmPipelineDto> {
    if (!this.prospects) {
      return { stages: [], totalCount: 0, totalValue: 0, wonValue: 0, conversionRate: 0 };
    }

    const stats = await this.prospects.getPipelineStats();
    const stages = Object.entries(stats.byStatus).map(([name, count]) => ({
      name: name as any,
      count: count as number,
      totalValue: 0,
    }));

    return {
      stages,
      totalCount: stats.totalProspects,
      totalValue: stats.totalOpportunity,
      wonValue: stats.wonOpportunity,
      conversionRate: stats.conversionRate,
    };
  }

  async getLeads(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<LeadListDto> {
    if (!this.prospects) {
      return { leads: [], total: 0, limit: filters?.limit ?? 50, offset: filters?.offset ?? 0 };
    }

    const result = await this.prospects.getProspects(filters);
    const leads: LeadDto[] = result.prospects.map((p: any) => ({
      id: p.id,
      businessName: p.businessName,
      contactName: p.contactName,
      email: p.email,
      status: p.status,
      estimatedValue: p.estimatedOpportunity,
      leadSource: p.leadSource,
      claimedBy: null,
      createdAt: p.createdAt?.toISOString?.() ?? '',
    }));

    return { leads, total: result.total, limit: result.limit, offset: result.offset };
  }

  async claimLead(leadId: string, userId: string): Promise<LeadClaimDto | null> {
    if (!this.leadClaimStore) {
      return null;
    }
    const record = await this.leadClaimStore.tryClaim(leadId, userId);
    if (!record) return null;
    return {
      leadId: record.leadId,
      claimedBy: record.claimedBy,
      claimedAt: record.claimedAt.toISOString(),
    };
  }

  // ─── Customers ──────────────────────────────────────────────────────────────

  async getCustomers(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<CustomerListDto> {
    if (!this.customers) {
      return { customers: [], total: 0, limit: filters?.limit ?? 50, offset: filters?.offset ?? 0 };
    }

    const result = await this.customers.findAll(filters);
    const mapped = result.customers.map((c: any) => ({
      id: c.id,
      businessName: c.businessName,
      contactName: c.contactName,
      email: c.email,
      status: c.status,
      mrr: c.mrr,
      industry: c.industry ?? null,
      createdAt: c.createdAt?.toISOString?.() ?? '',
    }));

    return { customers: mapped, total: result.total, limit: result.limit, offset: result.offset };
  }

  async getCustomerStats(): Promise<CustomerStatsDto | null> {
    if (!this.customers) return null;
    return this.customers.getStats();
  }

  // ─── Finance ────────────────────────────────────────────────────────────────

  async getFinanceSnapshot(): Promise<FinanceSnapshotDto> {
    const stats = await this.getCustomerStats();
    return {
      revenueToday: 0,
      revenueMonth: stats?.totalMrr ?? 0,
      totalMrr: stats?.totalMrr ?? 0,
      unpaidInvoices: 0,
      unpaidInvoiceCount: 0,
      activeCustomers: stats?.active ?? 0,
      projectedMonthRevenue: stats?.totalMrr ?? 0,
    };
  }

  // ─── Cloud ──────────────────────────────────────────────────────────────────

  async getCloudHealth(): Promise<CloudHealthDto> {
    if (!this.controlBridge) {
      return { status: 'unreachable', message: 'ControlBridge not configured', checkedAt: new Date().toISOString() };
    }
    return this.controlBridge.healthCheck();
  }

  async deploy(dto: CloudDeployDto): Promise<CloudOperationResultDto> {
    if (!this.controlBridge) {
      return { success: false, service: dto.service, error: 'ControlBridge not configured', executedAt: new Date().toISOString() };
    }
    return this.controlBridge.deploy(dto);
  }

  async restart(dto: CloudRestartDto): Promise<CloudOperationResultDto> {
    if (!this.controlBridge) {
      return { success: false, service: dto.service, error: 'ControlBridge not configured', executedAt: new Date().toISOString() };
    }
    return this.controlBridge.restart(dto);
  }

  async rollback(dto: CloudRollbackDto): Promise<CloudOperationResultDto> {
    if (!this.controlBridge) {
      return { success: false, service: dto.service, error: 'ControlBridge not configured', executedAt: new Date().toISOString() };
    }
    return this.controlBridge.rollback(dto);
  }

  async getInventory(): Promise<CloudInventoryDto> {
    if (!this.controlBridge) {
      return { services: [], generatedAt: new Date().toISOString() };
    }
    return this.controlBridge.inventory();
  }

  // ─── Capabilities ───────────────────────────────────────────────────────────

  getCapabilities(): CapabilityMatrixDto {
    return {
      generatedAt: new Date().toISOString(),
      capabilities: [
        {
          name: 'crm',
          available: Boolean(this.prospects),
          source: 'ProspectsService',
          description: 'Lead and pipeline management',
        },
        {
          name: 'customers',
          available: Boolean(this.customers),
          source: 'CustomersService',
          description: 'Customer accounts and MRR',
        },
        {
          name: 'hermes',
          available: Boolean(this.hermes),
          source: 'HermesService',
          description: 'AI actions and daily briefing',
        },
        {
          name: 'cloud',
          available: Boolean(this.controlBridge && process.env.CONTROL_BRIDGE_URL),
          source: 'BusinessOsControlBridgeClient',
          description: 'Deploy, restart, rollback, inventory',
        },
        {
          name: 'lead_claims',
          available: Boolean(this.leadClaimStore),
          source: 'BusinessOsLeadClaimStore',
          description: 'Atomic lead claiming',
        },
      ],
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async getHotLeadCount(): Promise<number> {
    if (!this.prospects) return 0;
    try {
      const result = await this.prospects.getProspects({ status: 'QUALIFIED', limit: 1 });
      return result.total;
    } catch {
      return 0;
    }
  }

  private resolveIntent(text: string): AllowedCommandIntent | null {
    if (text.includes('hot lead') || text === 'show_hot_leads') return 'show_hot_leads';
    if (text.includes('business summary') || text.includes('summary') || text === 'show_business_summary') {
      return 'show_business_summary';
    }
    if (text.includes('health') || text === 'health_check') return 'health_check';
    return ALLOWED_COMMAND_INTENTS.find((intent) => text.includes(intent)) ?? null;
  }

  private buildCommandResult(intent: AllowedCommandIntent): CommandResultDto {
    switch (intent) {
      case 'show_hot_leads':
        return { summary: 'Hot leads view is ready. Connect CRM providers for live counts.', module: 'crm' };
      case 'show_business_summary':
        return { summary: 'Business summary is ready with authoritative dashboard metrics.', module: 'command' };
      case 'health_check':
        return { summary: 'Platform health check requested. Use Cloud for named infrastructure actions.', module: 'cloud' };
      default:
        return { summary: 'Command completed.' };
    }
  }
}
