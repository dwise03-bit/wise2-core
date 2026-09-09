import { describe, expect, it } from 'vitest';
import { loadConfig, parseSigningKeys } from '../config.js';

const SECRET = 'a-signing-secret-of-at-least-32-characters';
const base = { WISE2_CONTROL_TOKEN: 'test-token', WISE2_OPS_SIGNING_KEYS: `relay:${SECRET}` };

describe('loadConfig', () => {
  it('requires a bearer token', () => {
    expect(() => loadConfig({})).toThrow('WISE2_CONTROL_TOKEN is required');
  });

  it('defaults to localhost port 3099', () => {
    const config = loadConfig(base);
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(3099);
  });

  it('enforces signed writes by default', () => {
    expect(loadConfig(base).requireSignedWrites).toBe(true);
  });

  it('refuses to start when signed writes are enforced with no signing key', () => {
    expect(() => loadConfig({ WISE2_CONTROL_TOKEN: 'test-token' }))
      .toThrow('WISE2_OPS_SIGNING_KEYS is required when signed writes are enforced');
  });

  it('starts without a key only when signed writes are explicitly disabled', () => {
    const config = loadConfig({ WISE2_CONTROL_TOKEN: 'test-token', WISE2_REQUIRE_SIGNED_WRITES: 'false' });
    expect(config.requireSignedWrites).toBe(false);
    expect(config.signingKeys).toEqual([]);
  });

  it('derives the environment from NODE_ENV and rejects an invalid override', () => {
    expect(loadConfig({ ...base, WISE2_CONTROL_TOKEN: 'a-production-length-token', NODE_ENV: 'production' }).targetEnvironment).toBe('production');
    expect(loadConfig(base).targetEnvironment).toBe('development');
    expect(() => loadConfig({ ...base, WISE2_TARGET_ENVIRONMENT: 'prod' })).toThrow('WISE2_TARGET_ENVIRONMENT');
  });

  it('rejects an unknown action profile in the allowlist', () => {
    expect(() => loadConfig({ ...base, WISE2_ALLOWED_PROFILES: 'status,exec' })).toThrow('unknown profile: exec');
  });

  it('exposes the full profile set now that every adapter exists', () => {
    const profiles = loadConfig(base).allowedProfiles;
    expect(profiles).toContain('diagnose');
    expect(profiles).toContain('maintenance');
    expect(profiles).toContain('emergency-stop');
  });

  it('leaves emergency-stop inert until a service is explicitly designated stoppable', () => {
    expect(loadConfig(base).allowedStoppable).toEqual([]);
  });
});

describe('parseSigningKeys', () => {
  it('parses multiple keys for rotation', () => {
    expect(parseSigningKeys(`old:${SECRET}1,new:${SECRET}2`)).toEqual([
      { keyId: 'old', secret: `${SECRET}1` },
      { keyId: 'new', secret: `${SECRET}2` },
    ]);
  });

  it.each([
    ['a missing separator', 'relay-secret'],
    ['an empty key id', `:${SECRET}`],
    ['a short secret', 'relay:tooshort'],
    ['a duplicate key id', `relay:${SECRET},relay:${SECRET}2`],
  ])('rejects %s', (_label, value) => {
    expect(() => parseSigningKeys(value)).toThrow();
  });

  it('returns an empty keyring for an unset variable', () => {
    expect(parseSigningKeys(undefined)).toEqual([]);
  });
});
