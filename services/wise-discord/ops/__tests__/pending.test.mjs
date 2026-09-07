import { describe, expect, it } from 'vitest';
import pending from '../pending.js';
const { createPendingStore } = pending;

const OWNER = '111111111111111111';

function store(now = () => 1_000_000) {
  return createPendingStore({ now });
}

function draft(overrides = {}) {
  return {
    jobId: 'OPS-20260906-A1B2', actorId: OWNER, actorName: 'Daniel', role: 'owner',
    target: 'wise2-core', environment: 'production', actionProfile: 'restart',
    args: { service: 'worker' }, requiredConfirmations: 1, ...overrides,
  };
}

describe('pending store', () => {
  it('holds a write as unconfirmed until it is confirmed', () => {
    const pending = store();
    const entry = pending.create(draft());
    expect(entry.status).toBe('awaiting-confirmation');
    expect(pending.consume(entry.jobId)).toBeUndefined();
  });

  it('requires the production environment to be echoed', () => {
    const pending = store();
    const entry = pending.create(draft());
    expect(pending.confirm(entry.jobId, { userId: OWNER })).toMatchObject({ ok: false, code: 'ENVIRONMENT_CONFIRMATION_REQUIRED' });
    expect(pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'prod' })).toMatchObject({ ok: false, code: 'ENVIRONMENT_CONFIRMATION_REQUIRED' });
    expect(pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' }).ok).toBe(true);
  });

  it('does not ask for an echo outside production', () => {
    const pending = store();
    const entry = pending.create(draft({ environment: 'staging' }));
    expect(pending.confirm(entry.jobId, { userId: OWNER }).ok).toBe(true);
  });

  it('refuses a confirmation from anyone but the requester', () => {
    const pending = store();
    const entry = pending.create(draft());
    expect(pending.confirm(entry.jobId, { userId: '999999999999999999', environmentEcho: 'production' }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_ACTOR_MISMATCH' });
  });

  it('expires a confirmation after ten minutes', () => {
    let clock = 1_000_000;
    const pending = createPendingStore({ now: () => clock });
    const entry = pending.create(draft());
    expect(entry.expiresAt - entry.createdAt).toBe(10 * 60 * 1000);
    clock += 10 * 60 * 1000 + 1;
    expect(pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_EXPIRED' });
  });

  it('requires two confirmations for a double-confirm action', () => {
    const pending = store();
    const entry = pending.create(draft({ actionProfile: 'emergency-stop', requiredConfirmations: 2 }));
    const first = pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' });
    expect(first).toMatchObject({ ok: true, remaining: 1 });
    expect(pending.consume(entry.jobId)).toBeUndefined();
    const second = pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' });
    expect(second).toMatchObject({ ok: true, remaining: 0 });
    expect(pending.consume(entry.jobId)).toBeDefined();
  });

  it('is single use', () => {
    const pending = store();
    const entry = pending.create(draft());
    pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' });
    expect(pending.consume(entry.jobId)).toBeDefined();
    expect(pending.consume(entry.jobId)).toBeUndefined();
    expect(pending.confirm(entry.jobId, { userId: OWNER, environmentEcho: 'production' }))
      .toMatchObject({ ok: false, code: 'JOB_ALREADY_RUN' });
  });

  it('lets only the requester cancel', () => {
    const pending = store();
    const entry = pending.create(draft());
    expect(pending.cancel(entry.jobId, '999999999999999999')).toMatchObject({ ok: false, code: 'CONFIRMATION_ACTOR_MISMATCH' });
    expect(pending.cancel(entry.jobId, OWNER).ok).toBe(true);
    expect(pending.get(entry.jobId)).toBeUndefined();
  });
});
