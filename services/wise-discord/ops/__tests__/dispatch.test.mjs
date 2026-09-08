import { describe, expect, it, beforeAll } from 'vitest';
import dispatchModule from '../dispatch.js';
import pendingModule from '../pending.js';
import protocolModule from '../protocol.js';
import cardModule from '../card.js';
import { createRelayStub } from './fakes.mjs';

const { dispatchJob, parseSigningKey } = dispatchModule;
const { createPendingStore } = pendingModule;
const { renderResultCard } = cardModule;

const KEY = { keyId: 'discord-test', secret: 'a-signing-secret-of-at-least-32-chars' };
const OWNER = '111111111111111111';

let protocol;
beforeAll(async () => { protocol = await protocolModule.loadProtocol(); });

function entryFor(overrides = {}) {
  const store = createPendingStore();
  return store.create({
    jobId: 'OPS-20260906-A1B2', actorId: OWNER, actorName: 'Daniel', role: 'owner',
    target: 'wise2-core', environment: 'production', actionProfile: 'restart',
    args: { service: 'worker' }, requiredConfirmations: 1, ...overrides,
  });
}

describe('dispatchJob', () => {
  it('refuses to submit a write that carries no confirmation', async () => {
    const relay = createRelayStub();
    const result = await dispatchJob({ entry: entryFor(), signingKey: KEY, relay, protocol });
    expect(result).toMatchObject({ ok: false, code: 'CONFIRMATION_REQUIRED' });
    expect(relay.submissions).toEqual([]);
  });

  it('refuses to submit an emergency-stop with only one confirmation', async () => {
    const relay = createRelayStub();
    const entry = entryFor({ actionProfile: 'emergency-stop', args: { service: 'studio' }, requiredConfirmations: 2 });
    entry.confirmations.push({ sequence: 1, userId: OWNER, confirmedAt: new Date().toISOString(), environmentEcho: 'production' });
    const result = await dispatchJob({ entry, signingKey: KEY, relay, protocol });
    expect(result).toMatchObject({ ok: false, code: 'CONFIRMATION_REQUIRED' });
    expect(relay.submissions).toEqual([]);
  });

  it('refuses to sign when no signing key is configured', async () => {
    const relay = createRelayStub();
    const result = await dispatchJob({ entry: entryFor(), signingKey: undefined, relay, protocol });
    expect(result).toMatchObject({ ok: false, code: 'SIGNING_KEY_MISSING' });
    expect(relay.submissions).toEqual([]);
  });

  it('produces a job the protocol itself accepts', async () => {
    const relay = createRelayStub();
    const entry = entryFor();
    entry.confirmations.push({ sequence: 1, userId: OWNER, confirmedAt: new Date().toISOString(), environmentEcho: 'production' });
    const result = await dispatchJob({ entry, signingKey: KEY, relay, protocol });
    expect(result.ok).toBe(true);

    const [submission] = relay.submissions;
    const targets = [{
      alias: 'wise2-core', address: '100.64.0.10', transport: 'control-bridge', controlPort: 3099,
      environment: 'production', allowedProfiles: ['restart'], healthCheckProfile: 'status',
    }];
    const verified = protocol.verifyJob({ envelope: submission.job, keys: [KEY], targets, confirmations: submission.confirmations });
    expect(verified.ok).toBe(true);
  });
});

describe('parseSigningKey', () => {
  it.each([['no separator', 'abc'], ['empty id', ':' + 'x'.repeat(40)], ['short secret', 'id:short'], ['empty', '']])
    ('rejects %s', (_label, value) => { expect(parseSigningKey(value)).toBeUndefined(); });

  it('parses a well-formed key', () => {
    expect(parseSigningKey(`${KEY.keyId}:${KEY.secret}`)).toEqual(KEY);
  });
});

describe('renderResultCard', () => {
  it('renders every field the ops card specifies', () => {
    const card = renderResultCard({
      jobId: 'OPS-20260906-A1B2', actor: 'Daniel', target: 'wise2-core', environment: 'production',
      actionProfile: 'restart', argsSummary: 'service=worker', status: 'complete',
      startedAt: '2026-09-06T12:00:00.000Z', finishedAt: '2026-09-06T12:00:04.000Z',
      result: { data: { stdout: 'restarted' } },
    });
    for (const field of ['Actor:', 'Target:', 'Environment:', 'Action:', 'Status:', 'Started:', 'Finished:', 'Evidence:', 'Rollback:', 'Next action:']) {
      expect(card).toContain(field);
    }
    expect(card).toContain('OPS-20260906-A1B2');
    expect(card).toContain('restarted');
  });

  it('names an idempotent replay rather than implying a second execution', () => {
    const card = renderResultCard({ jobId: 'OPS-1', actor: 'Daniel', target: 'wise2-core', environment: 'production', actionProfile: 'restart', status: 'complete', result: { data: { idempotent: true } } });
    expect(card).toContain('Already executed');
  });
});
