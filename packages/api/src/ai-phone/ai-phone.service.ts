import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantCrmAdapter } from './ai-phone-crm.adapter';
import { AiPhoneRuntimeService } from './ai-phone-runtime.service';
import {
  AI_PHONE_CAPABILITIES,
  AiPhoneCallDto,
  AiPhoneConfigDto,
  AiPhoneDashboardDto,
  DEFAULT_AI_PHONE_AFTER_HOURS,
  DEFAULT_AI_PHONE_GREETING,
  DEFAULT_AI_PHONE_HOURS,
  SimulateCallInput,
  UpdateAiPhoneConfigInput,
} from './ai-phone.types';
import { isWithinBusinessHours, phonesMatch } from './ai-phone.hours';

const OWNER_ROLES = new Set(['OWNER', 'ADMIN', 'FOUNDER']);

@Injectable()
export class AiPhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runtime: AiPhoneRuntimeService,
  ) {}

  async resolveTenantId(userId: string, requestedTenantId?: string): Promise<string | null> {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId,
        tenant: { state: 'ACTIVE' },
        ...(requestedTenantId ? { tenantId: requestedTenantId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
    return membership?.tenantId ?? null;
  }

  async membershipRole(userId: string, tenantId: string): Promise<string | undefined> {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { userId, tenantId },
    });
    return membership?.role;
  }

  async getDashboard(tenantId: string): Promise<AiPhoneDashboardDto> {
    const config = await this.ensureConfig(tenantId);
    await this.seedDemoCalls(tenantId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [callsToday, recentCalls, totalCalls, avgDuration, leadsCaptured] = await Promise.all([
      this.prisma.aiPhoneCall.count({
        where: { tenantId, startedAt: { gte: startOfDay } },
      }),
      this.prisma.aiPhoneCall.findMany({
        where: { tenantId },
        orderBy: { startedAt: 'desc' },
        take: 12,
      }),
      this.prisma.aiPhoneCall.count({ where: { tenantId } }),
      this.prisma.aiPhoneCall.aggregate({
        where: { tenantId, durationSeconds: { not: null } },
        _avg: { durationSeconds: true },
      }),
      this.prisma.aiPhoneCall.count({
        where: {
          tenantId,
          outcome: { in: ['LEAD_CAPTURED', 'BOOKED', 'SMS_SENT', 'TRANSFERRED', 'VOICEMAIL'] },
        },
      }),
    ]);

    return {
      config: this.serializeConfig(config),
      stats: {
        callsToday,
        totalCalls,
        avgDurationSeconds: Math.round(avgDuration._avg.durationSeconds ?? 0),
        leadsCaptured,
        aiActive: config.enabled,
      },
      recentCalls: recentCalls.map((call) => this.serializeCall(call)),
      capabilities: AI_PHONE_CAPABILITIES,
      poweredBy: 'WISE² AI Phone',
    };
  }

  async updateConfig(
    tenantId: string,
    role: string | undefined,
    input: UpdateAiPhoneConfigInput,
  ) {
    if (role && !OWNER_ROLES.has(role.toUpperCase())) {
      throw new ForbiddenException('Only owners and admins can update AI Phone settings');
    }

    await this.ensureConfig(tenantId);
    const config = await this.prisma.aiPhoneConfig.update({
      where: { tenantId },
      data: {
        enabled: input.enabled,
        phoneNumber: input.phoneNumber === undefined ? undefined : input.phoneNumber,
        greeting: input.greeting,
        afterHoursMessage: input.afterHoursMessage,
        businessHours: input.businessHours as Prisma.InputJsonValue | undefined,
        timezone: input.timezone,
        transferNumber: input.transferNumber === undefined ? undefined : input.transferNumber,
        smsEnabled: input.smsEnabled,
        voicemailEnabled: input.voicemailEnabled,
        recordingEnabled: input.recordingEnabled,
        aiPersona: input.aiPersona,
      },
    });

    return { config: this.serializeConfig(config) };
  }

  async listConversations(tenantId: string) {
    const calls = await this.prisma.aiPhoneCall.findMany({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
      take: 40,
    });

    return calls.map((call) => ({
      id: call.id,
      contactName: call.callerName || call.callerNumber,
      channel: 'voice' as const,
      preview: call.summary || call.intent || 'AI Phone call',
      humanTakeover: call.outcome === 'TRANSFERRED',
    }));
  }

  async findCallBySid(callSid: string) {
    if (!callSid) return null;
    return this.prisma.aiPhoneCall.findUnique({ where: { callSid } });
  }

  async firstConfiguredTenantId(): Promise<string | null> {
    const first = await this.prisma.aiPhoneConfig.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    return first?.tenantId ?? null;
  }

  async findConfigByNumber(toNumber: string) {
    const configs = await this.prisma.aiPhoneConfig.findMany({
      where: { phoneNumber: { not: null } },
    });
    return configs.find((config) => phonesMatch(config.phoneNumber, toNumber)) ?? null;
  }

  async ensureConfig(tenantId: string) {
    const existing = await this.prisma.aiPhoneConfig.findUnique({ where: { tenantId } });
    if (existing) return existing;

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const defaultNumber = process.env.TWILIO_PHONE_NUMBER || process.env.AI_PHONE_NUMBER || null;

    return this.prisma.aiPhoneConfig.create({
      data: {
        tenantId,
        enabled: true,
        phoneNumber: defaultNumber,
        greeting: DEFAULT_AI_PHONE_GREETING,
        afterHoursMessage: DEFAULT_AI_PHONE_AFTER_HOURS,
        businessHours: DEFAULT_AI_PHONE_HOURS as Prisma.InputJsonValue,
        timezone: tenant?.timezone || 'America/New_York',
        transferNumber: null,
        smsEnabled: true,
        voicemailEnabled: true,
        recordingEnabled: true,
        aiPersona: 'WISE²',
      },
    });
  }

  async startInboundCall(input: {
    tenantId: string;
    callSid: string;
    from: string;
    to: string;
  }) {
    const config = await this.ensureConfig(input.tenantId);
    const existing = await this.prisma.aiPhoneCall.findUnique({
      where: { callSid: input.callSid },
    });
    if (existing) {
      return {
        call: existing,
        config: this.serializeConfig(config),
        created: false,
        sessionId: existing.sessionId ?? undefined,
      };
    }

    const customer = await new TenantCrmAdapter(this.prisma, input.tenantId).lookupCustomer(
      input.from,
    );

    const session = this.runtime.sessions.createSession(input.callSid, input.tenantId, []);

    const call = await this.prisma.aiPhoneCall.create({
      data: {
        tenantId: input.tenantId,
        callSid: input.callSid,
        sessionId: session.sessionId,
        callerNumber: input.from,
        callerName: customer?.fullName ?? null,
        inboundNumber: input.to,
        direction: 'INBOUND',
        status: 'IN_PROGRESS',
        customerId: customer?.id,
        startedAt: new Date(),
      },
    });

    return { call, config: this.serializeConfig(config), created: true, sessionId: session.sessionId };
  }

  async handleTurn(input: {
    tenantId: string;
    callSid: string;
    sessionId?: string;
    message: string;
  }) {
    const configRow = await this.ensureConfig(input.tenantId);
    const config = this.serializeConfig(configRow);
    const orchestrator = this.runtime.orchestratorFor(input.tenantId, config);

    let session = input.sessionId
      ? this.runtime.sessions.getSession(input.sessionId)
      : this.runtime.sessions.getSessionByCallId(input.callSid);

    if (!session) {
      session = this.runtime.sessions.createSession(input.callSid, input.tenantId, []);
    }

    const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
      session.sessionId,
      input.message,
    );

    const summary = this.runtime.sessions.getSummary(session.sessionId);
    const transcript = Array.isArray(summary?.transcript)
      ? (summary?.transcript as Array<{ role: string; content: string }>)
          .map((turn) => `${turn.role}: ${turn.content}`)
          .join('\n')
      : input.message;

    const call = await this.prisma.aiPhoneCall.updateMany({
      where: { callSid: input.callSid },
      data: {
        sessionId: session.sessionId,
        transcript,
        intent: (summary?.context as { intent?: string } | undefined)?.intent,
        summary: response,
        outcome: shouldTransfer ? 'TRANSFERRED' : undefined,
      },
    });
    void call;

    return { response, shouldTransfer, sessionId: session.sessionId, config };
  }

  async completeCall(input: {
    callSid: string;
    outcome?: string;
    status?: string;
    recordingUrl?: string;
    durationSeconds?: number;
  }) {
    const existing = await this.prisma.aiPhoneCall.findUnique({
      where: { callSid: input.callSid },
    });
    if (!existing) return null;

    const session = existing.sessionId
      ? this.runtime.sessions.getSession(existing.sessionId)
      : this.runtime.sessions.getSessionByCallId(input.callSid);
    if (session) this.runtime.sessions.endSession(session.sessionId, input.outcome || 'completed');
    const summary = session ? this.runtime.sessions.getSummary(session.sessionId) : null;

    const transcript = Array.isArray(summary?.transcript)
      ? (summary?.transcript as Array<{ role: string; content: string }>)
          .map((turn) => `${turn.role}: ${turn.content}`)
          .join('\n')
      : existing.transcript;

    if (existing.conversationId) {
      return this.prisma.aiPhoneCall.update({
        where: { id: existing.id },
        data: {
          status: input.status || existing.status,
          outcome: input.outcome || existing.outcome,
          durationSeconds: input.durationSeconds ?? existing.durationSeconds,
          endedAt: existing.endedAt ?? new Date(),
          transcript,
        },
      });
    }

    const conversation =
      (await this.prisma.conversation.findFirst({
        where: { tenantId: existing.tenantId, externalProviderId: input.callSid },
      })) ??
      (await this.prisma.conversation.create({
        data: {
          tenantId: existing.tenantId,
          customerId: existing.customerId,
          leadId: existing.leadId,
          channel: 'PHONE',
          direction: 'INBOUND',
          fromValue: existing.callerNumber,
          toValue: existing.inboundNumber,
          body: existing.summary,
          transcript,
          aiHandled: true,
          externalProviderId: input.callSid,
        },
      }));

    const outcome = input.outcome || existing.outcome || 'COMPLETED';
    let leadId = existing.leadId;
    if (!leadId && outcome !== 'VOICEMAIL') {
      const lead = await this.prisma.lead.create({
        data: {
          tenantId: existing.tenantId,
          customerId: existing.customerId,
          source: 'ai-phone',
          summary: existing.summary || existing.intent || 'Inbound AI Phone call',
          status: 'NEW',
        },
      });
      leadId = lead.id;
    }

    return this.prisma.aiPhoneCall.update({
      where: { id: existing.id },
      data: {
        status: input.status || 'COMPLETED',
        outcome,
        durationSeconds: input.durationSeconds,
        endedAt: new Date(),
        transcript,
        conversationId: conversation.id,
        leadId,
      },
    });
  }

  async simulate(tenantId: string, input: SimulateCallInput) {
    if (!input.messages?.length) {
      throw new BadRequestException('messages are required');
    }

    const config = this.serializeConfig(await this.ensureConfig(tenantId));
    const callSid = `sim-${Date.now()}`;
    const started = await this.startInboundCall({
      tenantId,
      callSid,
      from: input.fromNumber || '+15555550100',
      to: config.phoneNumber || '+15555550199',
    });

    const conversation: Array<{ userMessage: string; response: string; shouldTransfer: boolean }> = [];
    let shouldTransfer = false;

    for (const message of input.messages) {
      const turn = await this.handleTurn({
        tenantId,
        callSid,
        sessionId: started.sessionId,
        message,
      });
      conversation.push({
        userMessage: message,
        response: turn.response,
        shouldTransfer: turn.shouldTransfer,
      });
      shouldTransfer = turn.shouldTransfer;
      if (shouldTransfer) break;
    }

    const call = await this.completeCall({
      callSid,
      outcome: shouldTransfer ? 'TRANSFERRED' : 'LEAD_CAPTURED',
      status: 'COMPLETED',
      durationSeconds: Math.max(30, input.messages.length * 25),
    });

    return {
      sessionId: started.sessionId,
      conversation,
      call: call ? this.serializeCall(call) : null,
    };
  }

  isOpen(config: AiPhoneConfigDto, now = new Date()): boolean {
    return isWithinBusinessHours(config.businessHours, config.timezone, now);
  }

  private async seedDemoCalls(tenantId: string) {
    const existing = await this.prisma.aiPhoneCall.count({ where: { tenantId } });
    if (existing > 0) return;

    const now = Date.now();
    const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000);

    await this.prisma.aiPhoneCall.createMany({
      data: [
        {
          tenantId,
          callerNumber: '+14055550142',
          callerName: 'Sarah M.',
          durationSeconds: 142,
          intent: 'Appointment',
          outcome: 'BOOKED',
          summary: 'Booked Thursday 9 AM maintenance visit. Consent recorded for SMS reminder.',
          startedAt: hoursAgo(2),
          status: 'COMPLETED',
        },
        {
          tenantId,
          callerNumber: '+16785550298',
          callerName: 'James Chen',
          durationSeconds: 96,
          intent: 'Service quote',
          outcome: 'LEAD_CAPTURED',
          summary: 'New lead for equipment replacement. Follow-up SMS sent with estimate window.',
          startedAt: hoursAgo(5),
          status: 'COMPLETED',
        },
        {
          tenantId,
          callerNumber: '+17705550311',
          callerName: 'Unknown',
          durationSeconds: 74,
          intent: 'Urgent repair',
          outcome: 'TRANSFERRED',
          summary: 'No cooling, transferred to dispatch after capturing address.',
          startedAt: hoursAgo(8),
          status: 'COMPLETED',
        },
        {
          tenantId,
          callerNumber: '+14045550177',
          callerName: 'Taylor K.',
          durationSeconds: 41,
          intent: 'After-hours inquiry',
          outcome: 'VOICEMAIL',
          summary: 'Asked about Saturday availability. Voicemail captured for morning callback.',
          startedAt: hoursAgo(14),
          status: 'COMPLETED',
        },
      ],
    });
  }

  serializeConfig(config: {
    enabled: boolean;
    phoneNumber: string | null;
    greeting: string;
    afterHoursMessage: string | null;
    businessHours: unknown;
    timezone: string;
    transferNumber: string | null;
    smsEnabled: boolean;
    voicemailEnabled: boolean;
    recordingEnabled: boolean;
    aiPersona: string;
  }): AiPhoneConfigDto {
    return {
      enabled: config.enabled,
      phoneNumber: config.phoneNumber,
      greeting: config.greeting,
      afterHoursMessage: config.afterHoursMessage,
      businessHours: config.businessHours,
      timezone: config.timezone,
      transferNumber: config.transferNumber,
      smsEnabled: config.smsEnabled,
      voicemailEnabled: config.voicemailEnabled,
      recordingEnabled: config.recordingEnabled,
      aiPersona: config.aiPersona,
    };
  }

  serializeCall(call: {
    id: string;
    callerNumber: string;
    callerName: string | null;
    inboundNumber?: string | null;
    direction: string;
    status: string;
    durationSeconds: number | null;
    intent: string | null;
    outcome: string | null;
    summary: string | null;
    startedAt: Date;
  }): AiPhoneCallDto {
    return {
      id: call.id,
      callerNumber: call.callerNumber,
      callerName: call.callerName,
      inboundNumber: call.inboundNumber ?? null,
      direction: call.direction,
      status: call.status,
      durationSeconds: call.durationSeconds,
      intent: call.intent,
      outcome: call.outcome,
      summary: call.summary,
      startedAt: call.startedAt.toISOString(),
    };
  }
}
