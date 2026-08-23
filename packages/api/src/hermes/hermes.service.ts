import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrismaService } from '../prisma/prisma.service';
import {
  HermesAction,
  HermesActionStatus,
} from './hermes-action.entity';
import {
  CreateHermesActionDto,
  DecideHermesActionDto,
  HermesChatDto,
} from './hermes.dto';
import {
  HermesGenerationResolver,
  HermesProfile,
} from './hermes-generation.config';

type SourceState<T> =
  | { available: true; value: T }
  | { available: false; reason: string };

@Injectable()
export class HermesService {
  private readonly logger = new Logger('HermesService');

  constructor(
    @InjectRepository(HermesAction)
    private readonly actions: Repository<HermesAction>,
    private readonly prisma: PrismaService,
  ) {}

  async createAction(tenantUserId: string, dto: CreateHermesActionDto) {
    const requiresApproval =
      dto.requiresApproval === true ||
      dto.risk === 'high' ||
      dto.risk === 'critical';

    const action = this.actions.create({
      tenantUserId,
      mode: dto.mode,
      kind: dto.kind,
      risk: dto.risk,
      status: requiresApproval ? 'pending_approval' : 'queued',
      title: dto.title,
      summary: dto.summary ?? null,
      evidence: dto.evidence ?? [],
      payload: dto.payload ?? {},
      requiresApproval,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      decisionNote: null,
      executedAt: null,
      errorMessage: null,
    });

    return this.actions.save(action);
  }

  async listActions(
    tenantUserId: string,
    status?: HermesActionStatus,
    limit = 50,
  ) {
    const validStatuses: HermesActionStatus[] = [
      'queued',
      'pending_approval',
      'approved',
      'rejected',
      'executing',
      'completed',
      'failed',
      'cancelled',
    ];
    if (status && !validStatuses.includes(status)) {
      throw new BadRequestException('Invalid Hermes action status');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Hermes action limit must be a positive integer');
    }
    const boundedLimit = Math.min(Math.max(limit, 1), 100);
    return this.actions.find({
      where: {
        tenantUserId,
        ...(status ? { status } : {}),
      },
      order: { createdAt: 'DESC' },
      take: boundedLimit,
    });
  }

  async getAction(tenantUserId: string, id: string) {
    const action = await this.actions.findOne({
      where: { id, tenantUserId },
    });
    if (!action) {
      throw new NotFoundException('Hermes action not found');
    }
    return action;
  }

  async approveAction(
    tenantUserId: string,
    id: string,
    dto: DecideHermesActionDto,
  ) {
    const action = await this.getAction(tenantUserId, id);
    this.assertPendingDecision(action);

    action.status = 'approved';
    action.approvedBy = tenantUserId;
    action.approvedAt = new Date();
    action.decisionNote = dto.note ?? null;
    return this.actions.save(action);
  }

  async rejectAction(
    tenantUserId: string,
    id: string,
    dto: DecideHermesActionDto,
  ) {
    const action = await this.getAction(tenantUserId, id);
    this.assertPendingDecision(action);

    action.status = 'rejected';
    action.rejectedBy = tenantUserId;
    action.rejectedAt = new Date();
    action.decisionNote = dto.note ?? null;
    return this.actions.save(action);
  }

