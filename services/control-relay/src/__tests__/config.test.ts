import { describe, expect, it } from 'vitest';
import { loadConfig, parseSigningKeys } from '../config.js';

const SECRET = 'a-relay-signing-secret-of-32-plus-characters';
const base = { WISE2_RELAY_TOKEN: 'a-relay-token-of-at-least-32-characters', WISE2_OPS_SIGNING_KEYS: `relay:${SECRET}` };

describe('loadConfig', () => {
  it('requires a relay token of real length', () => {
    expect(() => loadConfig({ WISE2_OPS_SIGNING_KEYS: `relay:${SECRET}` })).toThrow('WISE2_RELAY_TOKEN is required');
    expect(() => loadConfig({ ...base, WISE2_RELAY_TOKEN: 'short' })).toThrow('at least 32 characters');
  });

  it('refuses to start without a signing key', () => {
    expect(() => loadConfig({ WISE2_RELAY_TOKEN: base.WISE2_RELAY_TOKEN })).toThrow('WISE2_OPS_SIGNING_KEYS is required');
  });

  it('binds to localhost by default', () => {
    const config = loadConfig(base);
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(4600);
  });

  it('defaults the registry and audit paths under ~/.wise2', () => {
    const config = loadConfig(base);
    expect(config.targetsFile).toMatch(/\.wise2\/targets\.json$/);
    expect(config.auditFile).toMatch(/\.wise2\/relay-audit\.jsonl$/);
  });
});

describe('parseSigningKeys', () => {
  it('parses a keyring and rejects malformed entries', () => {
    expect(parseSigningKeys(`relay:${SECRET}`)).toEqual([{ keyId: 'relay', secret: SECRET }]);
    expect(() => parseSigningKeys('relay-no-separator')).toThrow();
    expect(() => parseSigningKeys('relay:short')).toThrow();
    expect(() => parseSigningKeys(`a:${SECRET},a:${SECRET}2`)).toThrow('Duplicate');
  });
});
