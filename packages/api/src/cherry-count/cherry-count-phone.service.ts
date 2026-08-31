import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CherryCountRequestTenant } from './cherry-count-tenant.guard';
import { UpdatePhoneConfigInput } from './cherry-count.types';

const DEFAULT_GREETING =
  "Hey love! Thanks for calling Brianna's Boutique. I'm Cherry, Brianna's AI assistant. I can help with sizes, our next pop-up, or hold an item for you. What can I help you with today?";

const DEFAULT_AFTER_HOURS =
  "We're closed right now, but I can take a message or text you when we're back. Our next pop-up is Downtown Night Market — want me to save you a spot?";

const DEFAULT_HOURS = {
  mon: { open: '10:00', close: '19:00' },
  tue: { open: '10:00', close: '19:00' },
  wed: { open: '10:00', close: '19:00' },
  thu: { open: '10:00', close: '19:00' },
  fri: { open: '10:00', close: '21:00' },
  sat: { open: '11:00', close: '21:00' },
  sun: { closed: true },
};

@Injectable()
export class CherryCountPhoneService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const config = await this.ensureConfig(tenantId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [callsToday, recentCalls, totalCalls] = await Promise.all([
      this.prisma.cherryCountPhoneCall.count({
        where: { tenantId, startedAt: { gte: startOfDay } },
      }),
      this.prisma.cherryCountPhoneCall.findMany({
        where: { tenantId },
        orderBy: { startedAt: 'desc' },
        take: 8,
      }),
      this.prisma.cherryCountPhoneCall.count({ where: { tenantId } }),
    ]);

    const avgDuration = await this.prisma.cherryCountPhoneCall.aggregate({
      where: { tenantId, durationSeconds: { not: null } },
      _avg: { durationSeconds: true },
    });

    const leadsCaptured = await this.prisma.cherryCountPhoneCall.count({
      where: {
        tenantId,
        outcome: { in: ['HOLD_PLACED', 'SMS_SENT', 'TRANSFERRED', 'VOICEMAIL'] },
      },
    });

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
      capabilities: [
        'Answer sizing and availability questions',
        'Share next pop-up date, time, and location',
        'Hold items and capture customer requests',
        'Send SMS follow-ups with Instagram links',
        'Transfer urgent calls to Brianna',
        'Take after-hours voicemails',
      ],
      poweredBy: 'WISE² AI Phone',
    };
  }

  async updateConfig(
    tenantId: string,
    role: CherryCountRequestTenant['role'],
    input: UpdatePhoneConfigInput,
  ) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Only owners and admins can update AI Phone settings');
    }

    await this.ensureConfig(tenantId);
    const config = await this.prisma.cherryCountPhoneConfig.update({
      where: { tenantId },
      data: {
        enabled: input.enabled,
        greeting: input.greeting,
        afterHoursMessage: input.afterHoursMessage,
        businessHours: input.businessHours,
        transferNumber: input.transferNumber,
        smsEnabled: input.smsEnabled,
        voicemailEnabled: input.voicemailEnabled,
      },
    });

    return { config: this.serializeConfig(config) };
  }

  async seedDemoCalls(tenantId: string) {
    const existing = await this.prisma.cherryCountPhoneCall.count({ where: { tenantId } });
    if (existing > 0) return;

    const now = Date.now();
    const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000);

    await this.prisma.cherryCountPhoneCall.createMany({
      data: [
        {
          tenantId,
          callerNumber: '(404) 555-0142',
          callerName: 'Sarah M.',
          durationSeconds: 134,
          intent: 'Product availability',
          outcome: 'HOLD_PLACED',
          summary: 'Asked about Cherry Bomb Hoodie in Medium. Cherry confirmed stock and placed a hold for Downtown Night Market.',
          startedAt: hoursAgo(2),
        },
        {
          tenantId,
          callerNumber: '(678) 555-0298',
          callerName: 'Imani L.',
          durationSeconds: 182,
          intent: 'Sizing help',
          outcome: 'SMS_SENT',
          summary: 'Needed sizing advice on Lavender Crop Top. Cherry sent size chart and Instagram DM link.',
          startedAt: hoursAgo(5),
        },
        {
          tenantId,
          callerNumber: '(770) 555-0311',
          callerName: 'Unknown',
          durationSeconds: 105,
          intent: 'Pop-up info',
          outcome: 'TRANSFERRED',
          summary: 'Wanted vendor booth details for Downtown Night Market. Transferred to Brianna after capturing name.',
          startedAt: hoursAgo(8),
        },
        {
          tenantId,
          callerNumber: '(404) 555-0177',
          callerName: 'Taylor K.',
          durationSeconds: 48,
          intent: 'After-hours inquiry',
          outcome: 'VOICEMAIL',
          summary: 'Asked about restocking Royal Plum Joggers. Voicemail captured and tagged for follow-up.',
          startedAt: hoursAgo(14),
        },
        {
          tenantId,
          callerNumber: '(470) 555-0220',
          callerName: 'Maya P.',
          durationSeconds: 96,
          intent: 'VIP request',
          outcome: 'HOLD_PLACED',
          summary: 'VIP customer requested Pink Statement Earrings held. Cherry linked to CRM profile automatically.',
          startedAt: hoursAgo(26),
        },
      ],
    });
  }

  async ensureConfig(tenantId: string) {
    const existing = await this.prisma.cherryCountPhoneConfig.findUnique({ where: { tenantId } });
    if (existing) return existing;

    return this.prisma.cherryCountPhoneConfig.create({
      data: {
        tenantId,
        enabled: true,
        phoneNumber: '(404) 867-2446',
        greeting: DEFAULT_GREETING,
        afterHoursMessage: DEFAULT_AFTER_HOURS,
        businessHours: DEFAULT_HOURS,
        transferNumber: '(404) 555-0182',
        smsEnabled: true,
        voicemailEnabled: true,
        aiPersona: 'Cherry',
      },
    });
  }

  private serializeConfig(config: {
    enabled: boolean;
    phoneNumber: string | null;
    greeting: string;
    afterHoursMessage: string | null;
    businessHours: unknown;
    transferNumber: string | null;
    smsEnabled: boolean;
    voicemailEnabled: boolean;
    aiPersona: string;
  }) {
    return {
      enabled: config.enabled,
      phoneNumber: config.phoneNumber,
      greeting: config.greeting,
      afterHoursMessage: config.afterHoursMessage,
      businessHours: config.businessHours,
      transferNumber: config.transferNumber,
      smsEnabled: config.smsEnabled,
      voicemailEnabled: config.voicemailEnabled,
      aiPersona: config.aiPersona,
    };
  }

  private serializeCall(call: {
    id: string;
    callerNumber: string;
    callerName: string | null;
    direction: string;
    status: string;
    durationSeconds: number | null;
    intent: string | null;
    outcome: string | null;
    summary: string | null;
    startedAt: Date;
  }) {
    return {
      id: call.id,
      callerNumber: call.callerNumber,
      callerName: call.callerName,
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
