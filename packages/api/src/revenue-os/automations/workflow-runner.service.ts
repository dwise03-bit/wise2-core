import { Injectable, Logger } from '@nestjs/common';
import { AutomationRunStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowKey } from './workflow.types';

export interface WorkflowResult {
  status: AutomationRunStatus;
  detail: string;
  /** Minutes until the next attempt, when a cadence should continue. */
  retryInMinutes?: number;
  /** Optional structured data for the caller; never logged verbatim. */
  data?: Record<string, unknown>;
}

export const skipped = (detail: string): WorkflowResult => ({
  status: AutomationRunStatus.SKIPPED,
  detail,
});

export const succeeded = (
  detail: string,
  extra: Partial<WorkflowResult> = {},
): WorkflowResult => ({ status: AutomationRunStatus.SUCCEEDED, detail, ...extra });

/**
 * Wraps every workflow execution in an AutomationRun record (Phase 17).
 *
 * Centralised so each workflow states its business logic only, and so the
 * audit trail cannot be forgotten in one of six places. A run row is written
 * before the work starts and closed afterwards, including on failure — an
 * automation that dies mid-flight leaves a RUNNING row rather than no trace.
 */
@Injectable()
export class WorkflowRunnerService {
  private readonly logger = new Logger('RevenueOS/Workflow');

  constructor(private prisma: PrismaService) {}

  async run(
    params: {
      tenantId: string;
      workflowKey: WorkflowKey;
      entityType?: string;
      entityId?: string;
      payload?: Record<string, unknown>;
      attempt?: number;
    },
    work: () => Promise<WorkflowResult>,
  ): Promise<WorkflowResult> {
    const run = await this.prisma.automationRun.create({
      data: {
        tenantId: params.tenantId,
        workflowKey: params.workflowKey,
        entityType: params.entityType,
        entityId: params.entityId,
        status: AutomationRunStatus.RUNNING,
        startedAt: new Date(),
        payload: (params.payload ?? {}) as Prisma.InputJsonValue,
        retryCount: params.attempt ?? 0,
      },
    });

    try {
      const result = await work();
      await this.close(run.id, result.status, undefined);
      return result;
    } catch (err: any) {
      // Never log the payload here: it can contain customer contact details.
      const message = err?.message ?? 'unknown error';
      this.logger.error(
        `${params.workflowKey} failed for tenant ${params.tenantId}: ${message}`,
      );
      await this.close(run.id, AutomationRunStatus.FAILED, message);
      throw err;
    }
  }

  private async close(runId: string, status: AutomationRunStatus, error?: string) {
    await this.prisma.automationRun.update({
      where: { id: runId },
      data: { status, finishedAt: new Date(), errorMessage: error },
    });
  }
}
