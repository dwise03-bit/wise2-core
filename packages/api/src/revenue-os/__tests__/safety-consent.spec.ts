import { ConsentChannel, ConsentState, HvacServiceCategory, LeadUrgency, SafetyRiskType } from '@prisma/client';
import { HvacSafetyService } from '../safety/hvac-safety.service';
import { HvacClassifierService } from '../safety/hvac-classifier.service';
import { ConsentService } from '../consent/consent.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Phase 14 coverage for the two areas where being wrong has consequences
 * outside the software: safety escalation and contact consent.
 */

describe('HVAC safety gate', () => {
  const prisma = {
    tenant: { findUnique: jest.fn(async () => ({ safetyScript: null })) },
    safetyEvent: { create: jest.fn(async ({ data }: any) => data) },
  } as unknown as PrismaService;

  const safety = new HvacSafetyService(prisma);

  beforeEach(() => jest.clearAllMocks());

  describe('escalates high-risk reports', () => {
    const cases: Array<[string, SafetyRiskType]> = [
      ['I think I smell gas near the furnace', SafetyRiskType.GAS_ODOR],
      ['my carbon monoxide detector is going off', SafetyRiskType.CARBON_MONOXIDE],
      ['there is a burning smell coming from the vents', SafetyRiskType.ELECTRICAL_BURNING],
      ['the unit is sparking', SafetyRiskType.ARCING],
      ['smoke coming out of the vent', SafetyRiskType.SMOKE],
      ['the furnace caught fire', SafetyRiskType.FIRE],
    ];

    it.each(cases)('%s -> %s', async (text, expected) => {
      const outcome = await safety.evaluate('tenant-a', text);
      expect(outcome.safe).toBe(false);
      expect(outcome.detection?.riskType).toBe(expected);
    });
  });

  it('leaves a normal no-cooling call on the standard service flow', async () => {
    const outcome = await safety.evaluate('tenant-a', 'my ac is not cooling since this morning');
    expect(outcome.safe).toBe(true);
    expect(outcome.detection).toBeUndefined();
  });

  it('logs a SafetyEvent whenever the gate trips', async () => {
    await safety.evaluate('tenant-a', 'I smell gas', 'lead-1');
    expect(prisma.safetyEvent.create).toHaveBeenCalledTimes(1);
    const logged = (prisma.safetyEvent.create as jest.Mock).mock.calls[0][0].data;
    expect(logged).toMatchObject({
      tenantId: 'tenant-a',
      leadId: 'lead-1',
      riskType: SafetyRiskType.GAS_ODOR,
      escalated: true,
    });
  });

  it('does not log a SafetyEvent for a safe call', async () => {
    await safety.evaluate('tenant-a', 'I need a maintenance tune up');
    expect(prisma.safetyEvent.create).not.toHaveBeenCalled();
  });

  it('never returns repair or diagnostic instructions', async () => {
    const outcome = await safety.evaluate('tenant-a', 'I smell gas');
    const script = (outcome.script ?? '').toLowerCase();
    // The script must tell them to leave, not to investigate or fix.
    expect(script).toContain('leave');
    ['turn the valve', 'relight', 'reset the', 'check the pilot', 'tighten', 'replace the'].forEach(
      (forbidden) => expect(script).not.toContain(forbidden),
    );
  });

  it('prefers tenant-approved language over the default script', async () => {
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValueOnce({
      safetyScript: 'Leave the property and call our emergency line at 555-0100.',
    });
    const outcome = await safety.evaluate('tenant-a', 'I smell gas');
    expect(outcome.script).toContain('555-0100');
  });

  it('treats empty input as safe rather than erroring', async () => {
    await expect(safety.evaluate('tenant-a', null)).resolves.toMatchObject({ safe: true });
  });
});

describe('HVAC classifier', () => {
  const classifier = new HvacClassifierService();

  it('classifies a no-cooling call', () => {
    const result = classifier.classify('the ac is not cooling');
    expect(result.category).toBe(HvacServiceCategory.NO_COOLING);
  });

  it('classifies a maintenance request as flexible', () => {
    const result = classifier.classify('I would like to book a seasonal tune up');
    expect(result.category).toBe(HvacServiceCategory.PREVENTATIVE_MAINTENANCE);
    expect(result.urgency).toBe(LeadUrgency.FLEXIBLE);
  });

  it('escalates urgency when vulnerable occupants are mentioned', () => {
    const result = classifier.classify('no heat and we have an infant at home');
    expect(result.urgency).toBe(LeadUrgency.EMERGENCY);
  });

  it('treats loss of heating or cooling as same-day even with no stated timeframe', () => {
    expect(classifier.classify('no heat').urgency).toBe(LeadUrgency.SAME_DAY);
  });

  it('falls back to OTHER rather than guessing', () => {
    expect(classifier.classify('just wondering about your company').category).toBe(
      HvacServiceCategory.OTHER,
    );
  });
});

describe('Consent', () => {
  const makePrisma = (latest: any) =>
    ({
      consentRecord: {
        findFirst: jest.fn(async () => latest),
        create: jest.fn(async ({ data }: any) => data),
      },
    } as unknown as PrismaService);

  it('STOP halts SMS automation', async () => {
    const prisma = makePrisma(null);
    const consent = new ConsentService(prisma);

    const state = await consent.handleInboundKeyword(
      'tenant-a', 'cust-1', ConsentChannel.SMS, 'STOP',
    );

    expect(state).toBe(ConsentState.OPTED_OUT);
    const written = (prisma.consentRecord.create as jest.Mock).mock.calls[0][0].data;
    expect(written.state).toBe(ConsentState.OPTED_OUT);
  });

  it.each(['STOP', 'stop', ' Stop ', 'UNSUBSCRIBE', 'cancel', 'opt out'])(
    'recognises %s as an opt-out',
    async (keyword) => {
      const consent = new ConsentService(makePrisma(null));
      await expect(
        consent.handleInboundKeyword('tenant-a', 'cust-1', ConsentChannel.SMS, keyword),
      ).resolves.toBe(ConsentState.OPTED_OUT);
    },
  );

  it('blocks contact after an opt-out', async () => {
    const consent = new ConsentService(makePrisma({ state: ConsentState.OPTED_OUT }));
    await expect(
      consent.canContact('tenant-a', 'cust-1', ConsentChannel.SMS),
    ).resolves.toBe(false);
  });

  it('DNC prevents outbound call automation', async () => {
    const consent = new ConsentService(makePrisma({ state: ConsentState.DNC }));
    await expect(
      consent.canContact('tenant-a', 'cust-1', ConsentChannel.CALL),
    ).resolves.toBe(false);
  });

  it('denies contact when consent is unknown, rather than assuming permission', async () => {
    const consent = new ConsentService(makePrisma(null));
    await expect(
      consent.canContact('tenant-a', 'cust-1', ConsentChannel.SMS),
    ).resolves.toBe(false);
  });

  it('allows contact only on an explicit opt-in', async () => {
    const consent = new ConsentService(makePrisma({ state: ConsentState.OPTED_IN }));
    await expect(
      consent.canContact('tenant-a', 'cust-1', ConsentChannel.SMS),
    ).resolves.toBe(true);
  });

  it('ignores ordinary message text', async () => {
    const consent = new ConsentService(makePrisma(null));
    await expect(
      consent.handleInboundKeyword('tenant-a', 'cust-1', ConsentChannel.SMS, 'sounds good, thanks'),
    ).resolves.toBeNull();
  });
});
