import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PayloadTooLargeException } from '@nestjs/common';
import { WebhookSecurityService, MAX_WEBHOOK_BYTES } from '../webhooks/webhook-security.service';
import { MockProvider } from '../providers/mock.provider';
import { PrismaService } from '../../prisma/prisma.service';

const SECRET = 'test-webhook-secret';
const sign = (body: string, secret = SECRET) =>
  'sha256=' + createHmac('sha256', secret).update(body).digest('hex');

/** Prisma fake enforcing the unique (provider, externalId) constraint. */
function createPrismaFake() {
  const seen = new Set<string>();
  const rows: any[] = [];
  return {
    __rows: () => rows,
    webhookEvent: {
      create: jest.fn(async ({ data }: any) => {
        const key = `${data.provider}:${data.externalId}`;
        if (seen.has(key)) {
          const err: any = new Error('Unique constraint failed');
          err.code = 'P2002';
          throw err;
        }
        seen.add(key);
        const row = { id: `evt-${rows.length + 1}`, ...data };
        rows.push(row);
        return row;
      }),
      update: jest.fn(async ({ data }: any) => data),
    },
  } as unknown as PrismaService & { __rows: () => any[] };
}

describe('Webhook security', () => {
  let prisma: ReturnType<typeof createPrismaFake>;
  let webhooks: WebhookSecurityService;
  const body = JSON.stringify({ event: 'lead.created', id: 'abc' });

  beforeEach(() => {
    prisma = createPrismaFake();
    webhooks = new WebhookSecurityService(prisma);
  });

  it('accepts a correctly signed webhook', async () => {
    const result = await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-1',
      rawBody: body,
      signature: sign(body),
      secret: SECRET,
      resolveTenant: async () => 'tenant-a',
    });

    expect(result.accepted).toBe(true);
    expect(result.tenantId).toBe('tenant-a');
  });

  it('rejects an invalid signature', async () => {
    const result = await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-2',
      rawBody: body,
      signature: sign(body, 'wrong-secret'),
      secret: SECRET,
      resolveTenant: async () => 'tenant-a',
    });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('INVALID_SIGNATURE');
  });

  it('rejects a missing signature', async () => {
    const result = await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-3',
      rawBody: body,
      signature: undefined,
      secret: SECRET,
      resolveTenant: async () => 'tenant-a',
    });
    expect(result.reason).toBe('INVALID_SIGNATURE');
  });

  it('does not resolve a tenant for an unsigned request', async () => {
    const resolveTenant = jest.fn(async () => 'tenant-a');
    await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-4',
      rawBody: body,
      signature: 'sha256=deadbeef',
      secret: SECRET,
      resolveTenant,
    });
    // Signature is checked before tenant resolution, so a forged request
    // never reaches the mapping lookup.
    expect(resolveTenant).not.toHaveBeenCalled();
  });

  it('ignores a duplicate delivery of the same event', async () => {
    const args = {
      provider: 'telephony',
      externalId: 'call-99',
      rawBody: body,
      signature: sign(body),
      secret: SECRET,
      resolveTenant: async () => 'tenant-a',
    };

    const first = await webhooks.admit(args);
    const second = await webhooks.admit(args);

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(false);
    expect(second.reason).toBe('DUPLICATE');
  });

  it('rejects when no tenant mapping exists, rather than trusting the body', async () => {
    const result = await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-5',
      rawBody: JSON.stringify({ tenantId: 'tenant-b', event: 'lead.created' }),
      signature: sign(JSON.stringify({ tenantId: 'tenant-b', event: 'lead.created' })),
      secret: SECRET,
      resolveTenant: async () => null,
    });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('UNKNOWN_TENANT');
    // The tenantId in the payload must not have been adopted.
    expect(result.tenantId).toBeUndefined();
  });

  it('refuses an oversized payload', async () => {
    const huge = 'x'.repeat(MAX_WEBHOOK_BYTES + 1);
    await expect(
      webhooks.admit({
        provider: 'meta',
        externalId: 'evt-6',
        rawBody: huge,
        signature: sign(huge),
        secret: SECRET,
        resolveTenant: async () => 'tenant-a',
      }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('records rejected attempts without attaching a tenant', async () => {
    await webhooks.admit({
      provider: 'meta',
      externalId: 'evt-7',
      rawBody: body,
      signature: 'sha256=bad',
      secret: SECRET,
      resolveTenant: async () => 'tenant-a',
    });

    const row = prisma.__rows()[0];
    expect(row.signatureValid).toBe(false);
    expect(row.tenantId).toBeNull();
  });
});

describe('Mock provider (Phase 11)', () => {
  const config = { get: () => undefined } as unknown as ConfigService;
  const provider = new MockProvider(config);

  it('reports NEEDS_CONFIG with the missing variables named', () => {
    const health = provider.health();
    expect(health.status).toBe('NEEDS_CONFIG');
    expect(health.missing).toEqual(
      expect.arrayContaining(['TELEPHONY_ACCOUNT_ID', 'TELEPHONY_AUTH_TOKEN']),
    );
  });

  it('does not claim an SMS was sent', async () => {
    const result = await provider.sendSms({ to: '+15550100', body: 'hi', tenantId: 't' });
    expect(result.sent).toBe(false);
    expect(result.status).toBe('NEEDS_CONFIG');
  });

  it('does not claim a call was placed', async () => {
    const result = await provider.placeCall({ to: '+15550100', tenantId: 't' });
    expect(result.placed).toBe(false);
    expect(result.status).toBe('NEEDS_CONFIG');
  });

  it('never invents appointment availability', async () => {
    const slots = await provider.availableSlots('t', new Date(), new Date());
    expect(slots).toEqual([]);
  });

  it('never invents a review link', async () => {
    await expect(provider.reviewLink('t')).resolves.toBeNull();
  });

  it('never treats a signature as valid', () => {
    expect(provider.verifySignature()).toBe(false);
  });

  it('missing credentials produce NEEDS_CONFIG rather than a crash', async () => {
    await expect(provider.sendSms({ to: 'x', body: 'y', tenantId: 't' })).resolves.toBeDefined();
    await expect(provider.placeCall({ to: 'x', tenantId: 't' })).resolves.toBeDefined();
  });
});
