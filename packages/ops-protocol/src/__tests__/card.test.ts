import { describe, expect, it } from 'vitest';
import { evidenceFor, MAX_EVIDENCE_CHARS, renderResultCard, summariseArgs } from '../card.js';

const base = {
  jobId: 'OPS-20260906-A1B2',
  actor: 'Daniel',
  target: 'wise2-core',
  environment: 'production' as const,
  actionProfile: 'restart',
  args: { service: 'worker' },
  status: 'complete' as const,
  startedAt: '2026-09-06T12:00:00.000Z',
  finishedAt: '2026-09-06T12:00:04.000Z',
};

describe('renderResultCard', () => {
  it('renders every field the ops card specifies', () => {
    const card = renderResultCard({ ...base, result: { data: { stdout: 'restarted' } } });
    expect(card).toMatchInlineSnapshot(`
      "## OPS-20260906-A1B2 — Action Result
      **Actor:** Daniel
      **Target:** wise2-core
      **Environment:** production
      **Action:** restart service=worker
      **Status:** complete
      **Started:** 2026-09-06 12:00:00Z
      **Finished:** 2026-09-06 12:00:04Z
      **Evidence:** restarted
      **Rollback:** available via /ops rollback
      **Next action:** Verify the service is healthy with /ops status"
    `);
  });

  it('shows an unfinished action without inventing a timestamp', () => {
    const card = renderResultCard({ ...base, status: 'awaiting-confirmation', finishedAt: undefined, result: undefined });
    expect(card).toContain('**Finished:** —');
    expect(card).toContain('**Evidence:** —');
    expect(card).toContain('/ops confirm OPS-20260906-A1B2');
    expect(card).toContain('**Rollback:** not applicable');
  });

  it('reports a failure with its code rather than a partial result', () => {
    const card = renderResultCard({ ...base, status: 'failed', error: { code: 'TARGET_UNREACHABLE', message: 'Target control bridge did not respond' } });
    expect(card).toContain('**Status:** failed');
    expect(card).toContain('TARGET_UNREACHABLE');
    expect(card).toContain('Check host reachability');
  });

  it('names an idempotent replay instead of implying a second execution', () => {
    const card = renderResultCard({ ...base, result: { data: { idempotent: true } } });
    expect(card).toContain('Already executed — no action taken');
  });

  it('ignores a malformed timestamp', () => {
    expect(renderResultCard({ ...base, startedAt: 'yesterday' })).toContain('**Started:** —');
  });
});

describe('sanitized reporting', () => {
  it('redacts a bearer token, an env secret, a private key and a connection string', () => {
    const leaked = [
      'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abcdef-1234',
      'WISE2_CONTROL_TOKEN=s3cr3t-token-value',
      'DATABASE_URL=postgres://wise2:hunter2@db:5432/prod',
      'connecting to postgres://wise2:hunter2@db:5432/prod',
      '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjE\n-----END OPENSSH PRIVATE KEY-----',
    ].join('\n');

    const card = renderResultCard({ ...base, result: { data: { stdout: leaked } } });

    expect(card).not.toContain('eyJhbGciOiJIUzI1NiJ9.abcdef-1234');
    expect(card).not.toContain('s3cr3t-token-value');
    expect(card).not.toContain('hunter2');
    expect(card).not.toContain('b3BlbnNzaC1rZXktdjE');
    expect(card).toContain('Bearer [REDACTED]');
    expect(card).toContain('[REDACTED PRIVATE KEY]');
    expect(card).toContain('postgres://wise2:[REDACTED]@db:5432/prod');
  });

  it('blanks out secrets the caller knows about', () => {
    const card = renderResultCard({ ...base, result: { data: { stdout: 'relay token is abc123xyz' } }, secrets: ['abc123xyz'] });
    expect(card).not.toContain('abc123xyz');
    expect(card).toContain('[REDACTED]');
  });

  it('redacts a secret embedded in an error message', () => {
    const card = renderResultCard({ ...base, status: 'blocked', error: { code: 'BRIDGE_REJECTED', message: 'bad WISE2_OPS_SIGNING_KEYS=relay:supersecret' } });
    expect(card).not.toContain('relay:supersecret');
  });

  it('caps evidence so a runaway log cannot flood the message', () => {
    const card = renderResultCard({ ...base, result: { data: { stdout: 'x'.repeat(50_000) } } });
    const evidence = card.split('**Evidence:** ')[1]!.split('\n')[0]!;
    expect(evidence.length).toBeLessThanOrEqual(MAX_EVIDENCE_CHARS);
  });

  it('cannot leave a secret fragment behind when the cap falls mid-secret', () => {
    // The secret sits past the cap; capping happens before redaction, so the tail that
    // survives must not contain a readable fragment of it.
    const padding = 'y'.repeat(MAX_EVIDENCE_CHARS - 20);
    const card = renderResultCard({ ...base, result: { data: { stdout: `${padding}PASSWORD=hunter2hunter2hunter2` } } });
    expect(card).not.toContain('hunter2');
  });
});

describe('evidenceFor', () => {
  it('handles the shapes the bridge actually returns', () => {
    expect(evidenceFor({ data: { stdout: 'restarted' } })).toBe('restarted');
    expect(evidenceFor({ data: { id: 'dep-1', status: 'rolled_back' } })).toBe('deployment dep-1 → rolled_back');
    expect(evidenceFor({ data: { enabled: true } })).toBe('maintenance enabled');
    expect(evidenceFor(undefined)).toBe('—');
    expect(evidenceFor('plain text')).toBe('plain text');
  });

  it('falls back to compact JSON for an unrecognised shape', () => {
    expect(evidenceFor({ data: { services: ['api', 'website'] } })).toBe('{"services":["api","website"]}');
  });
});

describe('summariseArgs', () => {
  it('renders arguments as key=value pairs and nothing for none', () => {
    expect(summariseArgs({ app: 'website', releaseId: 'abc1234' })).toBe('app=website releaseId=abc1234');
    expect(summariseArgs({})).toBe('');
    expect(summariseArgs(undefined)).toBe('');
  });
});

describe('nested response envelopes', () => {
  it('finds the evidence inside a relay envelope wrapping a bridge envelope', () => {
    const relayResponse = { ok: true, action: 'restart', data: { ok: true, action: 'docker.restart', data: { code: 0, stdout: 'restarted' } } };
    expect(evidenceFor(relayResponse)).toBe('restarted');
  });

  it('reports an idempotent replay reported through both envelopes', () => {
    const relayResponse = { ok: true, data: { ok: true, data: { idempotent: true, previous: { jobId: 'OPS-1' } } } };
    expect(evidenceFor(relayResponse)).toContain('Already executed');
  });

  it('stops unwrapping when there is no data field left', () => {
    expect(evidenceFor({ ok: true, data: { services: ['api'] } })).toBe('{"services":["api"]}');
  });
});