  async getDailyBrief(tenantUserId: string) {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [
      projects,
      creativeProjects,
      galleryAssets,
      customers,
      upcomingBookings,
      audits,
      pendingApprovals,
      recentActions,
    ] = await Promise.all([
      this.capture(() =>
        this.prisma.project.findMany({
          where: { userId: tenantUserId },
          select: { id: true, title: true, status: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ),
      this.capture(() =>
        this.prisma.soundLabsProject.findMany({
          where: { userId: tenantUserId },
          select: { id: true, name: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ),
      this.capture(() =>
        this.prisma.galleryAsset.count({ where: { userId: tenantUserId } }),
      ),
      this.capture(() =>
        this.prisma.customer.findMany({
          where: { userId: tenantUserId },
          select: {
            id: true,
            businessName: true,
            status: true,
            mrr: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 100,
        }),
      ),
      this.capture(() =>
        this.prisma.booking.findMany({
          where: {
            userId: tenantUserId,
            startTime: { gte: now, lte: nextDay },
            status: { not: 'cancelled' },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            meetingLink: true,
            service: { select: { name: true } },
          },
          orderBy: { startTime: 'asc' },
        }),
      ),
      this.capture(() =>
        this.prisma.consultingAuditSession.findMany({
          where: { booking: { userId: tenantUserId } },
          select: {
            id: true,
            clientName: true,
            auditTopic: true,
            status: true,
            summaryStatus: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ),
      this.capture(() =>
        this.actions.count({
          where: { tenantUserId, status: 'pending_approval' },
        }),
      ),
      this.capture(() =>
        this.actions.find({
          where: { tenantUserId },
          select: {
            id: true,
            mode: true,
            kind: true,
            risk: true,
            status: true,
            title: true,
            createdAt: true,
          },
          order: { createdAt: 'DESC' },
          take: 8,
        }),
      ),
    ]);

    const sourceStates = {
      projects,
      creativeProjects,
      galleryAssets,
      customers,
      upcomingBookings,
      audits,
      pendingApprovals,
      recentActions,
    };
    const unavailable = Object.entries(sourceStates)
      .filter(([, source]) => !source.available)
      .map(([source, state]) => ({
        source,
        reason: (state as SourceState<unknown> & { available: false }).reason,
      }));

    const customerRows = customers.available ? customers.value : [];
    const mrr = customerRows.reduce((total, customer) => total + customer.mrr, 0);

    return {
      generatedAt: now.toISOString(),
      tenant: { kind: 'user', id: tenantUserId },
      status: unavailable.length ? 'partial' : 'ready',
      headline: {
        pendingApprovals: pendingApprovals.available
          ? pendingApprovals.value
          : null,
        activeCustomers: customers.available
          ? customerRows.filter((customer) => customer.status === 'ACTIVE').length
          : null,
        monthlyRecurringRevenue: customers.available ? mrr : null,
        activeProjects: projects.available
          ? projects.value.filter((project) =>
              !['DELIVERED', 'REJECTED'].includes(project.status),
            ).length
          : null,
        creativeProjects: creativeProjects.available
          ? creativeProjects.value.length
          : null,
        galleryAssets: galleryAssets.available ? galleryAssets.value : null,
      },
      next24Hours: {
        bookings: upcomingBookings.available ? upcomingBookings.value : null,
      },
      attention: {
        audits: audits.available
          ? audits.value.filter((audit) =>
              audit.status !== 'COMPLETED' ||
              audit.summaryStatus === 'READY_FOR_REVIEW',
            )
          : null,
        approvals: pendingApprovals.available
          ? pendingApprovals.value
          : null,
      },
      recent: {
        projects: projects.available ? projects.value : null,
        creativeProjects: creativeProjects.available
          ? creativeProjects.value
          : null,
        customers: customers.available ? customerRows.slice(0, 10) : null,
        hermesActions: recentActions.available ? recentActions.value : null,
      },
      provenance: [
        { metric: 'projects', source: 'prisma.Project', scope: 'userId' },
        {
          metric: 'creativeProjects',
          source: 'prisma.SoundLabsProject',
          scope: 'userId',
        },
        {
          metric: 'galleryAssets',
          source: 'prisma.GalleryAsset',
          scope: 'userId',
        },
        { metric: 'customers', source: 'prisma.Customer', scope: 'userId' },
        { metric: 'bookings', source: 'prisma.Booking', scope: 'userId' },
        {
          metric: 'audits',
          source: 'prisma.ConsultingAuditSession via Booking',
          scope: 'booking.userId',
        },
        {
          metric: 'approvals',
          source: 'typeorm.HermesAction',
          scope: 'tenant_user_id',
        },
      ],
      accessIssues: [
        ...unavailable,
        {
          source: 'prisma.Prospect',
          reason:
            'Excluded from this brief because the current Prospect schema has no tenant owner field.',
        },
      ],
    };
  }

  async chat(tenantUserId: string, dto: HermesChatDto) {
    const startedAt = Date.now();

    const history = (dto.messages ?? []).slice(-10);
    const conversationLength = history.length;

    // Resolve reasoning profile (FAST, DEEP, or AUTO)
    let profile: HermesProfile = dto.profile || 'auto';
    if (profile === 'auto') {
      profile = HermesGenerationResolver.autoClassify(
        dto.message,
        conversationLength,
        dto.mode,
      );
      this.logger.debug(
        `Auto-classified request to profile: ${profile} (message length: ${dto.message.length}, conversation length: ${conversationLength})`,
      );
    }

    // Resolve generation configuration
    const config = HermesGenerationResolver.resolve(profile);
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';
    const endpoint = configuredEndpoint.includes('/v1/chat/completions')
      ? configuredEndpoint
      : `${configuredEndpoint.replace(/\/+$/, '')}/api/chat`;

    const system = [
      'You are Hermes, the WISE² business intelligence assistant.',
      `Active mode: ${dto.mode || 'executive'}.`,
      `Authenticated tenant: ${tenantUserId}.`,
      'Do not claim to have read business records unless they are supplied in the conversation.',
      'Distinguish facts from inference. State when evidence or access is missing.',
      'Never claim an external action was completed; high-risk actions require human approval.',
    ].join(' ');

    const openAiCompatible = endpoint.includes('/v1/chat/completions');
    const body = openAiCompatible
      ? HermesGenerationResolver.buildOpenAiBody(
          config.model,
          system,
          history,
          dto.message,
        )
      : HermesGenerationResolver.buildOllamaBody(
          config.model,
          system,
          history,
          dto.message,
          config.selectedSettings,
        );

    this.logger.debug(
      `[${profile}] model=${config.model} think=${config.selectedSettings.think} ctx=${config.selectedSettings.numCtx}`,
    );

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.selectedSettings.timeoutMs),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'connection failed';
      this.logger.error(`Hermes inference failed: ${errorMsg}`);
      throw new BadRequestException(`Hermes inference unavailable: ${errorMsg}`);
    }

    const data = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      const errorMsg =
        data?.error?.message ||
        data?.error ||
        `inference failed (${response.status})`;
      this.logger.error(`Hermes inference error: ${errorMsg}`);
      throw new BadRequestException(`Hermes inference failed: ${errorMsg}`);
    }

    const content = openAiCompatible
      ? data?.choices?.[0]?.message?.content
      : data?.message?.content;
    if (!content) {
      this.logger.error('Hermes inference returned empty response');
      throw new BadRequestException('Hermes inference returned no response');
    }

    const durationMs = Date.now() - startedAt;
    this.logger.log(
      `[${profile}] Chat complete: ${durationMs}ms (model=${config.model})`,
    );

    return {
      response: content,
      mode: dto.mode || 'executive',
      model: data?.model || config.model,
      profile,
      provider: config.provider,
      durationMs,
      sources: [],
      evidenceStatus: 'conversation-only',
    };
  }

  async *chatStream(
    tenantUserId: string,
    dto: HermesChatDto,
  ): AsyncIterable<{ event: string; data: string }> {
    const startedAt = Date.now();

    const history = (dto.messages ?? []).slice(-10);
    const conversationLength = history.length;

    // Resolve reasoning profile (FAST, DEEP, or AUTO)
    let profile: HermesProfile = dto.profile || 'auto';
    if (profile === 'auto') {
      profile = HermesGenerationResolver.autoClassify(
        dto.message,
        conversationLength,
        dto.mode,
      );
    }

    // Resolve generation configuration
    const config = HermesGenerationResolver.resolve(profile);
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';
    const endpoint = configuredEndpoint.includes('/v1/chat/completions')
      ? configuredEndpoint
      : `${configuredEndpoint.replace(/\/+$/, '')}/api/chat`;

    const system = [
      'You are Hermes, the WISE² business intelligence assistant.',
      `Active mode: ${dto.mode || 'executive'}.`,
      `Authenticated tenant: ${tenantUserId}.`,
      'Do not claim to have read business records unless they are supplied in the conversation.',
      'Distinguish facts from inference. State when evidence or access is missing.',
      'Never claim an external action was completed; high-risk actions require human approval.',
    ].join(' ');

    const openAiCompatible = endpoint.includes('/v1/chat/completions');
    const body = openAiCompatible
      ? HermesGenerationResolver.buildOpenAiBody(
          config.model,
          system,
          history,
          dto.message,
        )
      : HermesGenerationResolver.buildOllamaStreamBody(
          config.model,
          system,
          history,
          dto.message,
          config.selectedSettings,
        );

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.selectedSettings.timeoutMs),
      });
    } catch (error) {
      yield {
        event: 'error',
        data: JSON.stringify({
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'connection failed',
        }),
      };
      return;
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as any;
      yield {
        event: 'error',
        data: JSON.stringify({
          code: `ERROR_${response.status}`,
          message: data?.error?.message || `inference failed (${response.status})`,
        }),
      };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield {
        event: 'error',
        data: JSON.stringify({ code: 'NO_STREAM', message: 'response body not readable' }),
      };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let tokenCount = 0;
    let cumulativeText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let jsonStr = line;
          if (line.startsWith('data: ')) {
            jsonStr = line.slice(6);
          }
          if (jsonStr === '[DONE]') {
            yield {
              event: 'done',
              data: JSON.stringify({
                totalTokens: tokenCount,
                durationMs: Date.now() - startedAt,
                model: config.model,
                profile,
              }),
            };
            return;
          }

          try {
            const chunk = JSON.parse(jsonStr);
            const token = openAiCompatible
              ? chunk?.choices?.[0]?.delta?.content ?? ''
              : chunk?.message?.content ?? '';

            if (token) {
              tokenCount++;
              cumulativeText += token;

              yield {
                event: 'token',
                data: JSON.stringify({
                  token,
                  cumulative: cumulativeText,
                  index: tokenCount,
                }),
              };
            }

            if (chunk.done === true || chunk?.choices?.[0]?.finish_reason) {
              yield {
                event: 'done',
                data: JSON.stringify({
                  totalTokens: tokenCount,
                  durationMs: Date.now() - startedAt,
                  model: config.model,
                  profile,
                }),
              };
              return;
            }
          } catch (parseError) {
            this.logger.warn(`[Hermes] Malformed chunk: ${jsonStr}`);
            continue;
          }
        }
      }

      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer);
          const token = openAiCompatible
            ? chunk?.choices?.[0]?.delta?.content ?? ''
            : chunk?.message?.content ?? '';
          if (token) {
            cumulativeText += token;
            yield {
              event: 'token',
              data: JSON.stringify({
                token,
                cumulative: cumulativeText,
                index: ++tokenCount,
              }),
            };
          }
        } catch {
          // Ignore final buffer parse error
        }
      }

      yield {
        event: 'done',
        data: JSON.stringify({
          totalTokens: tokenCount,
          durationMs: Date.now() - startedAt,
          model: config.model,
          profile,
        }),
      };
    } catch (error) {
      yield {
        event: 'error',
        data: JSON.stringify({
          code: 'STREAM_ERROR',
          message: error instanceof Error ? error.message : 'unknown error',
        }),
      };
    } finally {
      reader.cancel();
    }
  }

  private assertPendingDecision(action: HermesAction) {
    if (action.status !== 'pending_approval') {
      throw new BadRequestException(
        `Action cannot be decided from status ${action.status}`,
      );
    }
  }

  private async capture<T>(operation: () => Promise<T>): Promise<SourceState<T>> {
    try {
      return { available: true, value: await operation() };
    } catch (error) {
      return {
        available: false,
        reason: error instanceof Error ? error.message : 'Source unavailable',
      };
    }
  }
}
