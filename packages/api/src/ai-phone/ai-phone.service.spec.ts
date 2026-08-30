import { isWithinBusinessHours, phonesMatch } from './ai-phone.hours';
import { sayGatherTwiml, sayHangupTwiml, transferTwiml } from './ai-phone.twiml';
import { validateTwilioSignature } from './ai-phone.twilio-signature';
import { AiPhoneService } from './ai-phone.service';
import { AiPhoneRuntimeService } from './ai-phone-runtime.service';

describe('AI Phone helpers', () => {
  it('matches phone numbers on the last 10 digits', () => {
    expect(phonesMatch('+1 (404) 555-0100', '4045550100')).toBe(true);
    expect(phonesMatch('4045550100', '7705550100')).toBe(false);
  });

  it('treats Sunday as closed in default hours', () => {
    const hours = {
      sun: { closed: true },
      mon: { open: '09:00', close: '17:00' },
    };
    const sunday = new Date('2026-08-30T16:00:00Z');
    expect(isWithinBusinessHours(hours, 'UTC', sunday)).toBe(false);
  });

  it('emits TwiML without injecting caller text as XML', () => {
    const xml = sayHangupTwiml('Hello <script>');
    expect(xml).toContain('&lt;script&gt;');
    expect(xml).toContain('<Hangup/>');
    expect(sayGatherTwiml('https://wise2.net/api/v1/ai-phone/webhooks/twilio', 'Hi', 'sess-1')).toContain(
      'sessionId=sess-1',
    );
    expect(transferTwiml('Hold on', '+14045550100')).toContain('+14045550100');
  });

  it('validates Twilio signatures with HMAC-SHA1', () => {
    const token = 'test-token';
    const url = 'https://wise2.net/api/v1/ai-phone/webhooks/twilio/voice';
    const params = { From: '+15551212', To: '+14045550100' };
    const { createHmac } = require('crypto') as typeof import('crypto');
    const data = Object.keys(params)
      .sort()
      .reduce((acc, key) => acc + key + params[key as keyof typeof params], url);
    const signature = createHmac('sha1', token).update(data, 'utf8').digest('base64');
    expect(validateTwilioSignature(token, signature, url, params)).toBe(true);
    expect(validateTwilioSignature(token, 'nope', url, params)).toBe(false);
  });
});

describe('AiPhoneService', () => {
  const calls: Array<Record<string, unknown>> = [];
  const prisma = {
    tenantMembership: {
      findFirst: jest.fn().mockResolvedValue({ tenantId: 't1' }),
    },
    tenant: {
      findUnique: jest.fn().mockResolvedValue({ timezone: 'America/New_York' }),
    },
    aiPhoneConfig: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        id: 'cfg-1',
        enabled: true,
        smsEnabled: true,
        voicemailEnabled: true,
        recordingEnabled: true,
        aiPersona: 'WISE²',
        timezone: 'America/New_York',
        phoneNumber: null,
        transferNumber: null,
        afterHoursMessage: null,
        greeting: data.greeting,
        businessHours: data.businessHours,
      })),
      update: jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'cfg-1',
        tenantId: 't1',
        enabled: data.enabled ?? true,
        phoneNumber: null,
        greeting: data.greeting ?? 'Thanks for calling.',
        afterHoursMessage: null,
        businessHours: {},
        timezone: 'America/New_York',
        transferNumber: null,
        smsEnabled: true,
        voicemailEnabled: true,
        recordingEnabled: true,
        aiPersona: 'WISE²',
      })),
    },
    aiPhoneCall: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockImplementation(async () => calls),
      aggregate: jest.fn().mockResolvedValue({ _avg: { durationSeconds: 90 } }),
      createMany: jest.fn().mockImplementation(async ({ data }: { data: Array<Record<string, unknown>> }) => {
        calls.push(...data);
        return { count: data.length };
      }),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    conversation: { create: jest.fn(), findFirst: jest.fn().mockResolvedValue(null) },
    lead: { create: jest.fn() },
  };

  it('resolves the caller workspace and seeds demo calls on first dashboard', async () => {
    const runtime = {
      sessions: { createSession: jest.fn(), getSession: jest.fn(), getSessionByCallId: jest.fn(), endSession: jest.fn(), getSummary: jest.fn() },
      orchestratorFor: jest.fn(),
    };
    const service = new AiPhoneService(
      prisma as never,
      runtime as unknown as AiPhoneRuntimeService,
    );

    const tenantId = await service.resolveTenantId('user-1');
    expect(tenantId).toBe('t1');

    const dashboard = await service.getDashboard('t1');
    expect(dashboard.poweredBy).toBe('WISE² AI Phone');
    expect(dashboard.config.enabled).toBe(true);
    expect(dashboard.recentCalls.length).toBeGreaterThan(0);
    expect(dashboard.capabilities.length).toBeGreaterThan(0);
  });

  it('rejects config updates from viewers', async () => {
    const service = new AiPhoneService(
      prisma as never,
      { sessions: {}, orchestratorFor: jest.fn() } as unknown as AiPhoneRuntimeService,
    );
    await expect(service.updateConfig('t1', 'VIEWER', { enabled: false })).rejects.toThrow(
      'Only owners and admins',
    );
  });
});
