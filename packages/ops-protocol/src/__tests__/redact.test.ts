import { describe, expect, it } from 'vitest';
import { boundedText, redactJson, redactText } from '../redact.js';

describe('redactText', () => {
  it('redacts a named secret', () => {
    expect(redactText('token=abc123', ['abc123'])).toBe('token=[REDACTED]');
  });

  it('redacts bearer headers, env-style secrets, private keys and connection strings', () => {
    expect(redactText('Authorization: Bearer eyJhbGciOi.abc-123')).toContain('Bearer [REDACTED]');
    expect(redactText('WISE2_OPS_SIGNING_KEYS=relay:supersecretvalue')).toContain('[REDACTED]');
    expect(redactText('-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n-----END OPENSSH PRIVATE KEY-----')).toBe('[REDACTED PRIVATE KEY]');
    expect(redactText('postgres://wise2:hunter2@db:5432/prod')).toBe('postgres://wise2:[REDACTED]@db:5432/prod');
  });

  it('leaves ordinary output alone', () => {
    expect(redactText('restarting worker: ok')).toBe('restarting worker: ok');
  });
});

describe('boundedText', () => {
  it('caps output at the byte budget', () => {
    expect(boundedText('x'.repeat(100), 10)).toHaveLength(10);
  });
});

describe('redactJson', () => {
  it('redacts secrets nested inside a structure', () => {
    expect(redactJson({ log: 'PASSWORD=hunter2' })).toEqual({ log: 'PASSWORD=[REDACTED]' });
  });
});
