import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentStatus, AgentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MockProvider } from '../providers/mock.provider';
import {
  AGENT_DEFINITIONS,
  AGENT_DEFINITION_BY_TYPE,
  AgentCapability,
  GLOBAL_AGENT_RULES,
} from './agent-definitions';

/**
 * Tenant-scoped AI workforce management (Phase 5).
 *
 * Agents are seeded disabled and config-ready. An agent only reports ONLINE
 * when it is enabled *and* every capability it requires has a configured
 * provider — otherwise NEEDS_CONFIG. Missing credentials therefore surface
 * as a state in the UI rather than as a runtime crash.
 */
@Injectable()
export class AgentsService {
  private readonly logger = new Logger('RevenueOS/Agents');

  constructor(
    private prisma: PrismaService,
    private mockProvider: MockProvider,
  ) {}

  /**
   * Create the seven agents for a tenant if absent. Idempotent: safe to run
   * on every deploy, and it never re-enables an agent an operator paused.
   */
  async seedForTenant(tenantId: string) {
    const existing = await this.prisma.agentConfig.findMany({
      where: { tenantId },
      select: { type: true },
    });
    const have = new Set(existing.map((e) => e.type));

    const toCreate = AGENT_DEFINITIONS.filter((d) => !have.has(d.type));
    if (toCreate.length === 0) {
      return { created: 0 };
    }

    await this.prisma.agentConfig.createMany({
      data: toCreate.map((d) => ({
        tenantId,
        type: d.type,
        name: d.name,
        enabled: false,
        status: AgentStatus.NEEDS_CONFIG,
        instructions: [d.purpose, '', 'Rules:', ...GLOBAL_AGENT_RULES, ...d.guardrails].join('\n'),
        config: {
          agentId: d.id,
          promptPath: d.promptPath,
          tools: d.tools,
          requires: d.requires,
        },
      })),
    });

    this.logger.log(`Seeded ${toCreate.length} agents for tenant ${tenantId}`);
    return { created: toCreate.length };
  }

  /** Workforce view for the Command Center, with live status per agent. */
  async listForTenant(tenantId: string) {
    const rows = await this.prisma.agentConfig.findMany({
      where: { tenantId },
      orderBy: { type: 'asc' },
    });

    return rows.map((row) => {
      const definition = AGENT_DEFINITION_BY_TYPE.get(row.type);
      const missing = this.missingCapabilities(definition?.requires ?? []);

      return {
        id: row.id,
        type: row.type,
        name: row.name,
        purpose: definition?.purpose ?? '',
        enabled: row.enabled,
        status: this.deriveStatus(row.enabled, row.status, missing),
        missingCapabilities: missing,
        guardrails: definition?.guardrails ?? [],
        lastRunAt: row.lastRunAt,
        lastError: row.lastError,
      };
    });
  }

  async setEnabled(tenantId: string, type: AgentType, enabled: boolean) {
    const agent = await this.prisma.agentConfig.findFirst({
      where: { tenantId, type },
    });
    if (!agent) {
      throw new NotFoundException('Agent not configured for this tenant');
    }

    const definition = AGENT_DEFINITION_BY_TYPE.get(type);
    const missing = this.missingCapabilities(definition?.requires ?? []);

    await this.prisma.agentConfig.updateMany({
      where: { tenantId, type },
      data: {
        enabled,
        status: this.deriveStatus(enabled, agent.status, missing),
      },
    });

    return this.listForTenant(tenantId).then((all) => all.find((a) => a.type === type));
  }

  /**
   * Whether an agent may actually run. Callers use this instead of reading
   * `enabled` directly, so an agent with unconfigured providers is never
   * dispatched and never invents the data it is missing.
   */
  async canRun(tenantId: string, type: AgentType): Promise<boolean> {
    const agent = await this.prisma.agentConfig.findFirst({ where: { tenantId, type } });
    if (!agent || !agent.enabled) {
      return false;
    }
    const definition = AGENT_DEFINITION_BY_TYPE.get(type);
    return this.missingCapabilities(definition?.requires ?? []).length === 0;
  }

  async recordRun(tenantId: string, type: AgentType, error?: string) {
    return this.prisma.agentConfig.updateMany({
      where: { tenantId, type },
      data: {
        lastRunAt: new Date(),
        lastError: error ?? null,
        ...(error ? { status: AgentStatus.ERROR } : {}),
      },
    });
  }

  /**
   * Capabilities with no configured provider. Today every capability falls
   * back to MockProvider, so all of them report missing until real vendor
   * credentials are supplied.
   */
  private missingCapabilities(required: AgentCapability[]): AgentCapability[] {
    const health = this.mockProvider.health();
    if (health.status === 'READY') {
      return [];
    }
    return [...required];
  }

  private deriveStatus(
    enabled: boolean,
    current: AgentStatus,
    missing: AgentCapability[],
  ): AgentStatus {
    if (missing.length > 0) {
      return AgentStatus.NEEDS_CONFIG;
    }
    if (current === AgentStatus.ERROR) {
      return AgentStatus.ERROR;
    }
    return enabled ? AgentStatus.ONLINE : AgentStatus.PAUSED;
  }
}
